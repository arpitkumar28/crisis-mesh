import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/app_messenger.dart';

class ReportIncidentScreen extends StatefulWidget {
  const ReportIncidentScreen({super.key});

  @override
  State<ReportIncidentScreen> createState() => _ReportIncidentScreenState();
}

class _ReportIncidentScreenState extends State<ReportIncidentScreen> {
  final _formKey = GlobalKey<FormState>();
  String _type = 'OTHER';
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController(text: 'Current Location (GPS)');
  String _severity = 'MEDIUM';
  bool _isSubmitting = false;

  final List<String> _types = ['FLOOD', 'FIRE', 'EARTHQUAKE', 'HEATWAVE', 'ACCIDENT', 'MEDICAL', 'OTHER'];
  final List<String> _severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      final response = await crisisApi.createIncident({
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'type': _type,
        'severity': _severity,
        // In a real device, we would use geolocator to get lat/long
        'location_id': null, 
      });

      if (mounted && response.data['success'] == true) {
        AppMessenger.success(context, 'Incident reported successfully. Help is on the way.');
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        AppMessenger.error(context, 'Failed to report incident. Please try again.');
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Report Incident')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Incident Details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
              const SizedBox(height: 8),
              const Text('Provide accurate information to help responders reach you faster.', style: TextStyle(color: Color(0xFF65728A))),
              const SizedBox(height: 24),
              DropdownButtonFormField<String>(
                initialValue: _type,
                decoration: const InputDecoration(labelText: 'Incident Type', border: OutlineInputBorder()),
                items: _types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) => setState(() => _type = v!),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Short Title', hintText: 'e.g. Flash flood near main market', border: OutlineInputBorder()),
                validator: (v) => v == null || v.isEmpty ? 'Please enter a title' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Description', hintText: 'Describe the situation and any immediate needs', border: OutlineInputBorder()),
                maxLines: 3,
                validator: (v) => v == null || v.isEmpty ? 'Please enter a description' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _severity,
                decoration: const InputDecoration(labelText: 'Perceived Severity', border: OutlineInputBorder()),
                items: _severities.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) => setState(() => _severity = v!),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locationController,
                readOnly: true,
                decoration: const InputDecoration(labelText: 'Location', prefixIcon: Icon(Icons.my_location, color: Colors.blue), border: OutlineInputBorder()),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD92835), foregroundColor: Colors.white),
                  child: _isSubmitting 
                    ? const CircularProgressIndicator(color: Colors.white) 
                    : const Text('SUBMIT EMERGENCY REPORT', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
