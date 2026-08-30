import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../models/information_models.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  late Future<List<NewsArticle>> _newsFuture;

  @override
  void initState() {
    super.initState();
    _newsFuture = crisisApi.getNews();
  }

  void _retry() {
    setState(() {
      _newsFuture = crisisApi.getNews();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('News & Updates'),
      ),
      body: FutureBuilder<List<NewsArticle>>(
        future: _newsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  const Text('Failed to load news'),
                  const SizedBox(height: 16),
                  ElevatedButton(onPressed: _retry, child: const Text('Retry')),
                ],
              ),
            );
          }

          final articles = snapshot.data ?? [];
          if (articles.isEmpty) {
            return const Center(child: Text('No news updates available.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: articles.length,
            itemBuilder: (context, index) {
              final article = articles[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () async {
                    if (await canLaunchUrl(Uri.parse(article.url))) {
                      await launchUrl(Uri.parse(article.url));
                    }
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (article.imageUrl != null)
                        Image.network(
                          article.imageUrl!,
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(height: 200, color: Colors.grey[200], child: const Icon(Icons.image)),
                        ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              article.title,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              article.description ?? '',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.grey),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(article.source ?? 'Official Source', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0757E8))),
                                Text(article.publishedAt?.split('T')[0] ?? '', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
