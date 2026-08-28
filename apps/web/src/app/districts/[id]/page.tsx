'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Activity, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge,
  Shield,
  Home,
  Phone,
  Flame,
  Bell,
  Radio,
  ChevronRight,
  CloudRain,
  Building,
  Factory,
  TrendingUp,
  Newspaper
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { MapEntity } from '@/components/live-map';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="map-frame"><div className="map-empty">Loading district map...</div></div> 
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3002/api';

type DistrictIntelligence = {
  district: {
    id: string;
    name: string;
    state: string;
    population: string;
    area_sq_km: string;
    code?: string;
  };
  overall_risk: {
    percentage: string;
    severity: string;
    trend: string;
    change: number;
    last_assessment: Date;
  };
  active_alerts: {
    total: number;
    critical: number;
    high: number;
    recent: Array<{
      id: string;
      title: string;
      type: string;
      severity: string;
      description: string;
      issued_at: Date;
      source: string;
      location: string;
    }>;
  };
  incidents: {
    total: number;
    recent: Array<{
      id: string;
      title: string;
      type: string;
      severity: string;
      status: string;
      reported_at: Date;
      location: string;
    }>;
  };
  sensors: {
    online: number;
    total: number;
    offline: number;
    operational_percentage: number;
    crisis_mesh_intelligence: {
      water_level: {
        current: string;
        trend: string;
        time_period: string;
        status: string;
      };
      rainfall_intensity: {
        current: string;
        intensity: string;
        today_total: string;
      };
      soil_moisture: {
        current: string;
        status: string;
      };
      ai_risk_prediction: {
        risk_level: string;
        severity: string;
        confidence: string;
        trend: string;
      };
      ai_insight: string;
    };
  };
  weather: {
    temperature_celsius: string;
    humidity_percent: string;
    wind_speed_kmh: string;
    precipitation_mm: string;
    observation_time: Date;
    source: string;
    condition: string;
  } | null;
  risk_breakdown: {
    flood: string;
    heat: string;
    fire: string;
    lightning: string;
    pollution: string;
  };
  risk_assessments: Array<{
    id: string;
    risk_type: string;
    risk_level: string;
    severity: string;
    confidence: string;
    prediction: string;
    valid_from: Date;
    valid_until: Date;
  }>;
  emergency_resources: {
    hospitals: number;
    shelters: number;
    police_stations: number;
    fire_stations: number;
    helpline: string;
    ambulance: number;
  };
  last_updated: string;
  generated_at: string;
};

export default function DistrictPage({ params }: { params: { id: string } }) {
  const [intelligence, setIntelligence] = useState<DistrictIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<string>('all');

  const loadDistrictIntelligence = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/v1/public/districts/${params.id}/intelligence`);
      if (!response.ok) throw new Error('Failed to load district intelligence');
      const result = await response.json();
      setIntelligence(result.data);
    } catch (err) {
      setError('Failed to load district intelligence. Please try again.');
      console.error('Error loading district intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadDistrictIntelligence();
  }, [loadDistrictIntelligence]);

  if (loading) {
    return (
      <div className="loading-state">
        <Activity className="spinner" size={32} />
        <p>Loading district intelligence...</p>
      </div>
    );
  }

  if (error || !intelligence) {
    return (
      <div className="error-state">
        <AlertTriangle size={32} />
        <p>{error || 'District not found'}</p>
        <button onClick={loadDistrictIntelligence}>Retry</button>
        <Link href="/districts">Back to Districts</Link>
      </div>
    );
  }

  const riskPercentage = parseFloat(intelligence.overall_risk.percentage);
  const riskLevel = intelligence.overall_risk.severity || (riskPercentage >= 80 ? 'CRITICAL' : riskPercentage >= 60 ? 'HIGH' : riskPercentage >= 40 ? 'MODERATE' : 'LOW');
  const riskColor = riskLevel === 'CRITICAL' ? '#df2534' : riskLevel === 'HIGH' ? '#f1781b' : riskLevel === 'MODERATE' ? '#f2b314' : '#18a85b';

  const mapEntities: MapEntity[] = []; // This would be populated with actual map data

  return (
    <main className="district-app">
      <header className="district-header">
        <Link className="brand" href="/">
          <Shield />
          <span><b>CRISIS</b>MESH<small>Resilient Disaster Intelligence</small></span>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/map">Live Map</Link>
          <Link href="/districts">Districts</Link>
          <Link href="/alerts">Alerts</Link>
          <Link href="/news">News</Link>
          <Link href="/resources">Resources</Link>
        </nav>
        <div className="header-actions">
          <button>◉ English⌄</button>
          <Bell size={20} />
          <Link href="/login">Login / Sign Up</Link>
        </div>
      </header>

      <div className="live-alert">
        <b><AlertTriangle size={14} /> LIVE ALERT</b>
        <span>{intelligence.district.name}, {intelligence.district.state}: Active monitoring</span>
        <small>{new Date().toLocaleTimeString()}</small>
        <Link href="/alerts">View Alert <ChevronRight size={16} /></Link>
      </div>

      <div className="district-workspace">
        <aside className="district-sidebar">
          <div className="sidebar-nav">
            <a className="active" href="#overview">Overview</a>
            <a href="#map">Live Map</a>
            <a href="#alerts">Alerts ({intelligence.active_alerts.total})</a>
            <a href="#weather">Weather</a>
            <a href="#sensors">Sensors (CrisisMesh)</a>
            <a href="#incidents">Incidents ({intelligence.incidents.total})</a>
            <a href="#news">News & Updates</a>
            <a href="#safety">Safety & Guidance</a>
            <a href="#resources">Resources</a>
            <a href="#reports">Reports & Analytics</a>
          </div>

          <div className="share-location">
            <small>SHARE LOCATION</small>
            <button><Activity size={16} /> Copy Link</button>
          </div>

          <div className="my-location">
            <small>MY LOCATION</small>
            <h3><MapPin size={16} /> {intelligence.district.name}, {intelligence.district.state}</h3>
            <button>Change</button>
          </div>

          <div className="current-risk">
            <small>CURRENT RISK</small>
            <div className="risk-display" style={{ color: riskColor }}>
              {intelligence.overall_risk.percentage}% {riskLevel}
            </div>
            <Link href={`/districts/${params.id}#overview`}>View My Area</Link>
          </div>
        </aside>

        <main className="district-main">
          <div className="district-header-content">
            <div>
              <div className="breadcrumb">India <ChevronRight size={14} /> {intelligence.district.state} <ChevronRight size={14} /> {intelligence.district.name}</div>
              <h1>{intelligence.district.name} District, {intelligence.district.state}</h1>
              <span className={`risk-pill ${riskLevel.toLowerCase()}`}>{riskLevel} RISK</span>
              <small>Last Updated: {new Date(intelligence.last_updated).toLocaleString()}</small>
            </div>
            <div className="district-actions">
              <button><Radio size={16} /> Refresh</button>
              <button><Bell size={16} /> Subscribe</button>
              <button><Activity size={16} /> Download Report</button>
            </div>
          </div>

          <div className="district-metrics">
            <MetricCard 
              icon={<Activity />}
              label="Overall Risk"
              value={`${intelligence.overall_risk.percentage}%`}
              sub={intelligence.overall_risk.trend}
              trend={intelligence.overall_risk.change > 0 ? 'increasing' : intelligence.overall_risk.change < 0 ? 'decreasing' : 'stable'}
              color={riskColor}
            />
            <MetricCard
              icon={<AlertTriangle />}
              label="Active Alerts"
              value={intelligence.active_alerts.total}
              sub={`${intelligence.active_alerts.critical} Critical, ${intelligence.active_alerts.high} High`}
              color={intelligence.active_alerts.critical > 0 ? '#df2534' : '#f1781b'}
            />
            <MetricCard
              icon={<Radio />}
              label="Sensors Online"
              value={`${intelligence.sensors.online}/${intelligence.sensors.total}`}
              sub={`${intelligence.sensors.operational_percentage}% Operational, ${intelligence.sensors.offline} Offline`}
              color={intelligence.sensors.operational_percentage > 80 ? '#18a85b' : '#f1781b'}
            />
            <MetricCard
              icon={<AlertTriangle />}
              label="Incidents"
              value={intelligence.incidents.total}
              sub="Active Incidents"
              color="#f1781b"
            />
            <MetricCard
              icon={<MapPin />}
              label="Population"
              value={intelligence.district.population}
              sub="Estimated"
              color="#6366f1"
            />
          </div>

          <div className="district-grid">
            <section className="district-map" id="map">
              <div className="panel-header">
                <h2>District Live Map</h2>
                <div className="map-controls">
                  <button 
                    className={selectedLayer === 'all' ? 'active' : ''}
                    onClick={() => setSelectedLayer('all')}
                  >All Layers</button>
                  <button 
                    className={selectedLayer === 'alerts' ? 'active' : ''}
                    onClick={() => setSelectedLayer('alerts')}
                  >Alerts</button>
                  <button 
                    className={selectedLayer === 'sensors' ? 'active' : ''}
                    onClick={() => setSelectedLayer('sensors')}
                  >Sensors</button>
                  <button 
                    className={selectedLayer === 'incidents' ? 'active' : ''}
                    onClick={() => setSelectedLayer('incidents')}
                  >Incidents</button>
                </div>
              </div>
              <LiveMap entities={mapEntities} />
              <div className="map-legend">
                <span><i className="legend-dot" style={{ background: '#18a85b' }} />Safe Zone</span>
                <span><i className="legend-dot" style={{ background: '#f2b314' }} />Moderate Risk</span>
                <span><i className="legend-dot" style={{ background: '#f1781b' }} />High Risk</span>
                <span><i className="legend-dot" style={{ background: '#df2534' }} />Critical Risk</span>
              </div>
            </section>

            <section className="district-weather" id="weather">
              <div className="panel-header">
                <h2>Current Weather</h2>
                <span className="live-tag"><Activity size={12} /> LIVE</span>
              </div>
              {intelligence.weather ? (
                <div className="weather-display">
                  <div className="weather-main">
                    <Thermometer size={32} />
                    <div>
                      <span className="temperature">{intelligence.weather.temperature_celsius}°C</span>
                      <small>{intelligence.weather.condition}</small>
                    </div>
                  </div>
                  <div className="weather-details">
                    <WeatherDetail icon={<Droplets />} label="Humidity" value={`${intelligence.weather.humidity_percent}%`} />
                    <WeatherDetail icon={<Wind />} label="Wind" value={`${intelligence.weather.wind_speed_kmh} km/h`} />
                    <WeatherDetail icon={<Droplets />} label="Rain (Today)" value={`${intelligence.weather.precipitation_mm} mm`} />
                    <WeatherDetail icon={<Gauge />} label="Pressure" value="1013 hPa" />
                  </div>
                </div>
              ) : (
                <div className="no-data">Weather data unavailable</div>
              )}
            </section>

            <section className="district-risk" id="overview">
              <div className="panel-header">
                <h2>Risk Breakdown</h2>
                <span className="risk-score" style={{ color: riskColor }}>{intelligence.overall_risk.percentage}%</span>
              </div>
              <div className="risk-chart">
                <div className="risk-bar" style={{ width: `${intelligence.risk_breakdown.flood}%`, background: '#3b82f6' }}>
                  <span>Flood {intelligence.risk_breakdown.flood}%</span>
                </div>
                <div className="risk-bar" style={{ width: `${intelligence.risk_breakdown.heat}%`, background: '#ef4444' }}>
                  <span>Heat {intelligence.risk_breakdown.heat}%</span>
                </div>
                <div className="risk-bar" style={{ width: `${intelligence.risk_breakdown.fire}%`, background: '#f97316' }}>
                  <span>Fire {intelligence.risk_breakdown.fire}%</span>
                </div>
                <div className="risk-bar" style={{ width: `${intelligence.risk_breakdown.lightning}%`, background: '#eab308' }}>
                  <span>Lightning {intelligence.risk_breakdown.lightning}%</span>
                </div>
                <div className="risk-bar" style={{ width: `${intelligence.risk_breakdown.pollution}%`, background: '#8b5cf6' }}>
                  <span>Pollution {intelligence.risk_breakdown.pollution}%</span>
                </div>
              </div>
            </section>

            <section className="district-alerts" id="alerts">
              <div className="panel-header">
                <h2>Latest Alerts</h2>
                <Link href="/alerts">View All <ChevronRight size={14} /></Link>
              </div>
              <div className="alerts-list">
                {intelligence.active_alerts.recent.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>

            <section className="district-incidents" id="incidents">
              <div className="panel-header">
                <h2>Active Incidents</h2>
                <Link href="/incidents">View All <ChevronRight size={14} /></Link>
              </div>
              <div className="incidents-list">
                {intelligence.incidents.recent.map(incident => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            </section>

            <section className="district-news" id="news">
              <div className="panel-header">
                <h2>Latest News & Updates</h2>
                <Link href="/news">View All <ChevronRight size={14} /></Link>
              </div>
              <div className="news-list">
                <NewsCard 
                  title="Heavy rainfall warning issued for Jaipur district"
                  source="IMD"
                  date="25 Aug 2026"
                />
                <NewsCard 
                  title="Local authorities advise caution in low-lying areas"
                  source="Local News"
                  date="25 Aug 2026"
                />
                <NewsCard 
                  title="Emergency response teams on standby"
                  source="NDEM"
                  date="25 Aug 2026"
                />
              </div>
            </section>

            <section className="district-intelligence" id="sensors">
              <div className="panel-header">
                <h2>CrisisMesh Intelligence</h2>
                <span className="live-tag"><Activity size={12} /> LIVE</span>
              </div>
              <div className="intelligence-grid">
                <IntelligenceCard 
                  icon={<Droplets />}
                  label="Water Level"
                  value={intelligence.sensors.crisis_mesh_intelligence.water_level.current}
                  sub={intelligence.sensors.crisis_mesh_intelligence.water_level.time_period}
                  trend={intelligence.sensors.crisis_mesh_intelligence.water_level.trend.includes('+') ? 'up' : 'stable'}
                />
                <IntelligenceCard
                  icon={<CloudRain />}
                  label="Rainfall Intensity"
                  value={intelligence.sensors.crisis_mesh_intelligence.rainfall_intensity.current}
                  sub={intelligence.sensors.crisis_mesh_intelligence.rainfall_intensity.intensity}
                  trend="up"
                />
                <IntelligenceCard
                  icon={<Factory />}
                  label="Soil Moisture"
                  value={intelligence.sensors.crisis_mesh_intelligence.soil_moisture.current}
                  sub={intelligence.sensors.crisis_mesh_intelligence.soil_moisture.status}
                  trend="stable"
                />
                <IntelligenceCard
                  icon={<Activity />}
                  label="AI Risk Prediction"
                  value={intelligence.sensors.crisis_mesh_intelligence.ai_risk_prediction.risk_level}
                  sub={`${intelligence.sensors.crisis_mesh_intelligence.ai_risk_prediction.confidence} Confidence`}
                  trend={intelligence.sensors.crisis_mesh_intelligence.ai_risk_prediction.trend}
                />
              </div>
              <div className="ai-insight">
                <Activity size={16} />
                <p>{intelligence.sensors.crisis_mesh_intelligence.ai_insight}</p>
              </div>
            </section>

            <section className="district-resources" id="resources">
              <div className="panel-header">
                <h2>Emergency Resources</h2>
                <Link href="/resources">View All <ChevronRight size={14} /></Link>
              </div>
              <div className="resources-grid">
                <ResourceCard icon={<Building />} label="Hospitals" value={intelligence.emergency_resources.hospitals} />
                <ResourceCard icon={<Home />} label="Shelters" value={intelligence.emergency_resources.shelters} />
                <ResourceCard icon={<Shield />} label="Police Stations" value={intelligence.emergency_resources.police_stations} />
                <ResourceCard icon={<Flame />} label="Fire Stations" value={intelligence.emergency_resources.fire_stations} />
                <ResourceCard icon={<Phone />} label="Helpline" value={intelligence.emergency_resources.helpline} />
                <ResourceCard icon={<Activity />} label="Ambulance" value={intelligence.emergency_resources.ambulance} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </main>
  );
}

function MetricCard({ icon, label, value, sub, trend, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  sub?: string; 
  trend?: string;
  color?: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-icon" style={{ color: color || '#6366f1' }}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong style={{ color: color }}>{value}</strong>
        {sub && <small>{sub}</small>}
        {trend && (
          <span className={`trend ${trend}`}>
            <TrendingUp size={12} />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function WeatherDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="weather-detail">
      {icon}
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: any }) {
  return (
    <div className={`alert-card severity-${alert.severity.toLowerCase()}`}>
      <AlertTriangle size={16} />
      <div>
        <strong>{alert.title}</strong>
        <small>{alert.severity} · {alert.location} · {alert.source} · {new Date(alert.issued_at).toLocaleString()}</small>
      </div>
      <ChevronRight size={16} />
    </div>
  );
}

function IncidentCard({ incident }: { incident: any }) {
  return (
    <div className={`incident-card severity-${incident.severity.toLowerCase()}`}>
      <AlertTriangle size={16} />
      <div>
        <strong>{incident.title}</strong>
        <small>{incident.severity} · {incident.location} · {new Date(incident.reported_at).toLocaleString()}</small>
      </div>
      <ChevronRight size={16} />
    </div>
  );
}

function IntelligenceCard({ icon, label, value, sub, trend }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  sub: string; 
  trend: string;
}) {
  return (
    <div className="intelligence-card">
      {icon}
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{sub}</span>
      </div>
      <span className={`trend ${trend}`}>
        <TrendingUp size={12} />
      </span>
    </div>
  );
}

function ResourceCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="resource-card">
      {icon}
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function NewsCard({ title, source, date }: { title: string; source: string; date: string }) {
  return (
    <div className="news-card">
      <Newspaper size={16} />
      <div>
        <strong>{title}</strong>
        <small>{source} · {date}</small>
      </div>
      <ChevronRight size={16} />
    </div>
  );
}