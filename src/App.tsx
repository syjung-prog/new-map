/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Users, Key } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import FeedbackDisplay from './components/FeedbackDisplay';
import { analyzeStakeholderMap } from './services/geminiService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [manualApiKey, setManualApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');

  const [hasPaidKey, setHasPaidKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasPaidKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectPaidKey = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasPaidKey(true);
      } catch (err) {
        console.error("Key selection failed:", err);
      }
    }
  };

  const handleImageSelect = async (base64: string, mimeType: string) => {
    setIsLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const result = await analyzeStakeholderMap(base64, mimeType, manualApiKey);
      setFeedback(result);
    } catch (err) {
      console.error(err);
      let msg = "알 수 없는 오류가 발생했습니다.";
      if (err instanceof Error) {
        if (err.message.includes("API key not valid")) {
          msg = "등록된 API 키가 유효하지 않거나 형식이 잘못되었습니다. [Settings] > [Secrets]에서 키를 '직접 붙여넣기'로 다시 입력해 주세요.";
        } else {
          msg = err.message;
        }
      }
      setError(
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-800 font-medium mb-1">분석 실패: {msg}</p>
          <p className="text-xs text-red-600 opacity-80">
            잠시 후 다시 시도해 주세요. 문제가 지속되면 운영자에게 문의 바랍니다.
          </p>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative organic elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b-4 border-black pb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-2 brutal-border brutal-shadow-sm flex items-center justify-center w-12 h-12">
              <Users className="w-8 h-8 text-black" />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-6 uppercase leading-none">
            이해관계자<br/>Map 분석
          </h1>
          <div className="bg-[#f4f4f0] p-6 brutal-border brutal-shadow-sm max-w-2xl relative">
            <div className="absolute -top-3 -right-3 bg-green-500 text-black font-bold px-3 py-1 brutal-border text-sm transform rotate-3">
              NEW
            </div>
            <p className="text-lg text-black font-medium leading-relaxed mb-4">
              LG생활건강 신임팀장님을 위한 맞춤형 피드백입니다.<br/>
              직접 그리신 지도를 업로드하면, 전문 코치가 따뜻하고 실질적인 조언을 드립니다.
            </p>
            
            {/* API Key UI removed as per user request */}
          </div>
        </motion.header>

        <main>
          <div className="bg-[#f4f4f0] brutal-border brutal-shadow p-8 mb-12 relative">
            <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
              <h2 className="font-display text-2xl font-bold uppercase flex items-center gap-2">
                <Upload className="w-6 h-6" />
                지도 이미지 업로드
              </h2>
              <span className="bg-black text-green-400 font-mono text-xs px-2 py-1 uppercase tracking-wider">
                Step 01
              </span>
            </div>
            
            <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} />
            
            {error && (
              <div className="mt-6 p-4 bg-red-500 text-white font-bold brutal-border brutal-shadow-sm flex items-start gap-3">
                <span className="text-2xl leading-none">!</span>
                <p>{error}</p>
              </div>
            )}
          </div>

          {feedback && (
            <div className="relative">
              <div className="absolute -left-4 top-10 bottom-10 w-2 bg-green-500 brutal-border hidden md:block"></div>
              <FeedbackDisplay feedback={feedback} />
            </div>
          )}
        </main>

        <footer className="mt-12 text-center pb-8">
          <p className="text-black/60 font-medium text-sm font-mono tracking-wider">
            © 2026 U&R PROJECT. All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
