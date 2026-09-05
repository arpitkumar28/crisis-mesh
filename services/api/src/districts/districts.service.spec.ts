import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { District } from '../entities/district.entity';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { Alert } from '../entities/alert.entity';
import { Incident } from '../entities/incident.entity';
import { Device } from '../entities/device.entity';
import { WeatherObservation } from '../entities/weather-observation.entity';
import { Shelter } from '../entities/shelter.entity';
import { Resource } from '../entities/resource.entity';

describe('DistrictsService — getDistrictIntelligence', () => {
  let service: DistrictsService;

  const mockDistrictRepository = { findOne: jest.fn(), find: jest.fn() };
  const mockRiskAssessmentRepository = { find: jest.fn() };
  const mockAlertRepository = { count: jest.fn(), find: jest.fn() };
  const mockIncidentRepository = { count: jest.fn(), find: jest.fn() };
  const mockDeviceRepository = { count: jest.fn() };
  const mockWeatherRepository = { findOne: jest.fn() };
  const mockShelterRepository = { count: jest.fn() };
  const mockResourceRepository = { find: jest.fn() };

  const baseDistrict = {
    id: 'district-1',
    name: 'Test District',
    state: 'Test State',
    population: '100000',
    area_sq_km: '500',
    code: 'TD01',
    overall_risk_percent: '42.00',
    flood_risk_percent: '10',
    heat_risk_percent: '5',
    fire_risk_percent: '3',
    lightning_risk_percent: '2',
    pollution_risk_percent: '8',
    last_risk_assessment: new Date('2026-01-01T00:00:00Z'),
    ai_risk_insight: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistrictsService,
        { provide: getRepositoryToken(District), useValue: mockDistrictRepository },
        { provide: getRepositoryToken(RiskAssessment), useValue: mockRiskAssessmentRepository },
        { provide: getRepositoryToken(Alert), useValue: mockAlertRepository },
        { provide: getRepositoryToken(Incident), useValue: mockIncidentRepository },
        { provide: getRepositoryToken(Device), useValue: mockDeviceRepository },
        { provide: getRepositoryToken(WeatherObservation), useValue: mockWeatherRepository },
        { provide: getRepositoryToken(Shelter), useValue: mockShelterRepository },
        { provide: getRepositoryToken(Resource), useValue: mockResourceRepository },
      ],
    }).compile();

    service = module.get<DistrictsService>(DistrictsService);
    jest.clearAllMocks();

    mockDistrictRepository.findOne.mockResolvedValue(baseDistrict);
    mockAlertRepository.count.mockResolvedValue(0);
    mockAlertRepository.find.mockResolvedValue([]);
    mockIncidentRepository.count.mockResolvedValue(0);
    mockIncidentRepository.find.mockResolvedValue([]);
    mockDeviceRepository.count.mockResolvedValue(0);
    mockWeatherRepository.findOne.mockResolvedValue(null);
    mockRiskAssessmentRepository.find.mockResolvedValue([]);
    mockShelterRepository.count.mockResolvedValue(0);
    mockResourceRepository.find.mockResolvedValue([]);
  });

  it('throws NotFoundException for an unknown district', async () => {
    mockDistrictRepository.findOne.mockResolvedValue(null);
    await expect(service.getDistrictIntelligence('missing')).rejects.toThrow(NotFoundException);
  });

  it('never includes a fabricated crisis_mesh_intelligence / AI prediction block', async () => {
    const result = await service.getDistrictIntelligence('district-1');
    expect(result.sensors).not.toHaveProperty('crisis_mesh_intelligence');
    expect(JSON.stringify(result)).not.toContain('ai_risk_prediction');
    expect(JSON.stringify(result)).not.toContain('87%');
  });

  it('reports real emergency resource counts, including genuine zero, with no fake fallback', async () => {
    mockResourceRepository.find.mockResolvedValue([]); // no HOSPITAL/POLICE/FIRE/AMBULANCE resources at all
    mockShelterRepository.count.mockResolvedValue(0);

    const result = await service.getDistrictIntelligence('district-1');

    expect(result.emergency_resources.hospitals).toBe(0);
    expect(result.emergency_resources.police_stations).toBe(0);
    expect(result.emergency_resources.fire_stations).toBe(0);
    expect(result.emergency_resources.ambulance).toBe(0);
  });

  it('counts real resources by type without inflating a nonzero count', async () => {
    mockResourceRepository.find.mockResolvedValue([
      { type: 'HOSPITAL' },
      { type: 'HOSPITAL' },
      { type: 'POLICE' },
    ]);

    const result = await service.getDistrictIntelligence('district-1');

    expect(result.emergency_resources.hospitals).toBe(2);
    expect(result.emergency_resources.police_stations).toBe(1);
    expect(result.emergency_resources.fire_stations).toBe(0);
  });

  it('queries risk assessments scoped to this district_id (the column the schema previously lacked)', async () => {
    await service.getDistrictIntelligence('district-1');
    expect(mockRiskAssessmentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { district_id: 'district-1', is_active: true },
      }),
    );
  });

  it('trend is "unknown" with fewer than two real risk assessments', async () => {
    mockRiskAssessmentRepository.find.mockResolvedValue([
      { id: 'ra-1', risk_level: '40.00', created_at: new Date() },
    ]);
    const result = await service.getDistrictIntelligence('district-1');
    expect(result.overall_risk.trend).toBe('unknown');
    expect(result.overall_risk.change).toBeNull();
  });

  it('trend is computed for real from the two most recent assessments (newest-first)', async () => {
    mockRiskAssessmentRepository.find.mockResolvedValue([
      { id: 'ra-2', risk_level: '55.00', created_at: new Date('2026-01-02T00:00:00Z') },
      { id: 'ra-1', risk_level: '40.00', created_at: new Date('2026-01-01T00:00:00Z') },
    ]);
    const result = await service.getDistrictIntelligence('district-1');
    expect(result.overall_risk.trend).toBe('increasing');
    expect(result.overall_risk.change).toBe(15);
  });

  it('trend is "decreasing" when the most recent assessment is lower than the previous one', async () => {
    mockRiskAssessmentRepository.find.mockResolvedValue([
      { id: 'ra-2', risk_level: '30.00', created_at: new Date('2026-01-02T00:00:00Z') },
      { id: 'ra-1', risk_level: '50.00', created_at: new Date('2026-01-01T00:00:00Z') },
    ]);
    const result = await service.getDistrictIntelligence('district-1');
    expect(result.overall_risk.trend).toBe('decreasing');
    expect(result.overall_risk.change).toBe(-20);
  });
});
