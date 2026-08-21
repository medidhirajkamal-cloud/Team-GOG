import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { ReportItem } from '../types';

interface MapsGroundingCardProps {
  address: string;
  report?: ReportItem;
}

export const MapsGroundingCard: React.FC<MapsGroundingCardProps> = ({ address, report }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);

  const fetchMapsGrounding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          locationCoords: report ? { lat: report.location.lat, lng: report.location.lng } : undefined,
          query: `Identify the municipal sector, nearest Department of Public Works depot, closest fire/water emergency station, and traffic impact for incident at: ${address}`
        })
      });

      const data = await response.json();
      setAnalysis(data.analysis || 'No detailed maps analysis returned.');
      setGroundingMetadata(data.groundingMetadata);
    } catch (err: any) {
      console.error('Maps Grounding Error:', err);
      setAnalysis('Unable to connect to Google Maps grounding service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#e6e8ea]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#dae2fd] text-[#006a61] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">pin_drop</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[14px] text-[#000000]">Google Maps Geospatial Grounding</h4>
              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#86f2e4]/30 text-[#006a61]">
                gemini-3.5-flash (googleMaps)
              </span>
            </div>
            <p className="text-[11.5px] text-[#76777d]">Live verified municipal infrastructure &amp; depot proximity</p>
          </div>
        </div>

        <button
          onClick={fetchMapsGrounding}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#006a61] rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors border border-[#c6c6cd]"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isLoading ? 'sync' : 'explore'}
          </span>
          {isLoading ? 'Grounding with Google Maps...' : analysis ? 'Refresh Maps Data' : 'Verify Location with Maps'}
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center text-[#45464d]">
          <div className="w-6 h-6 border-2 border-[#006a61] border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-[12.5px] font-semibold">Querying Google Maps Infrastructure Grounding...</span>
        </div>
      ) : analysis ? (
        <div className="mt-4 space-y-3">
          <div className="bg-[#f7f9fb] p-3.5 rounded-lg border border-[#e6e8ea] text-[13px] leading-relaxed text-[#191c1e]">
            <div className="markdown-body prose prose-sm max-w-none">
              <Markdown>{analysis}</Markdown>
            </div>
          </div>

          {/* Grounding Web / Maps Sources */}
          {groundingMetadata?.groundingChunks && (
            <div className="p-3 bg-[#dae2fd]/20 rounded-lg border border-[#dae2fd] text-[11.5px]">
              <div className="font-bold text-[#131b2e] mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#006a61]">verified</span>
                Verified Google Maps Grounding Sources:
              </div>
              <div className="flex flex-wrap gap-2">
                {groundingMetadata.groundingChunks.slice(0, 4).map((chunk: any, i: number) => (
                  <a
                    key={i}
                    href={chunk?.web?.uri || chunk?.maps?.uri || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#006a61] hover:underline font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#c6c6cd]"
                  >
                    <span>{chunk?.web?.title || chunk?.maps?.title || `Maps Entity #${i + 1}`}</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between bg-[#f7f9fb] p-3 rounded-lg text-[12.5px] text-[#45464d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#76777d] text-[18px]">location_on</span>
            <span>Target: <strong>{address}</strong></span>
          </div>
          <span className="text-[11px] text-[#76777d]">Click above to verify with live Google Maps data</span>
        </div>
      )}
    </div>
  );
};
