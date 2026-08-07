import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from 'features/auth/services/authToken'

export function useWebSocket(projectId, onMessage) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;
    const token = getAccessToken();

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws'}?token=${encodeURIComponent(token || '')}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to project board events
        client.subscribe(`/topic/project/${projectId}`, (msg) => {
          try { onMessage(JSON.parse(msg.body)); } catch (e) {}
        });
        // Subscribe to personal notifications
        client.subscribe('/user/queue/notifications', (msg) => {
          try { onMessage({ type: 'NOTIFICATION', payload: JSON.parse(msg.body) }); } catch (e) {}
        });
      },
      onStompError: (frame) => console.error('STOMP error:', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current?.active) clientRef.current.deactivate();
    };
  }, [projectId, onMessage]);

  const publish = useCallback((destination, body) => {
    if (clientRef.current?.active) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  return { publish };
}

