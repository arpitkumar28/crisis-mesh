/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Pool } = require(path.join(__dirname, '..', 'services', 'api', 'node_modules', 'pg'));
const bcrypt = require(path.join(__dirname, '..', 'services', 'api', 'node_modules', 'bcrypt'));

const apiUrl = process.env.PHASE1_API_URL || 'http://localhost:3002';
const databaseUrl = process.env.DATABASE_URL || 'postgresql://crisis_mesh:crisis_mesh_password@localhost:5432/crisis_mesh';
const password = process.env.PHASE1_TEST_PASSWORD;
if (!password) { console.error('RUNTIME = BLOCKED: set PHASE1_TEST_PASSWORD in the environment'); process.exit(1); }

const identities = [['CITIZEN_A', 'CITIZEN'], ['CITIZEN_B', 'CITIZEN'], ['RESPONDER', 'RESPONDER'], ['AUTHORITY', 'AUTHORITY'], ['ADMIN', 'ADMIN'], ['ANALYST', 'ANALYST']];
const marker = 'phase1-test';
const evidence = [];
const auditEvidence = [];
const tokenByIdentity = new Map();
const userByIdentity = new Map();
const citizenIdentity = 'CITIZEN_A';

async function request(method, endpoint, identity, body, headers = {}) {
  const response = await fetch(`${apiUrl}${endpoint}`, { method, headers: { 'content-type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = undefined; }
  return { status: response.status, json, headers: response.headers };
}
function record(endpoint, identity, expected, actual) {
  const result = actual === expected ? 'PASS' : 'FAIL';
  evidence.push({ timestamp: new Date().toISOString(), endpoint, identity, expected, actual, result });
  if (result === 'FAIL') console.error(`${result} ${identity} ${endpoint}: expected ${expected}, got ${actual}`);
}
function recordAccess(method, endpoint, role, allowed, actual) {
  const expected = allowed ? 'ALLOW (not 401/403)' : role === 'anonymous' ? 401 : 403;
  const passed = allowed ? actual !== 401 && actual !== 403 : actual === expected;
  const result = passed ? 'PASS' : 'FAIL';
  evidence.push({ timestamp: new Date().toISOString(), endpoint: `${method} ${endpoint}`, identity: role, expected, actual, result });
  if (!passed) console.error(`${result} ${role} ${method} ${endpoint}: expected ${expected}, got ${actual}`);
}
function auditResponse(label, response, allowedFields = []) {
  const forbidden = new Set(['password', 'password_hash', 'reset_token', 'refresh_token', 'access_token', 'jwt_secret', 'mqtt_password', 'api_key', 'service_role_key', 'database_url']);
  for (const field of allowedFields) forbidden.delete(field);
  const found = [];
  function visit(value, objectPath = '$') {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (forbidden.has(key.toLowerCase())) found.push(`${objectPath}.${key}`);
      visit(child, `${objectPath}.${key}`);
    }
  }
  visit(response.json);
  const passed = found.length === 0;
  auditEvidence.push({ label, status: response.status, result: passed ? 'PASS' : 'FAIL', fields: found });
  if (!passed) console.error(`FAIL sensitive response ${label}: ${found.join(', ')}`);
}

async function runAuthorizationMatrix() {
  const allRoles = ['CITIZEN', 'RESPONDER', 'AUTHORITY', 'ADMIN', 'ANALYST'];
  const identityForRole = { CITIZEN: 'CITIZEN_A', RESPONDER: 'RESPONDER', AUTHORITY: 'AUTHORITY', ADMIN: 'ADMIN', ANALYST: 'ANALYST' };
  const matrix = [
    ['GET', '/api/v1/incidents', allRoles],
    ['GET', '/api/v1/incidents/status/ACTIVE', allRoles],
    ['GET', '/api/v1/incidents/type/OTHER', allRoles],
    ['GET', '/api/v1/incidents/active', allRoles],
    ['GET', '/api/v1/incidents/count', allRoles],
    ['GET', '/api/v1/incidents/count/by-status', allRoles],
    ['GET', '/api/v1/incidents/00000000-0000-0000-0000-000000000000', allRoles],
    ['GET', '/api/v1/alerts', allRoles],
    ['GET', '/api/v1/alerts/status/ACTIVE', allRoles],
    ['GET', '/api/v1/alerts/severity/HIGH', allRoles],
    ['GET', '/api/v1/alerts/active', allRoles],
    ['GET', '/api/v1/alerts/critical', allRoles],
    ['GET', '/api/v1/alerts/count', allRoles],
    ['GET', '/api/v1/alerts/count/by-status', allRoles],
    ['GET', '/api/v1/alerts/filter', allRoles],
    ['GET', '/api/v1/alerts/sources', allRoles],
    ['GET', '/api/v1/alerts/types', allRoles],
    ['GET', '/api/v1/alerts/00000000-0000-0000-0000-000000000000', allRoles],
    ['GET', '/api/v1/devices', allRoles],
    ['GET', '/api/v1/devices/count', allRoles],
    ['GET', '/api/v1/devices/count/by-status', allRoles],
    ['GET', '/api/v1/devices/online', allRoles],
    ['GET', '/api/v1/devices/offline', allRoles],
    ['GET', '/api/v1/devices/00000000-0000-0000-0000-000000000000', allRoles],
    ['GET', '/api/v1/districts', allRoles],
    ['GET', '/api/v1/risk', allRoles],
    ['GET', '/api/v1/risk/high-risk', allRoles],
    ['GET', '/api/v1/risk/summary', allRoles],
    ['GET', '/api/v1/weather', allRoles],
    ['GET', '/api/v1/weather/latest', allRoles],
    ['GET', '/api/v1/resources', allRoles],
    ['GET', '/api/v1/shelters', allRoles],
    ['GET', '/api/v1/dashboard/overview', allRoles],
    ['GET', '/api/v1/notifications', allRoles],
    ['POST', '/api/v1/alerts', ['RESPONDER', 'AUTHORITY', 'ADMIN']],
    ['PUT', '/api/v1/incidents/00000000-0000-0000-0000-000000000000', ['RESPONDER', 'AUTHORITY', 'ADMIN']],
    ['DELETE', '/api/v1/incidents/00000000-0000-0000-0000-000000000000', ['ADMIN']],
    ['PUT', '/api/v1/alerts/00000000-0000-0000-0000-000000000000', ['RESPONDER', 'AUTHORITY', 'ADMIN']],
    ['DELETE', '/api/v1/alerts/00000000-0000-0000-0000-000000000000', ['ADMIN']],
    ['POST', '/api/v1/auth/admin/assign-role', ['ADMIN']],
    ['POST', '/api/v1/auth/admin/remove-role', ['ADMIN']],
  ];
  for (const [method, endpoint, allowedRoles] of matrix) {
    for (const role of allRoles) {
      const body = method === 'POST' && endpoint.includes('/alerts') ? { type: 'PUBLIC', severity: 'LOW', title: `${marker}:matrix-alert` } : method === 'POST' ? { userId: userByIdentity.get('CITIZEN_B').id, role: 'CITIZEN' } : method === 'PUT' ? { title: `${marker}:matrix-update` } : undefined;
      recordAccess(method, endpoint, role, allowedRoles.includes(role), (await request(method, endpoint, role, body, auth(identityForRole[role]))).status);
    }
    recordAccess(method, endpoint, 'anonymous', false, (await request(method, endpoint, 'anonymous', undefined)).status);
  }
}
function token(identity) { return tokenByIdentity.get(identity); }
function auth(identity) { return { authorization: `Bearer ${token(identity)}` }; }
function expiredJwt() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: userByIdentity.get('CITIZEN_A').id, type: 'access', exp: Math.floor(Date.now() / 1000) - 60 })).toString('base64url');
  const unsigned = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || '').update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

async function ensureUsers(pool) {
  const hash = await bcrypt.hash(password, 10);
  for (const [identity, role] of identities) {
    const email = `${marker}.${identity.toLowerCase()}@localhost.invalid`;
    const profile = await pool.query(`INSERT INTO profiles (email, name, phone, password_hash, is_active) VALUES ($1, $2, NULL, $3, true) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = true RETURNING id`, [email, `${marker}:${identity}`, hash]);
    const roleRow = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
    if (!roleRow.rows[0]) throw new Error(`Role ${role} is missing; run migrations first`);
    await pool.query(`INSERT INTO user_roles (profile_id, role_id) VALUES ($1, $2) ON CONFLICT (profile_id, role_id) DO NOTHING`, [profile.rows[0].id, roleRow.rows[0].id]);
    userByIdentity.set(identity, { id: profile.rows[0].id, email });
  }
}

async function loginAll() {
  for (const [identity] of identities) {
    const result = await request('POST', '/api/v1/auth/login', identity, { email: userByIdentity.get(identity).email, password });
    record('/api/v1/auth/login', identity, 200, result.status);
    if (result.status !== 200) throw new Error(`Cannot authenticate ${identity}`);
    auditResponse(`POST /api/v1/auth/login (${identity}; tokens intentional)`, result, ['access_token', 'refresh_token']);
    const data = result.json?.data || result.json;
    tokenByIdentity.set(identity, data.access_token);
    userByIdentity.get(identity).refresh = data.refresh_token;
  }
}

async function run() {
  const health = await request('GET', '/api/v1/health', 'anonymous');
  record('/api/v1/health', 'anonymous', 200, health.status);
  if (health.status !== 200) throw new Error('Health gate failed; security results are UNVERIFIED');
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await ensureUsers(pool);
    await loginAll();
    await runAuthorizationMatrix();
    auditResponse('GET /api/v1/auth/me', await request('GET', '/api/v1/auth/me', 'CITIZEN_A', undefined, auth('CITIZEN_A')));
    auditResponse('GET /api/v1/incidents', await request('GET', '/api/v1/incidents', 'CITIZEN_A', undefined, auth('CITIZEN_A')));
    auditResponse('GET /api/v1/alerts', await request('GET', '/api/v1/alerts', 'CITIZEN_A', undefined, auth('CITIZEN_A')));
    const malformed = await request('POST', '/api/v1/incidents', 'CITIZEN_A', { unexpected: `${marker}:unexpected` }, auth('CITIZEN_A'));
    auditResponse('POST /api/v1/incidents malformed DTO', malformed);
    for (const [identity] of identities) record('/api/v1/incidents', identity, 401, (await request('GET', '/api/v1/incidents', identity)).status);
    record('/api/v1/incidents', citizenIdentity, 200, (await request('GET', '/api/v1/incidents', citizenIdentity, undefined, auth(citizenIdentity))).status);
    record('/api/v1/alerts', citizenIdentity, 403, (await request('POST', '/api/v1/alerts', citizenIdentity, { type: 'PUBLIC', severity: 'LOW', title: `${marker}:alert` }, auth(citizenIdentity))).status);
    record('/api/v1/auth/admin/assign-role', citizenIdentity, 403, (await request('POST', '/api/v1/auth/admin/assign-role', citizenIdentity, { userId: userByIdentity.get('CITIZEN_B').id, role: 'ADMIN' }, auth(citizenIdentity))).status);
    record('/api/v1/auth/admin/assign-role', 'ADMIN', 200, (await request('POST', '/api/v1/auth/admin/assign-role', 'ADMIN', { userId: userByIdentity.get('CITIZEN_B').id, role: 'CITIZEN' }, auth('ADMIN'))).status);
    const createdIncident = await request('POST', '/api/v1/incidents', 'CITIZEN_A', { type: 'OTHER', title: `${marker}:incident`, description: marker }, auth('CITIZEN_A'));
    record('/api/v1/incidents', 'CITIZEN_A', 201, createdIncident.status);
    const incidentId = createdIncident.json?.data?.id;
    if (!incidentId) throw new Error('Test incident was not created; IDOR checks cannot run');
    record(`/api/v1/incidents/${incidentId}`, 'CITIZEN_A', 200, (await request('GET', `/api/v1/incidents/${incidentId}`, 'CITIZEN_A', undefined, auth('CITIZEN_A'))).status);
    record(`/api/v1/incidents/${incidentId}`, 'CITIZEN_B', 403, (await request('GET', `/api/v1/incidents/${incidentId}`, 'CITIZEN_B', undefined, auth('CITIZEN_B'))).status);
    record(`/api/v1/incidents/${incidentId}`, 'CITIZEN_B', 403, (await request('PUT', `/api/v1/incidents/${incidentId}`, 'CITIZEN_B', { title: `${marker}:idor-put` }, auth('CITIZEN_B'))).status);
    record(`/api/v1/incidents/${incidentId}`, 'CITIZEN_B', 403, (await request('DELETE', `/api/v1/incidents/${incidentId}`, 'CITIZEN_B', undefined, auth('CITIZEN_B'))).status);
    record(`/api/v1/incidents/${incidentId}`, 'CITIZEN_A', 403, (await request('PUT', `/api/v1/incidents/${incidentId}`, 'CITIZEN_A', { title: `${marker}:citizen-update` }, auth('CITIZEN_A'))).status);
    const access = token('CITIZEN_A');
    const refresh = userByIdentity.get('CITIZEN_A').refresh;
    record('/api/v1/auth/me', 'CITIZEN_A', 200, (await request('GET', '/api/v1/auth/me', 'CITIZEN_A', undefined, auth('CITIZEN_A'))).status);
    record('/api/v1/auth/me', 'malformed JWT', 401, (await request('GET', '/api/v1/auth/me', 'malformed JWT', undefined, { authorization: 'Bearer malformed' })).status);
    record('/api/v1/auth/me', 'modified JWT', 401, (await request('GET', '/api/v1/auth/me', 'modified JWT', undefined, { authorization: `Bearer ${access.slice(0, -1)}x` })).status);
    record('/api/v1/auth/me', 'expired JWT', 401, (await request('GET', '/api/v1/auth/me', 'expired JWT', undefined, { authorization: `Bearer ${expiredJwt()}` })).status);
    record('/api/v1/auth/me', 'refresh as access', 401, (await request('GET', '/api/v1/auth/me', 'refresh as access', undefined, { authorization: `Bearer ${refresh}` })).status);
    record('/api/v1/auth/refresh', 'access as refresh', 401, (await request('POST', '/api/v1/auth/refresh', 'access as refresh', { refresh_token: access })).status);
    const rotatedRefresh = await request('POST', '/api/v1/auth/refresh', 'CITIZEN_A', { refresh_token: refresh });
    record('/api/v1/auth/refresh', 'CITIZEN_A', 200, rotatedRefresh.status);
    auditResponse('POST /api/v1/auth/refresh (tokens intentional)', rotatedRefresh, ['access_token', 'refresh_token']);
    const activeRefresh = rotatedRefresh.json?.data?.refresh_token;
    record('/api/v1/auth/refresh', 'revoked refresh', 401, (await request('POST', '/api/v1/auth/refresh', 'revoked refresh', { refresh_token: refresh })).status);
    await pool.query('UPDATE profiles SET is_active = false WHERE id = $1', [userByIdentity.get('CITIZEN_A').id]);
    record('/api/v1/auth/me', 'disabled CITIZEN_A', 401, (await request('GET', '/api/v1/auth/me', 'disabled CITIZEN_A', undefined, auth('CITIZEN_A'))).status);
    record('/api/v1/incidents', 'disabled CITIZEN_A', 401, (await request('GET', '/api/v1/incidents', 'disabled CITIZEN_A', undefined, auth('CITIZEN_A'))).status);
    record('/api/v1/auth/login', 'disabled CITIZEN_A', 401, (await request('POST', '/api/v1/auth/login', 'disabled CITIZEN_A', { email: userByIdentity.get('CITIZEN_A').email, password })).status);
    record('/api/v1/auth/refresh', 'disabled CITIZEN_A', 401, (await request('POST', '/api/v1/auth/refresh', 'disabled CITIZEN_A', { refresh_token: activeRefresh })).status);
    await pool.query('UPDATE profiles SET is_active = true WHERE id = $1', [userByIdentity.get('CITIZEN_A').id]);
    for (const origin of ['http://localhost:3000', 'http://evil.example']) {
      const cors = await request('OPTIONS', '/api/v1/health', 'anonymous', undefined, { origin, 'access-control-request-method': 'GET' });
      console.log(`CORS ${origin}: status=${cors.status}, allow-origin=${cors.headers.get('access-control-allow-origin') || '<absent>'}`);
      auditEvidence.push({ label: `OPTIONS /api/v1/health Origin=${origin}`, status: cors.status, result: origin === 'http://localhost:3000' ? (cors.status === 204 && cors.headers.get('access-control-allow-origin') === origin ? 'PASS' : 'FAIL') : (!cors.headers.get('access-control-allow-origin') ? 'PASS' : 'FAIL'), fields: [] });
    }
    const noOriginCors = await request('OPTIONS', '/api/v1/health', 'anonymous', undefined, { 'access-control-request-method': 'GET' });
    auditEvidence.push({ label: 'OPTIONS /api/v1/health without Origin', status: noOriginCors.status, result: noOriginCors.status === 204 && !noOriginCors.headers.get('access-control-allow-origin') ? 'PASS' : 'FAIL', fields: [] });
  } finally {
    await pool.query('DELETE FROM incidents WHERE reported_by IN (SELECT id FROM profiles WHERE email LIKE $1)', [`${marker}.%@localhost.invalid`]);
    await pool.query('DELETE FROM user_roles WHERE profile_id IN (SELECT id FROM profiles WHERE email LIKE $1)', [`${marker}.%@localhost.invalid`]);
    await pool.query('DELETE FROM profiles WHERE email LIKE $1', [`${marker}.%@localhost.invalid`]);
    await pool.end();
  }
  const reportPath = path.join(__dirname, '..', 'PHASE_1_RUNTIME_EVIDENCE.md');
  const previousEvidence = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, 'utf8')
    : '';
  const rows = evidence.map((item) => `| ${item.timestamp} | ${item.endpoint} | ${item.identity} | ${item.expected} | ${item.actual} | ${item.result} |`).join('\n');
  const currentRun = `## Retest Run: ${new Date().toISOString()}\n\nNo tokens or passwords are recorded.\n\n| Timestamp | Endpoint | Identity | Expected | Actual | Result |\n|---|---|---|---:|---:|---:|\n${rows}\n`;
  const audits = auditEvidence.map((item) => `| ${item.label} | ${item.status} | ${item.result} | ${item.fields.join(', ') || 'none'} |`).join('\n');
  const auditRun = `\n### Response, CORS, and error audit\n\n| Probe | HTTP status | Result | Sensitive fields |\n|---|---:|---|---|\n${audits}\n`;
  fs.writeFileSync(
    reportPath,
    previousEvidence
      ? `${previousEvidence.trim()}\n\n${currentRun}${auditRun}`
      : `# Phase 1 Runtime Evidence\n\n${currentRun}${auditRun}`,
  );
  console.log(`Runtime evidence written to ${reportPath}`);
  const failures = evidence.filter((item) => item.result === 'FAIL');
  if (failures.length > 0) {
    console.error(`Phase 1 live suite failed ${failures.length} assertion(s)`);
    process.exitCode = 1;
  }
}
run().catch((error) => { console.error(`RUNTIME = BLOCKED: ${error.message}`); process.exit(1); });