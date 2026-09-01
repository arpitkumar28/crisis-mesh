# CrisisMesh Mock Data & Production Issues Audit Report
**Date:** 2026-09-01 | **Status:** CRITICAL FINDINGS DETECTED

---

## Executive Summary
The CrisisMesh codebase contains significant amounts of **hardcoded mock data in production code**, **test credentials in non-test files**, and **unimplemented API fallbacks** that must be addressed before production deployment.

### Severity Breakdown
- 🔴 **Critical:** 113+ hardcoded data arrays in production pages
- 🟠 **High:** Mock data comments in core services
- 🟡 **Medium:** Test credentials in configuration files
- 🟢 **Low:** CSS-related .map references

---

## 1. HARDCODED DATA ARRAYS IN PRODUCTION CODE

### 1.1 Web App (`apps/web/src/app/`)
**Issue:** 113+ constant arrays with hardcoded mock data displayed in production pages instead of fetching from API.

#### Activity & Audit Logs
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/activity/page.tsx](apps/web/src/app/activity/page.tsx#L10) | 10-18 | `activityData` | 8 hardcoded activity entries with fake usernames, IPs, and timestamps |
| [apps/web/src/app/settings/audit-logs/page.tsx](apps/web/src/app/settings/audit-logs/page.tsx#L11) | 11-21 | `auditData` + `auditStats` | Hardcoded audit statistics and historical audit records |

#### Alerts & Early Warning System
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/alerts/page.tsx](apps/web/src/app/alerts/page.tsx#L30-L70) | 30-70 | Alerts fetched via API but **initial render shows empty[]** | Missing fallback UI handling while data loads |
| [apps/web/src/app/alerts/approval/page.tsx](apps/web/src/app/alerts/approval/page.tsx#L9-L34) | 9-34 | `stats`, `pendingAlerts`, `alertHistory` | 3 hardcoded arrays for approval dashboard |
| [apps/web/src/app/alerts/broadcast-confirmation/page.tsx](apps/web/src/app/alerts/broadcast-confirmation/page.tsx#L14-L27) | 14-27 | `deliveryData`, `channelStats` | Mock delivery tracking and channel statistics |
| [apps/web/src/app/alerts/early-warning/page.tsx](apps/web/src/app/alerts/early-warning/page.tsx#L17-L40) | 17-40 | `warningStats`, `activeWarnings`, `hazardForecast` | 3 arrays with fake early warning data |

#### Citizens & Safety
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/citizen/page.tsx](apps/web/src/app/citizen/page.tsx#L19) | 19-25 | `updates` | Hardcoded citizen updates with fake content |
| [apps/web/src/app/citizen/report/page.tsx](apps/web/src/app/citizen/report/page.tsx#L11-L27) | 11-27 | `hazardTypes`, `previousReports` | Mock hazard categories and report history |
| [apps/web/src/app/citizen/safety/page.tsx](apps/web/src/app/citizen/safety/page.tsx#L11) | 11-16 | `categories` | Hardcoded safety categories |
| [apps/web/src/app/citizen/shelters/page.tsx](apps/web/src/app/citizen/shelters/page.tsx#L17-L21) | 17-21 | `shelters` | **CRITICAL:** 5 hardcoded shelters with fake occupancy data (should be real-time) |
| [apps/web/src/app/citizen/sos/page.tsx](apps/web/src/app/citizen/sos/page.tsx#L16) | 16-23 | `nearestResponders` | Fake responder list with hardcoded distances |

#### Infrastructure & Connectivity
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/connectivity/page.tsx](apps/web/src/app/connectivity/page.tsx#L15-L28) | 15-28 | `powerGridData`, `outageData`, `networkStability` | 3 arrays simulating infrastructure status |
| [apps/web/src/app/crowd/page.tsx](apps/web/src/app/crowd/page.tsx#L22-L40) | 22-40 | `crowdTrendData`, `highDensityLocations` | Mock crowd density and location data |

#### Disaster & Risk Management
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/reports/page.tsx](apps/web/src/app/reports/page.tsx#L21-L45) | 21-45 | `damageStats`, `impactSummary`, `recentAssessments` | 3 hardcoded arrays for damage reports |
| [apps/web/src/app/risk/page.tsx](apps/web/src/app/risk/page.tsx#L12-L26) | 12-26 | `rainfallForecast`, `highRiskAreas` | Mock rainfall and risk data |

#### Resources & Logistics
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/resources/page.tsx](apps/web/src/app/resources/page.tsx#L14-L48) | 14-48 | `assetStats`, `categoryData`, `currentAssets`, `maintenanceAlerts` | 4 arrays of fake resource data |
| [apps/web/src/app/resources/live/page.tsx](apps/web/src/app/resources/live/page.tsx#L16) | 16-32 | `resourceStats`, `activeResources` | Mock live resource tracking |
| [apps/web/src/app/logistics/page.tsx](apps/web/src/app/logistics/page.tsx#L9-L37) | 9-37 | `logisticsStats`, `inventoryItems`, `recentShipments`, `topSuppliers` | 4 arrays of fake logistics data |
| [apps/web/src/app/donations/page.tsx](apps/web/src/app/donations/page.tsx#L13-L37) | 13-37 | `donationData`, `topCampaigns`, `recentDonations` | Mock donation tracking |

#### Sensors & Telemetry
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/sensors/page.tsx](apps/web/src/app/sensors/page.tsx#L18-L36) | 18-36 | `telemetry` state initialized | API-based but returns empty arrays on [L87](apps/web/src/app/weather/page.tsx#L87) |
| [apps/web/src/app/sensors/[id]/page.tsx](apps/web/src/app/sensors/[id]/page.tsx#L16-L35) | 16-35 | `trendData`, `ingestionData` | 2 hardcoded trend/ingestion arrays |
| [apps/web/src/app/sensors/history/page.tsx](apps/web/src/app/sensors/history/page.tsx#L13-L28) | 13-28 | `trendData`, `readings` | Historical sensor data (hardcoded) |
| [apps/web/src/app/weather/page.tsx](apps/web/src/app/weather/page.tsx#L66, #L87) | 66, 87 | Returns `[]` on error/processing | Empty array fallbacks instead of cached data |

#### Settings & Configuration
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/settings/integrations/page.tsx](apps/web/src/app/settings/integrations/page.tsx#L12-L34) | 12-34 | `integrations`, `webhooks` | **CRITICAL:** Hardcoded webhook URLs with fake data |
| [apps/web/src/app/settings/geofencing/page.tsx](apps/web/src/app/settings/geofencing/page.tsx#L19-L32) | 19-32 | `geofences`, `rules` | Mock geofence data |
| [apps/web/src/app/settings/simulator/page.tsx](apps/web/src/app/settings/simulator/page.tsx#L16-L40) | 16-40 | `simulatorStats`, `sensorNodes`, `liveData` | 3 arrays for simulator data |
| [apps/web/src/app/settings/security/page.tsx](apps/web/src/app/settings/security/page.tsx#L16-L41) | 16-41 | `threatData`, `securityStats`, `recentEvents` | Mock security events and threat data |

#### Admin & Operations
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/settings/users/page.tsx](apps/web/src/app/settings/users/page.tsx#L11-L29) | 11-29 | `users`, `stats` | Hardcoded user list with fake data |
| [apps/web/src/app/settings/roles/page.tsx](apps/web/src/app/settings/roles/page.tsx#L11-L26) | 11-26 | `roles`, `permissionCategories` | Hardcoded RBAC structure |
| [apps/web/src/app/settings/backup/page.tsx](apps/web/src/app/settings/backup/page.tsx#L11-L23) | 11-23 | `backupStats`, `backupHistory` | Mock backup records |
| [apps/web/src/app/settings/data-export/page.tsx](apps/web/src/app/settings/data-export/page.tsx#L13-L27) | 13-27 | `exportStats`, `exportHistory` | Hardcoded export history |
| [apps/web/src/app/settings/data-management/page.tsx](apps/web/src/app/settings/data-management/page.tsx#L16-L40) | 16-40 | `storageData`, `ingestionData`, `retentionPolicies` | 3 arrays for data management UI |
| [apps/web/src/app/settings/offline-sync/page.tsx](apps/web/src/app/settings/offline-sync/page.tsx#L11-L33) | 11-33 | `syncStats`, `syncQueue`, `recentSyncs` | Mock sync data |

#### Districts & States
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/districts/page.tsx](apps/web/src/app/districts/page.tsx#L13-L43) | 13-43 | `districts` | Hardcoded district list (should be dynamic) |
| [apps/web/src/app/states/page.tsx](apps/web/src/app/states/page.tsx#L13-L32) | 13-32 | `states` | Hardcoded state list (should be dynamic) |

#### Community & Volunteers
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/community/page.tsx](apps/web/src/app/community/page.tsx#L17-L35) | 17-35 | `communityStats`, `recentActivities`, `topCommunities` | 3 arrays of community mock data |
| [apps/web/src/app/volunteers/page.tsx](apps/web/src/app/volunteers/page.tsx#L15-L50) | 15-50 | `volunteerStats`, `volunteers`, `distributionData` | 3 arrays of hardcoded volunteer data |

#### Other Modules
| File | Line | Data Variable | Issue |
|------|------|--------------|-------|
| [apps/web/src/app/communication/page.tsx](apps/web/src/app/communication/page.tsx#L10-L24) | 10-24 | `channels`, `recentBroadcasts` | Mock broadcast channels |
| [apps/web/src/app/drones/page.tsx](apps/web/src/app/drones/page.tsx#L18-L29) | 18-29 | `droneStatus`, `drones` | Hardcoded drone status |
| [apps/web/src/app/feedback/page.tsx](apps/web/src/app/feedback/page.tsx#L12-L42) | 12-42 | `surveyStats`, `feedbackSummary`, `topIssues`, `recentSurveys` | 4 arrays of feedback data |
| [apps/web/src/app/help/page.tsx](apps/web/src/app/help/page.tsx#L9-L13) | 9-13 | `categories` | Help categories |
| [apps/web/src/app/knowledge-base/page.tsx](apps/web/src/app/knowledge-base/page.tsx#L9-L32) | 9-32 | `categories`, `popularArticles`, `recentlyAdded` | 3 knowledge base arrays |
| [apps/web/src/app/media/page.tsx](apps/web/src/app/media/page.tsx#L9-L22) | 9-22 | `mediaStats`, `pressReleases` | Mock media data |
| [apps/web/src/app/shelters/page.tsx](apps/web/src/app/shelters/page.tsx#L12-L26) | 12-26 | `shelterStats`, `shelterList` | Hardcoded shelter data |
| [apps/web/src/app/training/page.tsx](apps/web/src/app/training/page.tsx#L12-L25) | 12-25 | `trainingStats`, `programs` | Mock training data |
| [apps/web/src/app/system-overview/page.tsx](apps/web/src/app/system-overview/page.tsx#L22) | 22-26 | `recentActivity` | Hardcoded system activity |

---

## 2. TEST CREDENTIALS & DATABASE CONFIGURATION

### 2.1 Test Email Addresses in Test Files (Acceptable but verify not leaking)
| File | Line | Content | Severity |
|------|------|---------|----------|
| [services/api/src/auth/auth.controller.spec.ts](services/api/src/auth/auth.controller.spec.ts#L57) | 57+ | `test@example.com` | Test file (OK) |
| [services/api/src/auth/auth.service.spec.ts](services/api/src/auth/auth.service.spec.ts#L73) | 73+ | `test@example.com` | Test file (OK) |
| [services/api/src/auth/providers/jwt.provider.spec.ts](services/api/src/auth/providers/jwt.provider.spec.ts#L51) | 51+ | `test@example.com` | Test file (OK) |
| [services/api/src/users/users.service.spec.ts](services/api/src/users/users.service.spec.ts#L70) | 70+ | `test@example.com` | Test file (OK) |

### 2.2 CRITICAL: Hardcoded Database Configuration
| File | Line | Issue | Severity |
|------|------|-------|----------|
| [services/api/src/config/config.service.spec.ts](services/api/src/config/config.service.spec.ts#L10) | 10 | `process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'` | **HIGH:** Test credentials hardcoded |
| [services/api/src/database/database.service.spec.ts](services/api/src/database/database.service.spec.ts#L20) | 20 | `databaseUrl: process.env.DATABASE_URL \|\| 'postgresql://test:test@localhost:5432/test'` | **HIGH:** Fallback to localhost DB |
| [services/api/src/main.ts](services/api/src/main.ts#L15-L19) | 15-19 | `'http://localhost:3000', 'http://127.0.0.1:3000'` in CORS_ORIGIN | **MEDIUM:** Hardcoded localhost in CORS |
| [services/api/src/websocket/websocket.gateway.ts](services/api/src/websocket/websocket.gateway.ts#L18) | 18 | `'http://localhost:3000'` in WebSocket CORS | **MEDIUM:** Hardcoded localhost |

---

## 3. MOCK DATA IN CORE SERVICES

### 3.1 Mobile App API Service
| File | Line | Issue | Severity |
|------|------|-------|----------|
| [apps/mobile/lib/services/api_service.dart](apps/mobile/lib/services/api_service.dart#L347) | 347 | Comment: `// or just return mock data if not in backend yet.` | **HIGH:** Fallback to mock data implemented |
| [apps/mobile/lib/services/api_service.dart](apps/mobile/lib/services/api_service.dart#L94) | 94 | `if (data is! List) return const []` | Returns empty array when data is not list |
| [apps/mobile/lib/services/api_service.dart](apps/mobile/lib/services/api_service.dart#L328) | 328 | `return []` on error/missing data | Silent failure with empty array |
| [apps/mobile/lib/screens/forgot_password_screen.dart](apps/mobile/lib/screens/forgot_password_screen.dart#L19) | 19 | Comment: `// Mock sending reset link` | **MEDIUM:** Unimplemented password reset |

### 3.2 Hardcoded Sample Data in Mobile Screens
| File | Line | Data | Issue |
|------|------|------|-------|
| [apps/mobile/lib/screens/checklists_screen.dart](apps/mobile/lib/screens/checklists_screen.dart#L11) | 11-30 | `_items = [...]` | Hardcoded checklist items |
| [apps/mobile/lib/screens/emergency_contacts_screen.dart](apps/mobile/lib/screens/emergency_contacts_screen.dart#L7) | 7-22 | `contacts = const [...]` | Hardcoded emergency contacts |
| [apps/mobile/lib/screens/language_screen.dart](apps/mobile/lib/screens/language_screen.dart#L14) | 14-20 | `_languages = [...]` | Hardcoded language list |
| [apps/mobile/lib/screens/onboarding_screen.dart](apps/mobile/lib/screens/onboarding_screen.dart#L14) | 14-30 | `_pages = [...]` | Hardcoded onboarding pages |
| [apps/mobile/lib/screens/report_incident_screen.dart](apps/mobile/lib/screens/report_incident_screen.dart#L21-L22) | 21-22 | `_types`, `_severities` | Hardcoded incident type/severity lists |
| [apps/mobile/lib/screens/safety_tips_screen.dart](apps/mobile/lib/screens/safety_tips_screen.dart#L6) | 6-64 | `tips = const [...]` | Hardcoded safety tips |
| [apps/mobile/lib/screens/training_videos_screen.dart](apps/mobile/lib/screens/training_videos_screen.dart#L6) | 6-36 | `videos = const [...]` | Hardcoded training video list |

---

## 4. UNIMPLEMENTED TODOs & FIXMES

### 4.1 API Service Fallback Comment
| File | Line | Comment | Severity |
|------|------|---------|----------|
| [apps/mobile/lib/services/api_service.dart](apps/mobile/lib/services/api_service.dart#L345-L350) | 345-350 | Multiple comments about mock data fallback for missing endpoints | **HIGH:** Indicates incomplete backend |

### 4.2 Password Reset - Unimplemented
| File | Line | Comment | Severity |
|------|------|---------|----------|
| [apps/mobile/lib/screens/forgot_password_screen.dart](apps/mobile/lib/screens/forgot_password_screen.dart#L19) | 19 | `// Mock sending reset link` | **HIGH:** Password reset is mocked, not implemented |

---

## 5. COMMENTED-OUT API CALLS

### 5.1 API/Fetch References (Not Commented but with fallback)
| File | Line | Reference | Status |
|------|------|-----------|--------|
| [apps/web/src/app/page.tsx](apps/web/src/app/page.tsx#L50) | 50 | `// Fetch weather data for Jaipur` | Comment explaining fetch logic |
| [apps/web/src/app/map/page.tsx](apps/web/src/app/map/page.tsx#L55) | 55 | `// For now, we'll fetch incidents and alerts...` | Placeholder comment |

---

## 6. LOCALSTORAGE USAGE (Potential Mock/Cache Issues)

| File | Line | Usage | Severity |
|------|------|-------|----------|
| [apps/web/src/app/login/page.tsx](apps/web/src/app/login/page.tsx#L33) | 33-34 | `localStorage.setItem('access_token', access_token)` | Stores JWT token (OK) |
| [apps/web/src/app/login/page.tsx](apps/web/src/app/login/page.tsx#L34) | 34 | `localStorage.setItem('user', JSON.stringify(user))` | Stores user data (OK) |
| [apps/web/src/app/page.tsx](apps/web/src/app/page.tsx#L36) | 36 | `localStorage.getItem('crisismesh-theme')` | Theme preference (OK) |
| [apps/web/src/lib/api-client.ts](apps/web/src/lib/api-client.ts#L26) | 26 | `localStorage.getItem('access_token')` | Token retrieval (OK) |
| [apps/web/src/lib/store/auth-store.ts](apps/web/src/lib/store/auth-store.ts#L35-L36) | 35-36 | Token/User retrieval from localStorage | Used for auth persistence (OK) |

---

## 7. RETURN EMPTY ARRAYS/OBJECTS (Fallback Issues)

### 7.1 Web App
| File | Line | Function | Issue |
|------|------|----------|-------|
| [apps/web/src/app/weather/page.tsx](apps/web/src/app/weather/page.tsx#L66) | 66 | `processHourlyData()` | Returns `[]` when forecast is falsy |
| [apps/web/src/app/weather/page.tsx](apps/web/src/app/weather/page.tsx#L87) | 87 | `processHourlyData()` again | Returns `[]` on error |
| [apps/web/src/lib/toast.ts](apps/web/src/lib/toast.ts#L104) | 104 | `sanitizeErrorMessage()` | Returns `[]` for invalid error details |

### 7.2 Mobile App
| File | Line | Function | Issue |
|------|------|----------|-------|
| [apps/mobile/lib/services/api_service.dart](apps/mobile/lib/services/api_service.dart#L94) | 94 | `recordsFrom()` | Returns empty list if data type mismatch |
| [apps/mobile/lib/services/api_service.dart](apps/mobile/lib/services/api_service.dart#L328) | 328 | `getNews()` | Returns empty list on error |

### 7.3 API Backend
| File | Line | Function | Issue |
|------|------|----------|-------|
| [services/api/src/auth/guards/roles.guard.spec.ts](services/api/src/auth/guards/roles.guard.spec.ts#L53) | 53 | `mockReflector.getAllAndOverride()` | Test mock returns `[]` |
| [services/api/src/database/migration.service.ts](services/api/src/database/migration.service.ts#L66) | 66 | `getPendingMigrations()` | Returns `[]` if no pending migrations |
| [services/api/src/devices/devices.service.ts](services/api/src/devices/devices.service.ts#L139) | 139 | `findById()` | Returns `null` if device not found |
| [services/api/src/telemetry/telemetry.service.ts](services/api/src/telemetry/telemetry.service.ts#L267) | 267, 280, 363 | `getLatestReading()`, `getReadingStats()` | Returns `null` for missing data |
| [services/api/src/websocket/websocket.gateway.ts](services/api/src/websocket/websocket.gateway.ts#L119) | 119 | `handleDisconnect()` | Returns `null` |

---

## 8. INTELLIGENCE SERVICE - HARDCODED FALLBACK

| File | Line | Issue | Severity |
|------|------|-------|----------|
| [services/api/src/intelligence/disaster-feed.service.ts](services/api/src/intelligence/disaster-feed.service.ts#L100) | 100 | Uses `process.env.GDACS_BASE_URL \|\| 'https://www.gdacs.org/gdacsapi'` | Hardcoded fallback URL |

---

## 9. SUMMARY BY COMPONENT

### Critical Issues (Must Fix Before Production)
1. **113+ hardcoded mock data arrays** in web app pages - Replace with API calls
2. **Shelter data hardcoded** (citizen/shelters/page.tsx) - Should pull real-time occupancy
3. **Webhook URLs hardcoded** (settings/integrations/page.tsx) - Should be database-driven
4. **Password reset mocked** (mobile forgot_password_screen.dart) - Needs implementation
5. **Geofence data hardcoded** (settings/geofencing/page.tsx) - Should be database-driven
6. **Test database config hardcoded** (config.service.spec.ts) - Database credentials exposed

### High Priority Issues
1. Mock data fallback comments in api_service.dart
2. Empty array returns on API errors
3. Hardcoded localhost/127.0.0.1 in CORS configuration
4. Database configuration test credentials

### Medium Priority Issues
1. LocalStorage fallback logic needs review
2. Error handling returns empty states instead of user-friendly messages
3. CSS .map files reference (development artifact)

---

## 10. REMEDIATION CHECKLIST

### Phase 1: Data Arrays (Immediate)
- [ ] Replace 50+ hardcoded arrays with API endpoints
- [ ] Implement proper loading/error states instead of empty arrays
- [ ] Create re-usable data fetching hooks

### Phase 2: Services (High Priority)
- [ ] Implement password reset endpoint
- [ ] Remove mock data fallback comments
- [ ] Add proper error handling with retry logic

### Phase 3: Configuration (High Priority)
- [ ] Remove hardcoded test credentials
- [ ] Extract localhost URLs to environment variables
- [ ] Implement environment-based configuration

### Phase 4: Mobile App (High Priority)
- [ ] Replace hardcoded checklist/contacts with API-driven data
- [ ] Implement offline caching properly
- [ ] Remove mock data fallback logic

---

## Files Requiring Immediate Action

### Top 20 Files by Issue Count
1. `apps/web/src/app/` - 113+ constant arrays (BATCH REPLACEMENT NEEDED)
2. `services/api/src/config/config.service.spec.ts` - Test credentials
3. `services/api/src/database/database.service.spec.ts` - Test DB config
4. `apps/mobile/lib/services/api_service.dart` - Mock fallback comments
5. `apps/web/src/app/citizen/shelters/page.tsx` - Critical shelter data
6. `apps/web/src/app/settings/integrations/page.tsx` - Hardcoded webhooks
7. `apps/web/src/app/settings/geofencing/page.tsx` - Geofence data
8. `apps/mobile/lib/screens/forgot_password_screen.dart` - Unimplemented feature
9. `services/api/src/main.ts` - Hardcoded localhost CORS
10. `services/api/src/websocket/websocket.gateway.ts` - Hardcoded localhost

---

## Recommendations

1. **Implement Data Fetching Framework**: Create a consistent pattern for fetching data across web app
2. **API-First Approach**: All pages should fetch data from API, with proper loading/error states
3. **Configuration Management**: Use environment variables for all URLs, credentials, settings
4. **Test Data Isolation**: Keep mock data only in test files (.spec.ts, tests/)
5. **Feature Flags**: Implement feature flags for incomplete features (like password reset)
6. **Error Boundaries**: Add proper error handling instead of silent failures with empty arrays

---

**Report Generated:** 2026-09-01
**Next Steps:** Prioritize Critical Issues and create implementation plan for Phase 1
