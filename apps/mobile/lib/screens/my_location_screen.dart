import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:share_plus/share_plus.dart';
import '../services/app_messenger.dart';

class MyLocationScreen extends StatefulWidget {
  const MyLocationScreen({super.key});

  @override
  State<MyLocationScreen> createState() => _MyLocationScreenState();
}

class _MyLocationScreenState extends State<MyLocationScreen> {
  Position? _currentPosition;
  bool _isLoading = true;
  String _address = "Fetching address...";

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoading = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) AppMessenger.error(context, 'Location services are disabled.');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) AppMessenger.error(context, 'Location permissions are denied.');
          return;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        if (mounted) AppMessenger.error(context, 'Location permissions are permanently denied.');
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = position;
        _isLoading = false;
        _address = "Near ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}";
      });
    } catch (e) {
      if (mounted) AppMessenger.error(context, 'Error fetching location: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Location')),
      body: Column(
        children: [
          Container(
            height: 300,
            width: double.infinity,
            color: Colors.grey[200],
            child: Center(
              child: _isLoading 
                ? const CircularProgressIndicator()
                : const Icon(Icons.my_location, size: 64, color: Color(0xFF0757E8)),
            ),
          ),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Current Location', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(_address, style: const TextStyle(color: Colors.grey)),
                  const SizedBox(height: 32),
                  _LocationDetailRow(label: 'Latitude', value: _currentPosition?.latitude.toString() ?? '—'),
                  const Divider(),
                  _LocationDetailRow(label: 'Longitude', value: _currentPosition?.longitude.toString() ?? '—'),
                  const Divider(),
                  _LocationDetailRow(label: 'Accuracy', value: _currentPosition != null ? '${_currentPosition!.accuracy.toStringAsFixed(1)}m' : '—'),
                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: _currentPosition == null ? null : () {
                        Share.share('My current location: https://www.google.com/maps/search/?api=1&query=${_currentPosition!.latitude},${_currentPosition!.longitude}');
                      },
                      icon: const Icon(Icons.share),
                      label: const Text('Share Location', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0757E8),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LocationDetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _LocationDetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
