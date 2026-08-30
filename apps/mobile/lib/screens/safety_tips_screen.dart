import 'package:flutter/material.dart';

class SafetyTipsScreen extends StatelessWidget {
  const SafetyTipsScreen({super.key});

  final List<Map<String, dynamic>> tips = const [
    {
      'title': 'Floods',
      'icon': Icons.water,
      'color': Colors.blue,
      'steps': [
        'Move to higher ground immediately.',
        'Do not walk or drive through flood water.',
        'Turn off electricity and gas if safe to do so.',
        'Do not cross flooded roads.',
        'Listen to official updates.',
      ]
    },
    {
      'title': 'Fire',
      'icon': Icons.local_fire_department,
      'color': Colors.red,
      'steps': [
        'Stay low to the ground to avoid smoke.',
        'Check doors for heat before opening.',
        'Use stairs, not elevators.',
        'Once out, stay out.',
        'Call emergency services immediately.',
      ]
    },
    {
      'title': 'Earthquake',
      'icon': Icons.landscape,
      'color': Colors.brown,
      'steps': [
        'Drop, Cover, and Hold On.',
        'Stay away from glass and heavy furniture.',
        'If outdoors, stay in an open area.',
        'Do not use elevators.',
        'Expect aftershocks.',
      ]
    },
    {
      'title': 'Heatwave',
      'icon': Icons.wb_sunny,
      'color': Colors.orange,
      'steps': [
        'Drink plenty of water.',
        'Avoid strenuous activities during peak heat.',
        'Wear lightweight, light-colored clothing.',
        'Stay in air-conditioned or shaded areas.',
        'Check on elderly neighbors.',
      ]
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Safety Tips')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: tips.length,
        itemBuilder: (context, index) {
          final tip = tips[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: ExpansionTile(
              leading: Icon(tip['icon'], color: tip['color']),
              title: Text(tip['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: (tip['steps'] as List<String>).map((step) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                            Expanded(child: Text(step)),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
