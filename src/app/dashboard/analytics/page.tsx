"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import AnalysisSchedulePanel from "@/components/AnalysisSchedulePanel";
import AnalysisHistoryPanel from "@/components/AnalysisHistoryPanel";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useSoilMoistureData } from "@/hooks/useSoilMoistureData";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AnalyticsPage() {
  const { data, loading, error } = useSoilMoistureData();
  const { analysisHistory, isLoadingHistory, loadAnalysisHistory } = useAIAnalysis();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Debug: Log history data
  useEffect(() => {
    console.log("📊 Analysis History State:", {
      count: analysisHistory.length,
      isLoading: isLoadingHistory,
      items: analysisHistory
    });
  }, [analysisHistory, isLoadingHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#89986D]"></div>
          <p className="mt-4 text-gray-600 text-lg">{t('analytics.loadingData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('common.error')}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              {t('analytics.errorReload')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="content-header">
        <div className="header-left">
          <h1>📊 {t('analytics.title')}</h1>
          <p>{t('analytics.subtitle')}</p>
        </div>
        <div className="header-right">
          <div className="header-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
          <div className="header-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{currentTime.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}</span>
          </div>
          <div className={`status-indicator ${data.timestamp > 0 ? "active" : "inactive"}`}>
            <div className="status-dot"></div>
            <span>{data.timestamp > 0 ? "Live" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* Current Data Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-[#9CAB84]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">{t('analytics.soilMoisture')}</span>
            <span className="text-3xl">💧</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{data.moisture}%</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-[#89986D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">{t('analytics.airTemp')}</span>
            <span className="text-3xl">🌡️</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{data.airTemp.toFixed(1)}°C</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-[#C5D89D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">{t('analytics.airHumidity')}</span>
            <span className="text-3xl">💨</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{data.airHumidity}%</div>
        </div>

        <div className={`bg-white rounded-2xl shadow-xl p-6 border-t-4 ${
          data.weather === "Hujan" ? "border-[#9CAB84]" : "border-[#F6F0D7]"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">{t('analytics.weather')}</span>
            <span className="text-3xl">{data.weather === "Hujan" ? "🌧️" : "☀️"}</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{data.weather}</div>
        </div>
      </div>

      {/* AI Analysis Controls & History - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Analysis Schedule (1 column) */}
        <div className="lg:col-span-1">
          <AnalysisSchedulePanel />
        </div>

        {/* Right: Analysis History (2 columns - wider) */}
        <div className="lg:col-span-2">
          <AnalysisHistoryPanel 
            history={analysisHistory} 
            isLoading={isLoadingHistory} 
            onRefresh={loadAnalysisHistory}
          />
        </div>
      </div>

      {/* AI Analysis Results Panel */}
      <AIAnalysisPanel />

      {/* Footer */}
      <div className="dashboard-footer">
        <p>🤖 AI-Powered Analytics System © 2025</p>
        <p className="text-xs mt-1">Powered by OpenRouter (Meta Llama 3.3 70B) + Firebase + Next.js</p>
      </div>
    </DashboardLayout>
  );
}
