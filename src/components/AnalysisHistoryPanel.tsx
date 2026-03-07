"use client";

import { useState, useRef } from "react";
import { AnalysisHistoryItem } from "@/hooks/useAIAnalysis";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalysisHistoryPanelProps {
  history: AnalysisHistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AnalysisHistoryPanel({ history, isLoading, onRefresh }: AnalysisHistoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Scroll functions for carousel
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Format analysis text with elegant styling (same as AIAnalysisPanel)
  const formatAnalysis = (text: string | undefined): JSX.Element[] => {
    if (!text) {
      return [<p key="no-data" className="text-gray-500 italic">{t('analytics.ai.noAnalysis')}</p>];
    }

    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 my-4">
            {listItems.map((item, idx) => {
              // Process bold text in list items
              const processedItem = item.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
              return (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-olive mt-1 font-bold">•</span>
                  <span className="flex-1" dangerouslySetInnerHTML={{ __html: processedItem }} />
                </li>
              );
            })}
          </ul>
        );
        listItems = [];
      }
    };

    // Helper to process inline markdown (bold, italic)
    const processInlineMarkdown = (text: string): string => {
      let processed = text;
      // Bold text: **text**
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      // Italic text: *text* or _text_
      processed = processed.replace(/\*(.+?)\*/g, '<em class="italic text-gray-800">$1</em>');
      processed = processed.replace(/_(.+?)_/g, '<em class="italic text-gray-800">$1</em>');
      return processed;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        flushList();
        return;
      }

      // Headers - support #### (h4), ### (h3), ## (h2), # (h1)
      if (trimmed.startsWith('#### ')) {
        flushList();
        const text = processInlineMarkdown(trimmed.substring(5));
        elements.push(
          <h4 key={`h4-${index}`} className="text-base font-bold text-gray-800 mt-3 mb-2 flex items-center space-x-2">
            <span className="text-[#9CAB84]">▸</span>
            <span dangerouslySetInnerHTML={{ __html: text }} />
          </h4>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList();
        const text = processInlineMarkdown(trimmed.substring(4));
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-bold text-gray-800 mt-4 mb-2 flex items-center space-x-2">
            <span className="text-[#89986D]">▸</span>
            <span dangerouslySetInnerHTML={{ __html: text }} />
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList();
        const text = processInlineMarkdown(trimmed.substring(3));
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-gray-900 mt-5 mb-3 pb-2 border-b-2 border-sage-light">
            <span dangerouslySetInnerHTML={{ __html: text }} />
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        flushList();
        const text = processInlineMarkdown(trimmed.substring(2));
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-bold text-olive mt-6 mb-4">
            <span dangerouslySetInnerHTML={{ __html: text }} />
          </h1>
        );
      }
      // List items - support both - and • and *
      else if (trimmed.match(/^[-•*]\s/)) {
        const itemText = trimmed.substring(2);
        listItems.push(itemText);
      }
      // Regular paragraph
      else {
        flushList();
        const content = processInlineMarkdown(trimmed);
        
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: content }} />
        );
      }
    });

    flushList();
    return elements;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return timestamp;
    }
  };

  const getTrendIcon = (tren: string) => {
    if (tren?.toLowerCase().includes('naik')) return '📈';
    if (tren?.toLowerCase().includes('turun')) return '📉';
    return '➡️';
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full">
        {/* Header - Minimalist White with Sage Green Border */}
        <div className="bg-white border-b-4 border-[#9CAB84] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#89986D] to-[#9CAB84] rounded-xl flex items-center justify-center text-2xl shadow-md">
                📚
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('analytics.history.title')}</h2>
                <p className="text-sm text-gray-600">{t('analytics.history.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-[#9CAB84] hover:bg-[#89986D] text-white rounded-xl border-2 border-[#C5D89D] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
              <span className="font-medium">{t('analytics.history.refresh')}</span>
            </button>
          </div>
        </div>

        {/* Content - Flex-1 for equal height with Carousel */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">{t('analytics.history.loading')}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">{t('analytics.history.empty')}</p>
              <p className="text-sm text-gray-500 mt-2">{t('analytics.history.emptyHint')}</p>
            </div>
          ) : (
            <div className="relative flex-1">
              {/* Navigation Buttons */}
              {history.length > 1 && (
                <>
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-[#F6F0D7] rounded-full shadow-lg border-2 border-[#C5D89D] flex items-center justify-center text-[#89986D] hover:text-[#89986D] transition-all hover:scale-110"
                    aria-label="Scroll left"
                  >
                    ←
                  </button>
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-[#F6F0D7] rounded-full shadow-lg border-2 border-[#C5D89D] flex items-center justify-center text-[#89986D] hover:text-[#89986D] transition-all hover:scale-110"
                    aria-label="Scroll right"
                  >
                    →
                  </button>
                </>
              )}

              {/* Scrollable Carousel Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-12 hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group flex-shrink-0 w-72 bg-white rounded-2xl border-2 border-gray-200 hover:border-[#C5D89D] hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Minimalist Card Header */}
                    <div className="bg-[#F6F0D7]/40 p-4 border-b border-[#C5D89D]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🧠</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold bg-white border border-[#C5D89D] text-gray-700`}>
                          {getTrendIcon(item.statistics?.tren || '')}
                        </span>
                      </div>
                      <p className="font-bold text-sm mb-1 text-gray-800">{item.timeRange}</p>
                      <p className="text-xs text-gray-600">{formatTimestamp(item.timestamp)}</p>
                    </div>

                    {/* Minimalist Statistics */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{t('analytics.history.average')}</span>
                        <span className="text-lg font-bold text-sage-dark">{item.statistics?.rata_rata || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{t('analytics.history.range')}</span>
                        <span className="text-sm font-bold text-gray-700">
                          {item.statistics?.minimum || 0}% - {item.statistics?.maksimum || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-600">⚙️ {t('analytics.history.pump')}</span>
                        <span className="text-sm font-bold text-orange-600">{item.pumpUsage?.aktivasi || 0}x</span>
                      </div>
                    </div>

                    {/* Minimalist View Button */}
                    <div className="px-4 pb-4">
                      <button className="w-full py-2 bg-cream hover:bg-sage-light/20 text-olive rounded-xl text-sm font-medium transition-all border border-sage-light">
                        {t('analytics.history.viewDetail')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Modal Detail */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 " onClick={(e) => e.stopPropagation()}>
            {/* Modal Header - Minimalist White with Green Border */}
            <div className="bg-white border-b-4  px-6 py-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                  🧠
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedItem.timeRange}</h3>
                  <p className="text-sm text-gray-600">{formatTimestamp(selectedItem.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 bg-cream/70 hover:bg-red-200 rounded-xl flex items-center justify-center text-olive-dark text-xl transition-all shadow-sm hover:shadow-md"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-2xl border border-sage-light/50">
                  <div className="text-xs text-sage-dark font-semibold uppercase tracking-wide mb-2">{t('analytics.modal.average')}</div>
                  <div className="text-3xl font-bold text-olive">{selectedItem.statistics?.rata_rata || 0}<span className="text-xl">%</span></div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-2xl border border-sage-light/50">
                  <div className="text-xs text-olive font-semibold uppercase tracking-wide mb-2">{t('analytics.modal.maximum')}</div>
                  <div className="text-3xl font-bold text-olive">{selectedItem.statistics?.maksimum || 0}<span className="text-xl">%</span></div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-2xl border border-orange-200/50">
                  <div className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-2">{t('analytics.modal.minimum')}</div>
                  <div className="text-3xl font-bold text-orange-700">{selectedItem.statistics?.minimum || 0}<span className="text-xl">%</span></div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-2xl border border-purple-200/50">
                  <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-2">{t('analytics.modal.trend')}</div>
                  <div className="text-3xl font-bold text-purple-700 capitalize">{selectedItem.statistics?.tren || 'N/A'}</div>
                </div>
              </div>

              {/* Pump Usage */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 mb-6 border border-orange-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-xl">⚙️</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{t('analytics.modal.pumpUsage')}</h4>
                      <p className="text-sm text-gray-600">{t('analytics.modal.pumpActivation')} <span className="font-bold text-orange-700">{selectedItem.pumpUsage?.aktivasi || 0} {t('analytics.modal.times')}</span></p>
                    </div>
                  </div>
                  <div className="px-5 py-2.5 bg-orange-100 border-2 border-orange-200 rounded-xl">
                    <span className="text-xs text-orange-600 font-medium block mb-0.5">{t('analytics.modal.timePercentage')}</span>
                    <span className="text-2xl font-bold text-orange-700">{selectedItem.pumpUsage?.persentase || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Analysis Content */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-md">🧠</div>
                    <h4 className="font-bold text-xl text-gray-900">{t('analytics.modal.analysisTitle')}</h4>
                  </div>
                  <button
                    onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                    className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    {showFullAnalysis ? `📖 ${t('analytics.modal.showSummary')}` : `📄 ${t('analytics.modal.showFull')}`}
                  </button>
                </div>
                <div className={`text-gray-700 leading-relaxed space-y-1 ${!showFullAnalysis ? 'max-h-96 overflow-hidden relative' : ''}`}>
                  {formatAnalysis(selectedItem?.analysis)}
                  {!showFullAnalysis && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-100 to-transparent"></div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                <span>📊 {selectedItem.metadata?.dataPoints || 0} data points</span>
                <span>📅 {selectedItem.metadata?.analyzedAt || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
