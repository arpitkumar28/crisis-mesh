import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { District } from '../entities/district.entity';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { Alert, AlertStatus, AlertSeverity } from '../entities/alert.entity';
import { Incident, IncidentStatus } from '../entities/incident.entity';
import { Device, DeviceStatus } from '../entities/device.entity';
import { WeatherObservation } from '../entities/weather-observation.entity';
import { Shelter } from '../entities/shelter.entity';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(District)
    private readonly districts: Repository<District>,
    @InjectRepository(RiskAssessment)
    private readonly riskAssessments: Repository<RiskAssessment>,
    @InjectRepository(Alert) private readonly alerts: Repository<Alert>,
    @InjectRepository(Incident)
    private readonly incidents: Repository<Incident>,
    @InjectRepository(Device) private readonly devices: Repository<Device>,
    @InjectRepository(WeatherObservation)
    private readonly weather: Repository<WeatherObservation>,
    @InjectRepository(Shelter) private readonly shelters: Repository<Shelter>,
    @InjectRepository(Resource)
    private readonly resources: Repository<Resource>,
  ) {}

  async findAll() {
    return this.districts.find({
      order: { overall_risk_percent: 'DESC' },
    });
  }

  async findByState(state: string) {
    return this.districts.find({
      where: { state },
      order: { overall_risk_percent: 'DESC' },
    });
  }

  async findOne(id: string) {
    const district = await this.districts.findOne({ where: { id } });
    if (!district) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }
    return district;
  }

  async getDistrictIntelligence(id: string) {
    const district = await this.districts.findOne({ where: { id } });
    if (!district) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }

    // Get comprehensive intelligence data
    const [
      activeAlerts,
      criticalAlerts,
      highAlerts,
      activeIncidents,
      onlineDevices,
      totalDevices,
      latestWeather,
      riskAssessments,
      shelterCount,
      resources,
    ] = await Promise.all([
      this.alerts.count({
        where: { status: AlertStatus.ACTIVE },
      }),
      this.alerts.count({
        where: { status: AlertStatus.ACTIVE, severity: AlertSeverity.CRITICAL },
      }),
      this.alerts.count({
        where: { status: AlertStatus.ACTIVE, severity: AlertSeverity.HIGH },
      }),
      this.incidents.count({
        where: {
          status: In([
            IncidentStatus.REPORTED,
            IncidentStatus.ACKNOWLEDGED,
            IncidentStatus.IN_PROGRESS,
          ]),
        },
      }),
      this.devices.count({ where: { status: DeviceStatus.ONLINE } }),
      this.devices.count(),
      this.weather.findOne({
        where: {},
        order: { observation_time: 'DESC' },
      }),
      this.riskAssessments.find({
        where: { district_id: id, is_active: true },
        order: { created_at: 'DESC' },
        take: 10,
      }),
      this.shelters.count(),
      this.resources.find(),
    ]);

    // Get latest alerts and incidents
    const [recentAlerts, recentIncidents] = await Promise.all([
      this.alerts.find({
        where: { status: AlertStatus.ACTIVE },
        relations: { location: true },
        order: { issued_at: 'DESC' },
        take: 5,
      }),
      this.incidents.find({
        where: {
          status: In([
            IncidentStatus.REPORTED,
            IncidentStatus.ACKNOWLEDGED,
            IncidentStatus.IN_PROGRESS,
          ]),
        },
        relations: { location: true },
        order: { reported_at: 'DESC' },
        take: 5,
      }),
    ]);

    // Calculate operational percentage
    const operationalPercentage =
      totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0;

    // Get risk breakdown
    const riskBreakdown = {
      flood: district.flood_risk_percent,
      heat: district.heat_risk_percent,
      fire: district.fire_risk_percent,
      lightning: district.lightning_risk_percent,
      pollution: district.pollution_risk_percent,
    };

    // Break down emergency resources by type — real counts only, including
    // zero. A fallback like `|| 32` here would silently misreport a
    // district with genuinely zero hospitals as having 32.
    const emergencyResources = {
      hospitals: resources.filter((r) => r.type === 'HOSPITAL').length,
      shelters: shelterCount,
      police_stations: resources.filter((r) => r.type === 'POLICE').length,
      fire_stations: resources.filter((r) => r.type === 'FIRE').length,
      helpline: '112',
      ambulance: resources.filter((r) => r.type === 'AMBULANCE').length,
    };

    // Real trend: compare the two most recent RiskAssessment rows for
    // this district. With fewer than two, there is nothing to compare —
    // report 'unknown' rather than guessing from elapsed time.
    const riskTrend = this.calculateRiskTrend(riskAssessments);

    return {
      district: {
        id: district.id,
        name: district.name,
        state: district.state,
        population: district.population,
        area_sq_km: district.area_sq_km,
        code: district.code,
      },
      overall_risk: {
        percentage: district.overall_risk_percent,
        severity: this.getRiskSeverity(district.overall_risk_percent),
        trend: riskTrend.trend,
        change: riskTrend.change,
        last_assessment: district.last_risk_assessment,
      },
      active_alerts: {
        total: activeAlerts,
        critical: criticalAlerts,
        high: highAlerts,
        recent: recentAlerts.map((alert) => ({
          id: alert.id,
          title: alert.title,
          type: alert.type,
          severity: alert.severity,
          description: alert.description,
          issued_at: alert.issued_at,
          source: alert.issuer?.name || 'System',
          location: alert.location?.name || district.name,
        })),
      },
      incidents: {
        total: activeIncidents,
        recent: recentIncidents.map((incident) => ({
          id: incident.id,
          title: incident.title,
          type: incident.type,
          severity: incident.severity,
          status: incident.status,
          reported_at: incident.reported_at,
          location: incident.location?.name || district.name,
        })),
      },
      sensors: {
        online: onlineDevices,
        total: totalDevices,
        offline: totalDevices - onlineDevices,
        operational_percentage: operationalPercentage,
      },
      weather: latestWeather
        ? {
            temperature_celsius: latestWeather.temperature_celsius,
            humidity_percent: latestWeather.humidity_percent,
            wind_speed_kmh: latestWeather.wind_speed_kmh,
            precipitation_mm: latestWeather.precipitation_mm,
            observation_time: latestWeather.observation_time,
            source: latestWeather.source,
            condition: this.getWeatherCondition(latestWeather),
          }
        : null,
      risk_breakdown: riskBreakdown,
      risk_assessments: riskAssessments.map((assessment) => ({
        id: assessment.id,
        risk_type: assessment.risk_type,
        risk_level: assessment.risk_level,
        severity: assessment.severity,
        confidence: assessment.confidence,
        prediction: assessment.prediction,
        valid_from: assessment.valid_from,
        valid_until: assessment.valid_until,
      })),
      emergency_resources: emergencyResources,
      last_updated: new Date().toISOString(),
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Real trend from the two most recent RiskAssessment rows for this
   * district (riskAssessments is ordered newest-first). With fewer than
   * two assessments there is nothing to compare a change against, so
   * this reports 'unknown' rather than guessing from elapsed time.
   */
  private calculateRiskTrend(
    riskAssessments: RiskAssessment[],
  ): { trend: string; change: number | null } {
    if (riskAssessments.length < 2) {
      return { trend: 'unknown', change: null };
    }

    const latest = parseFloat(riskAssessments[0].risk_level);
    const previous = parseFloat(riskAssessments[1].risk_level);
    if (Number.isNaN(latest) || Number.isNaN(previous)) {
      return { trend: 'unknown', change: null };
    }

    const change = Math.round((latest - previous) * 10) / 10;
    const trend = change > 0.5 ? 'increasing' : change < -0.5 ? 'decreasing' : 'stable';
    return { trend, change };
  }

  private getRiskSeverity(riskPercent: string): string {
    const risk = parseFloat(riskPercent);
    if (risk >= 80) return 'CRITICAL';
    if (risk >= 60) return 'HIGH';
    if (risk >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private getWeatherCondition(weather: WeatherObservation): string {
    const precipitation = Number(weather.precipitation_mm);
    const temperature = Number(weather.temperature_celsius);

    if (precipitation > 10) return 'Rain likely';
    if (temperature > 35) return 'Hot';
    if (temperature < 15) return 'Cool';
    return 'Clear';
  }

  async getTopAffectedStates(limit: number = 5) {
    const districts = await this.districts
      .createQueryBuilder('district')
      .select('district.state', 'state')
      .addSelect('AVG(district.overall_risk_percent)', 'avg_risk')
      .groupBy('district.state')
      .orderBy('avg_risk', 'DESC')
      .limit(limit)
      .getRawMany();

    return districts.map((d) => ({
      state: d.state,
      risk_level: parseFloat(d.avg_risk).toFixed(1),
    }));
  }

  async getTopAffectedDistricts(limit: number = 10) {
    return this.districts.find({
      order: { overall_risk_percent: 'DESC' },
      take: limit,
    });
  }
}
