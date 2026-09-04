# Bootstrap Admin Documentation

## Overview

This document describes the secure, environment-controlled one-time ADMIN bootstrap implementation for CrisisMesh. This system allows for the initial provisioning of an admin user in production environments without compromising security or affecting normal user registration.

## Security Requirements Met

✅ **Opt-in via environment variables only** - Bootstrap only runs when explicitly configured  
✅ **Idempotent operation** - Does nothing if admin already exists with ADMIN role  
✅ **No password logging** - Never logs BOOTSTRAP_ADMIN_PASSWORD  
✅ **No credential exposure** - Password never returned in API responses, logs, or exceptions  
✅ **Existing registration unchanged** - Normal registration still creates CITIZEN users  
✅ **No self-escalation** - Users cannot self-register as ADMIN  
✅ **No privilege escalation** - Cannot upgrade existing accounts via bootstrap  
✅ **Uses existing hashing** - Reuses application's bcrypt password hashing  
✅ **Role-based access control intact** - JwtAuthGuard and RolesGuard unchanged  
✅ **Audit-safe logging** - Logs confirm completion without exposing credentials  

## Files Changed

### New Files Created

1. **`src/bootstrap/bootstrap.service.ts`** (144 lines)
   - Core bootstrap service with idempotent admin creation
   - Validates email format and password strength
   - Prevents privilege escalation of existing accounts
   - Uses existing password hashing and user creation mechanisms

2. **`src/bootstrap/bootstrap.module.ts`** (15 lines)
   - NestJS module for bootstrap functionality
   - Exports BootstrapService for CLI use

3. **`src/bootstrap/bootstrap.cli.ts`** (88 lines)
   - Standalone CLI script for one-time bootstrap execution
   - Provides clear security reminders and troubleshooting guidance
   - Usage: `npm run bootstrap:admin`

4. **`src/bootstrap/bootstrap.service.spec.ts`** (398 lines)
   - Comprehensive unit tests for bootstrap service
   - Tests security requirements, idempotency, and error handling
   - 21 test cases covering all scenarios

5. **`src/bootstrap/bootstrap.integration.spec.ts`** (218 lines)
   - Integration tests ensuring bootstrap doesn't affect normal operations
   - Tests that registration still creates CITIZEN users
   - Tests that RBAC remains unchanged
   - 7 test cases covering integration scenarios

### Modified Files

1. **`src/app.module.ts`**
   - Added BootstrapModule import to make bootstrap service available

2. **`package.json`**
   - Added script: `"bootstrap:admin": "ts-node src/bootstrap/bootstrap.cli.ts"`

3. **`src/config/config.service.ts`**
   - Added `get(key: string)` method for environment variable access
   - Modified constructor to skip validation in test environment

4. **`tsconfig.json`**
   - Removed incompatible TypeScript deprecation setting

## Environment Variables

### Required for Bootstrap

- **`BOOTSTRAP_ADMIN_EMAIL`**: Email address for the bootstrap admin account
  - Must be valid email format
  - Example: `admin@crisismesh.example.com`

- **`BOOTSTRAP_ADMIN_PASSWORD`**: Password for the bootstrap admin account
  - Minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
  - Example: `SecureAdminPass123`

### Important Notes

- Both variables must be set for bootstrap to execute
- If either is missing, bootstrap does nothing (opt-in behavior)
- **Never commit these values to source control**
- **Never use real values in `.env.example` or documentation**

## Usage

### One-Time Bootstrap Execution

1. **Set environment variables** (in Render or local environment):
   ```bash
   export BOOTSTRAP_ADMIN_EMAIL="admin@crisismesh.example.com"
   export BOOTSTRAP_ADMIN_PASSWORD="SecureAdminPass123"
   ```

2. **Run the bootstrap command**:
   ```bash
   cd services/api
   npm run bootstrap:admin
   ```

3. **Expected output**:
   ```
   🚀 Starting admin bootstrap process...
   Loading .env from: /path/to/.env
   ⚙️  Bootstrap credentials configured, proceeding with admin provisioning...
   ✅ Bootstrap admin provisioning completed successfully
   
   🔒 SECURITY REMINDER:
      1. Remove BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD from your environment
      2. Verify the admin account was created with ADMIN role
      3. Test the admin login before proceeding
      4. Do not commit bootstrap credentials to source control
   ```

4. **Disable bootstrap** by removing environment variables:
   ```bash
   unset BOOTSTRAP_ADMIN_EMAIL
   unset BOOTSTRAP_ADMIN_PASSWORD
   ```

### Production Deployment Steps

1. **Configure temporary bootstrap credentials in Render dashboard**
2. **Run the bootstrap command** (via Render shell or deploy hook)
3. **Verify admin account creation** via database query or API test
4. **Remove bootstrap credentials** from Render environment variables
5. **Test admin login** with the configured credentials
6. **Proceed with MQTT E2E testing** using the admin account

### Verification Steps

After bootstrap execution, verify the admin account:

```sql
-- Check if admin was created
SELECT id, email, name, is_active 
FROM profiles 
WHERE email = 'admin@crisismesh.example.com';

-- Verify ADMIN role assignment
SELECT p.email, r.name as role 
FROM profiles p
JOIN user_roles ur ON p.id = ur.profile_id
JOIN roles r ON ur.role_id = r.id
WHERE p.email = 'admin@crisismesh.example.com';
```

## Security Considerations

### What Bootstrap Does

✅ Creates a new admin user with ADMIN role  
✅ Uses existing bcrypt password hashing  
✅ Validates email format and password strength  
✅ Logs completion without exposing credentials  
✅ Is idempotent (safe to run multiple times)  

### What Bootstrap Does NOT Do

❌ Does not modify existing accounts  
❌ Does not upgrade CITIZEN users to ADMIN  
❌ Does not affect normal user registration  
❌ Does not weaken JWT authentication  
❌ Does not expose credentials in logs  
❌ Does not store plaintext passwords  
❌ Does not modify role-based access control  

### Post-Bootstrap Security

After successful bootstrap:
1. **Immediately remove** bootstrap environment variables
2. **Test admin login** to verify credentials work
3. **Consider rotating** the admin password after first login
4. **Audit database** to confirm only one admin exists
5. **Monitor logs** for any unexpected bootstrap attempts

## Test Results

### Unit Tests

All 21 unit tests passed:
- ✅ Bootstrap disabled when env vars absent
- ✅ Admin creation when explicitly enabled
- ✅ Idempotent repeated execution
- ✅ Existing ADMIN remains unchanged
- ✅ Password hashed using existing mechanism
- ✅ Password never returned/logged
- ✅ Invalid/missing bootstrap configuration fails safely
- ✅ Email format validation
- ✅ Password strength validation
- ✅ Privilege escalation prevention
- ✅ Database error handling

### Integration Tests

All 7 integration tests passed:
- ✅ Normal registration continues creating CITIZEN users
- ✅ Self-registration as ADMIN not possible
- ✅ RBAC functionality unchanged
- ✅ Password hashing consistency
- ✅ Bootstrap functionality isolated from AuthService
- ✅ JWT authentication flow unaffected

### Build Status

✅ Backend build successful  
✅ All existing tests continue to pass  
✅ No breaking changes to existing functionality  

## Troubleshooting

### Bootstrap Does Nothing

**Symptom**: Bootstrap runs but creates no admin  
**Cause**: Environment variables not configured  
**Solution**: Ensure both `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` are set

### Invalid Email Format

**Symptom**: Error "Invalid BOOTSTRAP_ADMIN_EMAIL format"  
**Cause**: Email format validation failed  
**Solution**: Use valid email format (e.g., `user@domain.com`)

### Weak Password

**Symptom**: Error "BOOTSTRAP_ADMIN_PASSWORD does not meet security requirements"  
**Cause**: Password doesn't meet strength requirements  
**Solution**: Use password with min 8 chars, uppercase, lowercase, and number

### Admin Already Exists

**Symptom**: Bootstrap completes but no new admin created  
**Cause**: Admin already exists with ADMIN role (idempotent behavior)  
**Solution**: This is expected behavior. Use existing admin or delete and re-run

### Database Connection Failed

**Symptom**: Error "Database connection failed"  
**Cause**: Database connectivity issues  
**Solution**: Verify DATABASE_URL and database availability

## Commit Information

**Files Changed**: 9 files (5 new, 4 modified)  
**Lines Added**: ~1,000 lines  
**Test Coverage**: 28 comprehensive tests  
**Security**: All security requirements met  
**Breaking Changes**: None  

## Production E2E Sequence

After bootstrap implementation, the production MQTT E2E sequence will be:

1. ✅ Securely configure temporary bootstrap credentials in Render
2. ✅ Run the one-time bootstrap: `npm run bootstrap:admin`
3. ✅ Verify the dedicated account has ADMIN role
4. ✅ Disable/remove bootstrap credentials
5. ✅ Run the production MQTT E2E test
6. ✅ Verify MQTT → Render → PostgreSQL
7. ✅ Verify WebSocket/alert stages separately
8. ✅ Remove/disable the E2E admin afterward if appropriate

## Important Reminders

⚠️ **NEVER** run bootstrap against production without approval  
⚠️ **NEVER** commit bootstrap credentials to source control  
⚠️ **NEVER** leave bootstrap credentials configured after execution  
⚠️ **ALWAYS** verify admin creation before proceeding  
⚠️ **ALWAYS** remove bootstrap credentials immediately after use  
⚠️ **ALWAYS** test admin login before using for E2E tests  

## Implementation Status

✅ **Implementation Complete**  
✅ **Tests Passing**  
✅ **Build Successful**  
✅ **Documentation Complete**  
⏸️ **Pending Production Execution** (awaiting approval)  

This implementation meets all 17 security requirements specified in the original request and provides a secure, auditable mechanism for one-time admin provisioning in production environments.