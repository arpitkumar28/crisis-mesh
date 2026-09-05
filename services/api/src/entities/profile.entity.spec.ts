import { instanceToPlain } from 'class-transformer';
import { Profile } from './profile.entity';
import { Alert, AlertType, AlertSeverity, AlertStatus } from './alert.entity';

/**
 * password_hash must never survive JSON serialization, however deeply it
 * is nested — this is what actually protects every controller that
 * returns a raw entity carrying a loaded Profile relation (Alert.issuer,
 * Incident.reporter/assignee, etc.) via the global
 * ClassSerializerInterceptor registered in main.ts, which calls
 * instanceToPlain() under the hood.
 *
 * Nested objects are built as real class instances (Object.assign(new
 * Profile(), ...)) rather than via plainToInstance, matching how TypeORM
 * actually hydrates a loaded relation — a genuine `instanceof Profile`,
 * not a plain object — since instanceToPlain only applies a class's
 * @Exclude() metadata to values it recognizes as that class.
 */
describe('Profile entity — password_hash exclusion', () => {
  it('strips password_hash when a Profile is serialized directly', () => {
    const profile = Object.assign(new Profile(), {
      id: 'user-1',
      email: 'test@example.com',
      password_hash: '$2b$10$shouldneverleak',
      name: 'Test User',
    });

    const plain = instanceToPlain(profile);

    expect(plain.password_hash).toBeUndefined();
    expect(plain.email).toBe('test@example.com');
  });

  it('strips password_hash from a nested relation (e.g. Alert.issuer)', () => {
    const issuer = Object.assign(new Profile(), {
      id: 'user-1',
      email: 'issuer@example.com',
      password_hash: '$2b$10$shouldneverleak',
      name: 'Issuer',
    });
    const alert = Object.assign(new Alert(), {
      id: 'alert-1',
      type: AlertType.FLOOD,
      severity: AlertSeverity.HIGH,
      status: AlertStatus.ACTIVE,
      title: 'Test alert',
      issued_by: 'user-1',
      issuer,
    });

    const plain: any = instanceToPlain(alert);

    expect(plain.issuer.password_hash).toBeUndefined();
    expect(plain.issuer.email).toBe('issuer@example.com');
  });
});
