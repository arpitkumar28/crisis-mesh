import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('flattens geography coordinates for map markers', () => {
    const service = new DashboardService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const entity = (service as any).toMapEntity({
      id: 'alert-1',
      title: 'Flood alert',
      description: 'High water level',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      location: {
        id: 'geo-1',
        name: 'Jaipur, Rajasthan',
        location: 'POINT(75.7873 26.9124)',
      },
    });

    expect(entity).toMatchObject({
      id: 'alert-1',
      title: 'Flood alert',
      detail: 'High water level',
      latitude: 26.9124,
      longitude: 75.7873,
      severity: 'CRITICAL',
      status: 'ACTIVE',
    });
  });
});
