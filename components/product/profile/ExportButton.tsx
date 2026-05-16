'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { Share2 } from 'lucide-react';

export const ExportButton = ({ targetId, filename }: { targetId: string, filename: string }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="bg-accent text-accent-fg px-10 py-5 rounded-full font-black text-lg flex items-center justify-center gap-4 shadow-2xl shadow-accent/10 hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50"
    >
      {isExporting ? (
        <span className="animate-pulse">DECODING PIXELS...</span>
      ) : (
        <>
          <Share2 className="w-6 h-6" strokeWidth={3} />
          Export to Instagram Story
        </>
      )}
    </button>
  );
};
