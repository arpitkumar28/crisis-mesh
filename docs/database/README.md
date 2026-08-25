# CrisisMesh Database Documentation

## Phase 2: Neon PostgreSQL (Temporary) → Supabase PostgreSQL (Future)

This document describes the database architecture, migration system, and provider portability strategy for CrisisMesh.

---

## Database Provider Strategy

### Current Implementation: Neon PostgreSQL
- **Provider**: Neon (serverless PostgreSQL)
- **Reason**: Supabase Free project limit reached, using Neon as temporary development database
- **PostGIS Support**: ✅ Supported (versions 3.3.3 to 3.6.0)
- **Migration Path**: All migrations are provider-neutral and compatible with Supabase

### Future Target: Supabase PostgreSQL + PostGIS + Supabase Auth
- **Provider**: Supabase (managed PostgreSQL with additional features)
- **Additional Features**: Supabase Auth, Row Level Security (RLS), built-in APIs
- **Migration Strategy**: Same migrations will run on Supabase without modification

---

## Database Schema

### Core Domains

#### 1. GEOGRAPHY
- `countries` - Country records with ISO codes
- `states` - States/provinces within countries
- `districts` - Districts within states  
- `localities` - Localities/towns within districts
- `geographic_locations` - Specific points of interest with PostGIS coordinates

**India Hierarchy**: India → State → District → Locality → Location

#### 2. USERS
- `profiles` - User profile information
- `roles` - Available user roles (CITIZEN, RESPONDER, AUTHORITY, ADMIN, ANALYST)
- `user_roles` - Role assignments to users

#### 3. DEVICES
- `devices` - IoT devices (sensors, relays, gateways, simulators)
- `sensors` - Sensor components on devices
- `gateways` - Mesh network gateways
- `mesh_links` - Device-to-device network connections

#### 4. TELEMETRY
- `sensor_readings` - Time-series sensor data
- `device_status` - Device status history

#### 5. CRISIS
- `incidents` - Emergency/disaster incidents
- `alerts` - System alerts and warnings
- `risk_assessments` - Risk level assessments

#### 6. RESPONSE
- `responders` - Emergency responder information
- `resources` - Response resources (equipment, supplies)
- `shelters` - Emergency shelter locations
- `evacuation_routes` - Evacuation route paths (PostGIS)

#### 7. ENVIRONMENT
- `weather_observations` - Weather and environmental data

#### 8. INFORMATION
- `news_articles` - News and media articles
- `official_notices` - Government notices and announcements

#### 9. COMMUNICATION
- `notifications` - User notifications

#### 10. AUDIT
- `audit_logs` - System audit trail

#### 11. SIMULATION
- `simulation_runs` - Simulation execution records
- `simulation_events` - Simulation event timeline

---

## PostGIS Implementation

### Status: ✅ ENABLED (Neon and Supabase Compatible)

Both Neon and Supabase support PostGIS extension. The schema uses PostGIS types:

- `GEOGRAPHY(POINT, 4326)` - For location coordinates (lat/long)
- `GEOGRAPHY(LINESTRING, 4326)` - For evacuation routes
- Spatial indexes using GIST for performance

### Example Usage
```sql
-- Find locations within 10km of a point
SELECT * FROM geographic_locations 
WHERE ST_DWithin(location, ST_MakePoint(77.2090, 28.6139)::geography, 10000);

-- Calculate distance between two locations
SELECT ST_Distance(
  (SELECT location FROM geographic_locations WHERE id = $1),
  (SELECT location FROM geographic_locations WHERE id = $2)
) / 1000 as distance_km;
```

---

## Migration System

### Migration Location
- **Path**: `supabase/migrations/`
- **Format**: `YYYYMMDD_HH_description.sql`
- **Compatibility**: Provider-neutral (works with both Neon and Supabase)

### Running Migrations

#### Development (Neon)
```bash
cd services/api
npm run migration:run
```

#### Production (Supabase - Future)
```bash
# Will use Supabase CLI when migrated
supabase migration up
```

### Migration Files
- `20260826_01_initial_schema.sql` - Complete database schema with PostGIS
- `20260826_02_seed_initial_data.sql` - Initial seed data (roles, admin user)

### Migration Tracking
- Uses `schema_migrations` table to track executed migrations
- Each migration runs in a transaction for atomicity
- Failed migrations are rolled back automatically

---

## Database Configuration

### Environment Variables
```bash
# Neon PostgreSQL (Current)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Supabase PostgreSQL (Future)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### TypeORM Configuration
```typescript
{
  type: 'postgres',
  url: configService.databaseUrl,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Use migrations instead
  logging: configService.isDevelopment,
  ssl: configService.isProduction ? { rejectUnauthorized: false } : false,
}
```

---

## Authentication Architecture

### Current: JWT-based Authentication (Neon)
- **Provider**: Custom JWT implementation
- **Storage**: PostgreSQL profiles table
- **Password Hashing**: bcrypt (cost factor 10)
- **Token Lifetime**: 1 day
- **Strategy**: Passport JWT strategy

### Future: Supabase Auth
- **Provider**: Supabase Auth service
- **Storage**: Supabase Auth users table
- **Features**: Built-in email verification, password reset, OAuth
- **Migration**: Authentication abstraction layer allows easy switch

### Authentication Abstraction
The system uses `IAuthProvider` interface to enable provider switching:

```typescript
interface IAuthProvider {
  validateCredentials(email: string, password: string): Promise<any>;
  generateToken(user: any): Promise<string>;
  validateToken(token: string): Promise<any>;
  refreshToken(token: string): Promise<string>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
```

---

## RBAC (Role-Based Access Control)

### Implemented Roles
- `CITIZEN` - Regular users with basic access
- `RESPONDER` - Emergency responders with operational access
- `AUTHORITY` - Government authorities with administrative access
- `ADMIN` - System administrators with full access
- `ANALYST` - Data analysts with read-only access

### RBAC Implementation
- **Server-side**: NestJS guards and decorators
- **Guards**: `JwtAuthGuard`, `RolesGuard`
- **Decorators**: `@Roles()`, `@CurrentUser()`
- **Storage**: PostgreSQL roles and user_roles tables

### Example Usage
```typescript
@Get('/admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async getAdminDashboard(@CurrentUser() user: any) {
  // Only accessible by ADMIN role
}
```

---

## Row Level Security (RLS)

### Current Status: NestJS Authorization
- **Implementation**: Server-side authorization via NestJS guards
- **Reason**: Neon doesn't provide Supabase-specific RLS context
- **Future**: Will implement Supabase RLS policies when migrated

### Planned Supabase RLS Policies
The schema includes comments documenting intended RLS policies:

```sql
-- Profiles RLS (Supabase):
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Users can only see their own profile unless they have admin/responder role
-- CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (...);
```

---

## Database Abstraction Layer

### Design Principles
1. **Provider-Neutral**: All code works with both Neon and Supabase
2. **No Hard-coded Features**: Avoid provider-specific APIs in business logic
3. **Interface-Based**: Use abstractions for replaceable components
4. **Migration-First**: Schema changes via migrations, not synchronize

### NestJS Database Module
```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.databaseUrl,
        // Provider-neutral configuration
      }),
    }),
  ],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class DatabaseModule {}
```

---

## Performance Optimization

### Indexes
- **Spatial Indexes**: GIST indexes on PostGIS columns
- **Foreign Key Indexes**: Automatic indexes on foreign keys
- **Query-Specific Indexes**: Custom indexes for common query patterns
- **Timestamp Indexes**: For time-series data queries

### Connection Pooling
- TypeORM manages connection pooling automatically
- Neon provides serverless connection scaling
- Future: Supabase connection pooling

---

## Testing

### Database Tests
- **Unit Tests**: Configuration validation, service logic
- **Integration Tests**: Connection testing, migration execution
- **Test Environment**: Uses test DATABASE_URL environment variable

### Test Coverage
```bash
cd services/api
npm test                    # Run all tests
npm run test:cov           # Run with coverage
```

---

## Backup and Recovery

### Neon (Current)
- **Backups**: Automatic point-in-time recovery (up to 7 days on free tier)
- **Export**: Can export database via pg_dump
- **Import**: Can import via psql

### Supabase (Future)
- **Backups**: Automatic daily backups + on-demand backups
- **Point-in-Time Recovery**: Up to 30 days
- **Migration**: Built-in migration tools

---

## Monitoring and Observability

### Current: Application-Level Monitoring
- **Logging**: NestJS logger with database query logging in development
- **Health Checks**: Database connection health checks
- **Error Tracking**: Error logging in audit_logs table

### Future: Supabase Monitoring
- **Database Metrics**: Built-in dashboard
- **Query Performance**: Query analysis tools
- **Resource Usage**: Storage and connection monitoring

---

## Known Limitations

### Neon Limitations (Temporary)
- No Supabase Auth integration
- No built-in RLS context
- Limited free tier resources
- Manual connection management

### Supabase Migration Requirements
- Update DATABASE_URL to Supabase connection string
- Implement Supabase Auth provider
- Enable RLS policies on sensitive tables
- Update authentication to use Supabase tokens
- Remove custom JWT implementation

---

## Migration Checklist

### Pre-Migration
- [ ] Create Supabase project
- [ ] Update DATABASE_URL in environment
- [ ] Test connection to Supabase
- [ ] Backup existing Neon database
- [ ] Review all migrations for Supabase compatibility

### Migration
- [ ] Run migrations on Supabase
- [ ] Verify schema matches Neon
- [ ] Test data integrity
- [ ] Update authentication provider
- [ ] Enable RLS policies
- [ ] Test all API endpoints

### Post-Migration
- [ ] Monitor for errors
- [ ] Verify performance
- [ ] Update documentation
- [ ] Deprecate Neon database
- [ ] Update CI/CD pipelines

---

## Troubleshooting

### Common Issues

#### Migration Failures
```bash
# Check migration status
npm run migration:status

# Force re-run specific migration (manual)
psql $DATABASE_URL -f supabase/migrations/20260826_01_initial_schema.sql
```

#### Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT NOW();"

# Check SSL configuration
psql "postgresql://user:password@host:5432/db?sslmode=require"
```

#### PostGIS Issues
```sql
-- Verify PostGIS is enabled
SELECT * FROM pg_extension WHERE extname = 'postgis';

-- Enable PostGIS if missing
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## Next Steps

1. **Complete Neon Setup**: User needs to create Neon project and provide DATABASE_URL
2. **Run Migrations**: Execute migrations on Neon database
3. **Test Full Stack**: Verify all services work with Neon database
4. **Plan Supabase Migration**: Document detailed migration timeline
5. **Implement Business Logic**: Add actual user/device/incident management

---

## References

- [Neon Documentation](https://neon.tech/docs)
- [Neon PostGIS Guide](https://neon.tech/docs/extensions/postgis)
- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [TypeORM Documentation](https://typeorm.io/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

**Last Updated**: 2026-08-26  
**Phase**: 2 - Database & Authentication  
**Status**: Implementation Complete, Awaiting Neon Database Connection
