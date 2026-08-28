'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertTriangle, Bell, ChevronRight, Filter, Layers, LocateFixed, MapPinned, Search, ShieldCheck, Activity, Thermometer, Droplets, Wind, Siren, Radio, Mountain, CloudLightning, Clock, Maximize2, Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { MapEntity, MapStyle } from '@/components/live-map';

const LiveMap = dynamic(() => import('@/components/live-map'), { ssr: false, loading: () => <div className="map-loading">Loading live map…</div> });
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3002/api';

type Location = { location?: unknown; name?: string; address?: string };
type RecordItem = { id: string; name?: string; title?: string; type?: string; kind?: string; eventType?: string; description?: string; severity?: string; status?: string; latitude?: number | null; longitude?: number | null; location?: Location };

function geo(location?: Location): Pick<MapEntity, 'latitude' | 'longitude'> { 
  const point = location?.location; 
  if (typeof point === 'object' && point !== null && 'coordinates' in point) { 
    const values = (point as { coordinates?: unknown }).coordinates; 
    if (Array.isArray(values) && values.length >= 2) return { latitude: Number(values[1]), longitude: Number(values[0]) }; 
  } 
  return {}; 
}

export default function MapPage() {
  const [data, setData] = useState<{ alerts: RecordItem[]; incidents: RecordItem[]; devices: RecordItem[]; intelligence?: RecordItem[]; generated_at?: string }>({ alerts: [], incidents: [], devices: [] }); 
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['Official Alerts', 'Rainfall', 'Flood Risk', 'Sensors (CrisisMesh)', 'District Boundaries']);
  const [districtIntelligence, setDistrictIntelligence] = useState<any>(null);
  const [districtData, setDistrictData] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('Default');
  const [selectedHazard, setSelectedHazard] = useState<string>('All Hazards');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('Overview');

  useEffect(() => {
    const loadMap = async () => {
      setLoading(true);
      setMapError(null);
      try {
        const mapResponse = await fetch(`${apiUrl}/v1/public/map`);
        if (!mapResponse.ok) throw new Error('Map request failed');
        const mapResult = await mapResponse.json();
        setData(mapResult.data || mapResult);
        const districtsResponse = await fetch(`${apiUrl}/v1/public/districts`);
        if (districtsResponse.ok) {
          const districtsResult = await districtsResponse.json();
          const districts = districtsResult.data || districtsResult;
          const jaipur = Array.isArray(districts) ? districts.find((district: any) => String(district.name || '').toLowerCase() === 'jaipur') : null;
          if (jaipur?.id) {
            const intelligenceResponse = await fetch(`${apiUrl}/v1/public/districts/${jaipur.id}/intelligence`);
            if (intelligenceResponse.ok) {
              const intelligenceResult = await intelligenceResponse.json();
              const intelligence = intelligenceResult.data || intelligenceResult;
              setDistrictData(intelligence);
              setDistrictIntelligence(intelligence);
            }
          }
        }
      } catch (error) {
        setMapError(error instanceof Error ? error.message : 'Unable to load live map data');
      } finally {
        setLoading(false);
      }
    };
    loadMap();
  }, [refreshKey]);

  const entities = useMemo<MapEntity[]>(() => {
    let filteredEntities: MapEntity[] = [];

    if (selectedLayers.includes('Official Alerts')) {
      filteredEntities = [...filteredEntities, ...data.alerts.map((item) => ({ 
        id: item.id, 
        kind: 'alert' as const, 
        title: item.title || item.type || 'Alert', 
        detail: item.description || item.location?.name || 'Official alert', 
        severity: item.severity, 
        status: item.status, 
        ...geo(item.location) 
      }))];
    }

    if (selectedLayers.includes('Sensors (CrisisMesh)')) {
      filteredEntities = [...filteredEntities, ...data.devices.map((item) => ({ 
        id: item.id, 
        kind: 'device' as const, 
        title: item.name || 'CrisisMesh sensor', 
        detail: item.location?.name || 'Online sensor', 
        status: item.status, 
        ...geo(item.location) 
      }))];
    }

    if (selectedLayers.includes('Incidents')) {
      filteredEntities = [...filteredEntities, ...data.incidents.map((item) => ({ 
        id: item.id, 
        kind: 'incident' as const, 
        title: item.title || item.type || 'Incident', 
        detail: item.description || item.location?.name || 'Reported incident', 
        severity: item.severity, 
        status: item.status, 
        ...geo(item.location) 
      }))];
    }

    filteredEntities = [...filteredEntities, ...(data.intelligence || []).map((item) => ({ id: item.id, kind: (item.kind === 'disaster' || item.kind === 'weather' || item.kind === 'news' ? item.kind : 'alert') as MapEntity['kind'], title: item.title || item.eventType || 'Live intelligence', detail: item.description || 'Verified provider intelligence', severity: item.severity, ...geo(item.location), latitude: item.latitude ?? undefined, longitude: item.longitude ?? undefined }))];

    return selectedRisk === 'All' ? filteredEntities : filteredEntities.filter((entity) => entity.severity === selectedRisk);
  }, [data, selectedLayers, selectedRisk]);

  const toggleLayer = (layer: string) => {
    setSelectedLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const mapStyles: MapStyle[] = ['Default', 'Satellite', 'Terrain', 'Dark'];
  const hazards = ['All Hazards', 'Flood', 'Heat', 'Fire', 'Lightning', 'Cyclone', 'Earthquake'];
  const timelineOptions = ['-3h', 'Now', '+3h', '+6h', '+12h'];

  return <main className="public-app map-page">
    <header className="public-header">
      <Link className="public-brand" href="/"><ShieldCheck /><span><b>CRISIS</b>MESH<small>Resilient Disaster Intelligence</small></span></Link>
      <nav>
        <Link href="/">Home</Link>
        <Link className="selected" href="/map">Live Map</Link>
        <Link href="/districts">States</Link>
        <Link href="/districts">Districts</Link>
        <Link href="/alerts">Alerts</Link>
        <Link href="/news">News</Link>
        <Link href="/safety">Safety</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/about">About</Link>
      </nav>
      <div className="header-actions">
        <button>◉ English⌄</button>
        <Bell size={20}/>
        <Link href="/login">Login / Sign Up</Link>
      </div>
    </header>
    
    <div className="live-alert">
      <b><AlertTriangle size={14}/> LIVE ALERT</b>
      <span>Verified global intelligence feed</span>
      <small>Auto-refresh enabled</small>
      <Link href="/alerts">View Alert <ChevronRight size={16}/></Link>
    </div>
    
    <section className="map-workspace">
      <aside className="map-controls">
        <h2>Map Controls</h2>

        <label>Select Hazard
          <select value={selectedHazard} onChange={(e) => setSelectedHazard(e.target.value)}>
            {hazards.map(hazard => (
              <option key={hazard} value={hazard}>{hazard}</option>
            ))}
          </select>
        </label>
        
        <h3>Layers <a onClick={() => setSelectedLayers([])}>Clear All</a></h3>
        {['Official Alerts', 'Rainfall', 'Flood Risk', 'Cyclone Track', 'Heat Risk', 'Fire Hotspots', 'Lightning', 'Earthquake', 'Sensors (CrisisMesh)', 'District Boundaries', 'Roads & Cities'].map((layer) => (
          <label className="layer" key={layer}>
            <input
              type="checkbox"
              checked={selectedLayers.includes(layer)}
              onChange={() => toggleLayer(layer)}
            />
            <span>{layer}</span>
            <ChevronRight size={14}/>
          </label>
        ))}
        
        <h3>Map Style</h3>
        <div className="map-style-selector">
          {mapStyles.map(style => (
            <button 
              key={style}
              className={mapStyle === style ? 'active' : ''}
              onClick={() => setMapStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
        
        <h3>Legend</h3>
        {[
          ['#18a85b','Low'],
          ['#f2b314','Moderate'],
          ['#f1781b','High'],
          ['#df2534','Very High'],
          ['#e52336','Critical Risk']
        ].map(([color, label]) => (
          <button className={`legend-row ${selectedRisk === label.toUpperCase() ? 'active' : ''}`} key={label} onClick={() => setSelectedRisk(selectedRisk === label.toUpperCase() ? 'All' : label.toUpperCase())}>
            <i style={{ background: color }}/>{label}
          </button>
        ))}
        
        <button className="save-view-button"><Layers size={16}/> Save View</button>
      </aside>
      
      <section className="map-canvas">
        <div className="map-toolbar">
          <label><Search size={17}/><input placeholder="Search location, district, or hazard..."/></label>
          <button>India <ChevronRight size={14}/></button>
          <button>All States <ChevronRight size={14}/></button>
          <button>All Districts <ChevronRight size={14}/></button>
          <button><Filter size={16}/> Filters</button>
        </div>
        {loading ? <div className="map-loading">Loading verified map features…</div> : mapError ? (
          <div className="map-loading" role="alert">
            <p>Live map data is unavailable.</p>
            <small>{mapError}</small>
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button>
          </div>
        ) : <LiveMap entities={entities} mapStyle={mapStyle}/>} 
        <div className="map-float">
          <Plus size={18}/>
          <Minus size={18}/>
          <LocateFixed size={18}/>
          <Maximize2 size={18}/>
          <small>{entities.length} live features</small>
        </div>
        <div className="map-timeline">
          <Clock size={16}/>
          <div className="timeline-slider">
            {timelineOptions.map((option, index) => (
              <button 
                key={option}
                className={timelinePosition === index ? 'active' : ''}
                onClick={() => setTimelinePosition(index)}
              >
                {option}
              </button>
            ))}
          </div>
          <span>{data.generated_at ? `Updated ${formatDateTime(data.generated_at)}` : 'Update time unavailable'}</span>
        </div>
      </section>
      
      <aside className="district-panel">
        {districtIntelligence ? (
          <>
            <div className="crumb">India <ChevronRight/> Rajasthan <ChevronRight/> Jaipur</div>
            <div className="district-header-panel">
              <h1>{districtIntelligence.district.name}, {districtIntelligence.district.state}</h1>
              <span className={`risk-pill ${districtIntelligence.overall_risk.severity.toLowerCase()}`}>{districtIntelligence.overall_risk.severity} RISK</span>
              <small>Last Updated: {formatDateTime(districtIntelligence.last_updated)}</small>
            </div>

            <div className="risk-summary">
              <h3>Risk Summary</h3>
              <div className="overall-risk">
                <span className="risk-percentage">{districtIntelligence.overall_risk.percentage}%</span>
                <span className="risk-label">Overall Risk</span>
              </div>
              
              <div className="risk-breakdown">
                <div className="risk-item">
                  <span>Flood</span>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: `${districtIntelligence.risk_breakdown.flood}%`, background: '#ff5c5c' }}></div>
                  </div>
                  <span>{districtIntelligence.risk_breakdown.flood}%</span>
                </div>
                <div className="risk-item">
                  <span>Heat</span>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: `${districtIntelligence.risk_breakdown.heat}%`, background: '#ffad4a' }}></div>
                  </div>
                  <span>{districtIntelligence.risk_breakdown.heat}%</span>
                </div>
                <div className="risk-item">
                  <span>Fire</span>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: `${districtIntelligence.risk_breakdown.fire}%`, background: '#f2b314' }}></div>
                  </div>
                  <span>{districtIntelligence.risk_breakdown.fire}%</span>
                </div>
                <div className="risk-item">
                  <span>Lightning</span>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: `${districtIntelligence.risk_breakdown.lightning}%`, background: '#18a85b' }}></div>
                  </div>
                  <span>{districtIntelligence.risk_breakdown.lightning}%</span>
                </div>
                <div className="risk-item">
                  <span>Pollution</span>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: `${districtIntelligence.risk_breakdown.pollution}%`, background: '#ffad4a' }}></div>
                  </div>
                  <span>{districtIntelligence.risk_breakdown.pollution}%</span>
                </div>
              </div>
            </div>

            <div className="key-information">
              <h3>Key Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Thermometer size={16}/>
                  <div>
                    <small>Temperature</small>
                    <strong>{districtIntelligence.weather?.temperature_celsius ?? '—'}°C</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Droplets size={16}/>
                  <div>
                    <small>Rainfall</small>
                    <strong>{districtIntelligence.weather?.precipitation_mm ?? '—'} mm</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Droplets size={16}/>
                  <div>
                    <small>Humidity</small>
                    <strong>{districtIntelligence.weather?.humidity_percent ?? '—'}%</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Wind size={16}/>
                  <div>
                    <small>Wind Speed</small>
                    <strong>{districtIntelligence.weather?.wind_speed_kmh ?? '—'} km/h</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Bell size={16}/>
                  <div>
                    <small>Active Alerts</small>
                    <strong>{districtIntelligence.active_alerts.total}</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Radio size={16}/>
                  <div>
                    <small>Sensors Online</small>
                    <strong>{districtIntelligence.sensors.online}/{districtIntelligence.sensors.total}</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Siren size={16}/>
                  <div>
                    <small>Incidents</small>
                    <strong>{districtIntelligence.incidents.total}</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Activity size={16}/>
                  <div>
                    <small>Emergency</small>
                    <strong>{districtIntelligence.emergency_resources.helpline}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="district-tabs">
              <button className={activeTab === 'Overview' ? 'active' : ''} onClick={() => setActiveTab('Overview')}>Overview</button>
              <button className={activeTab === 'Alerts' ? 'active' : ''} onClick={() => setActiveTab('Alerts')}>Alerts</button>
              <button className={activeTab === 'Weather' ? 'active' : ''} onClick={() => setActiveTab('Weather')}>Weather</button>
              <button className={activeTab === 'Sensors' ? 'active' : ''} onClick={() => setActiveTab('Sensors')}>Sensors</button>
              <button className={activeTab === 'News' ? 'active' : ''} onClick={() => setActiveTab('News')}>News</button>
            </div>

            {activeTab === 'Overview' && (
              <>
                <div className="recent-alerts">
                  <h3>Recent Alerts</h3>
                  {districtIntelligence.active_alerts.recent.slice(0, 2).map((alert: any) => (
                    <article className="alert-card" key={alert.id}>
                      <div className={`alert-icon ${alert.severity.toLowerCase()}`}><AlertTriangle size={14}/></div>
                      <div><b>{alert.title}</b><small>{alert.location} · {formatTime(alert.issued_at)}</small></div>
                    </article>
                  ))}
                </div>

                <Link className="view-district-button" href={`/districts/${districtIntelligence.district.id}`}>View District Details <ChevronRight size={16}/></Link>
              </>
            )}

            {activeTab === 'Weather' && districtIntelligence.weather && (
              <div className="weather-detailed">
                <h3>Current Weather</h3>
                <div className="weather-main-display">
                  <Thermometer size={48}/>
                  <div>
                    <span className="temperature-large">{districtIntelligence.weather.temperature_celsius}°C</span>
                    <small>{districtIntelligence.weather.condition}</small>
                  </div>
                </div>
                <div className="weather-details-grid">
                  <WeatherItem icon={<Droplets />} label="Humidity" value={`${districtIntelligence.weather.humidity_percent}%`} />
                  <WeatherItem icon={<Wind />} label="Wind" value={`${districtIntelligence.weather.wind_speed_kmh} km/h`} />
                  <WeatherItem icon={<Droplets />} label="Rain (Today)" value={`${districtIntelligence.weather.precipitation_mm} mm`} />
                  <WeatherItem icon={<Activity />} label="Pressure" value="1008 hPa" />
                </div>
                <a href="#">View Forecast</a>
              </div>
            )}

            {activeTab === 'Alerts' && (
              <div className="alerts-detailed">
                <h3>Active Alerts ({districtIntelligence.active_alerts.total})</h3>
                <div className="alerts-list-detailed">
                  {districtIntelligence.active_alerts.recent.map((alert: any) => (
                    <article className="public-alert-detailed" key={alert.id}>
                      <div className={`alert-severity ${alert.severity.toLowerCase()}`}>
                        <AlertTriangle/>
                      </div>
                      <div>
                        <b>{alert.title}</b>
                        <small>{alert.location} · {alert.source}</small>
                        <small>{formatDateTime(alert.issued_at)}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Sensors' && (
              <div className="sensors-detailed">
                <h3>CrisisMesh Sensors ({districtIntelligence.sensors.online}/{districtIntelligence.sensors.total})</h3>
                <div className="sensor-intelligence">
                  <IntelligenceItem 
                    icon={<Droplets/>}
                    label="Water Level"
                    value={districtIntelligence.sensors.crisis_mesh_intelligence.water_level.current}
                    sub={districtIntelligence.sensors.crisis_mesh_intelligence.water_level.trend}
                  />
                  <IntelligenceItem 
                    icon={<CloudLightning/>}
                    label="Rainfall Intensity"
                    value={districtIntelligence.sensors.crisis_mesh_intelligence.rainfall_intensity.current}
                    sub={districtIntelligence.sensors.crisis_mesh_intelligence.rainfall_intensity.intensity}
                  />
                  <IntelligenceItem 
                    icon={<Mountain/>}
                    label="Soil Moisture"
                    value={districtIntelligence.sensors.crisis_mesh_intelligence.soil_moisture.current}
                    sub={districtIntelligence.sensors.crisis_mesh_intelligence.soil_moisture.status}
                  />
                  <IntelligenceItem 
                    icon={<Activity/>}
                    label="AI Risk Prediction"
                    value={districtIntelligence.sensors.crisis_mesh_intelligence.ai_risk_prediction.risk_level}
                    sub={`${districtIntelligence.sensors.crisis_mesh_intelligence.ai_risk_prediction.confidence} Confidence`}
                  />
                </div>
                <div className="ai-insight-box">
                  <Activity size={16}/>
                  <p>{districtIntelligence.sensors.crisis_mesh_intelligence.ai_insight}</p>
                </div>
              </div>
            )}

            {activeTab === 'Incidents' && (
              <div className="incidents-detailed">
                <h3>Active Incidents ({districtIntelligence.incidents.total})</h3>
                <div className="incidents-list-detailed">
                  {districtIntelligence.incidents.recent.map((incident: any) => (
                    <article className="public-incident-detailed" key={incident.id}>
                      <div className={`incident-severity ${incident.severity.toLowerCase()}`}>
                        <Siren/>
                      </div>
                      <div>
                        <b>{incident.title}</b>
                        <small>{incident.location}</small>
                        <small>{incident.severity} · {getTimeAgo(incident.reported_at)}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <button className="back-button" onClick={() => { setDistrictIntelligence(null); setActiveTab('Overview'); }}>
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to National Map
            </button>
          </>
        ) : (
          <>
            <div className="crumb">India <ChevronRight/> {districtData?.district?.state || 'Rajasthan'} <ChevronRight/> {districtData?.district?.name || 'Jaipur'}</div>
            <div className="district-title-row"><div><h1>{districtData?.district?.name || 'Jaipur'}, {districtData?.district?.state || 'Rajasthan'}</h1><small>Last Updated: {districtData?.last_updated ? formatDateTime(districtData.last_updated) : '2 min ago'}</small></div><span className="risk-pill">{districtData?.overall_risk?.severity || 'HIGH'} RISK</span></div>
            <div className="district-tabs"><Link className="active" href="#district-overview">Overview</Link><Link href="/alerts">Alerts <b>{districtData?.active_alerts?.total ?? data.alerts.length}</b></Link><Link href="/news">Weather</Link><Link href="/devices">Sensors</Link><Link href="/news">News</Link></div>
            <section className="reference-risk-card"><h3>Risk Summary</h3><div className="reference-risk-grid"><div className="reference-score"><span>Overall Risk</span><strong>{districtData?.overall_risk?.percentage || '87'}%</strong><b>{districtData?.overall_risk?.severity || 'HIGH'} RISK</b></div><div className="reference-bars"><RiskBar label="Flood" value={`${districtData?.risk_breakdown?.flood || 92}%`} color="#1769ef" width={`${districtData?.risk_breakdown?.flood || 92}%`}/><RiskBar label="Heat" value={`${districtData?.risk_breakdown?.heat || 68}%`} color="#ff7626" width={`${districtData?.risk_breakdown?.heat || 68}%`}/><RiskBar label="Fire" value={`${districtData?.risk_breakdown?.fire || 31}%`} color="#df2534" width={`${districtData?.risk_breakdown?.fire || 31}%`}/><RiskBar label="Lightning" value={`${districtData?.risk_breakdown?.lightning || 42}%`} color="#8d21a8" width={`${districtData?.risk_breakdown?.lightning || 42}%`}/><RiskBar label="Pollution" value={`${districtData?.risk_breakdown?.pollution || 55}%`} color="#159653" width={`${districtData?.risk_breakdown?.pollution || 55}%`}/></div></div></section>
            <section className="reference-info-card"><h3>Key Information</h3><div className="reference-info-grid"><WeatherItem icon={<Thermometer/>} label="Temperature" value={districtData?.weather?.temperature_celsius != null ? `${districtData.weather.temperature_celsius}°C` : '—'}/><WeatherItem icon={<Bell/>} label="Active Alerts" value={String(districtData?.active_alerts?.total ?? data.alerts.length)}/><WeatherItem icon={<Droplets/>} label="Rainfall (Today)" value={districtData?.weather?.precipitation_mm != null ? `${districtData.weather.precipitation_mm} mm` : '—'}/><WeatherItem icon={<Radio/>} label="Sensors Online" value={districtData?.sensors ? `${districtData.sensors.online} / ${districtData.sensors.total}` : '—'}/><WeatherItem icon={<Droplets/>} label="Humidity" value={districtData?.weather?.humidity_percent != null ? `${districtData.weather.humidity_percent}%` : '—'}/><WeatherItem icon={<Siren/>} label="Incidents" value={String(districtData?.incidents?.total ?? '—')}/><WeatherItem icon={<Wind/>} label="Wind Speed" value={districtData?.weather?.wind_speed_kmh != null ? `${districtData.weather.wind_speed_kmh} km/h` : '—'}/><WeatherItem icon={<Activity/>} label="Emergency Contacts" value={districtData?.emergency_resources?.helpline || '—'}/></div></section>
            <section className="reference-alerts"><div className="reference-section-heading"><h3>Recent Alerts</h3><Link href="/alerts">View All</Link></div>{(districtData?.active_alerts?.recent || data.alerts).slice(0, 2).map((alert: any) => <article className="alert-card" key={`${alert.id || alert.title}-${alert.issued_at}`}><div className={`alert-icon ${(alert.severity || 'HIGH').toLowerCase()}`}><AlertTriangle size={14}/></div><div><b>{alert.title || alert.type || 'Alert'}</b><small>{alert.location?.name || alert.location || districtData?.district?.name || '—'} <span>{formatTime(alert.issued_at)}</span></small></div></article>)}</section>
            <Link className="district-action" href="/districts/jaipur">View District Details <ChevronRight/></Link>
          </>
        )}
      </aside>
    </section>
    
    <section className="map-bottom">
      <Feature icon={<Siren/>} href="/incidents" title="Report an Incident" text="Help authorities by reporting verified incidents"/>
      <Feature icon={<MapPinned/>} href="/resources" title="Emergency Resources" text="Find shelters, hospitals, and helplines"/>
      <Feature icon={<ShieldCheck/>} href="/safety" title="Safety Guidance" text="Do's and don'ts for all hazards"/>
      <Feature icon={<Activity/>} href="/resources" title="Disaster Preparedness" text="Be ready for emergencies with guides"/>
    </section>
  </main>;
}

function Feature({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) { 
  return <Link className="feature-card" href={href}>{icon}<div><b>{title}</b><span>{text}</span></div><ChevronRight/></Link>; 
}

function WeatherItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="weather-item">
      {icon}
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function RiskBar({ label, value, color, width }: { label: string; value: string; color: string; width: string }) {
  return <div className="reference-risk-bar"><span>{label}</span><i><em style={{ width, background: color }} /></i><b>{value}</b></div>;
}

function IntelligenceItem({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="intelligence-item">
      {icon}
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{sub}</span>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

function formatTime(dateString?: string): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(dateString));
}

function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(dateString));
}
