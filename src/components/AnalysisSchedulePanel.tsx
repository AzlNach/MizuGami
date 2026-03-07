"use client";

import { useAIAnalysis, ScheduleInterval } from "@/hooks/useAIAnalysis";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AnalysisSchedulePanel() {
  const {
    isAnalyzing,
    scheduleInterval,
    runAnalysis,
    updateSchedule,
    getIntervalLabel,
    getNextAnalysisTime,
  } = useAIAnalysis();

  const { t } = useLanguage();
  const scheduleOptions: ScheduleInterval[] = ["manual", "3h", "6h", "12h", "24h", "3d", "7d", "30d"];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header - Minimalist White with Sage Green Border */}
      <div className="bg-white border-b-4 border-[#9CAB84] px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#89986D] to-[#9CAB84] rounded-xl flex items-center justify-center text-2xl shadow-md">
            ⏰
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('analytics.schedule.title')}</h2>
            <p className="text-sm text-gray-600">{t('analytics.schedule.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Content - Flex-1 for equal height */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Schedule Options */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">{t('analytics.schedule.selectInterval')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {scheduleOptions.map((option) => (
              <button
                key={option}
                onClick={() => updateSchedule(option)}
                disabled={isAnalyzing}
                className={`
                  px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${scheduleInterval === option
                    ? 'bg-gradient-to-r from-[#89986D] to-[#9CAB84] text-white shadow-lg transform scale-105 ring-2 ring-[#C5D89D]'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-[#C5D89D]'
                  }
                  ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {getIntervalLabel(option)}
              </button>
            ))}
          </div>
        </div>

        {/* Active Schedule Status */}
        {scheduleInterval !== "manual" && (
          <div className="mb-6 p-4 bg-[#F6F0D7] rounded-xl border-2 border-[#C5D89D]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2.5 h-2.5 bg-[#9CAB84] rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-900 font-bold">{t('analytics.schedule.autoActive')}</span>
            </div>
            <p className="text-sm text-[#89986D] font-medium ml-5">
              {t('analytics.schedule.next')} {getNextAnalysisTime()}
            </p>
          </div>
        )}

        {/* Manual Analysis Button */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">{t('analytics.schedule.manualAnalysis')}</h4>
          <button
            onClick={() => runAnalysis(true)}
            disabled={isAnalyzing}
            className={`
              w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-base
              transition-all duration-200 border-2
              ${isAnalyzing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                : 'bg-gradient-to-r from-[#89986D] to-[#9CAB84] text-white hover:from-[#89986D] hover:to-[#89986D] border-[#9CAB84] shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400"></div>
                <span>{t('analytics.analyzing')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{t('analytics.analyzeNow')}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
