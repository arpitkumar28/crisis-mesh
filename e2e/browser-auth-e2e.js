#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Real Authentication Browser E2E
 *
 * Drives the ACTUAL registration and login pages in a real Chromium
 * browser against a running web app + backend. No mocked API, no
 * stubbed network responses, no fake frontend-only auth.
 *
 * This is intentionally a standalone script, not a project dependency —
 * it uses the Playwright package already available in this environment
 * (see PLAYWRIGHT_BROWSERS_PATH) rather than adding @playwright/test (or
 * any other framework) to package.json for a single verification run.
 *
 * Required environment variables (never printed):
 *   E2E_WEB_URL       Base URL of the running web app (e.g. http://localhost:3100)
 *   E2E_TEST_EMAIL    Base identity for the dedicated test account (a unique
 *                      derivative is used so this is safely re-runnable).
 *   E2E_TEST_PASSWORD Password for the dedicated test account.
 *
 * Optional (only for the OperationsShell identity/logout check):
 *   E2E_PROMOTE_DB_URL  A Postgres connection string for a LOCAL/TEST
 *                        database only. If set, this script promotes the
 *                        freshly-registered test user to ADMIN directly in
 *                        that database (never via the public API — public
 *                        registration cannot do this) purely so the
 *                        privileged OperationsShell UI can be exercised.
 *                        Never point this at a production database.
 */
const { chromium } = require('playwright');

const WEB_URL = process.env.E2E_WEB_URL;
const BASE_EMAIL = process.env.E2E_TEST_EMAIL;
const BASE_PASSWORD = process.env.E2E_TEST_PASSWORD;
const PROMOTE_DB_URL = process.env.E2E_PROMOTE_DB_URL;

if (!WEB_URL || !BASE_EMAIL || !BASE_PASSWORD) {
  console.error('❌ Missing required environment variables: E2E_WEB_URL, E2E_TEST_EMAIL, E2E_TEST_PASSWORD.');
  process.exit(1);
}

const results = [];
function record(name, pass, evidence) {
  results.push({ name, pass, evidence });
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'} — ${name}: ${evidence}`);
}

function uniqueEmailFrom(base) {
  const at = base.indexOf('@');
  const marker = `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  return at === -1 ? base : `${base.slice(0, at)}+${marker}@${base.slice(at + 1)}`;
}

async function main() {
  const testEmail = uniqueEmailFrom(BASE_EMAIL);
  const testName = 'Browser E2E Test User';
  const browser = await chromium.launch();

  try {
    // ---- REGISTER ----
    const regContext = await browser.newContext();
    const regPage = await regContext.newPage();
    await regPage.goto(`${WEB_URL}/register`);
    await regPage.fill('#name', testName);
    await regPage.fill('#email', testEmail);
    await regPage.fill('#password', BASE_PASSWORD);
    await regPage.fill('#confirm-password', BASE_PASSWORD);
    await Promise.all([
      regPage.waitForURL(/\/citizen/, { timeout: 10000 }).catch(() => null),
      regPage.click('button[type="submit"]'),
    ]);
    const afterRegisterUrl = regPage.url();
    const registeredToCitizen = afterRegisterUrl.includes('/citizen');
    const regToken = await regPage.evaluate(() => localStorage.getItem('access_token'));
    const regUser = await regPage.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        return null;
      }
    });
    record(
      'Browser: real registration reaches citizen destination with a real session',
      registeredToCitizen && !!regToken && regUser?.email === testEmail,
      `url=${afterRegisterUrl}, has_token=${!!regToken}, session_email_matches=${regUser?.email === testEmail}`,
    );
    await regContext.close();

    // ---- LOGIN (fresh context — no carried-over session) ----
    const loginContext = await browser.newContext();
    const loginPage = await loginContext.newPage();
    await loginPage.goto(`${WEB_URL}/login`);
    await loginPage.fill('input[type="email"]', testEmail);
    await loginPage.fill('input[type="password"]', BASE_PASSWORD);
    await Promise.all([
      loginPage.waitForURL(/\/(citizen|dashboard)/, { timeout: 10000 }).catch(() => null),
      loginPage.click('button[type="submit"]'),
    ]);
    const afterLoginUrl = loginPage.url();
    const loginToken = await loginPage.evaluate(() => localStorage.getItem('access_token'));
    record(
      'Browser: real login reaches an authenticated destination with a real session',
      /\/(citizen|dashboard)/.test(afterLoginUrl) && !!loginToken,
      `url=${afterLoginUrl}, has_token=${!!loginToken}`,
    );

    // ---- Protected route inaccessible without a session ----
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();
    await anonPage.goto(`${WEB_URL}/dashboard`);
    await anonPage.waitForLoadState('networkidle').catch(() => null);
    const anonUrl = anonPage.url();
    record(
      'Browser: protected route redirects to login without a session',
      anonUrl.includes('/login'),
      `url=${anonUrl}`,
    );
    await anonContext.close();

    // ---- OPTIONAL: promote to ADMIN in a LOCAL/TEST db only, then verify
    //      the real identity (not a hardcoded one) in OperationsShell and
    //      a working real logout. ----
    if (PROMOTE_DB_URL) {
      const { Client } = require('pg');
      const client = new Client({ connectionString: PROMOTE_DB_URL });
      await client.connect();
      // user_roles is normalized (profile_id, role_id -> roles.id), not a
      // direct role string column — join against the real roles table.
      await client.query(
        `INSERT INTO user_roles (profile_id, role_id)
         SELECT p.id, r.id
         FROM profiles p, roles r
         WHERE p.email = $1 AND r.name = 'ADMIN'
         ON CONFLICT DO NOTHING`,
        [testEmail],
      );
      await client.end();

      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`${WEB_URL}/login`);
      await adminPage.fill('input[type="email"]', testEmail);
      await adminPage.fill('input[type="password"]', BASE_PASSWORD);
      await Promise.all([
        adminPage.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => null),
        adminPage.click('button[type="submit"]'),
      ]);
      const bodyText = await adminPage.textContent('body');
      const showsRealName = bodyText.includes(testName);
      const showsFakeIdentity = /\bAdmin\b\s*\n?\s*Authority|>AK</.test(bodyText) || bodyText.includes('AK\n');
      record(
        'Browser: OperationsShell shows the real signed-in identity, not a hardcoded one',
        showsRealName && !showsFakeIdentity,
        `shows_real_name=${showsRealName}, url=${adminPage.url()}`,
      );

      const logoutButton = adminPage.locator('button[aria-label="Log out"]');
      await logoutButton.click();
      await adminPage.waitForURL(/\/login/, { timeout: 10000 }).catch(() => null);
      const afterLogoutUrl = adminPage.url();
      const tokenAfterLogout = await adminPage.evaluate(() => localStorage.getItem('access_token'));
      record(
        'Browser: real logout redirects to login and clears the session',
        afterLogoutUrl.includes('/login') && !tokenAfterLogout,
        `url=${afterLogoutUrl}, token_cleared=${!tokenAfterLogout}`,
      );

      // Protected route inaccessible again after logout
      await adminPage.goto(`${WEB_URL}/dashboard`);
      await adminPage.waitForLoadState('networkidle').catch(() => null);
      record(
        'Browser: protected route inaccessible after logout',
        adminPage.url().includes('/login'),
        `url=${adminPage.url()}`,
      );
      await adminContext.close();
    } else {
      console.log('ℹ️  E2E_PROMOTE_DB_URL not set — skipping OperationsShell identity/logout browser check.');
    }
  } finally {
    await browser.close();
  }

  console.log('');
  console.log('=====================================');
  const failed = results.filter((r) => !r.pass);
  if (failed.length === 0) {
    console.log(`🎉 BROWSER AUTH E2E: PASS (${results.length}/${results.length})`);
    process.exit(0);
  } else {
    console.log(`⚠️  BROWSER AUTH E2E: FAIL (${results.length - failed.length}/${results.length} passed)`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 FATAL ERROR:', error.stack || error.message);
  process.exit(1);
});
