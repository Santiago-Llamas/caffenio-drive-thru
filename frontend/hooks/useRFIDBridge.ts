'use client';

import { useEffect, useRef, useCallback } from 'react';

interface RFIDTag {
  type: string;
  id: string;
}

/**
 * Hook personalizado para conectar a un lector RFID USB (125 kHz) vía WebSocket.
 * 
 * El bridge Node.js (bridge.js) debe estar ejecutándose en ws://localhost:8081
 * y emitir mensajes en formato: { "type": "RFID_TAG", "id": "xxxxxxxxx" }
 * 
 * ⚠️ IMPORTANTE: Solo se conecta en DESARROLLO (localhost).
 * En producción (Vercel) se ignora automáticamente.
 * 
 * @param onTag - Callback que se ejecuta cuando se lee un tag RFID
 * @param autoConnect - Si true, se conecta automáticamente al montar (default: true)
 */
export const useRFIDBridge = (
  onTag: (uid: string) => void,
  autoConnect: boolean = true
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isLocalhost = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    );
  }, []);

  const connect = useCallback(() => {
    // Solo conectar en desarrollo (localhost)
    if (!isLocalhost()) {
      console.log('[RFID Bridge] No en localhost, bridge desactivado.');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('[RFID Bridge] Ya conectado.');
      return;
    }

    try {
      console.log('[RFID Bridge] Conectando a ws://localhost:8081...');
      const ws = new WebSocket('ws://localhost:8081');

      ws.onopen = () => {
        console.log('[RFID Bridge] ✅ Conectado al bridge RFID');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data: RFIDTag = JSON.parse(event.data);
          if (data.type === 'RFID_TAG' && data.id) {
            console.log(`[RFID Bridge] Tag leído: ${data.id}`);
            onTag(data.id);
          }
        } catch (err) {
          console.error('[RFID Bridge] Error al parsear mensaje:', err);
        }
      };

      ws.onerror = (error: Event) => {
        console.error('[RFID Bridge] Error en WebSocket:', error);
      };

      ws.onclose = () => {
        console.log('[RFID Bridge] ❌ Desconectado del bridge RFID');
        wsRef.current = null;

        // Reintentar conexión con backoff exponencial (máx 5 intentos)
        if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
          console.log(`[RFID Bridge] Reintentando en ${delay}ms (intento ${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})...`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[RFID Bridge] Error al crear WebSocket:', err);
    }
  }, [isLocalhost, onTag]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    console.log('[RFID Bridge] Desconectado manualmente.');
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};
