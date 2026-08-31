'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud, CloudRain, Droplets, Wind, Gauge,
  Sun, CloudLightning, Activity,
  ChevronRight, MapPin, RefreshCw,
  Bell, Info, AlertTriangle, Thermometer
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import apiClient from '@/lib/api-client';

// Jaipur coordinates
const JAIPUR_LAT = 26.9124;
const JAIPUR_LON = 75.7873;

export default function WeatherForecastPage() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeatherData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/public/weather/${JAIPUR_LAT}/${JAIPUR_LON}`);
      setWeatherData(response.data.data);
    } catch (err) {
      setError('Failed to load weather data. Please try again.');
      console.error('Weather API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={28} />;
    if (code >= 1 && code <= 3) return <Cloud size={28} />;
    if (code >= 45 && code <= 48) return <Cloud size={28} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain size={28} />;
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <Cloud size={28} />;
    if (code >= 95 && code <= 99) return <CloudLightning size={28} />;
    return <Cloud size={28} />;
  };

  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Clear';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rainy';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Cloudy';
  };

  const processHourlyData = (forecast: any) => {
    if (!forecast || !forecast.time || !forecast.temperature_2m || !forecast.precipitation) {
      return [];
    }

    const times = forecast.time as string[];
    const temps = forecast.temperature_2m as number[];
    const precip = forecast.precipitation as number[];
    const codes = forecast.weather_code as number[];

    // Get next 12 hours
    const next12Hours = times.slice(0, 12).map((time, index) => ({
      time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      value: precip[index] || 0,
      temperature: temps[index] || 0,
      code: codes[index] || 0
    }));

    return next12Hours;
  };

  const process7DayForecast = (forecast: any) => {
    if (!forecast || !forecast.time || !forecast.temperature_2m) {
      return [];
    }

    const times = forecast.time as string[];
    const temps = forecast.temperature_2m as number[];
    const codes = forecast.weather_code as number[];

    // Get next 7 days (assuming hourly data, take every 24th hour)
    const dailyData = [];
    for (let i = 0; i < 7 && i * 24 < times.length; i++) {
      const index = i * 24;
      dailyData.push({
        day: new Date(times[index]).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
        high: Math.max(...temps.slice(index, index + 24)),
        low: Math.min(...temps.slice(index, index + 24)),
        condition: getWeatherCondition(codes[index] || 0),
        icon: getWeatherIcon(codes[index] || 0)
      });
    }

    return dailyData;
  };

  const rainfallData = weatherData?.forecast ? processHourlyData(weatherData.forecast) : [];
  const sevenDayForecast = weatherData?.forecast ? process7DayForecast(weatherData.forecast) : [];

  return (
    <OperationsShell eyebrow="Real-time meteorological intelligence and forecasting" title="Weather & Forecast">
      {/* Top Section: Current Weather & 7-Day Forecast */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        {/* Current Weather Card */}
        <div className="col-span-12 lg:col-span-4">
           <div className="bg-[#061a37] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Current Weather</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jaipur, Rajasthan</p>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/5">
                      {loading ? <RefreshCw size={28} className="animate-spin" /> : getWeatherIcon(weatherData?.weatherCode || 0)}
                   </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw size={32} className="animate-spin text-blue-400" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertTriangle size={32} className="text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-400">{error}</p>
                    <button onClick={fetchWeatherData} className="mt-4 text-xs font-black text-blue-400 uppercase tracking-widest hover:underline">
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-4 mb-8">
                       <h2 className="text-7xl font-black tracking-tighter">{weatherData?.temperature?.toFixed(1) || '--'}°C</h2>
                       <div className="mb-3">
                          <p className="text-xl font-black">{getWeatherCondition(weatherData?.weatherCode || 0)}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Updated: {weatherData?.observedAt ? new Date(weatherData.observedAt).toLocaleTimeString() : '--'}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                       <WeatherStat label="Humidity" value={`${weatherData?.humidity?.toFixed(0) || '--'}%`} />
                       <WeatherStat label="Wind Speed" value={`${weatherData?.windSpeed?.toFixed(1) || '--'} km/h`} />
                       <WeatherStat label="Pressure" value={`${weatherData?.pressure?.toFixed(0) || '--'} hPa`} />
                       <WeatherStat label="Visibility" value={`${weatherData?.visibility ? (weatherData.visibility / 1000).toFixed(1) : '--'} km`} />
                    </div>
                  </>
                )}
              </div>
           </div>
        </div>

        {/* 7-Day Forecast Horizontal */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">7-Day Forecast</h3>
                <button onClick={fetchWeatherData} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw size={32} className="animate-spin text-blue-600" />
                </div>
              ) : sevenDayForecast.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 flex-1">
                   {sevenDayForecast.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-500 transition-all cursor-pointer group">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight text-center leading-tight">{item.day}</p>
                         <div className="text-blue-600 my-4 group-hover:scale-110 transition-transform">
                            {item.icon}
                         </div>
                         <div className="text-center">
                            <p className="text-sm font-black text-[#0f172a]">{item.high.toFixed(0)}°</p>
                            <p className="text-[10px] font-bold text-gray-400">{item.low.toFixed(0)}°</p>
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  No forecast data available
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Bottom Section: Rainfall Forecast & Alerts */}
      <div className="grid grid-cols-12 gap-8">
        {/* Rainfall Forecast Chart */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Rainfall Forecast <span className="text-gray-400 font-bold ml-2">(Next 12 Hours)</span></h3>
                 <div className="flex gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Rainfall (mm)</div>
                 </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw size={32} className="animate-spin text-blue-600" />
                </div>
              ) : rainfallData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfallData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                      <Tooltip
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         {rainfallData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value > 50 ? '#3b82f6' : '#93c5fd'} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No rainfall data available
                </div>
              )}
           </div>
        </div>

        {/* Weather Alerts Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm flex-1">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Weather Alerts</h3>
              {weatherData && (weatherData.weatherCode || 0) >= 95 ? (
                <div className="space-y-4">
                  <WeatherAlert
                    icon={<AlertTriangle size={18} className="text-red-500" />}
                    title="Severe Weather Alert"
                    time={weatherData.observedAt ? new Date(weatherData.observedAt).toLocaleString() : 'Now'}
                    severity="Red Alert"
                    color="bg-red-50 text-red-600"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Info size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No active weather alerts</p>
                  <p className="text-xs mt-1">Current conditions are normal</p>
                </div>
              )}
              <button onClick={fetchWeatherData} className="w-full mt-8 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <RefreshCw size={12} /> Refresh Data
              </button>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Info size={16} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Meteorological Insight</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 {weatherData ? `Current temperature in Jaipur is ${weatherData.temperature?.toFixed(1)}°C with ${weatherData.humidity?.toFixed(0)}% humidity. ${getWeatherCondition(weatherData.weatherCode || 0)} conditions reported. Data source: ${weatherData.source || 'Open-Meteo'}` : 'Loading weather intelligence data...'}
              </p>
              <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:underline">
                 Read Full Analysis Report <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}

function WeatherAlert({ icon, title, time, severity, color }: { icon: React.ReactNode; title: string; time: string; severity: string; color: string }) {
  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
       <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
          {icon}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
             <h5 className="text-[11px] font-black text-[#0f172a] uppercase truncate tracking-tight">{title}</h5>
             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${color}`}>{severity}</span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{time}</p>
       </div>
    </div>
  );
}
