import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export const useWebSocket = (roomId, onMessage, onPresenceUpdate, currentUserId) => {
  const clientRef = useRef(null);
  const roomSubRef = useRef(null);
  const typingSubRef = useRef(null);
  const presenceSubRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const onPresenceRef = useRef(onPresenceUpdate);
  const roomIdRef = useRef(roomId);
  const [connected, setConnected] = useState(false);

  // Keep refs updated to avoid stale closures
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onPresenceRef.current = onPresenceUpdate; }, [onPresenceUpdate]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

  // Create a single STOMP client once
  useEffect(() => {
    const socket = new SockJS(WS_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP:', str),
    });

    stompClient.onConnect = () => {
      console.log('✅ WebSocket connected');
      setConnected(true);

      // Presence subscription - keep it alive across room changes
      try {
        if (!presenceSubRef.current) {
          presenceSubRef.current = stompClient.subscribe('/topic/presence', (message) => {
            const presence = JSON.parse(message.body);
            console.log('� Presence update:', presence);
            if (onPresenceRef.current) onPresenceRef.current(presence);
          });
        }
      } catch (e) {
        console.error('❌ Error subscribing to presence:', e);
      }

      // Announce presence for current user (server will update onlineUsers and broadcast)
      try {
        if (currentUserId && clientRef.current) {
          const announce = { userId: currentUserId, online: true };
          // publish to /app/presence (server should handle MessageMapping)
          stompClient.publish({ destination: '/app/presence', body: JSON.stringify(announce) });
          console.log('📣 Announced presence:', announce);
        }
      } catch (e) {
        console.warn('⚠️ Could not announce presence on connect:', e);
      }

      // Subscribe to current room if available
      if (roomIdRef.current) {
        try {
          roomSubRef.current = stompClient.subscribe(`/topic/rooms/${roomIdRef.current}`, (message) => {
            const msg = JSON.parse(message.body);
            console.log('📩 Nhận tin nhắn mới:', msg);
            if (onMessageRef.current) onMessageRef.current(msg);
          });

          typingSubRef.current = stompClient.subscribe(`/topic/rooms/${roomIdRef.current}/typing`, (message) => {
            const typing = JSON.parse(message.body);
            console.log('✍️ Typing:', typing);
          });
        } catch (e) {
          console.error('❌ Error subscribing to room topics on connect:', e);
        }
      }
    };

    stompClient.onDisconnect = () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      try {
        if (roomSubRef.current) { roomSubRef.current.unsubscribe(); roomSubRef.current = null; }
        if (typingSubRef.current) { typingSubRef.current.unsubscribe(); typingSubRef.current = null; }
        if (presenceSubRef.current) { presenceSubRef.current.unsubscribe(); presenceSubRef.current = null; }
      } catch (e) {
        console.warn('⚠️ Error during subscription cleanup:', e);
      }

      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []);

  // Manage per-room subscriptions when roomId changes
  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    // If client not connected yet, onConnect will handle subscription
    if (!client.connected) {
      console.log('ℹ️ Client not connected yet - will subscribe when connected');
      return;
    }

    // Unsubscribe previous room
    try {
      if (roomSubRef.current) { roomSubRef.current.unsubscribe(); roomSubRef.current = null; }
      if (typingSubRef.current) { typingSubRef.current.unsubscribe(); typingSubRef.current = null; }
    } catch (e) {
      console.warn('⚠️ Error unsubscribing previous room topics:', e);
    }

    // Subscribe to new room if provided
    if (roomId) {
      try {
        roomSubRef.current = client.subscribe(`/topic/rooms/${roomId}`, (message) => {
          const msg = JSON.parse(message.body);
          console.log('📩 Nhận tin nhắn mới (room change):', msg);
          if (onMessageRef.current) onMessageRef.current(msg);
        });

        typingSubRef.current = client.subscribe(`/topic/rooms/${roomId}/typing`, (message) => {
          const typing = JSON.parse(message.body);
          console.log('✍️ Typing (room change):', typing);
        });
      } catch (e) {
        console.error('❌ Error subscribing to new room topics:', e);
      }
    }
  }, [roomId]);

  // ✅ Gửi tin nhắn kèm roomId
  const sendMessage = (senderId, content) => {
    const client = clientRef.current;
    const rId = roomIdRef.current;
    if (client?.connected && rId) {
      const payload = { roomId: rId, senderId, content };
      client.publish({ destination: `/app/rooms/${rId}/send`, body: JSON.stringify(payload) });
      console.log('📤 Gửi tin nhắn:', payload);
    } else {
      console.error('❌ WebSocket chưa kết nối hoặc roomId chưa có');
    }
  };

  // Gửi typing indicator (tuỳ chọn)
  const sendTyping = (userId, isTyping) => {
    const client = clientRef.current;
    const rId = roomIdRef.current;
    if (client?.connected && rId) {
      client.publish({ destination: '/app/typing', body: JSON.stringify({ roomId: rId, userId, typing: isTyping }) });
    }
  };

  return { connected, sendMessage, sendTyping };
};
