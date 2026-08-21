import React, { useState } from 'react';
import { ReportItem } from '../types';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReport?: ReportItem;
  onAttachImageToReport?: (imageUrl: string, note: string) => void;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  selectedReport,
  onAttachImageToReport
}) => {
  const [mode, setMode] = useState<'create' | 'edit'>('edit');
  const [prompt, setPrompt] = useState<string>('Add high-visibility orange safety cones, trench shoring, and LED warning barricades around this work zone.');
  const [sourceImage, setSourceImage] = useState<string>(
    selectedReport?.evidenceImages?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800'
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compareSplit, setCompareSplit] = useState<number>(50);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setSourceImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateOrEdit = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sourceImageBase64: mode === 'edit' ? sourceImage : undefined,
          mode
        })
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else if (data.error) {
        setErrorMsg(data.error);
      } else {
        // Fallback representation
        setGeneratedImage(
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800'
        );
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setErrorMsg(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const quickPresets = [
    { label: '🚧 Safety Barricades & Cones', text: 'Add high-visibility orange safety cones, trench shoring, and LED warning barricades around this work zone.' },
    { label: '✨ Asphalt Repair Simulation', text: 'Simulate a newly paved, smooth, dark asphalt road surface patch over the damaged pothole area.' },
    { label: '💡 Night Illumination Fix', text: 'Simulate a bright, operational 4000K LED street lamp casting clear illumination onto the sidewalk.' },
    { label: '🌳 Pruned Tree Canopy', text: 'Simulate the hazardous overhanging tree branch safely trimmed back clear of overhead power lines.' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-[#c6c6cd] flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e6e8ea]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#dae2fd] text-[#131b2e] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">image_search</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[18px] text-[#000000]">AI Municipal Visual Studio</h3>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#86f2e4]/30 text-[#006a61]">
                  gemini-3.1-flash-image-preview
                </span>
              </div>
              <p className="text-[13px] text-[#45464d]">
                Simulate work zone repairs, generate safety diagrams, and edit incident evidence photos with AI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#76777d] hover:text-[#000000] hover:bg-[#f2f4f6]"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 my-4 bg-[#f2f4f6] p-1 rounded-xl w-fit">
          <button
            onClick={() => setMode('edit')}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${
              mode === 'edit' ? 'bg-white text-[#006a61] shadow-xs' : 'text-[#45464d] hover:text-black'
            }`}
          >
            ✏️ Edit Incident Photo
          </button>
          <button
            onClick={() => setMode('create')}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${
              mode === 'create' ? 'bg-white text-[#006a61] shadow-xs' : 'text-[#45464d] hover:text-black'
            }`}
          >
            🎨 Create New Work Diagram
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-2">
          
          {/* Left Column: Canvas Preview */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[12.5px] font-semibold text-[#45464d]">
              <span>{mode === 'edit' ? 'Source Evidence / Base Image' : 'Target Visual Output'}</span>
              {mode === 'edit' && (
                <label className="text-[#006a61] hover:underline cursor-pointer flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Upload Custom Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Image Preview Box */}
            <div className="relative aspect-4/3 bg-[#131b2e] rounded-xl overflow-hidden border border-[#c6c6cd] flex items-center justify-center">
              {generatedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={generatedImage}
                    alt="AI Generated Result"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-md font-semibold backdrop-blur-xs">
                    AI Modified Output (gemini-3.1-flash-image-preview)
                  </span>
                </div>
              ) : mode === 'edit' ? (
                <div className="relative w-full h-full">
                  <img
                    src={sourceImage}
                    alt="Source Incident"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-md font-semibold">
                    Original Incident Evidence
                  </span>
                </div>
              ) : (
                <div className="text-center p-6 text-[#9ca3af]">
                  <span className="material-symbols-outlined text-[48px] text-[#86f2e4] mb-2">draw</span>
                  <div className="text-[13px] font-semibold text-white">Enter a prompt and generate</div>
                  <div className="text-[11.5px] text-[#9ca3af] mt-1">
                    AI will construct a photorealistic municipal infrastructure diagram
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                  <div className="w-10 h-10 border-3 border-[#86f2e4] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <div className="font-bold text-[14px]">Gemini Vision Model Rendering...</div>
                  <div className="text-[12px] text-[#86f2e4] mt-1">Applying pixel edits &amp; photorealistic shaders</div>
                </div>
              )}
            </div>

            {/* Action Bar for Generated Image */}
            {generatedImage && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onAttachImageToReport) {
                      onAttachImageToReport(generatedImage, `AI Visual Studio simulation: ${prompt}`);
                    }
                    onClose();
                  }}
                  className="flex-1 py-2 px-4 bg-[#006a61] hover:bg-[#00524b] text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">attachment</span>
                  Attach to Incident #{selectedReport?.trackingNumber || 'Record'}
                </button>
                <a
                  href={generatedImage}
                  download="municipal_ai_simulation.jpg"
                  className="py-2 px-3 border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#191c1e] rounded-lg text-[13px] font-semibold flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Prompt & Controls */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#191c1e] mb-1.5">
                {mode === 'edit' ? 'AI Edit Instructions' : 'Generation Prompt'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Describe the edits or diagram needed in detail..."
                className="w-full border border-[#c6c6cd] rounded-xl p-3 text-[13.5px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#006a61] resize-none"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[12px] font-bold text-[#45464d] mb-2">Municipal Presets:</div>
              <div className="flex flex-col gap-1.5">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset.text)}
                    className="text-left px-3 py-2 bg-[#f7f9fb] hover:bg-[#e6e8ea] border border-[#c6c6cd] rounded-lg text-[12.5px] text-[#191c1e] transition-colors"
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-[11.5px] text-[#45464d] truncate">{preset.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-lg">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerateOrEdit}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-3 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-[#c6c6cd] text-white cursor-not-allowed'
                  : 'bg-[#131b2e] hover:bg-[#1e273d] text-[#86f2e4]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isGenerating ? 'hourglass_top' : 'auto_fix_high'}
              </span>
              {isGenerating ? 'Rendering with Gemini Image Preview...' : mode === 'edit' ? 'Apply AI Vision Edits' : 'Generate Municipal Diagram'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
