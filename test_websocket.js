/**
 * WebSocket Authentication Test
 * Tests WebSocket connection with and without JWT tokens
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3001';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const CITIZEN_TOKEN = process.env.CITIZEN_TOKEN;
const INVALID_TOKEN = 'invalid.token.here';

console.log('=== WebSocket Authentication Test ===\n');

// Test 1: Connection without token
console.log('Test 1: Connection without JWT token');
const ws1 = new WebSocket(WS_URL);

ws1.on('open', () => {
  console.log('❌ FAIL: Connection accepted without token');
  ws1.close();
});

ws1.on('error', (error) => {
  console.log('✅ PASS: Connection rejected without token');
  console.log('Error:', error.message);
  test2();
});

ws1.on('close', () => {
  console.log('Connection closed');
});

setTimeout(() => {
  if (ws1.readyState === WebSocket.CONNECTING) {
    ws1.close();
    console.log('⚠️  Connection timeout (may indicate slow rejection)');
    test2();
  }
}, 3000);

function test2() {
  // Test 2: Connection with invalid token
  console.log('\nTest 2: Connection with invalid JWT token');
  const ws2 = new WebSocket(WS_URL, {
    headers: {
      'Authorization': `Bearer ${INVALID_TOKEN}`
    }
  });

  ws2.on('open', () => {
    console.log('❌ FAIL: Connection accepted with invalid token');
    ws2.close();
    test3();
  });

  ws2.on('error', (error) => {
    console.log('✅ PASS: Connection rejected with invalid token');
    console.log('Error:', error.message);
    test3();
  });

  setTimeout(() => {
    if (ws2.readyState === WebSocket.CONNECTING) {
      ws2.close();
      console.log('⚠️  Connection timeout');
      test3();
    }
  }, 3000);
}

function test3() {
  // Test 3: Connection with valid admin token
  console.log('\nTest 3: Connection with valid admin JWT token');
  const ws3 = new WebSocket(WS_URL, {
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`
    }
  });

  ws3.on('open', () => {
    console.log('✅ PASS: Connection accepted with valid admin token');
    
    // Subscribe to events
    ws3.send(JSON.stringify({
      action: 'subscribe',
      channels: ['telemetry.updated', 'device.status_changed', 'alert.created', 'alert.updated', 'incident.created', 'incident.updated', 'incident.status_changed']
    }));

    setTimeout(() => {
      console.log('Waiting for event messages...');
      setTimeout(() => {
        ws3.close();
        test4();
      }, 5000);
    }, 1000);
  });

  ws3.on('message', (data) => {
    console.log('📨 Received message:', data.toString());
  });

  ws3.on('error', (error) => {
    console.log('❌ FAIL: Connection rejected with valid admin token');
    console.log('Error:', error.message);
    test4();
  });

  setTimeout(() => {
    if (ws3.readyState === WebSocket.CONNECTING) {
      ws3.close();
      console.log('⚠️  Connection timeout');
      test4();
    }
  }, 10000);
}

function test4() {
  // Test 4: Connection with valid citizen token
  console.log('\nTest 4: Connection with valid citizen JWT token');
  const ws4 = new WebSocket(WS_URL, {
    headers: {
      'Authorization': `Bearer ${CITIZEN_TOKEN}`
    }
  });

  ws4.on('open', () => {
    console.log('✅ PASS: Connection accepted with valid citizen token');
    ws4.close();
    console.log('\n=== WebSocket Authentication Test Complete ===');
    process.exit(0);
  });

  ws4.on('error', (error) => {
    console.log('❌ FAIL: Connection rejected with valid citizen token');
    console.log('Error:', error.message);
    console.log('\n=== WebSocket Authentication Test Complete ===');
    process.exit(0);
  });

  setTimeout(() => {
    if (ws4.readyState === WebSocket.CONNECTING) {
      ws4.close();
      console.log('⚠️  Connection timeout');
      console.log('\n=== WebSocket Authentication Test Complete ===');
      process.exit(0);
    }
  }, 5000);
}
