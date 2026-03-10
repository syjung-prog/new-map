import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onImageSelect, isLoading }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setPreviewUrl(compressedBase64);
          onImageSelect(compressedBase64, 'image/jpeg');
        } else {
          setPreviewUrl(result);
          onImageSelect(result, file.type);
        }
      };
      img.onerror = () => {
        // Fallback in case image loading fails (e.g., unsupported format like some HEIC)
        setPreviewUrl(result);
        onImageSelect(result, file.type);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    if (isLoading) return;
    setPreviewUrl(null);
  };

  return (
    <div className="w-full">
      {!previewUrl ? (
        <label
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center w-full h-72 brutal-border cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'bg-green-400 scale-[1.02]'
              : 'bg-[#e5e5e5] hover:bg-green-300'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className="bg-black p-4 rounded-full mb-6">
              <UploadCloud className="w-10 h-10 text-green-400" />
            </div>
            <p className="mb-3 text-lg font-bold text-black uppercase tracking-wide">
              <span className="underline decoration-4 decoration-green-500 underline-offset-4">클릭하여 업로드</span> 하거나<br/>이미지를 드래그 앤 드롭
            </p>
            <p className="text-sm font-mono text-black/70 bg-black/5 px-3 py-1 brutal-border">
              PNG, JPG, JPEG (MAX 10MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onFileInputChange}
            disabled={isLoading}
          />
        </label>
      ) : (
        <div className="relative w-full brutal-border bg-[#e5e5e5] p-2">
          <img
            src={previewUrl}
            alt="Uploaded stakeholder map"
            className="w-full h-auto max-h-[500px] object-contain brutal-border bg-white"
          />
          {!isLoading && (
            <button
              onClick={clearImage}
              className="absolute top-6 right-6 p-2 bg-red-500 text-white brutal-border brutal-shadow hover:bg-red-600 transition-colors z-10"
              title="이미지 삭제"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="w-16 h-16 border-8 border-green-900 border-t-green-400 animate-spin mb-6 brutal-border rounded-full"></div>
              <p className="text-green-400 font-display font-bold text-lg md:text-xl bg-black px-6 py-3 brutal-border uppercase tracking-widest text-center">
                팀장님의 이해관계자 지도를 꼼꼼하게 분석중입니다<span className="animate-ellipsis"></span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
