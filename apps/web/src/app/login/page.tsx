'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, hasHydrated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (hasHydrated && isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
      const response = await fetch(`${apiUrl}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        console.error('Login API error:', errorData);
        setError(errorData.message || `Login failed with status ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Set token as cookie for middleware to read with proper attributes
        document.cookie = `access_token=${data.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Update auth store
        setAuth(data.data.user, data.data.access_token);

        console.log('Token stored, redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'radial-gradient(circle at 20% 15%, #153d67 0, transparent 28%), #061322' }}>
      <div style={{ width: 'min(100%, 420px)', padding: '42px', background: '#fff', color: '#102043', borderRadius: '14px', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'grid', placeItems: 'center', margin: '0 auto 14px', width: '42px', height: '42px', borderRadius: '11px', background: '#e8f0ff', color: '#0757e8', fontSize: '24px' }}>✦</div>
          <h2 style={{ margin: '0', fontSize: '25px', letterSpacing: '1px' }}>CRISIS<span style={{ color: '#0ca66d' }}>MESH</span></h2>
          <p style={{ marginTop: '8px', color: '#65728a', fontSize: '13px' }}>Emergency operations command center</p>
        </div>
        <form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: '8px' }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 13px', border: '1px solid #dce3f0', borderRadius: '8px', color: '#102043', outline: 'none', fontSize: '14px' }}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 13px', border: '1px solid #dce3f0', borderRadius: '8px', color: '#102043', outline: 'none', fontSize: '14px' }}
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '12px', border: '0', borderRadius: '8px', background: '#0757e8', color: '#fff', fontWeight: '700', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
