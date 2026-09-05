'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HelpCircle, Globe, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      // Never sends a role — the backend's RegisterDto has no such field
      // and the global ValidationPipe (whitelist + forbidNonWhitelisted)
      // would reject the request outright if one were added here.
      const response = await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      const { access_token, refresh_token, user } = response.data.data;

      // The backend already returns a real session on successful
      // registration — establish it immediately instead of making the
      // new user log in again with the password they just typed.
      document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      const roles: string[] = user.roles || [];
      setAuth({ id: user.id, email: user.email, name: user.name, role: roles[0] || 'User' }, access_token);

      // Public registration only ever assigns CITIZEN (enforced
      // server-side), so this always lands on the citizen experience.
      router.push('/citizen');
    } catch (requestError: any) {
      const message = requestError?.response?.data?.message || requestError?.message || 'Registration failed. Please try again.';
      setError(Array.isArray(message) ? message.join(' ') : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header — shared with /login */}
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
        <div className="w-full max-w-[900px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          <div className="md:w-1/2 bg-[#061a37] p-12 flex flex-col justify-end relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-[#061a37] via-[#061a37]/80 to-[#061a37]/40"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-black leading-tight mb-4 uppercase tracking-tighter">
                Join CrisisMesh <br />Stay Ahead of Every Hazard.
              </h2>
              <p className="text-gray-400 text-sm font-bold mb-8">
                Emergency operations command center for citizens, responders, and authorities.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Real-time hazard alerts
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Report incidents in seconds
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Free for every citizen
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-12 flex flex-col justify-center">
            <div className="mb-10 text-center">
              <h3 className="text-2xl font-black text-[#0f172a] mb-2 uppercase tracking-tighter">Create Account</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Join as a citizen in under a minute</p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={200}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1" htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  placeholder="Re-enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-gray-400 uppercase">Already Registered?</span></div>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="w-full py-3 border-2 border-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
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
