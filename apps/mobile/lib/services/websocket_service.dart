import 'package:socket_io_client/socket_io_client.dart' as io;
import 'dart:io';
import 'dart:developer' as developer;
import 'dart:async';

class WebSocketService {
  io.Socket? _socket;
  final String wsUrl;
  final _events = StreamController<SocketEvent>.broadcast();

  Stream<SocketEvent> get events => _events.stream;

  WebSocketService({String? wsUrl}) : wsUrl = wsUrl ?? (Platform.isAndroid ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

  void connect(String token) {
    if (_socket != null && _socket!.connected) {
      return;
    }

    _socket = io.io('$wsUrl/ws', <String, dynamic>{
      'auth': {'token': token},
      'transports': ['websocket'],
      'reconnection': true,
      'reconnectionAttempts': double.infinity,
      'reconnectionDelay': 1000,
      'reconnectionDelayMax': 10000,
    });

    _socket!.on('connect', (_) {
      developer.log('WebSocket connected', name: 'CrisisMesh');
    });

    _socket!.on('disconnect', (_) {
      developer.log('WebSocket disconnected', name: 'CrisisMesh');
    });

    _socket!.on('connection.established', (data) {
      developer.log('Connection established: $data', name: 'CrisisMesh');
    });
    for (final event in SocketEvent.names) {
      _socket!.on(event, (data) => _events.add(SocketEvent(event, data)));
    }
  }

  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket = null;
    }
  }

  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  void off(String event, [dynamic callback]) {
    _socket?.off(event, callback);
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void dispose() {
    disconnect();
    _events.close();
  }

  bool get isConnected => _socket?.connected ?? false;
}

class SocketEvent {
  const SocketEvent(this.name, this.data);

  final String name;
  final dynamic data;

  static const names = [
    'telemetry.updated',
    'device.updated',
    'device.status_changed',
    'alert.created',
    'alert.updated',
    'incident.created',
    'incident.updated',
    'incident.status_changed',
  ];
}

final crisisWebSocket = WebSocketService();
