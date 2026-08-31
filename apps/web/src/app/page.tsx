'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Bell, Cloud, Activity,
  Search, ChevronRight, ArrowRight, ChevronDown,
  Siren, Users, Globe, Menu, X,
  AlertTriangle, CloudRain, Droplets, Sun, Moon
} from 'lucide-react';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#061a37] flex items-center justify-center text-blue-900/20 font-black">Loading Interactive Map...</div>
});

type ThemePreference = 'system' | 'light' | 'dark';

export default function PublicHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('crisismesh-theme') as ThemePreference | null;
    const normalizedTheme = storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
      ? storedTheme
      : 'system';

    setThemePreference(normalizedTheme);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      const darkMode = themePreference === 'dark' || (themePreference === 'system' && mediaQuery.matches);
      document.documentElement.classList.toggle('dark', darkMode);
      window.localStorage.setItem('crisismesh-theme', themePreference);
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themePreference]);

  const nextTheme = (): ThemePreference => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const currentIndex = order.indexOf(themePreference);
    return order[(currentIndex + 1) % order.length];
  };

  const toggleTheme = () => {
    setThemePreference(nextTheme());
  };

  const themeLabel = themePreference === 'system' ? 'System' : themePreference === 'light' ? 'Light' : 'Dark';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Dynamic Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-lg py-2 dark:bg-slate-900/90 dark:shadow-slate-950/40'
          : 'bg-white/95 backdrop-blur-sm py-4 dark:bg-slate-900/95'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform overflow-hidden">
               <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#061a37] dark:text-white">
              CRISIS<span className="text-blue-600">MESH</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-7 flex-1 justify-center">
            {['Home', 'Live Map', 'States', 'Districts', 'Alerts', 'News', 'Safety', 'Resources'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                className="text-xs font-black uppercase tracking-wider text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap dark:text-slate-300 dark:hover:text-blue-400"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
             <button
               onClick={toggleTheme}
               className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 dark:text-slate-300 dark:hover:text-white"
               title="Toggle theme"
             >
                {themePreference === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                <span className="hidden xl:inline">{themeLabel}</span>
             </button>
             <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 dark:text-slate-300 dark:hover:text-white">
                <Globe size={14} /> 
                <span className="hidden xl:inline">English</span>
                <ChevronDown size={12} />
             </button>
             <Link href="/login" className="ml-2 px-5 py-2.5 bg-[#061a37] text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-900/20 hover:bg-blue-600 transition-all dark:bg-blue-600 dark:hover:bg-blue-500">
                Authority Login
             </Link>
          </div>

          <button className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {['Home', 'Live Map', 'States', 'Districts', 'Alerts', 'News', 'Safety', 'Resources'].map((item) => (
                <Link
                  key={item}
                  href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                  className="block px-4 py-3 text-sm font-black uppercase tracking-wider text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                >
                  {themePreference === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  {themePreference === 'system' ? 'System Theme' : themePreference === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-4 py-3 bg-[#061a37] text-white font-black uppercase tracking-wider text-sm rounded-lg hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Authority Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-blue-50/50 -skew-x-12 translate-x-12 lg:translate-x-20 pointer-events-none opacity-50 lg:opacity-100 dark:bg-slate-800/60"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-full border border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic">Live Safety Monitoring Active</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-7xl font-black text-[#061a37] leading-[1.2] lg:leading-[1.1] tracking-tight dark:text-white">
                Faster disaster response <br />
                for every district in <span className="text-blue-600">India</span>.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium leading-relaxed max-w-lg dark:text-slate-300">
                CrisisMesh connects citizens, responders, and agencies with real-time alerts,
                live hazard intelligence, and coordinated action when every minute matters.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/map" className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-lg sm:shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shrink-0">
                  View Live Map <ChevronRight size={18} />
                </Link>
                <Link href="/report-incident" className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#061a37] border border-gray-200 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-lg sm:shadow-xl shadow-blue-900/5 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  Report Incident
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" /> Trusted in 28 states
                </span>
                <span className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-red-700 dark:bg-slate-800 dark:text-red-300">
                  <div className="h-2 w-2 rounded-full bg-red-500" /> 24/7 monitoring
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 sm:pt-8">
                <div className="space-y-1">
                   <h4 className="text-xl sm:text-3xl font-black text-[#061a37] dark:text-white">766</h4>
                   <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">Districts Tracked</p>
                </div>
                <div className="space-y-1">
                   <h4 className="text-xl sm:text-3xl font-black text-[#061a37] dark:text-white">24/7</h4>
                   <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">Live Monitoring</p>
                </div>
                <div className="space-y-1">
                   <h4 className="text-xl sm:text-3xl font-black text-[#061a37] dark:text-white">AI</h4>
                   <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">Risk Prediction</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative h-80 sm:h-96 lg:h-[500px]">
               <div className="absolute inset-0 bg-[#061a37] rounded-2xl sm:rounded-3xl lg:rounded-[40px] shadow-lg sm:shadow-2xl overflow-hidden border-4 sm:border-8 border-white group dark:border-slate-800 dark:bg-slate-900">
                  <LiveMap entities={[]} />
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 sm:p-4 bg-white/90 backdrop-blur-md rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 max-w-[160px] sm:max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3 text-red-600">
                       <AlertTriangle size={16} />
                       <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Incident Alert</span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-black text-[#061a37]">Urban Flooding reported in Jaipur South</p>
                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase mt-2">2 minutes ago</p>
                  </div>
               </div>
               {/* Floating elements */}
               <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-gray-100 max-w-[180px] sm:max-w-[240px] hidden sm:block animate-bounce-slow">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Activity size={20} />
                     </div>
                     <div>
                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Mesh Health</p>
                        <p className="text-base sm:text-lg font-black text-[#061a37]">98.2%</p>
                     </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-[98%]"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 rounded-[28px] border border-gray-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
            {[
              { label: 'Districts monitored', value: '766+' },
              { label: 'Live sensors', value: '12k+' },
              { label: 'Residents informed', value: '2.4M' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white p-5 text-center shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-3xl font-black text-[#061a37] dark:text-white">{stat.value}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7">
              <div className="rounded-[30px] border border-gray-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
                <div className="mb-4 flex items-center justify-between gap-4 px-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600">Live Risk Overview</p>
                    <h3 className="mt-2 text-2xl font-black text-[#061a37] dark:text-white">National incident map</h3>
                  </div>
                  <button className="rounded-full border border-blue-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300">
                    View full map
                  </button>
                </div>
                <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-gray-200 bg-slate-900 dark:border-slate-700">
                  <LiveMap entities={[]} />
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-200 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> 98% network health
                  </div>
                  <div className="absolute bottom-4 right-4 w-[220px] rounded-2xl bg-white/95 p-4 shadow-xl dark:bg-slate-900/90">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-red-600">Critical</p>
                      <span className="rounded-full bg-red-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-red-700 dark:bg-red-950/40 dark:text-red-300">Flood</span>
                    </div>
                    <p className="mt-3 text-sm font-black text-[#061a37] dark:text-white">Jaipur South</p>
                    <p className="mt-1 text-[10px] font-bold text-gray-500 dark:text-slate-300">Waterlogging &ot; 2 roads blocked</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-slate-400">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Safe</span>
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> Watch</span>
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Warning</span>
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600">Why CrisisMesh works</p>
                <h3 className="mt-3 text-3xl font-black text-[#061a37] dark:text-white">Data-driven action, not just alerts.</h3>

                <div className="mt-6 space-y-4">
                  {[
                    { title: 'Real-time coordination', text: 'Unify alerts, risk levels, and district status in one operational view.', accent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' },
                    { title: 'Community visibility', text: 'Help citizens understand safe routes, shelter access, and active warnings instantly.', accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
                    { title: 'Faster response', text: 'Reduce delays with condition-aware dispatch and verified emergency zones.', accent: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300' },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-black ${item.accent}`}>
                        {item.title.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-[#061a37] dark:text-white">{item.title}</h4>
                        <p className="mt-1 text-sm font-medium text-gray-600 dark:text-slate-300">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Public Services</h2>
            <h3 className="text-4xl font-black text-[#061a37] dark:text-white">Complete Disaster Resilience</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon={<MapPin size={32} />}
              title="Live Map"
              desc="Monitor active hazards, safe zones, and district response in one view."
              href="/map"
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <ServiceCard
              icon={<Bell size={32} />}
              title="Alert Center"
              desc="Get official advisories, early warnings, and rapid incident updates."
              href="/alerts"
              color="text-red-600"
              bg="bg-red-50"
            />
            <ServiceCard
              icon={<Cloud size={32} />}
              title="Weather Desk"
              desc="Track rainfall, heat, wind, and region-specific climate intensity."
              href="/weather"
              color="text-cyan-600"
              bg="bg-cyan-50"
            />
            <ServiceCard
              icon={<Siren size={32} />}
              title="Safety Guide"
              desc="Follow clear preparedness steps before, during, and after emergencies."
              href="/safety"
              color="text-orange-600"
              bg="bg-orange-50"
            />
          </div>
        </div>
      </section>

      {/* Latest Intelligence Section */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: District Tracker */}
            <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-[#061a37] uppercase tracking-tight">Jaipur Desk</h3>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Change Area</button>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                        <CloudRain size={32} />
                     </div>
                     <div>
                        <h4 className="text-4xl font-black text-[#061a37]">28.6°C</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Light Rain • Jaipur</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <WeatherMetric label="Rainfall" value="12.4 mm" icon={<Droplets size={14} />} />
                     <WeatherMetric label="Alerts" value="7 Active" icon={<Bell size={14} />} />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Latest Local News</p>
                     <div className="space-y-4">
                        <NewsMini title="Heavy rainfall warning for Jaipur" time="12m ago" />
                        <NewsMini title="Waterlogging reported in Malviya Nagar" time="45m ago" />
                     </div>
                     <Link href="/news" className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-colors">
                        View All News <ArrowRight size={14} />
                     </Link>
                  </div>
               </div>
            </div>

            {/* Right: Regional Risk Overview */}
            <div className="lg:col-span-8 space-y-8">
               <div className="bg-[#061a37] rounded-[32px] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[100px]"></div>
                  <h3 className="text-3xl font-black mb-4 leading-tight">Ready for any disaster. <br />Everywhere in India.</h3>
                  <p className="text-gray-400 font-medium max-w-lg mb-10 leading-relaxed">
                    Our IoT sensor network and AI models provide localized risk
                    assessment for over 700+ districts across India.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <RegionStat label="IoT Sensors" value="12k+" />
                    <RegionStat label="Safe Shelters" value="5,400" />
                    <RegionStat label="Active Users" value="2.4M" />
                    <RegionStat label="Rescue Units" value="850" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex items-center gap-6 group hover:border-blue-500 transition-all cursor-pointer">
                     <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-all overflow-hidden">
                        <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={64} height={64} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-[#061a37]">Stay Informed</h4>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Get verified area updates</p>
                     </div>
                     <ChevronRight className="ml-auto text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex items-center gap-6 group hover:border-blue-500 transition-all cursor-pointer">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Users size={32} />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-[#061a37]">Volunteer</h4>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Join relief operations</p>
                     </div>
                     <ChevronRight className="ml-auto text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10 dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-4 space-y-6">
               <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 overflow-hidden">
                   <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-black tracking-tighter text-[#061a37] dark:text-white">
                  CRISIS<span className="text-[#3b82f6]">MESH</span>
                </span>
              </Link>
              <p className="text-sm font-medium text-gray-500 leading-relaxed dark:text-slate-300">
                Empowering authorities and citizens with India&apos;s most advanced disaster intelligence and emergency coordination platform.
              </p>
              <div className="flex gap-4">
                 {[0,1,2,3].map((item) => (
                   <div key={item} className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:border-slate-700" />
                 ))}
              </div>
            </div>

            <div className="lg:col-span-2">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 dark:text-slate-400">Platform</h4>
               <ul className="space-y-4">
                  <li><Link href="/map" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">Live Map</Link></li>
                  <li><Link href="/alerts" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">Alert Center</Link></li>
                  <li><Link href="/weather" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">Weather</Link></li>
                  <li><Link href="/reports" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">Reports</Link></li>
               </ul>
            </div>

            <div className="lg:col-span-2">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 dark:text-slate-400">Information</h4>
               <ul className="space-y-4">
                  <li><Link href="/news" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">News Updates</Link></li>
                  <li><Link href="/safety" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">Safety Guides</Link></li>
                  <li><Link href="/resources" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">Resources</Link></li>
                  <li><Link href="/about" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors dark:text-slate-200 dark:hover:text-blue-400">About Us</Link></li>
               </ul>
            </div>

            <div className="lg:col-span-4 bg-gray-50 rounded-3xl p-8 border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
               <h4 className="text-sm font-black text-[#061a37] mb-2 uppercase tracking-tight dark:text-white">Stay Connected</h4>
               <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6 dark:text-slate-300">Subscribe to our newsletter for major safety updates.</p>
               <div className="flex gap-2">
                  <input type="email" placeholder="Email address" className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400" />
                  <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700">Join</button>
               </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest dark:border-slate-700 dark:text-slate-400">
            <p>© 2026 CrisisMesh. Built for Digital India Resilience.</p>
            <div className="flex gap-8">
               <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a>
               <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Terms of Use</a>
               <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, desc, href, color, bg }: { icon: React.ReactNode; title: string; desc: string; href: string; color: string; bg: string }) {
  return (
    <Link href={href} className="group rounded-[30px] border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950/60">
       <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>
          {icon}
       </div>
       <h4 className="mb-3 text-lg font-black uppercase tracking-tight text-[#061a37] transition-colors group-hover:text-blue-600 dark:text-white">{title}</h4>
       <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-300">{desc}</p>
       <div className="mt-8 flex items-center gap-2 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explore</span>
          <ArrowRight size={14} />
       </div>
    </Link>
  );
}

function WeatherMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2 text-blue-600">
        {icon}
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-black text-[#061a37] uppercase">{value}</p>
    </div>
  );
}

function NewsMini({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-start gap-3 group cursor-pointer">
       <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
       <div>
          <h5 className="text-xs font-black text-[#061a37] leading-tight group-hover:text-blue-600 transition-colors">{title}</h5>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{time}</p>
       </div>
    </div>
  );
}

function RegionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
       <h4 className="text-2xl font-black text-white">{value}</h4>
       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}
