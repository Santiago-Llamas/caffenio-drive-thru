'use client';

import { useState, useRef, useEffect } from 'react';

// Declaración de tipos para la Web NFC API (experimental)
declare global {
  interface Window {
    NDEFReader: any;
  }
}

interface NFCReaderProps {
  onSuccess: (userData: any) => void;
  onError: (error: string) => void;
  onUnregistered: (uid: string) => void;
  apiUrl: string;
}

type NFCStatus = 'idle' | 'scanning' | 'success' | 'error' | 'unsupported';

export default function NFCReader({ onSuccess, onError, onUnregistered, apiUrl }: NFCReaderProps) {
  const [status, setStatus] = useState<NFCStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<any>(null); // Guardar referencia al reader para poder limpiar

  // Verificar soporte NFC al montar el componente
  useEffect(() => {
    const isSupported = 'NDEFReader' in window;
    console.log('[NFC] API soportada:', isSupported);
    if (!isSupported) {
      setStatus('unsupported');
      setErrorMessage('Tu navegador no soporta NFC. Usa QR o el botón Invitado.');
    }
  }, []);

  const startScanning = async () => {
    if (status === 'unsupported') {
      onError('NFC no soportado');
      return;
    }

    setStatus('scanning');
    setErrorMessage('');
    console.log('[NFC] Iniciando escaneo...');

    // Cancelar escaneo anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('[NFC] Escaneo anterior cancelado');
    }
    abortControllerRef.current = new AbortController();

    try {
      const reader = new window.NDEFReader();
      readerRef.current = reader;

      // Evento cuando se lee un tag correctamente
      reader.addEventListener('reading', async (event: any) => {
        const serialNumber = event.serialNumber;
        console.log('[NFC] Tag detectado, UID:', serialNumber);

        if (!serialNumber) {
          setStatus('error');
          setErrorMessage('No se pudo leer el UID del tag. Intenta de nuevo.');
          return;
        }

        // Detener escaneo inmediatamente después de leer
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          console.log('[NFC] Escaneo detenido tras lectura');
        }

        // Pequeño retraso para permitir que la UI se actualice
        setStatus('idle');

        // Llamar al backend para identificar el UID
        try {
          console.log(`[NFC] Enviando UID a ${apiUrl}/identificar`);
          const res = await fetch(`${apiUrl}/identificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: serialNumber })
          });
          const data = await res.json();

          if (data.success) {
            console.log('[NFC] Usuario identificado:', data.user.nombre);
            setStatus('success');
            onSuccess(data.user);
          } else {
            console.warn('[NFC] Tag no registrado:', serialNumber);
            setStatus('error');
            setErrorMessage(data.message || 'Tag no reconocido.');
            onUnregistered(serialNumber);
          }
        } catch (err) {
          console.error('[NFC] Error en la petición al backend:', err);
          setStatus('error');
          setErrorMessage('Error de conexión. Intenta de nuevo.');
          onError('Error de conexión');
        }
      });

      // Evento cuando ocurre un error durante la lectura
      reader.addEventListener('readingerror', (err: any) => {
        console.error('[NFC] Error de lectura:', err);
        setStatus('error');
        setErrorMessage('Error al leer el tag. Asegúrate de acercarlo bien.');
        onError('Error de lectura');
        // Cancelar escaneo para que el usuario pueda reintentar
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      });

      // Iniciar el escaneo
      await reader.scan({ signal: abortControllerRef.current.signal });
      console.log('[NFC] Escaneo activo, acerca un tag...');

    } catch (err: any) {
      console.error('[NFC] Error al iniciar el escaneo:', err);
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Permiso denegado. Acepta el permiso para usar NFC.');
      } else if (err.name === 'NotSupportedError') {
        setErrorMessage('NFC no soportado en este dispositivo/navegador.');
        setStatus('unsupported');
      } else {
        setErrorMessage('Error al iniciar el sensor NFC. Intenta de nuevo.');
      }
      onError(err.message);
    }
  };

  const cancelScanning = () => {
    console.log('[NFC] Cancelando escaneo por usuario');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    readerRef.current = null;
    setStatus('idle');
    setErrorMessage('');
  };

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('[NFC] Limpiando escaneo al desmontar componente');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {status === 'unsupported' && (
        <div className="text-center text-amber-600 bg-amber-50 p-4 rounded-xl">
          <span className="material-symbols-outlined text-3xl">warning</span>
          <p className="font-semibold">NFC no disponible</p>
          <p className="text-sm">Usa QR o el botón Invitado para continuar.</p>
        </div>
      )}

      {status === 'scanning' && (
        <div className="relative flex flex-col items-center gap-3 w-full">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-75 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-pulse delay-150"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-25 animate-pulse delay-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-5xl">nfc</span>
            </div>
          </div>
          <p className="text-lg font-bold text-red-600">Escaneando...</p>
          <p className="text-sm text-slate-500">Acerca tu dispositivo o tarjeta NFC</p>
          <button
            onClick={cancelScanning}
            className="mt-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl">
          <span className="material-symbols-outlined text-3xl">error</span>
          <p className="font-semibold">{errorMessage}</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-2 px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center text-green-600 bg-green-50 p-4 rounded-xl animate-pulse">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
          <p className="font-semibold">¡Identificación exitosa!</p>
        </div>
      )}

      {status === 'idle' && (
        <button
          onClick={startScanning}
          className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-500/30 flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-2xl">tap_and_play</span>
          Identificar con One-Tap
        </button>
      )}
    </div>
  );
}