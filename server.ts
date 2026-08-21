import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);

// JSON body parsing with large payload support for image base64
app.use(express.json({ limit: '35mb' }));

// Lazy initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

// 1. GEMINI CHATBOT API (Multi-turn, role system instructions, model switcher)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { 
      messages, 
      model = 'gemini-3.5-flash', 
      systemInstruction = 'You are the CityPulse Municipal AI Assistant for the Department of Public Works. Help citizens and city dispatchers accurately triage municipal work orders, explain road hazard repairs, provide municipal code guidelines, and track infrastructure incidents.' 
    } = req.body;

    const ai = getGeminiClient();

    // Map requested model to allowed preview versions
    let selectedModel = 'gemini-3.5-flash';
    if (model === 'gemini-3.1-pro-preview' || model.includes('pro')) {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (model === 'gemini-3.1-flash-lite' || model.includes('lite')) {
      selectedModel = 'gemini-3.1-flash-lite';
    } else {
      selectedModel = 'gemini-3.5-flash';
    }

    // Format chat history for Gemini contents
    const contents = (messages || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const replyText = response.text || 'No response generated.';
    res.json({
      role: 'assistant',
      content: replyText,
      modelUsed: selectedModel
    });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate chat response'
    });
  }
});

// 2. GOOGLE MAPS GROUNDING API (gemini-3.5-flash with googleMaps tool)
app.post('/api/gemini/maps-grounding', async (req, res) => {
  try {
    const { query, address, locationCoords } = req.body;
    const ai = getGeminiClient();

    const promptText = `
You are a municipal geospatial intelligence coordinator. 
Query: "${query || `Provide detailed geospatial analysis and verify the municipal jurisdiction, nearby public works depots, fire/emergency stations, and water utility nodes for address: ${address}`}".
${address ? `Target Address / Corridor: ${address}` : ''}
${locationCoords ? `Coordinates: Lat ${locationCoords.lat}, Lng ${locationCoords.lng}` : ''}

Use Google Maps grounding to locate exact infrastructure entities, public works service districts, cross streets, and nearby emergency services.
Provide a clear, structured municipal briefing with exact locations, distances, and operational jurisdiction.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });

    // Extract grounding metadata if available
    const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata || null;

    res.json({
      analysis: response.text || 'No location analysis returned.',
      groundingMetadata,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Gemini Maps Grounding Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch Maps Grounding data'
    });
  }
});

// 3. CREATE & EDIT IMAGES API (gemini-3.1-flash-image-preview)
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, sourceImageBase64, mode = 'generate' } = req.body;
    const ai = getGeminiClient();

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (mode === 'edit' && sourceImageBase64) {
      // Image editing using gemini-3.1-flash-image-preview multimodal generateContent
      const cleanBase64 = sourceImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = sourceImageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64
                }
              },
              {
                text: `You are an expert municipal infrastructure visualizer. Modify and edit this image based on instructions: ${prompt}. Output the resulting edited image illustration.`
              }
            ]
          }
        ]
      });

      // Find any image part in response candidates
      let editedImageData = null;
      let replyText = response.text || '';
      
      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if ((part as any).inlineData) {
          editedImageData = `data:${(part as any).inlineData.mimeType};base64,${(part as any).inlineData.data}`;
          break;
        }
      }

      // If no raw inline image data returned by content model, fallback to image generation with prompt context
      if (!editedImageData) {
        try {
          const imgGenResponse = await (ai.models as any).generateImages?.({
            model: 'gemini-3.1-flash-image-preview',
            prompt: `Municipal public works repair visualization: ${prompt}. Realistic, architectural photo of road work, municipal infrastructure, safety cones, clean street repairs.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg'
            }
          });
          const generatedImg = imgGenResponse?.generatedImages?.[0]?.image?.imageBytes;
          if (generatedImg) {
            editedImageData = `data:image/jpeg;base64,${generatedImg}`;
          }
        } catch (genErr) {
          console.warn('generateImages fallback error:', genErr);
        }
      }

      return res.json({
        imageUrl: editedImageData,
        description: replyText || `Edited image with prompt: ${prompt}`,
        mode: 'edit'
      });
    } else {
      // New image generation
      try {
        const response = await (ai.models as any).generateImages({
          model: 'gemini-3.1-flash-image-preview',
          prompt: `High quality municipal work zone and public infrastructure diagram: ${prompt}`,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg'
          }
        });

        const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          return res.json({
            imageUrl: `data:image/jpeg;base64,${imageBytes}`,
            description: prompt,
            mode: 'generate'
          });
        }
      } catch (genErr: any) {
        console.warn('generateImages API call attempted, using multimodal generateContent format:', genErr?.message);
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: `Create a visual image of: ${prompt}`
        });
        
        let foundImg = null;
        for (const part of fallbackRes.candidates?.[0]?.content?.parts || []) {
          if ((part as any).inlineData) {
            foundImg = `data:${(part as any).inlineData.mimeType};base64,${(part as any).inlineData.data}`;
            break;
          }
        }

        return res.json({
          imageUrl: foundImg,
          description: fallbackRes.text || prompt,
          mode: 'generate'
        });
      }
    }

    res.status(500).json({ error: 'Failed to produce image' });
  } catch (error: any) {
    console.error('Gemini Generate Image Error:', error);
    res.status(500).json({
      error: error.message || 'Image generation failed'
    });
  }
});

// 4. MULTIMODAL AI TRIAGE SCANNER (gemini-3.5-flash)
app.post('/api/gemini/triage-analyze', async (req, res) => {
  try {
    const { title, description, imageBase64, address } = req.body;
    const ai = getGeminiClient();

    const promptText = `
You are CityPulse AI, the automated Municipal Intake & Triage Engine.
Analyze this citizen report:
Title: "${title || 'Untitled'}"
Description: "${description || 'No description'}"
Location: "${address || 'Unspecified'}"

Evaluate the case and return a STRICT JSON OBJECT (and nothing else) in this format:
{
  "issueType": "pothole" | "streetlight" | "graffiti" | "dumping" | "tree" | "water" | "other",
  "issueTypeName": "Short Name (e.g. Water Main Breach / Hazardous Pothole)",
  "suggestedDept": "Water & Sewer" | "Transportation" | "Parks & Rec" | "Sanitation" | "Public Works" | "Electrical & Lighting",
  "aiConfidence": number (between 60 and 99),
  "priority": "urgent" | "high" | "normal" | "low",
  "riskScore": number (1 to 100),
  "infrastructureImpact": "High" | "Moderate" | "Low",
  "publicSafetyRisk": "High" | "Moderate" | "Low",
  "summary": "1-2 sentence executive gist of the problem and required municipal action",
  "keywords": ["tag1", "tag2", "tag3"],
  "explanation": "Why this department and priority were chosen based on municipal code"
}
`;

    const parts: any[] = [{ text: promptText }];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      parts.unshift({
        inlineData: {
          mimeType,
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ parts }],
      config: {
        temperature: 0.2
      }
    });

    const rawText = response.text || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    let parsedResult = {};
    if (jsonMatch) {
      try {
        parsedResult = JSON.parse(jsonMatch[0]);
      } catch (pErr) {
        console.warn('JSON parse error on triage result:', pErr);
      }
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error('Triage Analyze Error:', error);
    res.status(500).json({ error: error.message || 'Triage analysis failed' });
  }
});

// 5. LIVE VOICE WEBSOCKET SERVER (gemini-3.1-flash-live-preview)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  console.log('Gemini Live Voice WebSocket client connected');

  let sessionActive = true;
  const ai = getGeminiClient();

  ws.on('message', async (data: Buffer | string) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (message.type === 'user_audio_chunk' || message.type === 'user_speech') {
        // Voice processing with gemini-3.1-flash-live-preview
        const userPrompt = message.text || 'Citizen is reporting a civic issue via live voice microphone.';
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-live-preview',
          contents: [
            {
              role: 'user',
              parts: [
                { text: `System context: You are the CityPulse 311 Live Voice Dispatcher. Speak concisely and helpfully in 1-2 spoken sentences suitable for voice delivery. User voice input: "${userPrompt}"` }
              ]
            }
          ]
        });

        const replyText = response.text || 'I have recorded your municipal report and routed it to the dispatch queue.';
        if (sessionActive && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'agent_response',
            text: replyText,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (err: any) {
      console.error('Live Voice WS message error:', err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          error: err.message || 'Voice communication error'
        }));
      }
    }
  });

  ws.on('close', () => {
    sessionActive = false;
    console.log('Gemini Live Voice WebSocket client disconnected');
  });
});

// Upgrade HTTP to WS for /ws/live
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url?.split('?')[0];
  if (pathname === '/ws/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Serve frontend with Vite middleware in dev or static files in prod
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicLink Full-Stack Server running on port ${PORT}`);
  });
}

startApp().catch(err => {
  console.error('Fatal Server Startup Error:', err);
});
