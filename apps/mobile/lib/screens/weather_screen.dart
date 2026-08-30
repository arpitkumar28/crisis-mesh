import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/information_models.dart';

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  late Future<WeatherData> _weatherFuture;
  double latitude = 26.9124;
  double longitude = 75.7873;

  @override
  void initState() {
    super.initState();
    _loadWeather();
  }

  void _loadWeather() {
    setState(() {
      _weatherFuture = crisisApi.getWeather(latitude, longitude);
    });
  }

  void _retry() {
    _loadWeather();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Weather Intelligence'),
        centerTitle: true,
      ),
      body: FutureBuilder<WeatherData>(
        future: _weatherFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Error: ${snapshot.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _retry,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (!snapshot.hasData) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('No weather data available'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _retry,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final weather = snapshot.data!;
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Current Conditions Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Current Conditions',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _WeatherMetric(
                                label: 'Temperature',
                                value:
                                    '${weather.temperature?.toStringAsFixed(1) ?? "—"}°C',
                                icon: Icons.device_thermostat,
                              ),
                              _WeatherMetric(
                                label: 'Humidity',
                                value:
                                    '${weather.humidity?.toStringAsFixed(0) ?? "—"}%',
                                icon: Icons.water_drop,
                              ),
                              _WeatherMetric(
                                label: 'Wind',
                                value:
                                    '${weather.windSpeed?.toStringAsFixed(1) ?? "—"} km/h',
                                icon: Icons.air,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _WeatherMetric(
                                label: 'Precipitation',
                                value:
                                    '${weather.precipitation?.toStringAsFixed(1) ?? "—"} mm',
                                icon: Icons.grain,
                              ),
                              _WeatherMetric(
                                label: 'Pressure',
                                value:
                                    '${weather.pressure?.toStringAsFixed(0) ?? "—"} mb',
                                icon: Icons.compress,
                              ),
                              _WeatherMetric(
                                label: 'Visibility',
                                value:
                                    '${weather.visibility != null ? (weather.visibility! / 1000).toStringAsFixed(1) : "—"} km',
                                icon: Icons.visibility,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Last Updated: ${weather.observedAt}',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Hourly Forecast
                  if (weather.forecast != null &&
                      weather.forecast!['time'] != null)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Hourly Forecast',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: SizedBox(
                              height: 150,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: (weather.forecast!['time'] as List)
                                            .length <
                                        12
                                    ? (weather.forecast!['time'] as List).length
                                    : 12,
                                itemBuilder: (context, index) {
                                  final times =
                                      weather.forecast!['time'] as List;
                                  final temps = weather
                                      .forecast!['temperature_2m'] as List;
                                  final codes =
                                      weather.forecast!['weather_code'] as List;

                                  return Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          times[index]
                                              .toString()
                                              .substring(11, 16),
                                          style: const TextStyle(fontSize: 12),
                                        ),
                                        const SizedBox(height: 8),
                                        Icon(
                                          _getWeatherIcon(codes[index] as int),
                                          size: 32,
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          '${(temps[index] as num).toStringAsFixed(0)}°',
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),
                  // Location Info
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Location',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Latitude: ${weather.latitude.toStringAsFixed(4)}',
                            style: const TextStyle(fontSize: 12),
                          ),
                          Text(
                            'Longitude: ${weather.longitude.toStringAsFixed(4)}',
                            style: const TextStyle(fontSize: 12),
                          ),
                          Text(
                            'Source: ${weather.source}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  IconData _getWeatherIcon(int weatherCode) {
    if (weatherCode == 0) {
      return Icons.wb_sunny;
    } else if (weatherCode == 1 || weatherCode == 2 || weatherCode == 3) {
      return Icons.wb_cloudy;
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      return Icons.cloud_queue;
    } else if ((weatherCode >= 51 && weatherCode <= 67) ||
        (weatherCode >= 80 && weatherCode <= 82)) {
      return Icons.grain;
    } else if ((weatherCode >= 71 && weatherCode <= 77) ||
        (weatherCode >= 85 && weatherCode <= 86)) {
      return Icons.ac_unit;
    } else if (weatherCode >= 80 && weatherCode <= 82) {
      return Icons.thunderstorm;
    } else if (weatherCode >= 85 && weatherCode <= 86) {
      return Icons.cloud_queue;
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      return Icons.cloud_download;
    }
    return Icons.cloud;
  }
}

class _WeatherMetric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _WeatherMetric({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Colors.blue),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
      ],
    );
  }
}
