import React, { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { Download, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface FeedbackDisplayProps {
  feedback: string;
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!feedback) return null;

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // 약간의 지연을 주어 렌더링이 완전히 끝난 후 캡처하도록 함
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const imgData = await toPng(printRef.current, {
        backgroundColor: '#f4f4f0',
        pixelRatio: 2,
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('이해관계자_지도_코칭_리포트.pdf');
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      alert(`PDF 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-[#f4f4f0] brutal-border brutal-shadow mb-12"
    >
      <div ref={printRef} className="bg-[#f4f4f0]">
        <div className="border-b-4 border-black px-8 py-6 bg-green-400 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black text-black uppercase tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8" />
              코칭 피드백 결과
            </h2>
            <p className="text-black/80 mt-2 font-medium">
              팀장님의 이해관계자 지도를 바탕으로 분석한 내용입니다.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="bg-black text-green-400 font-mono text-xs px-3 py-2 uppercase tracking-widest brutal-border">
              REPORT
            </span>
          </div>
        </div>
        
        <div className="px-8 pt-8 pb-4 prose prose-lg prose-black max-w-none
          prose-headings:font-display prose-headings:font-black prose-headings:uppercase
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6 prose-h2:bg-black prose-h2:text-white prose-h2:inline-block prose-h2:px-4 prose-h2:py-2 prose-h2:brutal-border
          prose-p:leading-relaxed prose-p:font-medium
          prose-li:my-2 prose-li:font-medium
          prose-strong:font-black prose-strong:bg-green-200 prose-strong:px-1
          marker:text-black [&>*:last-child]:mb-0">
          <Markdown>{feedback}</Markdown>
        </div>

        <div className="pt-4 pb-8 text-right border-t-2 border-black/10 mx-8 mt-4">
          <p className="text-black/50 font-mono text-xs tracking-widest uppercase">
            © 2026 U&R PROJECT. All Rights Reserved.
          </p>
        </div>
      </div>

      <div className="px-8 py-6 border-t-4 border-black bg-[#e5e5e5] flex justify-end">
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-black font-black uppercase tracking-wider brutal-border brutal-shadow hover:bg-green-400 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isDownloading ? (
            <>
              <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
              <span>PDF 생성 중...</span>
            </>
          ) : (
            <>
              <Download className="w-6 h-6" />
              <span>분석 리포트 저장하기</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
