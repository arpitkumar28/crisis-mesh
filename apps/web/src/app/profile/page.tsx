'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera, Lock, Bell, Globe, ChevronRight,
  LogOut, Save,
  Settings, UserCircle, ShieldAlert, History,
  Loader2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  district?: string;
  department?: string;
  location?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('information');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/me');
      const userData = response.data.data;
      setProfile(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        district: userData.district || '',
        department: userData.department || '',
        location: userData.location || '',
        preferences: userData.preferences || {
          theme: 'light',
          language: 'English (IN)',
          timezone: '(GMT+05:30) Asia/Kolkata',
          emailNotifications: true,
          smsNotifications: true,
        },
      });
      if (userData.avatar) {
        setAvatarPreview(userData.avatar);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put('/auth/me', formData);
      await fetchProfile();
      Toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <OperationsShell eyebrow="Manage your account information and preferences" title="User Profile / Account Settings">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">Loading Profile...</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Manage your account information and preferences" title="User Profile / Account Settings">
      <div className="grid grid-cols-12 gap-8">
        {/* Profile Navigation Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden p-2">
              <ProfileNavLink icon={<UserCircle size={18} />} label="Information" active={activeTab === 'information'} onClick={() => setActiveTab('information')} />
              <ProfileNavLink icon={<Lock size={18} />} label="Change Password" active={activeTab === 'password'} onClick={() => setActiveTab('password')} />
              <ProfileNavLink icon={<Settings size={18} />} label="Application Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              <ProfileNavLink icon={<Globe size={18} />} label="Language & Region" active={activeTab === 'region'} onClick={() => setActiveTab('region')} />
              <ProfileNavLink icon={<ShieldAlert size={18} />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
              <ProfileNavLink icon={<History size={18} />} label="Personalized Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
              <ProfileNavLink icon={<Bell size={18} />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
           </div>

           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
           >
              <LogOut size={18} /> Logout Account
           </button>
        </div>

        {/* Main Profile Settings Form */}
        <div className="col-span-12 lg:col-span-9">
           {activeTab === 'information' && (
             <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 -skew-x-12 translate-x-32 -translate-y-32 pointer-events-none"></div>

                <div className="mb-10">
                   <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Profile Information</h3>
                   <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage your personal account information</p>
                </div>

                <div className="flex flex-col xl:flex-row gap-16">
                   {/* Profile Photo Section */}
                   <div className="flex flex-col items-center shrink-0">
                      <div className="relative group">
                         <div className="w-40 h-40 rounded-[48px] bg-[#061a37] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-900/20 border-4 border-white overflow-hidden relative">
                            {avatarPreview ? (
                              <Image src={avatarPreview} alt="Profile" fill className="object-cover" />
                            ) : (
                              profile?.name?.charAt(0).toUpperCase() || 'A'
                            )}
                         </div>
                         <label className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center text-blue-600 hover:scale-110 transition-transform cursor-pointer">
                            <Camera size={20} />
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                         </label>
                      </div>
                      <button className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Change Photo</button>
                   </div>

                   {/* Form Fields */}
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                      <ProfileInput 
                        label="Full Name" 
                        value={formData.name || ''} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <ProfileInput 
                        label="Email Address" 
                        value={formData.email || ''} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        type="email"
                      />
                      <ProfileInput 
                        label="Phone Number" 
                        value={formData.phone || ''} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      <ProfileInput 
                        label="District Authority" 
                        value={formData.district || ''} 
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        readOnly={!profile?.role?.includes('ADMIN')}
                      />
                      <ProfileInput 
                        label="Department" 
                        value={formData.department || ''} 
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                      <ProfileInput 
                        label="Location" 
                        value={formData.location || ''} 
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                   </div>
                </div>

                <div className="mt-12 flex items-center justify-end gap-4">
                   <button 
                     onClick={() => setFormData(profile || {})}
                     className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSave}
                     disabled={saving}
                     className="px-10 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2"
                   >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                      {saving ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
             </div>
           )}

           {activeTab === 'settings' && (
             <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
                <div className="mb-10">
                   <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Application Settings</h3>
                   <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Customize your application experience</p>
                </div>

                <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                   <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-8">Preferences</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Theme</p>
                         <div className="flex p-1 bg-white border border-gray-200 rounded-xl">
                            <button
                              className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${formData.preferences?.theme === 'light' ? 'bg-[#061a37] text-white' : 'text-gray-400'}`}
                              onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'light' } as any })}
                            >
                              Light
                            </button>
                            <button 
                              className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${formData.preferences?.theme === 'dark' ? 'bg-[#061a37] text-white' : 'text-gray-400'}`}
                              onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'dark' } as any })}
                            >
                              Dark
                            </button>
                            <button 
                              className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${formData.preferences?.theme === 'system' ? 'bg-[#061a37] text-white' : 'text-gray-400'}`}
                              onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'system' } as any })}
                            >
                              System
                            </button>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Language</p>
                         <div className="relative">
                            <select 
                              value={formData.preferences?.language || 'English (IN)'}
                              onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, language: e.target.value } as any })}
                              className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-black text-[#0f172a] focus:outline-none"
                            >
                               <option>English (IN)</option>
                               <option>Hindi (HI)</option>
                            </select>
                            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time Zone</p>
                         <div className="relative">
                            <select 
                              value={formData.preferences?.timezone || '(GMT+05:30) Asia/Kolkata'}
                              onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, timezone: e.target.value } as any })}
                              className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-black text-[#0f172a] focus:outline-none"
                            >
                               <option>(GMT+05:30) Asia/Kolkata</option>
                               <option>(GMT+00:00) UTC</option>
                            </select>
                            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                      <PreferenceToggle 
                        label="Email Notifications" 
                        active={formData.preferences?.emailNotifications || false}
                        onToggle={() => setFormData({ ...formData, preferences: { ...formData.preferences, emailNotifications: !formData.preferences?.emailNotifications } as any })}
                      />
                      <PreferenceToggle 
                        label="SMS/Mobile Notifications" 
                        active={formData.preferences?.smsNotifications || false}
                        onToggle={() => setFormData({ ...formData, preferences: { ...formData.preferences, smsNotifications: !formData.preferences?.smsNotifications } as any })}
                      />
                   </div>
                </div>

                <div className="mt-12 flex items-center justify-end gap-4">
                   <button 
                     onClick={() => setFormData(profile || {})}
                     className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSave}
                     disabled={saving}
                     className="px-10 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2"
                   >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                      {saving ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
             </div>
           )}

           {activeTab !== 'information' && activeTab !== 'settings' && (
             <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
                <div className="flex flex-col items-center justify-center py-20">
                   <Settings size={48} className="text-gray-300 mb-4" />
                   <h3 className="text-lg font-black text-[#0f172a] mb-2">Coming Soon</h3>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">This feature is under development</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </OperationsShell>
  );
}

function ProfileNavLink({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'
    }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProfileInput({ label, value, onChange, type = 'text', readOnly = false }: { label: string; value: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; readOnly?: boolean }) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
       <input
         type={type}
         value={value}
         onChange={onChange}
         readOnly={readOnly}
         className={`w-full px-6 py-3.5 rounded-2xl text-xs font-black border transition-all focus:outline-none ${
           readOnly ? 'bg-gray-50 text-gray-500 border-gray-100 cursor-not-allowed' : 'bg-white text-[#0f172a] border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
         }`}
       />
    </div>
  );
}

function PreferenceToggle({ label, active = false, onToggle }: { label: string; active?: boolean; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">{label}</span>
       <button 
         onClick={onToggle}
         className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-blue-600' : 'bg-gray-300'}`}
       >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
       </button>
    </div>
  );
}
