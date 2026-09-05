'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';
import Link from 'next/link';
import Image from 'next/image';
import { HelpCircle, Globe, ChevronDown } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [step, setStep] = useState(1); // 1: Login, 2: MFA (Verification) - MFA commented out

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { access_token, refresh_token, user } = response.data.data;

        // Store token in cookies for middleware and localStorage for API client
        document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        
        // Update auth store
        const roles: string[] = user.roles || [];
        setAuth({
          id: user.id,
          email: user.email,
          name: user.name,
          role: roles[0] || 'User',
        }, access_token);

        Toast.success('Login successful');
        // Route by the user's real role from the backend — never a
        // hardcoded destination regardless of who logged in.
        const isPrivileged = roles.some((r) => ['ADMIN', 'AUTHORITY', 'RESPONDER', 'ANALYST'].includes(r));
        router.push(isPrivileged ? '/dashboard' : '/citizen');
      } else {
        Toast.error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      Toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // const handleStep1 = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // In a real production system, this would trigger an MFA code email/SMS
  //   // For this implementation, we move to the verification UI step
  //   setStep(2);
  // };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg overflow-hidden">
            <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#061a37]">
            CRISIS<span className="text-blue-600">MESH</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-gray-400">
          <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:text-blue-600">
            <HelpCircle size={14} /> Help
          </button>
          <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:text-blue-600">
            <Globe size={14} /> English <ChevronDown size={12} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-[#f8fafc]">
        {/* MFA commented out - showing login form directly */}
        {/* {step === 1 ? ( */}
          {/* Authority / Admin Login */}
          <div className="w-full max-w-[900px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
            <div className="md:w-1/2 bg-[#061a37] p-12 flex flex-col justify-end relative overflow-hidden text-white">
              <Image
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
                alt="Command Center"
                fill
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061a37] via-[#061a37]/50 to-transparent"></div>

              <div className="relative z-10">
                <h2 className="text-4xl font-black leading-tight mb-4 uppercase tracking-tighter">Welcome Back! <br />CrisisMesh Authority Portal</h2>
                <p className="text-gray-400 text-sm font-bold mb-8">Real-time monitoring, faster decisions, safer communities.</p>

                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-xs font-bold text-blue-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div> Role-based access
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-blue-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div> Real-time dashboards
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-blue-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div> Secure & audited
                   </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <div className="mb-10 text-center">
                <h3 className="text-2xl font-black text-[#0f172a] mb-2 uppercase tracking-tighter">Authority Login</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Use your official credentials</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username / Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    placeholder="e.g. admin@crisismesh.gov.in"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                    <a href="#" className="text-[9px] font-black text-blue-600 uppercase hover:underline">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 px-1">
                   <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                   <label htmlFor="remember" className="text-[10px] font-black text-gray-500 uppercase">Remember me</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all"
                >
                  Continue
                </button>
              </form>

              <div className="mt-8 relative">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                 <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-gray-400 uppercase">New Here?</span></div>
              </div>

              <div className="mt-8">
                 <Link
                   href="/register"
                   className="w-full py-3 border-2 border-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
                 >
                    Create an Account
                 </Link>
              </div>

              <p className="mt-10 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">Authorized Access Only</p>
            </div>
          </div>
        {/* ) : (
          /* Multi-Factor Authentication UI - COMMENTED OUT
          <div className="w-full max-w-[800px] bg-white rounded-[40px] shadow-2xl p-16 border border-gray-100 flex flex-col md:flex-row gap-16">
            <div className="md:w-1/2">
              <h3 className="text-3xl font-black text-[#0f172a] mb-4 uppercase tracking-tighter">Security Verification</h3>
              <p className="text-xs font-bold text-gray-400 mb-10">We've sent a verification code to your official device.</p>

              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Email address</p>
                    <p className="text-sm font-bold text-[#0f172a]">{email}</p>
                 </div>
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                    <Info size={16} className="text-blue-600" />
                    <p className="text-[9px] font-black text-blue-600 uppercase">Verification required for authority access</p>
                 </div>
              </div>
            </div>

            <div className="md:w-1/2">
              <h3 className="text-xl font-black text-[#0f172a] mb-2 uppercase tracking-tighter">Multi-Factor Authentication</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-8">Enter the code to complete the secure login.</p>

              <form onSubmit={handleLoginSubmit}>
                <div className="grid grid-cols-6 gap-2 mb-6">
                   {[0, 0, 0, 0, 0, 0].map((_, i) => (
                     <input
                       key={i}
                       type="text"
                       maxLength={1}
                       className="w-full aspect-square border-2 border-gray-100 rounded-xl text-center text-xl font-black text-[#0f172a] focus:border-blue-600 outline-none transition-all bg-gray-50"
                       required
                     />
                   ))}
                </div>

                <p className="text-center text-[10px] font-black text-gray-400 uppercase mb-8">Didn't receive code? <button type="button" className="text-blue-600">Resend</button></p>

                <div className="flex items-center gap-2 mb-8">
                   <input type="checkbox" id="trust" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                   <label htmlFor="trust" className="text-[10px] font-black text-gray-500 uppercase">Trust this device for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 mb-6 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Verify & Login
                </button>

                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-center text-[10px] font-black text-blue-600 uppercase hover:underline"
                >
                  Back to login
                </button>
              </form>
            </div>
          </div>
        )} */}
      </main>

      <footer className="h-14 border-t border-gray-100 flex items-center justify-between px-6 bg-white shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">
         <div>Powered by CrisisMesh • All systems monitored</div>
         <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 text-blue-600">Help & Support</a>
         </div>
      </footer>
    </div>
  );
}
