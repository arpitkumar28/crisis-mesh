'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import apiClient from '@/lib/api-client';
import { wsClient } from '@/lib/websocket-client';

interface DashboardStats {
  devices: number;
  alerts: number;
  incidents: number;
  onlineDevices: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    devices: 0,
    alerts: 0,
    incidents: 0,
    onlineDevices: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchStats();

    // Set up WebSocket listeners
    const handleTelemetryUpdate = (data: any) => {
      console.log('Telemetry updated:', data);
    };

    const handleDeviceStatusChange = (data: any) => {
      console.log('Device status changed:', data);
      fetchStats();
    };

    const handleAlertCreated = (data: any) => {
      console.log('Alert created:', data);
      fetchStats();
    };

    const handleIncidentCreated = (data: any) => {
      console.log('Incident created:', data);
      fetchStats();
    };

    wsClient.on('telemetry.updated', handleTelemetryUpdate);
    wsClient.on('device.status_changed', handleDeviceStatusChange);
    wsClient.on('alert.created', handleAlertCreated);
    wsClient.on('incident.created', handleIncidentCreated);

    return () => {
      wsClient.off('telemetry.updated', handleTelemetryUpdate);
      wsClient.off('device.status_changed', handleDeviceStatusChange);
      wsClient.off('alert.created', handleAlertCreated);
      wsClient.off('incident.created', handleIncidentCreated);
    };
  }, [isAuthenticated, router]);

  const fetchStats = async () => {
    try {
      const [devicesRes, alertsRes, incidentsRes] = await Promise.all([
        apiClient.get('/devices'),
        apiClient.get('/alerts'),
        apiClient.get('/incidents'),
      ]);

      const devices = devicesRes.data.data;
      const alerts = alertsRes.data.data;
      const incidents = incidentsRes.data.data;

      setStats({
        devices: devices.length,
        alerts: alerts.filter((alert: any) => alert.status === 'ACTIVE').length,
        incidents: incidents.filter((incident: any) => incident.status !== 'RESOLVED' && incident.status !== 'CLOSED').length,
        onlineDevices: devices.filter((device: any) => device.status === 'ONLINE').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    localStorage.removeItem('access_token');
    wsClient.disconnect();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CrisisMesh</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Devices</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.devices}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Alerts</h3>
            <p className="mt-2 text-3xl font-bold text-danger-600">{stats.alerts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Open Incidents</h3>
            <p className="mt-2 text-3xl font-bold text-warning-600">{stats.incidents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Online Devices</h3>
            <p className="mt-2 text-3xl font-bold text-success-600">{stats.onlineDevices}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-500">Real-time updates will appear here via WebSocket.</p>
        </div>
      </main>
    </div>
  );
}
