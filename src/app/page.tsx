"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TeamSection from "@/components/TeamSection";
import AuthModal from "@/components/AuthModal";

type AuthTab = "login" | "register";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [showAuth, setShowAuth] = useState(false);
  const { t } = useLanguage();

  const openAuth = (tab: AuthTab) => { setAuthTab(tab); setShowAuth(true); };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal defaultTab={authTab} onClose={() => setShowAuth(false)} />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F6F0D7] via-white to-[#C5D89D] opacity-50"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C5D89D] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#9CAB84] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#89986D] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Header/Navbar */}
          <nav className={`flex justify-between items-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#89986D] to-[#9CAB84] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#89986D]">IoT Dashboard</h1>
                <p className="text-xs text-gray-500">Smart Agriculture System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => openAuth("login")}
                className="px-6 py-2.5 bg-[#89986D] text-white rounded-xl font-semibold text-sm hover:bg-[#9CAB84] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Get Started →
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className={`space-y-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-block px-4 py-2 bg-[#F6F0D7] rounded-full text-[#89986D] font-semibold text-sm">
                ✨ Real-time Monitoring System
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('landing.title').split(' ').slice(0, -2).join(' ')}
                <span className="block text-[#89986D] mt-2">
                  {t('landing.title').split(' ').slice(-2).join(' ')}
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('landing.subtitle')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/dashboard"
                  className="px-8 py-4 bg-[#89986D] text-white rounded-xl font-bold text-lg hover:bg-[#9CAB84] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {t('landing.cta')}
                </Link>
                <a 
                  href="#features"
                  className="px-8 py-4 bg-white border-2 border-[#C5D89D] text-[#89986D] rounded-xl font-bold text-lg hover:bg-[#F6F0D7] transition-all duration-300"
                >
                  {t('landing.learnMore')}
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#89986D]">24/7</div>
                  <div className="text-sm text-gray-600">{t('landing.stats.realtime')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#89986D]">AI</div>
                  <div className="text-sm text-gray-600">{t('landing.stats.analytics')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#89986D]">IoT</div>
                  <div className="text-sm text-gray-600">{t('landing.stats.sensors')}</div>
                </div>
              </div>
            </div>

            {/* Right: Visual/Dashboard Preview */}
            <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative">
                {/* Dashboard Preview Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#C5D89D]">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b-2 border-[#F6F0D7]">
                      <h3 className="text-xl font-bold text-gray-800">{t('landing.preview.title')}</h3>
                      <span className="px-3 py-1 bg-[#F6F0D7] text-[#89986D] rounded-full text-sm font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#89986D] rounded-full animate-pulse"></span>
                        {t('dashboard.status.live')}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-[#F6F0D7] to-[#C5D89D] p-4 rounded-xl">
                        <div className="text-3xl mb-2">💧</div>
                        <div className="text-2xl font-bold text-[#89986D]">65%</div>
                        <div className="text-xs text-gray-600">{t('stats.soilMoisture')}</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#C5D89D] to-[#9CAB84] p-4 rounded-xl">
                        <div className="text-3xl mb-2">🌡️</div>
                        <div className="text-2xl font-bold text-white">28°C</div>
                        <div className="text-xs text-white">{t('stats.airTemp')}</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#9CAB84] to-[#89986D] p-4 rounded-xl">
                        <div className="text-3xl mb-2">💨</div>
                        <div className="text-2xl font-bold text-white">70%</div>
                        <div className="text-xs text-white">{t('stats.airHumidity')}</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#F6F0D7] to-[#C5D89D] p-4 rounded-xl">
                        <div className="text-3xl mb-2">☀️</div>
                        <div className="text-lg font-bold text-[#89986D]">{t('dashboard.weather.sunny')}</div>
                        <div className="text-xs text-gray-600">{t('stats.weather')}</div>
                      </div>
                    </div>

                    {/* AI Badge */}
                    <div className="bg-gradient-to-r from-[#89986D] to-[#9CAB84] p-4 rounded-xl text-white">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🤖</div>
                        <div>
                          <div className="font-bold">{t('landing.preview.aiTitle')}</div>
                          <div className="text-xs opacity-90">{t('landing.preview.aiDesc')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Icons */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#C5D89D] rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#9CAB84] rounded-xl flex items-center justify-center shadow-lg animate-bounce animation-delay-1000">
                  <span className="text-3xl">🌾</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gradient-to-b from-white to-[#F6F0D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing.features.title')}</h2>
            <p className="text-xl text-gray-600">{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#F6F0D7] hover:border-[#C5D89D]">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C5D89D] to-[#9CAB84] rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">💧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.features.soilMoisture')}</h3>
              <p className="text-gray-600">{t('landing.features.soilMoistureDesc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#F6F0D7] hover:border-[#C5D89D]">
              <div className="w-14 h-14 bg-gradient-to-br from-[#9CAB84] to-[#89986D] rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">🌡️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.features.airQuality')}</h3>
              <p className="text-gray-600">{t('landing.features.airQualityDesc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#F6F0D7] hover:border-[#C5D89D]">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C5D89D] to-[#9CAB84] rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">🌦️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.features.weatherForecast')}</h3>
              <p className="text-gray-600">{t('landing.features.weatherForecastDesc')}</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#F6F0D7] hover:border-[#C5D89D]">
              <div className="w-14 h-14 bg-gradient-to-br from-[#89986D] to-[#9CAB84] rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.features.aiAnalytics')}</h3>
              <p className="text-gray-600">{t('landing.features.aiAnalyticsDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Get In Touch - Team Section */}
      <TeamSection />

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-[#89986D] to-[#9CAB84]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('landing.cta.ready')}
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            {t('landing.cta.startNow')}
          </p>
          <Link 
            href="/dashboard"
            className="inline-block px-10 py-5 bg-white text-[#89986D] rounded-xl font-bold text-lg hover:bg-[#F6F0D7] transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:scale-105"
          >
            {t('landing.cta.button')}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-[#2c2c2c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#89986D] to-[#9CAB84] rounded-lg flex items-center justify-center">
                  <span className="text-xl">🌱</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('landing.footer.title')}</h3>
                  <p className="text-xs text-gray-400">{t('landing.footer.subtitle')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                {t('landing.footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t('landing.footer.features')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/dashboard" className="hover:text-[#C5D89D] transition">Dashboard</Link></li>
                <li><Link href="/dashboard/soil-moisture" className="hover:text-[#C5D89D] transition">Soil Moisture</Link></li>
                <li><Link href="/dashboard/air-quality" className="hover:text-[#C5D89D] transition">Air Quality</Link></li>
                <li><Link href="/dashboard/weather" className="hover:text-[#C5D89D] transition">Weather</Link></li>
                <li><Link href="/dashboard/analytics" className="hover:text-[#C5D89D] transition">AI Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t('landing.footer.technology')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Next.js 14</li>
                <li>Firebase Realtime Database</li>
                <li>Meta Llama 3.3 70B (OpenRouter)</li>
                <li>OpenWeather API</li>
                <li>ESP32 IoT Sensors</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
