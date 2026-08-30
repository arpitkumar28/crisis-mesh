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
  String _type = 'FLOOD';
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController(text: 'Malviya Nagar, Jaipur');
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Report Incident'),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: const BackButton(color: Color(0xFF102043)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Incident Type',
                style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
              ),
              const SizedBox(height: 8),
              _buildDropdown(_type, _types, (val) => setState(() => _type = val!)),
              
              const SizedBox(height: 20),
              const Text(
                'Perceived Severity',
                style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
              ),
              const SizedBox(height: 8),
              _buildDropdown(_severity, _severities, (val) => setState(() => _severity = val!)),

              const SizedBox(height: 20),
              const Text(
                'Short Title',
                style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _titleController,
                decoration: _inputDecoration('e.g. Flash flood near main market'),
                validator: (v) => v == null || v.isEmpty ? 'Please enter a title' : null,
              ),

              const SizedBox(height: 20),
              const Text(
                'Description',
                style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: _inputDecoration('Describe the situation and any immediate needs...'),
                validator: (v) => v == null || v.isEmpty ? 'Please enter a description' : null,
              ),

              const SizedBox(height: 20),
              const Text(
                'Location',
                style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFD),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE4EAF4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.location_on, color: Color(0xFF0757E8), size: 20),
                    const SizedBox(width: 12),
                    Text(_locationController.text, style: const TextStyle(color: Color(0xFF102043))),
                    const Spacer(),
                    const Text('Change', style: TextStyle(color: Color(0xFF0757E8), fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ),

              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD92835),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _isSubmitting 
                    ? const CircularProgressIndicator(color: Colors.white) 
                    : const Text('SUBMIT EMERGENCY REPORT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 20),
              const Center(
                child: Text(
                  'False reporting is a punishable offense.',
                  style: TextStyle(color: Color(0xFF65728A), fontSize: 12),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown(String value, List<String> items, Function(String?) onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          items: items.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
      fillColor: const Color(0xFFF8FAFD),
      filled: true,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE4EAF4)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE4EAF4)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF0757E8)),
      ),
    );
  }
}
