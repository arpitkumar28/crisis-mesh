import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(() => {
    // Set required environment variables for all tests
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    // Clean up environment variables
    delete process.env.JWT_SECRET;
    delete process.env.DATABASE_URL;
    delete process.env.NODE_ENV;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // Clean up optional environment variables
    delete process.env.API_PORT;
    delete process.env.API_HOST;
    delete process.env.CORS_ORIGIN;
    delete process.env.MQTT_BROKER_URL;
    process.env.NODE_ENV = 'test'; // Reset to test environment
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return JWT secret from environment', () => {
    expect(service.jwtSecret).toBe('test-secret-key-for-testing');
  });

  it('should return database URL from environment', () => {
    expect(service.databaseUrl).toBe('postgresql://test:test@localhost:5432/test');
  });

  it('should return correct node environment', () => {
    expect(service.nodeEnv).toBe('test');
  });

  it('should return default API port when not set', () => {
    delete process.env.API_PORT;
    expect(service.apiPort).toBe(3002);
  });

  it('should return custom API port when set', () => {
    process.env.API_PORT = '4000';
    expect(service.apiPort).toBe(4000);
    delete process.env.API_PORT;
  });

  it('should return default API host when not set', () => {
    delete process.env.API_HOST;
    expect(service.apiHost).toBe('0.0.0.0');
  });

  it('should parse CORS origins correctly', () => {
    process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:3001';
    const origins = service.corsOrigin;
    expect(origins).toEqual(['http://localhost:3000', 'http://localhost:3001']);
    delete process.env.CORS_ORIGIN;
  });

  it('should not default to localhost origins in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CORS_ORIGIN;

    const origins = service.corsOrigin;

    expect(origins).toEqual(['https://crisis-mesh-eosin.vercel.app']);
    expect(origins).not.toContain('http://localhost:3000');
  });

  it('should match this project\'s own Vercel preview URLs in production', () => {
    process.env.NODE_ENV = 'production';

    const pattern = service.corsOriginPreviewPattern;

    expect(pattern).not.toBeNull();
    expect(pattern!.test('https://crisis-mesh-git-claude-verify-ren-8237b7-arpitkumar28s-projects.vercel.app')).toBe(true);
    expect(pattern!.test('https://crisis-mesh-abc123-arpitkumar28s-projects.vercel.app')).toBe(true);
  });

  it('should not match a look-alike origin outside this project\'s Vercel team', () => {
    process.env.NODE_ENV = 'production';

    const pattern = service.corsOriginPreviewPattern;

    expect(pattern!.test('https://crisis-mesh-abc123-some-other-team.vercel.app')).toBe(false);
    expect(pattern!.test('https://evil.com/?crisis-mesh-abc123-arpitkumar28s-projects.vercel.app')).toBe(false);
  });

  it('should not offer a preview pattern outside production', () => {
    process.env.NODE_ENV = 'development';
    expect(service.corsOriginPreviewPattern).toBeNull();
  });

  it('should honor an explicit CORS_ORIGIN_PREVIEW_PATTERN override', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN_PREVIEW_PATTERN = '^https://custom-preview\\.example\\.com$';

    const pattern = service.corsOriginPreviewPattern;

    expect(pattern!.test('https://custom-preview.example.com')).toBe(true);
    expect(pattern!.test('https://crisis-mesh-abc123-arpitkumar28s-projects.vercel.app')).toBe(false);

    delete process.env.CORS_ORIGIN_PREVIEW_PATTERN;
  });

  it('should require an explicit MQTT broker URL in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.MQTT_BROKER_URL;

    expect(() => service.mqttBrokerUrl).toThrow('MQTT_BROKER_URL');
  });

  it('should return default MQTT broker URL when not set', () => {
    delete process.env.MQTT_BROKER_URL;
    expect(service.mqttBrokerUrl).toBe('mqtt://localhost:1883');
  });

  it('should identify development environment', () => {
    process.env.NODE_ENV = 'development';
    expect(service.isDevelopment).toBe(true);
    expect(service.isProduction).toBe(false);
  });

  it('should identify production environment', () => {
    process.env.NODE_ENV = 'production';
    expect(service.isProduction).toBe(true);
    expect(service.isDevelopment).toBe(false);
  });
});
