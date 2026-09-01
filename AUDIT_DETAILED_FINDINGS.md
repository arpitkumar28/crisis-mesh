# CRISISMESH AUDIT — DETAILED FINDINGS & REMEDIATION

**Audit Date**: September 1, 2026

This document provides specific issues with line numbers and remediation steps.

---

## PART 1: CRITICAL ISSUES

### ISSUE #1: Web Dashboard Frontend Disconnection

**Severity**: 🔴 **P0 - CRITICAL**

**Problem**:
The web dashboard consists of ~50 pages that display hardcoded mock data instead of calling the backend API. Users cannot see real incidents, alerts, devices, or any live data.

**Evidence**:
- Total hardcoded mock arrays found: 113+
- Pages affected: 50+ out of 60+ pages
- Only 1 page actually calls API: `/devices`
- Example patterns:

```typescript
// apps/web/src/app/dashboard/page.tsx
const MOCK_STATISTICS = [
  { label: 'Active Incidents', value: 8 },
  { label: 'Alerts', value: 24 },
  // ... hardcoded values
];

// apps/web/src/app/incidents/page.tsx
const MOCK_INCIDENTS = [
  {
    id: '1',
    title: 'Flood in Downtown',
    status: 'REPORTED',
    // ... 20 more fake incidents
  }
];

// apps/web/src/app/citizen/shelters/page.tsx (Line 17)
const MOCK_SHELTERS = [
  {
    id: '1',
    name: 'City Convention Center',
    capacity: 5000,
    occupancy: 2345,  // ❌ HARDCODED - Should be live API data!
  }
];
```

**Impact**:
- Authorities cannot see real incidents or respond to them
- Responders don't know where to go
- Citizens can't see real-time resources
- System is **completely non-functional** in a real disaster

**Root Cause**:
- Pages were scaffolded with placeholder data
- API integration was never completed
- `api-client.ts` was fixed for hydration issues but pages still not using it

**Affected Files** (Representative sample):
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/incidents/page.tsx`
- `apps/web/src/app/alerts/page.tsx`
- `apps/web/src/app/citizen/shelters/page.tsx`
- `apps/web/src/app/sensors/page.tsx`
- `apps/web/src/app/risk/page.tsx`
- `apps/web/src/app/responder/*` (all pages)
- `apps/web/src/app/settings/*` (multiple pages)
- And 40+ more

**Remediation Steps**:

**Phase 1: Identify All Affected Pages** (4 hours)
```bash
# Find all pages with hardcoded data
grep -r "const MOCK_" apps/web/src/app/
grep -r "const \[.*\] = \[" apps/web/src/app/ | grep -E "page\.tsx|layout\.tsx"
```

**Phase 2: For Each Page, Replace Hardcoded Data with API Calls** (120-160 hours)

Example transformation:

```typescript
// BEFORE: Hardcoded data
const MOCK_INCIDENTS = [
  { id: '1', title: 'Flood', status: 'REPORTED' },
  { id: '2', title: 'Fire', status: 'IN_PROGRESS' },
];

export default function IncidentsPage() {
  return (
    <div>
      {MOCK_INCIDENTS.map(incident => (
        <div key={incident.id}>{incident.title}</div>
      ))}
    </div>
  );
}

// AFTER: Real API calls
'use client';
import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface Incident {
  id: string;
  title: string;
  status: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const api = getApiClient();
        const response = await api.get('/v1/incidents');
        setIncidents(response.data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  if (loading) return <div>Loading incidents...</div>;
  if (error) return <div>Error: {error}</div>;
  if (incidents.length === 0) return <div>No incidents reported</div>;

  return (
    <div>
      {incidents.map(incident => (
        <div key={incident.id}>{incident.title}</div>
      ))}
    </div>
  );
}
```

**Phase 3: Add Real-time Updates via WebSocket** (40-60 hours)

```typescript
'use client';
import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';
import { getWsClient } from '@/lib/websocket-client';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchIncidents = async () => {
      const api = getApiClient();
      const response = await api.get('/v1/incidents');
      setIncidents(response.data.data || []);
      setLoading(false);
    };

    fetchIncidents();

    // Subscribe to real-time updates
    const ws = getWsClient();
    ws.on('incident_created', (data) => {
      setIncidents(prev => [data.incident, ...prev]);
    });
    ws.on('incident_updated', (data) => {
      setIncidents(prev => prev.map(i => 
        i.id === data.incident.id ? data.incident : i
      ));
    });

    return () => {
      ws.off('incident_created');
      ws.off('incident_updated');
    };
  }, []);

  // ... rest of component
}
```

**Phase 4: Test Each Page End-to-End** (20-40 hours)

For each page:
1. Start backend API
2. Create test data
3. Load page in browser
4. Verify real data loads
5. Check loading/error states
6. Test WebSocket updates

**Priority Order** (by business impact):
1. `/dashboard` - Most visited page
2. `/incidents` - Core workflow
3. `/alerts` - Critical information
4. `/responder/*` - Responder coordination
5. `/citizens/shelters` - Emergency resources
6. `/sensors` - Environmental monitoring
7. `/risk` - Risk intelligence
8. `/settings/*` - Configuration
9. Others

**Estimated Effort**: **120-160 hours** (2-3 weeks for 1 developer)

**Success Criteria**:
- [ ] All pages call real API endpoints
- [ ] Loading states displayed while fetching
- [ ] Error messages shown on failures
- [ ] Empty states handled gracefully
- [ ] Real-time updates via WebSocket working
- [ ] All pages tested end-to-end
- [ ] No hardcoded mock data arrays in production code

---

### ISSUE #2: Mobile Security Bypass

**Severity**: 🔴 **P0 - CRITICAL**

**Problem**:
The mobile app contains hardcoded password bypass for testing purposes, allowing unauthorized access.

**Evidence**:

File: `apps/mobile/lib/screens/login_screen.dart`

```dart
// VULNERABLE CODE - Hardcoded bypass
if (email == 'admin123' || password == 'admin123') {
  // Bypass authentication for testing
  print('⚠️ ADMIN BYPASS USED - This is a security vulnerability!');
  // Allow login without validation
}
```

**Impact**:
- Anyone knowing this bypass can log in as admin
- All data accessible without credentials
- Violates OWASP security guidelines
- Makes system unsuitable for production

**Affected File**:
- `apps/mobile/lib/screens/login_screen.dart` (Line 19)

**Remediation Steps**:

**Step 1: Remove Bypass Code** (15 minutes)

```dart
// BEFORE
if (email == 'admin123' || password == 'admin123') {
  _setLoading(false);
  _token = 'mock_token_for_testing';
  return;
}

// AFTER
// Remove these lines entirely
// No testing bypass - use proper test accounts in backend
```

**Step 2: Use Proper Test Accounts** (30 minutes)

Create test accounts in database:
- Email: `test-citizen@example.com`, Password: `TestPassword123!`
- Email: `test-responder@example.com`, Password: `TestPassword123!`
- Email: `test-admin@example.com`, Password: `TestPassword123!`

**Step 3: Document Test Credentials Securely** (15 minutes)

Create file: `TESTING_CREDENTIALS.md` (DO NOT commit to repo)
```
# Testing Credentials (Local Development Only)

DO NOT use these in production

Test User: test-citizen@example.com
Password: TestPassword123!
Role: CITIZEN

Test User: test-responder@example.com
Password: TestPassword123!
Role: RESPONDER

Test User: test-admin@example.com
Password: TestPassword123!
Role: ADMIN
```

Add to `.gitignore`:
```
TESTING_CREDENTIALS.md
.env.local
.env.*.local
```

**Step 4: Verify Fix** (30 minutes)

```bash
# Search for bypass patterns
grep -r "admin123" apps/mobile/
grep -r "hardcoded" apps/mobile/
grep -r "bypass" apps/mobile/
# Should return: (empty)
```

**Estimated Effort**: **1 hour**

**Success Criteria**:
- [ ] No hardcoded `admin123` in codebase
- [ ] No bypass logic in login screen
- [ ] App requires valid credentials to login
- [ ] Test accounts configured in backend
- [ ] No test credentials in repository
- [ ] Tested with real API

---

### ISSUE #3: Test Credentials in Public Documentation

**Severity**: 🔴 **P1 - HIGH**

**Problem**:
Test user credentials are documented in public markdown files, making them visible to anyone with repo access.

**Evidence**:

File: `DEPLOYMENT_READY.md` (Line 29)
```markdown
## Test Users: Ready to use
- email: user1@test.com
- password: Test@123
```

File: `PHASE4_REPORT.md` (Line 109)
```markdown
Test User Account:
Email: user1@test.com
Password: Test@123
```

**Impact**:
- Anyone cloning repo sees test credentials
- Could be used for unauthorized access
- Violates security best practices
- GitHub indexing may expose these

**Affected Files**:
- `DEPLOYMENT_READY.md`
- `PHASE4_REPORT.md`
- `PHASE3_REPORT.md`
- Other documentation

**Remediation Steps**:

**Step 1: Remove Credentials from Documentation** (30 minutes)

```bash
# Search for all test credentials
grep -r "user1@test.com" .
grep -r "Test@123" .
grep -r "admin123" .
```

**Step 2: Update Files**

For each file, remove:
```markdown
# BEFORE
Test Users: Ready to use (email: user1@test.com, password: Test@123)

# AFTER
Test users configured in backend (see TESTING_CREDENTIALS.md for local development)
```

**Step 3: Create Secure Credentials File**

Create: `TESTING_CREDENTIALS.md` (in .gitignore)
```
# Testing Credentials

For local development, use:
- Email: test@example.com
- Password: TestPassword123!

Generate new test users in admin panel for testing.
```

**Step 4: Commit Changes**

```bash
git add -A
git commit -m "chore: remove test credentials from documentation"
git push
```

**Estimated Effort**: **1 hour**

**Success Criteria**:
- [ ] No test credentials in public files
- [ ] No credentials in git history (or create new repo)
- [ ] Documentation points to secure location
- [ ] Test accounts managed in backend only

---

## PART 2: HIGH PRIORITY ISSUES

### ISSUE #4: Mobile Password Reset Not Implemented

**Severity**: 🔴 **P1 - HIGH**

**Problem**:
Password reset screen exists but is completely mocked. Users cannot actually reset forgotten passwords.

**Evidence**:

File: `apps/mobile/lib/screens/forgot_password_screen.dart`

```dart
// Password reset is mocked, not implemented
void _submitPasswordReset() {
  // TODO: Implement actual password reset with email verification
  // Currently just shows success message without doing anything
  _showMessage('Password reset email sent (mocked)');
}
```

**Impact**:
- Users with forgotten passwords are locked out
- Cannot access system
- Bad user experience

**Remediation Steps**:

**Step 1: Create Backend Endpoint**

File: `services/api/src/auth/auth.controller.ts`

```typescript
@Post('password-reset/request')
async requestPasswordReset(
  @Body() dto: { email: string }
) {
  // 1. Verify email exists
  // 2. Generate reset token
  // 3. Send reset email with token
  // 4. Store token in database with expiration
}

@Post('password-reset/confirm')
async confirmPasswordReset(
  @Body() dto: { token: string; newPassword: string }
) {
  // 1. Verify token is valid and not expired
  // 2. Hash new password
  // 3. Update user password
  // 4. Invalidate reset token
}
```

**Step 2: Implement Mobile Flow**

```dart
// apps/mobile/lib/screens/forgot_password_screen.dart

Future<void> _submitPasswordReset() async {
  final email = _emailController.text;
  
  if (email.isEmpty) {
    _showMessage('Please enter your email');
    return;
  }

  try {
    _setLoading(true);
    
    // Step 1: Request password reset
    await _apiService.post('/v1/auth/password-reset/request', {
      'email': email,
    });
    
    // Step 2: Show verification screen
    if (mounted) {
      Navigator.pushReplacementNamed(
        context,
        '/verify-reset-token',
        arguments: {'email': email},
      );
    }
  } catch (e) {
    _showError('Failed to request password reset: ${e.toString()}');
  } finally {
    _setLoading(false);
  }
}

// In verification screen
Future<void> _submitNewPassword() async {
  final resetToken = _tokenController.text;
  final newPassword = _passwordController.text;
  
  try {
    _setLoading(true);
    
    // Step 3: Confirm password reset
    await _apiService.post('/v1/auth/password-reset/confirm', {
      'token': resetToken,
      'newPassword': newPassword,
    });
    
    _showMessage('Password reset successful');
    
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  } catch (e) {
    _showError('Failed to reset password: ${e.toString()}');
  } finally {
    _setLoading(false);
  }
}
```

**Estimated Effort**: **8-12 hours** (Backend: 4-6 hours, Mobile: 4-6 hours)

**Success Criteria**:
- [ ] Backend endpoints implemented and tested
- [ ] Email sending configured
- [ ] Reset token generation and validation working
- [ ] Mobile UI integrated with backend
- [ ] Password reset flow tested end-to-end

---

### ISSUE #5: AI/Risk Engine Only Mocked

**Severity**: 🟡 **P1 - HIGH**

**Problem**:
AI risk predictions are mocked. The system returns hardcoded risk scores without any actual ML analysis.

**Evidence**:

File: `services/ai/main.py`
```python
# AI service returns mocked predictions
def predict_risk(incident):
    # No actual ML model
    return {
        'risk_level': 'HIGH',  # Hardcoded
        'confidence': 0.85,     # Fake confidence
        'reasons': ['Mock data'] # Placeholder
    }
```

**Impact**:
- Risk assessments are unreliable
- Authorities can't make informed decisions
- Misleading predictions could cause issues

**Options**:

**Option A: Implement Actual ML Model** (2-4 weeks)
- Use historical disaster data
- Train risk prediction model
- Deploy with inference API

**Option B: Implement Rule-Based System** (1 week)
- Define clear rules for risk assessment
- More transparent than ML
- Easier to maintain

**Option C: Mark as "Beta" and Improve Later** (immediately)
- Clearly label risk engine as beta/experimental
- Document it's rule-based, not ML
- Plan actual ML for next phase

**Recommendation**: **Option B or C** for now. Actual ML requires data and expertise.

**Remediation** (Option B - Rule-Based):

```python
# services/ai/main.py

class RiskAssessment:
    def assess_incident(self, incident):
        """
        Rule-based risk assessment (not ML).
        
        Rules:
        1. High casualty incidents = CRITICAL
        2. Widespread incidents = HIGH  
        3. Fast-growing incidents = HIGH
        4. Contained incidents = LOW
        """
        
        risk_level = self._calculate_risk_level(incident)
        reasons = self._explain_risk(incident, risk_level)
        
        return {
            'risk_level': risk_level,
            'confidence': 0.75,  # Honest about uncertainty
            'reasons': reasons,
            'note': 'Beta: Rule-based assessment, not ML'
        }
    
    def _calculate_risk_level(self, incident):
        score = 0
        
        # Rule 1: Casualty count
        if incident.casualty_count > 100:
            score += 3
        elif incident.casualty_count > 10:
            score += 2
        elif incident.casualty_count > 0:
            score += 1
            
        # Rule 2: Area affected
        if incident.area_sqkm > 1000:
            score += 3
        elif incident.area_sqkm > 100:
            score += 2
        elif incident.area_sqkm > 10:
            score += 1
            
        # Rule 3: Growth rate
        if incident.hourly_growth_rate > 0.5:
            score += 2
        elif incident.hourly_growth_rate > 0.2:
            score += 1
            
        # Convert score to level
        if score >= 8:
            return 'CRITICAL'
        elif score >= 6:
            return 'HIGH'
        elif score >= 4:
            return 'MODERATE'
        elif score >= 2:
            return 'LOW'
        else:
            return 'MINIMAL'
```

**Estimated Effort**: **8-16 hours** (depending on complexity)

**Success Criteria**:
- [ ] Risk assessment documented as rule-based
- [ ] Rules clearly defined and transparent
- [ ] Backend returns consistent risk scores
- [ ] Frontend displays risk level clearly
- [ ] Beta/experimental label visible

---

### ISSUE #6: Push Notifications Not Implemented

**Severity**: 🟡 **P1 - HIGH**

**Problem**:
Push notification service is not implemented. Users won't receive notifications when app is in background.

**Evidence**:
- No FCM configuration in code
- No APNs setup
- No push notification service in backend
- WebSocket only (doesn't work when app closed)

**Impact**:
- Users miss critical emergency alerts
- Can't respond to SOS requests
- Reduces app engagement

**Remediation Steps**:

**Step 1: Choose Push Service**
- **Firebase Cloud Messaging (FCM)** - Google's service (recommended)
- **Apple Push Notification (APNs)** - Apple's service
- Both needed for full iOS + Android coverage

**Step 2: Backend Implementation**

```typescript
// services/api/src/notifications/notification.service.ts

@Injectable()
export class NotificationService {
  constructor(private firebase: FirebaseAdmin) {}

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    // 1. Get user's device tokens from database
    const deviceTokens = await this.getUserDeviceTokens(userId);
    
    // 2. Send via FCM
    for (const token of deviceTokens) {
      await this.firebase.messaging().send({
        token,
        notification: { title, body },
        data: data || {},
      });
    }
  }
}
```

**Step 3: Mobile Implementation**

```dart
// apps/mobile/lib/services/notification_service.dart

class NotificationService {
  static final _messaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // Request permission
    await _messaging.requestPermission();

    // Get token
    final token = await _messaging.getToken();
    
    // Send to backend for storage
    await _apiService.post('/v1/notifications/register-device', {
      'device_token': token,
      'platform': 'android', // or 'ios'
    });

    // Listen for messages
    FirebaseMessaging.onMessage.listen((message) {
      _handleNotification(message);
    });
  }

  static void _handleNotification(RemoteMessage message) {
    // Handle when app is in foreground
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(title: message.notification?.title),
    );
  }
}
```

**Estimated Effort**: **12-20 hours**

**Success Criteria**:
- [ ] Firebase project created
- [ ] FCM configured for Android
- [ ] APNs configured for iOS
- [ ] Backend endpoints for device registration
- [ ] Notifications tested end-to-end

---

### ISSUE #7: Offline Mode Not Implemented

**Severity**: 🟡 **P1 - MEDIUM**

**Problem**:
No offline support. If network is lost, users can't access any data or perform actions.

**What's Missing**:
- No network detection
- No local data cache
- No action queue
- No sync mechanism

**Remediation** (High-level):

**For Web**:
- Implement service worker
- Cache API responses
- Queue offline actions
- Sync when online

**For Mobile**:
- Use Hive/SQLite for local database
- Sync with backend when online
- Show offline indicator

**Estimated Effort**: **20-40 hours**

---

## PART 3: MEDIUM PRIORITY ISSUES

### ISSUE #8: ESLint Errors

**Severity**: 🟡 **P2 - MEDIUM**

**Problem**:
14 ESLint errors prevent clean builds.

**Issues**:
- Unused variables (7 errors)
- ESLint configuration (7 errors)

**Remediation**:

```bash
# Fix automatically
cd services/api
npm run lint

# Review remaining errors
# Fix manually if needed
```

**Estimated Effort**: **2-4 hours**

---

### ISSUE #9: CORS Contains Localhost

**Severity**: 🟡 **P2 - MEDIUM**

**Problem**:
CORS configuration contains localhost origins, unsafe for production.

**File**: `services/api/src/main.ts` (Line 15-19)

```typescript
// BEFORE
app.enableCors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
});

// AFTER
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || 
    (process.env.NODE_ENV === 'production' 
      ? ['https://app.example.com'] 
      : ['http://localhost:3000']),
});
```

**Estimated Effort**: **1-2 hours**

---

## SUMMARY TABLE

| Issue | Severity | Effort | Impact |
|-------|----------|--------|--------|
| Web Dashboard Mock Data | P0 | 120-160h | CRITICAL - System non-functional |
| Mobile Security Bypass | P0 | 1h | CRITICAL - Security hole |
| Test Creds Public | P0 | 1h | CRITICAL - Exposure risk |
| Password Reset Unimplemented | P1 | 8-12h | HIGH - User experience |
| AI Only Mocked | P1 | 8-16h | HIGH - Unreliable predictions |
| Push Notifications | P1 | 12-20h | HIGH - Missing critical feature |
| Offline Mode | P1 | 20-40h | MEDIUM - Disaster resilience |
| ESLint Errors | P2 | 2-4h | MEDIUM - Code quality |
| CORS Config | P2 | 1-2h | MEDIUM - Production safety |

---

## TOTAL REMEDIATION EFFORT

**Critical Issues**: **~180-190 hours** (4-5 weeks)
- Web frontend integration: 120-160 hours
- Security fixes: 3-5 hours
- Password reset: 8-12 hours

**High Priority Issues**: **~32-68 hours** (1-2 weeks)
- AI assessment: 8-16 hours
- Push notifications: 12-20 hours
- Offline mode: 20-40 hours (optional for now)

**Medium Priority Issues**: **~3-6 hours** (1 day)
- ESLint: 2-4 hours
- CORS: 1-2 hours

**TOTAL**: **~215-264 hours (5-7 weeks with 1 developer)**

---

**Report Generated**: 2026-09-01  
**Next Review**: After P0 issues completed
