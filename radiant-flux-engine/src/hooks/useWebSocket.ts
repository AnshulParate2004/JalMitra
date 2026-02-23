/**
 * WebSocket Hook for Real-time Water Quality Updates
 * 
 * Connects to the backend WebSocket endpoint and provides real-time
 * reading and alert updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { API_ENDPOINTS, WaterReading, WaterAlert } from '@/lib/api';

export interface WebSocketMessage {
  type: 'reading' | 'alert';
  data: WaterReading | WaterAlert;
}

export interface UseWebSocketReturn {
  latestReading: WaterReading | null;
  latestAlert: WaterAlert | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [latestReading, setLatestReading] = useState<WaterReading | null>(null);
  const [latestAlert, setLatestAlert] = useState<WaterAlert | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(API_ENDPOINTS.websocket);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to backend');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received from backend:', message.type, message.data);
          
          if (message.type === 'reading') {
            console.log('[WebSocket] New reading from backend:', message.data);
            setLatestReading(message.data as WaterReading);
          } else if (message.type === 'alert') {
            console.log('[WebSocket] New alert from backend:', message.data);
            setLatestAlert(message.data as WaterAlert);
          }
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`[WebSocket] Reconnecting... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          setError('Failed to connect to backend. Please check if the server is running.');
        }
      };
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
      setError('Failed to establish WebSocket connection');
      setIsConnected(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    latestReading,
    latestAlert,
    isConnected,
    error,
    reconnect,
  };
}
