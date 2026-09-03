import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { District } from '../entities/district.entity';

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(RiskAssessment)
    private readonly riskAssessments: Repository<RiskAssessment>,
    @InjectRepository(District)
    private readonly districts: Repository<District>,
  ) {}

  async findAll() {
    return this.riskAssessments.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByLocation(locationId: string) {
    return this.riskAssessments.find({
      where: { location_id: locationId, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByDistrict(districtId: string) {
    return this.riskAssessments.find({
      where: { district_id: districtId, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByType(riskType: string) {
    return this.riskAssessments.find({
      where: { risk_type: riskType, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findBySeverity(severity: string) {
    return this.riskAssessments.find({
      where: { severity: severity.toUpperCase(), is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async getHighRiskAreas() {
    return this.riskAssessments.find({
      where: {
        severity: In(['HIGH', 'CRITICAL']),
        is_active: true,
      },
      order: { risk_level: 'DESC' },
      take: 50,
    });
  }

  async getRiskSummary() {
    const [total, highRisk, criticalRisk, byType] = await Promise.all([
      this.riskAssessments.count({ where: { is_active: true } }),
      this.riskAssessments.count({
        where: { severity: 'HIGH', is_active: true },
      }),
      this.riskAssessments.count({
        where: { severity: 'CRITICAL', is_active: true },
      }),
      this.riskAssessments
        .createQueryBuilder('assessment')
        .select('assessment.risk_type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('assessment.is_active = :isActive', { isActive: true })
        .groupBy('assessment.risk_type')
        .getRawMany(),
    ]);

    return {
      total,
      high_risk: highRisk,
      critical_risk: criticalRisk,
      by_type: byType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
    };
  }
}
