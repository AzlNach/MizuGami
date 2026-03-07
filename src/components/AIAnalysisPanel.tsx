"use client";

import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AIAnalysisPanel() {
  const {
    isAnalyzing,
    lastAnalysis,
    error,
  } = useAIAnalysis();

  const { t } = useLanguage();
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Helper function to process inline markdown (bold, italic)
  const processInlineMarkdown = (text: string): JSX.Element[] => {
    const parts: JSX.Element[] = [];
    let keyIndex = 0;

    // Process **bold** text
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyIndex++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-gray-900">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${keyIndex++}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [<span key="default">{text}</span>];
  };

  // Format analysis text dengan line breaks - Ultra Elegant Typography
  const formatAnalysis = (text: string | undefined) => {
    // Handle undefined or null text
    if (!text) {
      return (
        <div className="text-gray-500 italic text-center py-8">
          <p>{t('analytics.ai.noAnalysis')}</p>
        </div>
      );
    }
    
    return text.split('\n').map((line, index) => {
      // Deteksi berbagai jenis formatting
      const isH4 = line.match(/^####\s+(.+)/); // #### Heading (tambahan untuk h4)
      const isH3 = line.match(/^###\s+(.+)/); // ### Heading
      const isH2 = line.match(/^##\s+(.+)/); // ## Heading
      const isH1 = line.match(/^#\s+(.+)/); // # Heading
      const isBold = line.match(/^\*\*(.+?)\*\*:?\s*(.*)$/); // Bold dengan optional colon
      const isNumberedList = line.match(/^\d+\.\s+(.+)/);
      const isBullet = line.trim().match(/^[-•*]\s+(.+)/); // Tambahan support untuk *
      const isSubBullet = line.trim().match(/^\s{2,}[-•*]\s+(.+)/);
      const isItalic = line.match(/^_(.+)_$/);
      const isDivider = line.match(/^[-_]{2,}$/);
      const isWarning = line.includes('⚠️') || line.includes('PERLU PERHATIAN') || line.includes('PRIORITAS') || line.includes('NEEDS ATTENTION') || line.includes('PRIORITY');
      const isSuccess = line.includes('✅') || line.includes('SANGAT BAIK') || line.includes('BAIK') || line.includes('VERY GOOD') || line.includes('GOOD');
      const isEmpty = line.trim() === '';

      if (isEmpty) {
        return <div key={index} className="h-2"></div>;
      }

      // Divider
      if (isDivider) {
        return <div key={index} className="my-6 border-t-2 border-gray-200 w-full"></div>;
      }

      // H1 - Main Title
      if (isH1) {
        const text = isH1[1];
        const emoji = text.match(/^([^\w\s]+)\s+(.+)/);
        return (
          <div key={index} className="mb-6 pb-4 border-b-2 border-gradient-to-r from-green-400 to-emerald-500">
            <div className="flex items-center space-x-3">
              {emoji && <span className="text-3xl">{emoji[1]}</span>}
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {emoji ? emoji[2] : text}
              </h2>
            </div>
          </div>
        );
      }

      // H2 - Section Title with Card
      if (isH2) {
        const text = isH2[1];
        const emoji = text.match(/^([^\w\s]+)\s+(.+)/);
        return (
          <div key={index} className="mt-6 mb-4 first:mt-0">
            <div className="bg-gradient-to-r from-[#F6F0D7] to-[#C5D89D]/30 rounded-xl p-4 border-l-4 border-[#9CAB84] shadow-sm">
              <div className="flex items-center space-x-3">
                {emoji && (
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                    {emoji[1]}
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  {emoji ? emoji[2] : text}
                </h3>
              </div>
            </div>
          </div>
        );
      }

      // H3 - Subsection
      if (isH3) {
        const text = isH3[1];
        return (
          <div key={index} className="mt-4 mb-2">
            <h4 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
              <span className="w-1 h-5 bg-cream0 rounded-full"></span>
              <span>{text}</span>
            </h4>
          </div>
        );
      }

      // H4 - Smaller Subsection (untuk #### 1. Status Kesehatan Tanah)
      if (isH4) {
        const text = isH4[1];
        return (
          <div key={index} className="mt-3 mb-2">
            <h5 className="text-base font-bold text-gray-800 flex items-center space-x-2">
              <span className="text-[#9CAB84]">▸</span>
              <span>{text}</span>
            </h5>
          </div>
        );
      }

      // Bold text - Status/Important Info
      if (isBold) {
        const boldText = isBold[1];
        const restText = isBold[2];
        const isWarningBold = boldText.includes('PERLU PERHATIAN') || boldText.includes('PRIORITAS') || boldText.includes('NEEDS ATTENTION') || boldText.includes('PRIORITY');
        const isSuccessBold = boldText.includes('SANGAT BAIK') || boldText.includes('BAIK') || boldText.includes('VERY GOOD') || boldText.includes('GOOD');
        
        return (
          <div key={index} className={`my-3 p-4 rounded-xl border-2 ${
            isWarningBold 
              ? 'bg-[#F6F0D7]/60 border-[#C5D89D]' 
              : isSuccessBold 
              ? 'bg-[#F6F0D7] border-[#C5D89D]'
              : 'bg-[#F6F0D7]/40 border-[#C5D89D]/50'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`text-2xl ${
                isWarningBold ? '' : isSuccessBold ? '' : ''
              }`}>
                {isWarningBold ? '⚠️' : isSuccessBold ? '✅' : '💡'}
              </div>
              <div>
                <p className={`font-bold text-base mb-1 ${
                  isWarningBold 
                    ? 'text-[#89986D]' 
                    : isSuccessBold 
                    ? 'text-[#89986D]'
                    : 'text-[#89986D]'
                }`}>
                  {boldText}
                </p>
                {restText && (
                  <p className={`text-sm ${
                    isWarningBold 
                      ? 'text-gray-700' 
                      : isSuccessBold 
                      ? 'text-olive-dark'
                      : 'text-olive-dark'
                  }`}>
                    {restText}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Numbered List
      if (isNumberedList) {
        const text = isNumberedList[1];
        const number = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={index} className="flex items-start space-x-3 my-2 ml-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#9CAB84] to-[#89986D] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xs font-bold text-white">{number}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pt-1">
              {processInlineMarkdown(text)}
            </p>
          </div>
        );
      }

      // Sub-bullet points
      if (isSubBullet) {
        const text = isSubBullet[1];
        return (
          <div key={index} className="flex items-start space-x-2 ml-10 my-1.5">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {processInlineMarkdown(text)}
            </p>
          </div>
        );
      }

      // Bullet points
      if (isBullet) {
        const text = isBullet[1];
        const hasEmoji = text.match(/^([^\w\s]+)\s+(.+)/);
        return (
          <div key={index} className="flex items-start space-x-3 my-2 ml-2">
            <div className="w-2 h-2 bg-cream0 rounded-full flex-shrink-0 mt-2"></div>
            <p className="text-sm text-gray-700 leading-relaxed flex items-start space-x-2">
              {hasEmoji && <span className="text-base">{hasEmoji[1]}</span>}
              <span>{processInlineMarkdown(hasEmoji ? hasEmoji[2] : text)}</span>
            </p>
          </div>
        );
      }

      // Italic text (notes/metadata)
      if (isItalic) {
        const text = isItalic[1];
        return (
          <p key={index} className="text-xs text-gray-500 italic my-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            {text}
          </p>
        );
      }

      // Regular paragraph with warning/success detection
      if (isWarning) {
        return (
          <div key={index} className="my-2 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <p className="text-sm text-amber-900 leading-relaxed">
              {processInlineMarkdown(line)}
            </p>
          </div>
        );
      }

      if (isSuccess) {
        return (
          <div key={index} className="my-2 p-3 bg-[#F6F0D7] border-l-4 border-[#9CAB84] rounded-r-lg">
            <p className="text-sm text-[#89986D] leading-relaxed">
              {processInlineMarkdown(line)}
            </p>
          </div>
        );
      }

      // Default paragraph - process inline markdown
      return (
        <p key={index} className="text-sm text-gray-700 leading-relaxed my-1.5 ml-2">
          {processInlineMarkdown(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Panel - Minimalist White Design */}

      {/* Analysis Results - Elegant White Design */}
      {lastAnalysis && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-[#F6F0D7] to-[#C5D89D]/30 p-6 md:p-8 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9CAB84] to-[#89986D] rounded-xl flex items-center justify-center text-white text-2xl shadow-md">
                  📊
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('analytics.ai.title')}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{t('analytics.ai.subtitle')}</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border-2 border-[#C5D89D] shadow-sm">
                <span className="text-xs text-gray-500 font-medium block mb-0.5">{t('analytics.ai.dataPeriod')}</span>
                <span className="text-sm text-[#89986D] font-bold">{lastAnalysis?.timeRange || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Statistics Grid - Minimalist Cards */}
              <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="group relative bg-gradient-to-br from-[#F6F0D7] to-[#F6F0D7]/50 p-5 rounded-2xl border border-[#C5D89D]/50 hover:shadow-md transition-all">
                <div className="absolute top-3 right-3 w-8 h-8 bg-[#89986D]/10 rounded-lg flex items-center justify-center text-lg">
                  📊
                </div>
                <div className="text-xs text-[#89986D] font-semibold uppercase tracking-wide mb-2">{t('analytics.ai.average')}</div>
                <div className="text-3xl font-bold text-[#89986D]">{lastAnalysis.statistics?.rata_rata ?? 0}<span className="text-xl">%</span></div>
              </div>
              <div className="group relative bg-gradient-to-br from-[#C5D89D]/40 to-[#C5D89D]/20 p-5 rounded-2xl border border-[#C5D89D]/50 hover:shadow-md transition-all">
                <div className="absolute top-3 right-3 w-8 h-8 bg-[#89986D]/10 rounded-lg flex items-center justify-center text-lg">
                  ⬆️
                </div>
                <div className="text-xs text-[#89986D] font-semibold uppercase tracking-wide mb-2">{t('analytics.ai.maximum')}</div>
                <div className="text-3xl font-bold text-[#89986D]">{lastAnalysis.statistics?.maksimum ?? 0}<span className="text-xl">%</span></div>
              </div>
              <div className="group relative bg-gradient-to-br from-[#F6F0D7] to-[#F6F0D7]/50 p-5 rounded-2xl border border-[#C5D89D]/50 hover:shadow-md transition-all">
                <div className="absolute top-3 right-3 w-8 h-8 bg-[#89986D]/10 rounded-lg flex items-center justify-center text-lg">
                  ⬇️
                </div>
                <div className="text-xs text-[#89986D] font-semibold uppercase tracking-wide mb-2">{t('analytics.ai.minimum')}</div>
                <div className="text-3xl font-bold text-[#89986D]">{lastAnalysis.statistics?.minimum ?? 0}<span className="text-xl">%</span></div>
              </div>
              <div className="group relative bg-gradient-to-br from-[#C5D89D]/30 to-[#C5D89D]/20 p-5 rounded-2xl border border-[#C5D89D]/50 hover:shadow-md transition-all">
                <div className="absolute top-3 right-3 w-8 h-8 bg-[#89986D]/10 rounded-lg flex items-center justify-center text-lg">
                  📈
                </div>
                <div className="text-xs text-[#89986D] font-semibold uppercase tracking-wide mb-2">{t('analytics.ai.trend')}</div>
                <div className="text-3xl font-bold text-[#89986D] capitalize">{lastAnalysis.statistics?.tren ?? 'N/A'}</div>
              </div>
            </div>            {/* Pump Usage - Elegant Card */}
            <div className="bg-gradient-to-r from-[#F6F0D7] to-[#C5D89D]/30 rounded-2xl p-5 mb-6 border border-[#C5D89D]/50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#89986D]/10 rounded-xl flex items-center justify-center text-xl">
                    ⚙️
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{t('analytics.ai.pumpUsage')}</h4>
                    <p className="text-sm text-gray-600">{t('analytics.ai.pumpActivation')} <span className="font-bold text-[#89986D]">{lastAnalysis.pumpUsage?.aktivasi ?? 0} {t('analytics.ai.times')}</span></p>
                  </div>
                </div>
                <div className="px-5 py-2.5 bg-[#F6F0D7] border-2 border-[#C5D89D] rounded-xl">
                  <span className="text-xs text-[#89986D] font-medium block mb-0.5">{t('analytics.ai.timePercentage')}</span>
                  <span className="text-2xl font-bold text-[#89986D]">{lastAnalysis.pumpUsage?.persentase ?? 0}%</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Text - Clean Typography */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9CAB84] to-[#89986D] rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  🧠
                </div>
                <h4 className="font-bold text-xl text-gray-900">{t('analytics.ai.analysisTitle')}</h4>
              </div>
              <div className={`text-gray-700 leading-relaxed space-y-1 ${!showFullAnalysis ? 'max-h-96 overflow-hidden relative' : ''}`}>
                {formatAnalysis(lastAnalysis?.analysis)}
                {!showFullAnalysis && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-100 to-transparent"></div>
                )}
              </div>
              
              {!showFullAnalysis && (
                <div className="mt-6 text-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowFullAnalysis(true)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#9CAB84] to-[#89986D] text-white rounded-xl font-semibold hover:from-[#89986D] hover:to-[#89986D] transition-all shadow-md hover:shadow-lg"
                  >
                    <span>{t('analytics.ai.viewFull')}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Metadata - Clean Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                {lastAnalysis.metadata?.analyzedAt && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-6 h-6 bg-sage-light/15 rounded-lg flex items-center justify-center text-xs">
                      📅
                    </div>
                    <span className="text-gray-600">{t('analytics.ai.analyzedAt')} <span className="font-semibold text-gray-900">{lastAnalysis.metadata.analyzedAt}</span></span>
                  </div>
                )}
                {lastAnalysis.metadata?.dataPoints && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-6 h-6 bg-sage-light/20 rounded-lg flex items-center justify-center text-xs">
                      📊
                    </div>
                    <span className="text-gray-600"><span className="font-semibold text-gray-900">{lastAnalysis.metadata.dataPoints}</span> {t('analytics.ai.dataPoints')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial State - No Analysis Yet - Elegant Empty State */}
      {!lastAnalysis && !isAnalyzing && !error && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
              🤖
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('analytics.ai.readyTitle')}</h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
              {t('analytics.ai.readyDesc')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="p-4 bg-[#F6F0D7]/50 rounded-2xl border border-[#C5D89D]">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{t('analytics.ai.deepAnalysis')}</div>
                <div className="text-xs text-gray-600">{t('analytics.ai.deepAnalysisDesc')}</div>
              </div>
              <div className="p-4 bg-[#F6F0D7] rounded-2xl border border-[#C5D89D]">
                <div className="text-3xl mb-2">💡</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{t('analytics.ai.smartRec')}</div>
                <div className="text-xs text-gray-600">{t('analytics.ai.smartRecDesc')}</div>
              </div>
              <div className="p-4 bg-[#C5D89D]/30 rounded-2xl border border-[#C5D89D]">
                <div className="text-3xl mb-2">⚙️</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{t('analytics.ai.pumpEval')}</div>
                <div className="text-xs text-gray-600">{t('analytics.ai.pumpEvalDesc')}</div>
              </div>
            </div>

            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-sage-light rounded-2xl">
              <div className="w-8 h-8 bg-cream0 rounded-lg flex items-center justify-center text-white text-lg">
                💡
              </div>
              <span className="text-sm text-gray-700 font-medium">{t('analytics.ai.aiHint')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
