'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
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
      await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      router.push('/login?registered=1');
    } catch (requestError: any) {
      const message = requestError?.response?.data?.message || requestError?.message || 'Registration failed. Please try again.';
      setError(Array.isArray(message) ? message.join(' ') : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div>
          <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={46} height={46} style={{ display: 'block', margin: '0 auto 14px', borderRadius: '12px', objectFit: 'cover' }} />
          <h2>CRISIS<span>MESH</span></h2>
          <p>Emergency operations command center</p>
        </div>
        <form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
          {error && <div style={{ marginBottom: '16px', padding: '12px 16px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: '8px' }}>{error}</div>}
          <div style={{ display: 'grid', gap: '16px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '14px', fontWeight: '500' }} htmlFor="name">
              Full name
              <input className="auth-input" id="name" name="name" type="text" required minLength={2} maxLength={200} value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '14px', fontWeight: '500' }} htmlFor="email">
              Email address
              <input className="auth-input" id="email" name="email" type="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '14px', fontWeight: '500' }} htmlFor="password">
              Password
              <input className="auth-input" id="password" name="password" type="password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '14px', fontWeight: '500' }} htmlFor="confirm-password">
              Confirm password
              <input className="auth-input" id="confirm-password" name="confirm-password" type="password" required minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter password" />
            </label>
          </div>
          <button className="auth-submit" type="submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p style={{ marginTop: '22px', textAlign: 'center', color: '#65728a', fontSize: '13px' }}>
          Already have an account? <Link href="/login" style={{ color: '#0757e8', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
