import 'package:flutter/material.dart';

class TrainingVideosScreen extends StatelessWidget {
  const TrainingVideosScreen({super.key});

  final List<Map<String, String>> videos = const [
    {
      'title': 'What to do during Floods?',
      'duration': '05:12',
      'thumbnail': 'https://img.youtube.com/vi/43M5mZuzM70/0.jpg',
    },
    {
      'title': 'Fire Safety Guidelines',
      'duration': '08:45',
      'thumbnail': 'https://img.youtube.com/vi/0pA5Z1R4eK4/0.jpg',
    },
    {
      'title': 'First Aid Basics for Everyone',
      'duration': '12:20',
      'thumbnail': 'https://img.youtube.com/vi/PhYSnJ729T4/0.jpg',
    },
    {
      'title': 'CPR Training Video',
      'duration': '04:30',
      'thumbnail': 'https://img.youtube.com/vi/M4ACYp75mjU/0.jpg',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Training Videos')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: videos.length,
        itemBuilder: (context, index) {
          final video = videos[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 20),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: () {},
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Image.network(
                        video['thumbnail']!,
                        height: 180,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) => Container(height: 180, color: Colors.grey[300], child: const Icon(Icons.movie_outlined)),
                      ),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                        child: const Icon(Icons.play_arrow, color: Colors.white, size: 32),
                      ),
                      Positioned(
                        bottom: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(4)),
                          child: Text(video['duration']!, style: const TextStyle(color: Colors.white, fontSize: 10)),
                        ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Text(
                      video['title']!,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
}
