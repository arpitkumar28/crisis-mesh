/* eslint-disable no-console */
const https = require('node:https');

const API_URL = process.env.E2E_API_URL || 'https://crisis-mesh-api.onrender.com';
const TEST_EMAIL = process.env.E2E_TEST_ADMIN_EMAIL;
const TEST_PASSWORD = process.env.E2E_TEST_ADMIN_PASSWORD;
const TEST_NAME = 'E2E Test Admin';

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('❌ Missing required environment variables.');
  console.error('   Set E2E_TEST_ADMIN_EMAIL and E2E_TEST_ADMIN_PASSWORD before running this script.');
  console.error('   Never hardcode credentials in this file.');
  process.exit(1);
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, json });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function ensureAdminUser() {
  console.log('Step 1: Ensuring admin user exists...');
  
  // Try to register
  const registerResult = await makeRequest('POST', '/api/v1/auth/register', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    name: TEST_NAME,
  });

  if (registerResult.status === 201) {
    console.log('✅ Admin user registered successfully');
    return registerResult.json.data.id;
  } else if (registerResult.status === 400 && registerResult.json?.message?.includes('already exists')) {
    console.log('ℹ️  Admin user already exists, proceeding to login');
    return null;
  } else {
    console.error('❌ Failed to register admin user:', registerResult.json);
    throw new Error('Admin user registration failed');
  }
}

async function loginAdmin() {
  console.log('Step 2: Logging in as admin...');
  
  const loginResult = await makeRequest('POST', '/api/v1/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (loginResult.status === 200) {
    console.log('✅ Admin login successful');
    return loginResult.json.data.access_token;
  } else {
    console.error('❌ Admin login failed:', loginResult.json);
    throw new Error('Admin login failed');
  }
}

async function runE2ETest(token) {
  console.log('Step 3: Running production E2E MQTT telemetry+risk+alert test...');
  console.log('(device/test markers are generated server-side and are always unique — this call does not send a device_id)');

  // No device_id is sent: the endpoint always generates a fresh, unique
  // device/test marker itself so this run can never pass because of a
  // stale row from a previous run. Metric/value/unit are left at the
  // endpoint's defaults (an actionable FLOOD/CRITICAL reading) so the
  // risk + alert stages of the pipeline are exercised, not just telemetry.
  const testResult = await makeRequest('POST', '/api/v1/test/mqtt-telemetry', {}, token);

  if (testResult.status === 200) {
    console.log('✅ E2E test executed successfully');
    return testResult.json.data;
  } else {
    console.error('❌ E2E test failed:', testResult.json);
    throw new Error('E2E test execution failed');
  }
}

async function main() {
  try {
    console.log('🚀 Starting Production E2E MQTT Test');
    console.log('=====================================');
    console.log(`API URL: ${API_URL}`);
    console.log('');

    await ensureAdminUser();
    const token = await loginAdmin();
    const results = await runE2ETest(token);

    console.log('');
    console.log('📊 E2E Test Results:');
    console.log('===================');
    console.log(`Test Marker: ${results.test_marker}`);
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Test Device (server-generated, unique): ${results.request?.device_id || 'n/a'}`);
    console.log(`MQTT Connected: ${results.mqtt_connected ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`MQTT Published: ${results.mqtt_published ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Device Found: ${results.device_found ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Telemetry Persisted: ${results.telemetry_persisted ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Risk Engine Configured (RISK_ENGINE_SYSTEM_USER_ID set): ${results.risk_engine_configured ? '✅ YES' : '❌ NO'}`);
    console.log(`Risk Assessment Created: ${results.risk_assessment_created ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Alert Created: ${results.alert_created ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Overall Success: ${results.overall_success ? '✅ PASS' : '❌ FAIL'}`);

    if (results.mqtt_topic) {
      console.log(`MQTT Topic: ${results.mqtt_topic}`);
    }

    if (results.latest_telemetry) {
      console.log(`Latest Telemetry: ${results.latest_telemetry.metric}=${results.latest_telemetry.value}${results.latest_telemetry.unit}`);
    }

    if (results.risk_assessment) {
      console.log(`Risk Assessment: ${results.risk_assessment.risk_type} ${results.risk_assessment.severity} (source: ${results.risk_assessment.source}, id: ${results.risk_assessment.id})`);
    }

    if (results.alert) {
      console.log(`Alert: ${results.alert.type} ${results.alert.severity} (status: ${results.alert.status}, id: ${results.alert.id})`);
    }

    if (results.websocket_broadcast_note) {
      console.log(`WebSocket Broadcast: ${results.websocket_broadcast_note}`);
    }

    if (results.error) {
      console.log(`Error: ${results.error}`);
    }

    console.log('');
    console.log('=====================================');
    
    if (results.overall_success) {
      console.log('🎉 PRODUCTION E2E TEST: PASS');
      process.exit(0);
    } else {
      console.log('⚠️  PRODUCTION E2E TEST: FAIL');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 FATAL ERROR:', error.message);
    console.log('=====================================');
    console.log('🚫 PRODUCTION E2E TEST: BLOCKED');
    console.log(`Missing capability: ${error.message}`);
    process.exit(1);
  }
}

main();