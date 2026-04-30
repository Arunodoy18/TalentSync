'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IITTemplate from './IITTemplate';
import JakesTemplate from './JakesTemplate';
import { Loader2 } from 'lucide-react';

interface TemplatePreviewProps {
  templateType: 'iit' | 'jakes';
  data: any;
}

export function TemplatePreview({ templateType, data }: TemplatePreviewProps) {
  const renderTemplate = () => {
    switch (templateType) {
      case 'jakes':
        return <JakesTemplate data={data} />;
      case 'iit':
      default:
        return <IITTemplate data={data} />;
    }
  };

  return (
    <div
      style={{
        width: '357px',
        height: '505px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div
        style={{
          width: '794px',
          transform: 'scale(0.45)',
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}

interface DownloadPDFProps {
  templateType: 'iit' | 'jakes';
  data: any;
}

export function DownloadPDFButton({ templateType, data }: DownloadPDFProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!containerRef.current || isGenerating) return;
    setIsGenerating(true);

    // The element to capture is the inner template div
    const targetElement = containerRef.current.firstElementChild as HTMLElement;
    if (!targetElement) {
      setIsGenerating(false);
      return;
    }

    try {
      const filename = data?.fullName 
        ? `${data.fullName.replace(/\\s+/g, '-')}-resume.pdf`
        : 'resume.pdf';

      const canvas = await html2canvas(targetElement, {
        scale: 2, // High resolution
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4', // 595.28 x 841.89 at 72dpi, but jspdf handles it internally mapped to pixel size
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTemplate = () => {
    switch (templateType) {
      case 'jakes':
        return <JakesTemplate data={data} />;
      case 'iit':
      default:
        return <IITTemplate data={data} />;
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        style={{
          padding: '10px 20px',
          backgroundColor: '#D4AF37', // Primary Gold from UI constraints
          color: '#0F172A',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '500',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
        {isGenerating ? 'Generating...' : 'Download PDF'}
      </button>

      {/* Hidden container to render the full scale template for PDF capture */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={containerRef}>
          <div style={{ width: '794px' }}>
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
}
