'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, hasHydrated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registered') === '1') {
      setSuccess('Account created successfully. Sign in to continue.');
    }
  }, []);

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
        setError(errorData.message || `Login failed with status ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Set token as cookie for middleware to read with proper attributes
        document.cookie = `access_token=${data.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Update auth store
        setAuth(data.data.user, data.data.access_token);

        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'radial-gradient(circle at 20% 15%, #153d67 0, transparent 28%), #061322' }}>
      <div style={{ width: 'min(100%, 420px)', padding: '42px', background: '#fff', color: '#102043', borderRadius: '14px', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
        <div style={{ textAlign: 'center' }}>
          <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={46} height={46} style={{ display: 'block', margin: '0 auto 14px', borderRadius: '12px', objectFit: 'cover' }} />
          <h2 style={{ margin: '0', fontSize: '25px', letterSpacing: '1px' }}>CRISIS<span style={{ color: '#0ca66d' }}>MESH</span></h2>
          <p style={{ marginTop: '8px', color: '#65728a', fontSize: '13px' }}>Emergency operations command center</p>
        </div>
        <form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
          {success && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', border: '1px solid #86efac', background: '#f0fdf4', color: '#15803d', borderRadius: '8px' }}>
              {success}
            </div>
          )}
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
        <p style={{ marginTop: '22px', textAlign: 'center', color: '#65728a', fontSize: '13px' }}>
          New to CrisisMesh? <Link href="/register" style={{ color: '#0757e8', fontWeight: '700', textDecoration: 'none' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
