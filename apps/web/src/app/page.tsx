'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, MapPin, Bell, Cloud, Activity,
  Search, ChevronRight, ArrowRight, Shield,
  Siren, Users, Globe, ExternalLink, Menu, X,
  Zap, AlertTriangle, CloudRain, Droplets
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#061a37] flex items-center justify-center text-blue-900/20 font-black">Loading Interactive Map...</div>
});

export default function PublicHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">
      {/* Dynamic Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
               <ShieldCheck size={24} />
            </div>
            <span className={`text-2xl font-black tracking-tighter ${scrolled ? 'text-[#061a37]' : 'text-[#061a37]'}`}>
              CRISIS<span className="text-[#3b82f6]">MESH</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'Live Map', 'States', 'Districts', 'Alerts', 'News', 'Safety', 'Resources'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
             <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#061a37] transition-colors">
                <Globe size={16} /> English <ChevronDownIcon />
             </button>
             <Link href="/login" className="px-6 py-3 bg-[#061a37] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
                Authority Login
             </Link>
          </div>

          <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 -skew-x-12 translate-x-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">Live Safety Monitoring Active</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-[#061a37] leading-[1.1] tracking-tight">
                India&apos;s Integrated <br />
                <span className="text-[#3b82f6]">Disaster Intel</span> Platform.
              </h1>

              <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
                Real-time alerts, AI-driven risk prediction, and coordinated
                emergency response to keep communities safe and resilient.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                   <input
                     type="text"
                     placeholder="Search district or hazard..."
                     className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold shadow-2xl shadow-blue-900/5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                   />
                </div>
                <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  View Live Map <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="space-y-1">
                   <h4 className="text-3xl font-black text-[#061a37]">766</h4>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Districts Tracked</p>
                </div>
                <div className="space-y-1">
                   <h4 className="text-3xl font-black text-[#061a37]">24/7</h4>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Monitoring</p>
                </div>
                <div className="space-y-1">
                   <h4 className="text-3xl font-black text-[#061a37]">AI</h4>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Prediction</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative h-[500px]">
               <div className="absolute inset-0 bg-[#061a37] rounded-[40px] shadow-2xl overflow-hidden border-8 border-white group">
                  <LiveMap entities={[]} />
                  <div className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 max-w-[200px]">
                    <div className="flex items-center gap-2 mb-3 text-red-600">
                       <AlertTriangle size={18} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Incident Alert</span>
                    </div>
                    <p className="text-xs font-black text-[#061a37]">Urban Flooding reported in Jaipur South</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">2 minutes ago</p>
                  </div>
               </div>
               {/* Floating elements */}
               <div className="absolute -bottom-8 -left-8 p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-[240px] hidden md:block animate-bounce-slow">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Activity size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Mesh Health</p>
                        <p className="text-lg font-black text-[#061a37]">98.2%</p>
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

      {/* Featured Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Public Services</h2>
            <h3 className="text-4xl font-black text-[#061a37]">Complete Disaster Resilience</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon={<MapPin size={32} />}
              title="Live Map"
              desc="Real-time visualization of hazards, resources and safe zones."
              href="/map"
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <ServiceCard
              icon={<Bell size={32} />}
              title="Alert Center"
              desc="Multi-source official warnings and early system alerts."
              href="/alerts"
              color="text-red-600"
              bg="bg-red-50"
            />
            <ServiceCard
              icon={<Cloud size={32} />}
              title="Weather Desk"
              desc="Detailed regional forecasts and extreme weather tracking."
              href="/weather"
              color="text-cyan-600"
              bg="bg-cyan-50"
            />
            <ServiceCard
              icon={<Siren size={32} />}
              title="Safety Guide"
              desc="Step-by-step guidance for preparedness and emergency."
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
                     <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                        <ShieldCheck size={32} />
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
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-4 space-y-6">
               <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                   <ShieldCheck size={18} />
                </div>
                <span className="text-xl font-black tracking-tighter text-[#061a37]">
                  CRISIS<span className="text-[#3b82f6]">MESH</span>
                </span>
              </Link>
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Empowering authorities and citizens with India&apos;s most advanced
                disaster intelligence and emergency coordination platform.
              </p>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100"></div>
                 <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100"></div>
                 <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100"></div>
                 <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100"></div>
              </div>
            </div>

            <div className="lg:col-span-2">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Platform</h4>
               <ul className="space-y-4">
                  <li><Link href="/map" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">Live Map</Link></li>
                  <li><Link href="/alerts" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">Alert Center</Link></li>
                  <li><Link href="/weather" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">Weather</Link></li>
                  <li><Link href="/reports" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">Reports</Link></li>
               </ul>
            </div>

            <div className="lg:col-span-2">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Information</h4>
               <ul className="space-y-4">
                  <li><Link href="/news" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">News Updates</Link></li>
                  <li><Link href="/safety" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">Safety Guides</Link></li>
                  <li><Link href="/resources" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">Resources</Link></li>
                  <li><Link href="/about" className="text-sm font-bold text-[#061a37] hover:text-blue-600 transition-colors">About Us</Link></li>
               </ul>
            </div>

            <div className="lg:col-span-4 bg-gray-50 rounded-3xl p-8 border border-gray-100">
               <h4 className="text-sm font-black text-[#061a37] mb-2 uppercase tracking-tight">Stay Connected</h4>
               <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">Subscribe to our newsletter for major safety updates.</p>
               <div className="flex gap-2">
                  <input type="email" placeholder="Email address" className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none" />
                  <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700">Join</button>
               </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <p>© 2026 CrisisMesh. Built for Digital India Resilience.</p>
            <div className="flex gap-8">
               <a href="#" className="hover:text-blue-600">Privacy Policy</a>
               <a href="#" className="hover:text-blue-600">Terms of Use</a>
               <a href="#" className="hover:text-blue-600">Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, desc, href, color, bg }: { icon: React.ReactNode; title: string; desc: string; href: string; color: string; bg: string }) {
  return (
    <Link href={href} className="group p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300">
       <div className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <h4 className="text-lg font-black text-[#061a37] mb-3 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{title}</h4>
       <p className="text-xs font-bold text-gray-400 leading-relaxed">{desc}</p>
       <div className="mt-8 flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-black uppercase tracking-widest italic">Explore Now</span>
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

function ChevronDownIcon() {
  return <ChevronRight className="rotate-90 text-gray-300" size={14} />;
}
