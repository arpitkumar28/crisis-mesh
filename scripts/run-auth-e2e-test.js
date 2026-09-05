#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Real Authentication E2E Gate
 *
 * Exercises the complete real user authentication lifecycle against a
 * running CrisisMesh API over real HTTP — no mocks, no stubs, no
 * hardcoded credentials. Every credential is read from environment
 * variables and NEVER printed or logged.
 *
 * Required environment variables:
 *   E2E_API_URL       Base URL of the API under test (e.g. http://localhost:3099)
 *   E2E_TEST_EMAIL    Base identity for the dedicated test account. A unique
 *                      derivative of this address is used for each run's
 *                      registration so the suite is safely re-runnable
 *                      without ever colliding with a prior run's account.
 *   E2E_TEST_PASSWORD Password for the dedicated test account (must satisfy
 *                      the real backend password policy — min 8 chars).
 *
 * This script performs real registration, real login, real /auth/me, real
 * refresh rotation, and real logout revocation against whatever backend
 * E2E_API_URL points to. It does not know or care whether that backend is
 * local or the production deployment — pointing it at production requires
 * explicit authorization and real production credentials, which this
 * script never assumes or falls back to.
 */
const http = require('http');
const https = require('https');

const API_URL = process.env.E2E_API_URL;
const BASE_EMAIL = process.env.E2E_TEST_EMAIL;
const BASE_PASSWORD = process.env.E2E_TEST_PASSWORD;

const results = [];
function record(name, pass, evidence) {
  results.push({ name, pass, evidence });
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'} — ${name}: ${evidence}`);
}

if (!API_URL || !BASE_EMAIL || !BASE_PASSWORD) {
  console.error('❌ Missing required environment variables.');
  console.error('   Set E2E_API_URL, E2E_TEST_EMAIL, and E2E_TEST_PASSWORD before running this script.');
  console.error('   Never hardcode credentials in this file.');
  process.exit(1);
}

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    // new URL(path, base) treats a leading "/" in `path` as absolute and
    // discards any path segment already in `base` (e.g. "/api") — join
    // manually so a base URL with its own path prefix is respected.
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const url = new URL(base + path);
    const client = url.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          // non-JSON response, leave json null
        }
        resolve({ status: res.statusCode, json, raw: data });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Derive a unique test email from the supplied base identity so this
// suite can be re-run indefinitely without ever hitting a stale
// "already registered" account from a previous run.
function uniqueEmailFrom(base) {
  const at = base.indexOf('@');
  if (at === -1) return base;
  const local = base.slice(0, at);
  const domain = base.slice(at + 1);
  const marker = `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  return `${local}+${marker}@${domain}`;
}

async function main() {
  const testEmail = uniqueEmailFrom(BASE_EMAIL);
  console.log(`Using freshly-derived test account for this run (email pattern only, never printing password).`);

  let accessToken, refreshToken, userId;

  // A. Registration
  {
    const res = await request('POST', '/v1/auth/register', {
      email: testEmail,
      password: BASE_PASSWORD,
      name: 'E2E Test User',
    });
    const data = res.json?.data;
    const ok =
      res.status === 201 &&
      !!data?.access_token &&
      !!data?.refresh_token &&
      data?.user?.email === testEmail &&
      Array.isArray(data?.user?.roles) &&
      data.user.roles.length === 1 &&
      data.user.roles[0] === 'CITIZEN' &&
      !('password_hash' in (data.user || {}));
    record('Registration', ok, `HTTP ${res.status}, role=${JSON.stringify(data?.user?.roles)}, has_tokens=${!!data?.access_token && !!data?.refresh_token}`);
    if (ok) {
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      userId = data.user.id;
    }
  }

  // B. /auth/me
  if (accessToken) {
    const res = await request('GET', '/v1/auth/me', null, accessToken);
    const data = res.json?.data;
    const ok =
      res.status === 200 &&
      data?.email === testEmail &&
      data?.id === userId &&
      Array.isArray(data?.roles) &&
      data.roles.includes('CITIZEN') &&
      !('password_hash' in (data || {}));
    record('/auth/me', ok, `HTTP ${res.status}, matches_registered_account=${data?.email === testEmail}, role=${JSON.stringify(data?.roles)}`);
  } else {
    record('/auth/me', false, 'skipped — registration did not produce a usable access token');
  }

  // C. Duplicate registration
  {
    const res = await request('POST', '/v1/auth/register', {
      email: testEmail,
      password: BASE_PASSWORD,
      name: 'E2E Test User Duplicate',
    });
    const ok = res.status === 409 || (res.status === 400 && /already/i.test(res.json?.message || ''));
    record('Duplicate registration rejected', ok, `HTTP ${res.status}, message=${JSON.stringify(res.json?.message)}`);
  }

  // D. Login
  let loginAccessToken, loginRefreshToken;
  {
    const res = await request('POST', '/v1/auth/login', { email: testEmail, password: BASE_PASSWORD });
    const data = res.json?.data;
    const ok = res.status === 200 && !!data?.access_token && !!data?.refresh_token && !('password_hash' in (data.user || {}));
    record('Login (correct credentials)', ok, `HTTP ${res.status}, has_tokens=${!!data?.access_token && !!data?.refresh_token}`);
    if (ok) {
      loginAccessToken = data.access_token;
      loginRefreshToken = data.refresh_token;
    }
  }

  // E. Invalid login
  {
    const res = await request('POST', '/v1/auth/login', { email: testEmail, password: `${BASE_PASSWORD}-wrong` });
    const ok = (res.status === 401 || res.status === 400) && !res.json?.data?.access_token;
    record('Invalid login rejected', ok, `HTTP ${res.status}, token_leaked=${!!res.json?.data?.access_token}`);
  }

  // F. Refresh rotation
  let rotatedRefreshToken;
  if (loginRefreshToken) {
    const res = await request('POST', '/v1/auth/refresh', { refresh_token: loginRefreshToken });
    const data = res.json?.data;
    const ok = res.status === 200 && !!data?.access_token && !!data?.refresh_token && data.refresh_token !== loginRefreshToken;
    record('Refresh rotation', ok, `HTTP ${res.status}, rotated=${data?.refresh_token !== loginRefreshToken}`);
    if (ok) rotatedRefreshToken = data.refresh_token;

    // Old refresh token must now be rejected
    const reuse = await request('POST', '/v1/auth/refresh', { refresh_token: loginRefreshToken });
    const reuseOk = reuse.status === 401 && !reuse.json?.data?.access_token;
    record('Old refresh token rejected after rotation', reuseOk, `HTTP ${reuse.status}`);
  } else {
    record('Refresh rotation', false, 'skipped — no refresh token from login');
    record('Old refresh token rejected after rotation', false, 'skipped');
  }

  // G. Logout revocation
  if (loginAccessToken && rotatedRefreshToken) {
    const res = await request('POST', '/v1/auth/logout', { refresh_token: rotatedRefreshToken }, loginAccessToken);
    const ok = res.status === 200 && res.json?.success === true;
    record('Logout', ok, `HTTP ${res.status}`);

    // H. Post-logout refresh must fail
    const postLogout = await request('POST', '/v1/auth/refresh', { refresh_token: rotatedRefreshToken });
    const postLogoutOk = postLogout.status === 401 && !postLogout.json?.data?.access_token;
    record('Post-logout refresh rejected', postLogoutOk, `HTTP ${postLogout.status}`);
  } else {
    record('Logout', false, 'skipped — missing access/refresh token from refresh step');
    record('Post-logout refresh rejected', false, 'skipped');
  }

  // I. Protected endpoint authorization
  {
    const validRes = accessToken ? await request('GET', '/v1/auth/me', null, accessToken) : { status: 0 };
    const invalidRes = await request('GET', '/v1/auth/me', null, 'not-a-real-token');
    const noneRes = await request('GET', '/v1/auth/me', null, null);
    const ok = validRes.status === 200 && invalidRes.status === 401 && noneRes.status === 401;
    record(
      'Protected endpoint enforcement',
      ok,
      `valid=${validRes.status}, invalid_token=${invalidRes.status}, no_token=${noneRes.status}`,
    );
  }

  // Role escalation attempt
  {
    const escalationEmail = uniqueEmailFrom(BASE_EMAIL);
    const res = await request('POST', '/v1/auth/register', {
      email: escalationEmail,
      password: BASE_PASSWORD,
      name: 'E2E Escalation Attempt',
      role: 'ADMIN',
    });
    // Either the global ValidationPipe rejects the unrecognized `role`
    // field outright (400), or registration succeeds but the resulting
    // account is CITIZEN-only. Both are secure outcomes.
    const rejected = res.status === 400;
    const succeededAsCitizenOnly =
      res.status === 201 &&
      Array.isArray(res.json?.data?.user?.roles) &&
      res.json.data.user.roles.length === 1 &&
      res.json.data.user.roles[0] === 'CITIZEN';
    const ok = rejected || succeededAsCitizenOnly;
    record(
      'Public role escalation blocked',
      ok,
      rejected
        ? `HTTP 400 — request rejected outright by validation`
        : `HTTP ${res.status}, resulting_roles=${JSON.stringify(res.json?.data?.user?.roles)}`,
    );
  }

  console.log('');
  console.log('=====================================');
  const failed = results.filter((r) => !r.pass);
  if (failed.length === 0) {
    console.log(`🎉 AUTH E2E GATE: PASS (${results.length}/${results.length})`);
    process.exit(0);
  } else {
    console.log(`⚠️  AUTH E2E GATE: FAIL (${results.length - failed.length}/${results.length} passed)`);
    console.log('Failed checks:', failed.map((f) => f.name).join(', '));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 FATAL ERROR:', error.message);
  console.log('🚫 AUTH E2E GATE: BLOCKED');
  process.exit(1);
});
