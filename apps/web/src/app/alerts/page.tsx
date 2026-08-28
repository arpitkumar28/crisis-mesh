"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { 
  BellRing, 
  RefreshCw, 
  Filter, 
  ChevronRight,
  Clock,
  MapPin,
  Layers,
  Shield,
  X,
  AlertTriangle,
  Activity,
  Flame,
  CloudLightning,
  Zap,
  Menu,
  Bell
} from "lucide-react";

type Alert = {
  id: string;
  title?: string;
  type?: string;
  description?: string;
  severity?: string;
  status?: string;
  issued_at?: string;
  source?: string;
  location?: {
    name?: string;
    district?: string;
    state?: string;
  };
  issued_by?: {
    name?: string;
  };
};

const ALERT_TABS = ['All Alerts', 'Official Alerts', 'CrisisMesh Alerts', 'Weather Alerts', 'System Alerts'];
const TIME_RANGES = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'All Time'];

export default function AlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState('All Alerts');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filters, setFilters] = useState({
    location: 'Rajasthan',
    district: 'All Districts',
    hazardType: 'All Hazards',
    severity: [] as string[],
    source: 'All Sources',
    timeRange: 'Last 24 Hours'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3002/api';

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      
      // Apply filters
      if (filters.severity.length > 0) {
        params.append('severity', filters.severity.join(','));
      }
      if (filters.source !== 'All Sources') {
        params.append('source', filters.source);
      }
      if (filters.hazardType !== 'All Hazards') {
        params.append('hazard_type', filters.hazardType);
      }
      if (filters.location !== 'Rajasthan') {
        params.append('location', filters.location);
      }
      
      // Apply time range
      const now = new Date();
      let startDate: Date | undefined;
      if (filters.timeRange === 'Last 24 Hours') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === 'Last 7 Days') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === 'Last 30 Days') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      if (startDate) {
        params.append('start_date', startDate.toISOString());
        params.append('end_date', now.toISOString());
      }

      const response = await fetch(`${apiUrl}/v1/public/alerts/filter?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load alerts');
      const result = await response.json();
      let alerts = result.data || [];

      // Apply tab filtering
      if (selectedTab === 'Official Alerts') {
        alerts = alerts.filter((a: Alert) => a.source === 'IMD' || a.source === 'NDMA');
      } else if (selectedTab === 'CrisisMesh Alerts') {
        alerts = alerts.filter((a: Alert) => a.source === 'CrisisMesh');
      } else if (selectedTab === 'Weather Alerts') {
        alerts = alerts.filter((a: Alert) => a.type?.includes('Weather') || a.type?.includes('Rain') || a.type?.includes('Heat'));
      } else if (selectedTab === 'System Alerts') {
        alerts = alerts.filter((a: Alert) => a.source === 'System');
      }

      // Apply sorting
      if (sortBy === 'Newest First') {
        alerts.sort((a: Alert, b: Alert) => 
          new Date(b.issued_at || 0).getTime() - new Date(a.issued_at || 0).getTime()
        );
      } else if (sortBy === 'Oldest First') {
        alerts.sort((a: Alert, b: Alert) => 
          new Date(a.issued_at || 0).getTime() - new Date(b.issued_at || 0).getTime()
        );
      } else if (sortBy === 'Severity') {
        const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'INFO': 4 };
        alerts.sort((a: Alert, b: Alert) => 
          (severityOrder[a.severity as keyof typeof severityOrder] || 5) - 
          (severityOrder[b.severity as keyof typeof severityOrder] || 5)
        );
      }

      setItems(alerts);
    } catch {
      setError("Alerts are unavailable. Check the API and retry.");
    } finally {
      setLoading(false);
    }
  }, [filters, selectedTab, sortBy, apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // Simulate WebSocket connection for real-time updates
    const interval = setInterval(() => {
      load();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [load]);

  const activeCount = items.filter((i) => i.status === "ACTIVE").length;

  const clearFilters = () => {
    setFilters({
      location: 'Rajasthan',
      district: 'All Districts',
      hazardType: 'All Hazards',
      severity: [],
      source: 'All Sources',
      timeRange: 'Last 24 Hours'
    });
  };

  const activeFilterCount = filters.severity.length + 
    (filters.source !== 'All Sources' ? 1 : 0) +
    (filters.hazardType !== 'All Hazards' ? 1 : 0) +
    (filters.timeRange !== 'Last 24 Hours' ? 1 : 0);

  return (
    <main className="alerts-center-app">
      <header className="alerts-header">
        <Link className="brand" href="/">
          <Shield />
          <span><b>CRISIS</b>MESH<small>Resilient Disaster Intelligence</small></span>
        </Link>
        <nav>
          <Link href="/">Overview</Link>
          <Link href="/map">Live Map</Link>
          <Link href="/alerts" className="active">Alerts <span className="badge">{activeCount}</span></Link>
          <Link href="/news">Weather</Link>
          <Link href="/devices">Sensors CrisisMesh</Link>
          <Link href="/incidents">Incidents <span className="badge">{items.filter(i => i.status === 'ACTIVE').length}</span></Link>
          <Link href="/news">News & Updates</Link>
          <Link href="/resources">Safety & Guidance</Link>
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
        <span>Jaipur, Rajasthan: Heavy rainfall warning issued by IMD</span>
        <small>{new Date().toLocaleTimeString()}</small>
        <button>View Details <ChevronRight size={16} /></button>
      </div>

      <div className="alerts-workspace">
        <aside className="alerts-sidebar">
          <div className="sidebar-nav">
            <a className="active" href="#overview">Overview</a>
            <a href="#map">Live Map</a>
            <a href="#alerts">Alerts <span className="badge">{activeCount}</span></a>
            <a href="#weather">Weather</a>
            <a href="#sensors">Sensors (CrisisMesh)</a>
            <a href="#incidents">Incidents <span className="badge">{items.filter(i => i.status === 'ACTIVE').length}</span></a>
            <a href="#news">News & Updates</a>
            <a href="#safety">Safety & Guidance</a>
            <a href="#resources">Resources</a>
          </div>

          <div className="my-location">
            <small>MY LOCATION</small>
            <h3><MapPin size={16} /> Jaipur, Rajasthan</h3>
            <button>Change</button>
          </div>

          <div className="current-risk">
            <small>CURRENT RISK</small>
            <div className="risk-display">87% HIGH</div>
            <a href="#">View My Area</a>
          </div>
        </aside>

        <main className="alerts-main">
          <div className="alerts-header-content">
            <h1>Alerts Center</h1>
            <div className="header-actions">
              <button onClick={load}><RefreshCw size={16} /> Refresh</button>
              <button><Menu size={16} /> Menu</button>
            </div>
          </div>

          <div className="alerts-tabs">
            {ALERT_TABS.map(tab => (
              <button 
                key={tab}
                className={selectedTab === tab ? 'active' : ''}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="alerts-content-layout">
            {/* Filters Panel */}
            <aside className={`alerts-filters-panel ${showFilters ? 'expanded' : ''}`}>
              <div className="filters-header">
                <h3>Filters</h3>
                {activeFilterCount > 0 && (
                  <button className="clear-filters" onClick={clearFilters}>
                    Clear All ({activeFilterCount})
                  </button>
                )}
              </div>



              <div className="filter-group">
                <label>Hazard Type</label>
                <select 
                  value={filters.hazardType}
                  onChange={(e) => setFilters(prev => ({ ...prev, hazardType: e.target.value }))}
                >
                  <option>All Hazards</option>
                  <option>Flood</option>
                  <option>Heavy Rainfall</option>
                  <option>Heat Wave</option>
                  <option>Fire</option>
                  <option>Lightning</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Source</label>
                <select 
                  value={filters.source}
                  onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option>All Sources</option>
                  <option>IMD</option>
                  <option>NDMA</option>
                  <option>CrisisMesh</option>
                  <option>System</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Time</label>
                <select 
                  value={filters.timeRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                >
                  {TIME_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Severity</label>
                <select 
                  value={filters.severity.join(',')}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value ? e.target.value.split(',') : [] }))}
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="INFO">Info</option>
                </select>
              </div>

              <button className="apply-filters" onClick={load}>
                Apply Filters
              </button>
            </aside>

            {/* Alerts List */}
            <div className="alerts-list-container">
              <div className="alerts-toolbar">
                <button 
                  className={`filter-toggle ${activeFilterCount > 0 ? 'has-filters' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} />
                  Filters
                  {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                </button>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Severity</option>
                </select>
              </div>

              {error ? (
                <div className="data-error">
                  {error}
                  <button onClick={load}>Retry</button>
                </div>
              ) : loading ? (
                <div className="data-loading">Loading active warnings…</div>
              ) : items.length === 0 ? (
                <div className="data-empty">
                  <BellRing size={25} />
                  No alerts in this view.
                </div>
              ) : (
                <div className="alerts-list-modern">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className={`alert-card-modern severity-${(item.severity || "low").toLowerCase()} ${selectedAlert?.id === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAlert(item)}
                    >
                      <div className="alert-icon">
                        {getAlertIcon(item.type)}
                      </div>
                      <div className="alert-info">
                        <div className="alert-header">
                          <span className={`severity-indicator ${(item.severity || 'low').toLowerCase()}`}>
                            {item.severity || 'INFO'}
                          </span>
                          <h3>{item.title || item.type || "Alert"}</h3>
                        </div>
                        <p className="alert-hazard">{item.type || 'Unknown Hazard'}</p>
                        <div className="alert-details">
                          <span className="alert-location">
                            <MapPin size={12} />
                            {item.location?.name || item.location?.district || 'Location pending'}
                          </span>
                          <span className="alert-time">
                            <Clock size={12} />
                            {item.issued_at ? new Date(item.issued_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Time unavailable"}
                          </span>
                          <span className="alert-source">{item.source || 'Unknown'}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="alert-arrow" />
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {items.length > 0 && (
                <div className="pagination">
                  <button disabled>Previous</button>
                  {[1, 2, 3, 4, 5].map(page => (
                    <button key={page} className={page === 1 ? 'active' : ''}>{page}</button>
                  ))}
                  <span>...</span>
                  <button>12</button>
                  <button>Next</button>
                </div>
              )}
            </div>

            {/* Alert Detail Panel */}
            {selectedAlert && (
              <aside className="alert-detail-panel-modern">
                <div className="detail-header">
                  <div className="detail-title">
                    <h2>{selectedAlert.title || selectedAlert.type || 'Alert Details'}</h2>
                    <p>{selectedAlert.location?.name || selectedAlert.location?.district || 'Location'}</p>
                  </div>
                  <button className="close-detail" onClick={() => setSelectedAlert(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="detail-meta">
                  <span>Issue Time: {selectedAlert.issued_at ? new Date(selectedAlert.issued_at).toLocaleString() : 'Unknown'}</span>
                  <span>Source: {selectedAlert.source || 'Unknown'}</span>
                </div>

                <div className="detail-tabs">
                  <button className="active">Overview</button>
                  <button>Affected Area</button>
                  <button>Safety Instructions</button>
                  <button>Source & History</button>
                </div>

                <div className="detail-content">
                  <div className="detail-map-section">
                    <div className="detail-map-placeholder">
                      <Layers size={32} />
                      <span>Map of Jaipur</span>
                    </div>
                    <div className="detail-legend">
                      <span><i className="legend-dot critical" />Critical Risk</span>
                      <span><i className="legend-dot high" />High Risk</span>
                      <span><i className="legend-dot moderate" />Moderate Risk</span>
                      <span><i className="legend-dot low" />Low Risk</span>
                      <span><i className="legend-dot affected" />Affected Area</span>
                    </div>
                  </div>

                  <div className="detail-summary">
                    <div className="summary-grid">
                      <SummaryItem label="Severity" value={selectedAlert.severity || 'Unknown'} color={getSeverityColor(selectedAlert.severity)} />
                      <SummaryItem label="Hazard" value={selectedAlert.type || 'Unknown'} color="#6366f1" />
                      <SummaryItem label="Confidence" value="96%" color="#10b981" />
                      <SummaryItem label="Validity" value="3-6 Hours" color="#f59e0b" />
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Impact</h4>
                    <p>Potential for localized flooding in low-lying areas. Disruption to transportation and possible power outages. Residents in affected areas should remain vigilant.</p>
                  </div>

                  <div className="detail-section">
                    <h4>Recommended Actions</h4>
                    <ul>
                      <li>Avoid low-lying areas and flood-prone zones</li>
                      <li>Do not attempt to cross flooded roads or bridges</li>
                      <li>Stay indoors and avoid unnecessary travel</li>
                      <li>Keep emergency supplies ready and accessible</li>
                      <li>Monitor official channels for updates</li>
                      <li>Follow local authority instructions immediately</li>
                    </ul>
                  </div>

                  <button className="view-full-details">
                    View Full Details
                  </button>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </main>
  );
}

function getAlertIcon(type?: string) {
  const typeLower = type?.toLowerCase() || '';
  if (typeLower.includes('rain') || typeLower.includes('flood')) return <CloudLightning size={20} />;
  if (typeLower.includes('fire')) return <Flame size={20} />;
  if (typeLower.includes('heat')) return <Activity size={20} />;
  if (typeLower.includes('lightning')) return <Zap size={20} />;
  return <AlertTriangle size={20} />;
}

function getSeverityColor(severity?: string) {
  const sev = severity?.toLowerCase() || '';
  if (sev === 'critical') return '#ef4444';
  if (sev === 'high') return '#f97316';
  if (sev === 'medium') return '#eab308';
  if (sev === 'low') return '#22c55e';
  return '#6366f1';
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="summary-item">
      <small>{label}</small>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}