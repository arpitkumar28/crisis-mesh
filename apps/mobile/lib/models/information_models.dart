class NewsArticle {
  final String id;
  final String title;
  final String? description;
  final String url;
  final String? imageUrl;
  final String? source;
  final String? publishedAt;
  final String? severity;

  NewsArticle({
    required this.id,
    required this.title,
    this.description,
    required this.url,
    this.imageUrl,
    this.source,
    this.publishedAt,
    this.severity,
  });

  factory NewsArticle.fromJson(Map<String, dynamic> json) {
    return NewsArticle(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      url: json['url'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
      source: json['source'] as String?,
      publishedAt: json['publishedAt'] as String?,
      severity: json['severity'] as String?,
    );
  }
}

class WeatherData {
  final double? temperature;
  final double? humidity;
  final double? windSpeed;
  final double? windGust;
  final double? precipitation;
  final double? pressure;
  final double? visibility;
  final int? weatherCode;
  final Map<String, dynamic>? forecast;
  final String observedAt;
  final double latitude;
  final double longitude;
  final String source;

  WeatherData({
    required this.temperature,
    required this.humidity,
    required this.windSpeed,
    required this.windGust,
    required this.precipitation,
    required this.pressure,
    required this.visibility,
    required this.weatherCode,
    required this.forecast,
    required this.observedAt,
    required this.latitude,
    required this.longitude,
    required this.source,
  });

  factory WeatherData.fromJson(Map<String, dynamic> json) {
    double? number(dynamic value) => (value as num?)?.toDouble();

    return WeatherData(
      temperature: number(json['temperature']),
      humidity: number(json['humidity']),
      windSpeed: number(json['windSpeed']),
      windGust: number(json['windGust']),
      precipitation: number(json['precipitation']),
      pressure: number(json['pressure']),
      visibility: number(json['visibility']),
      weatherCode: json['weatherCode'] as int?,
      forecast: (json['forecast'] as Map?)?.cast<String, dynamic>(),
      observedAt: json['observedAt'] as String? ?? '',
      latitude: number(json['latitude']) ?? 0,
      longitude: number(json['longitude']) ?? 0,
      source: json['source'] as String? ?? 'Unknown',
    );
  }
}