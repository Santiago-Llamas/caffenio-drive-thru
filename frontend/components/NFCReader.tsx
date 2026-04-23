'use client';

import { useState, useRef, useEffect } from 'react';

declare global {
  interface Window {
    NDEFReader: any;
  }
}

interface NFCReaderProps {
  onSuccess: (userData: any) => void;
  onError: (error: string) => void;
  onUnregistered: (uid: string) => void;
  onTimeout?: () => void; // Nueva prop para manejar el timeout
  apiUrl: string;
}

type NFCStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function NFCReader({ onSuccess, onError, onUnregistered, onTimeout, apiUrl }: NFCReaderProps) {
  const [status, setStatus] = useState<NFCStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const startScanning = async () => {
    // Verificar soporte NFC
    if (!('NDEFReader' in window)) {
      alert('Tu navegador no soporta NFC. Usa QR o el botón Invitado.');
      return;
    }

    setStatus('scanning');
    setErrorMessage('');

    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    abortControllerRef.current = new AbortController();

    // Timeout de 30 segundos
    timeoutRef.current = setTimeout(() => {
      console.log('[NFC] Tiempo de espera agotado (30s)');
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setStatus('idle');
      if (onTimeout) onTimeout(); // Llamar a la función de timeout
    }, 30000);

    try {
      const reader = new window.NDEFReader();

      reader.addEventListener('reading', async (event: any) => {
        const serialNumber = event.serialNumber;
        console.log('[NFC] Tag detectado, UID:', serialNumber);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();

        if (!serialNumber) {
          setStatus('error');
          setErrorMessage('No se pudo leer el UID del tag. Intenta de nuevo.');
          return;
        }

        setStatus('idle'); // Cambia a idle mientras se procesa

        try {
          const res = await fetch(`${apiUrl}/identificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: serialNumber })
          });
          const data = await res.json();

          if (data.success) {
            setStatus('success');
            onSuccess(data.user);
          } else {
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

      reader.addEventListener('readingerror', (err: any) => {
        console.error('[NFC] Error de lectura:', err);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setStatus('error');
        setErrorMessage('Error al leer el tag. Acércalo bien.');
        onError('Error de lectura');
        if (abortControllerRef.current) abortControllerRef.current.abort();
      });

      await reader.scan({ signal: abortControllerRef.current.signal });
      console.log('[NFC] Escaneo activo, acerca un tag...');

    } catch (err: any) {
      console.error('[NFC] Error al iniciar el escaneo:', err);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Permiso denegado. Acepta el permiso para usar NFC.');
      } else {
        setErrorMessage('Error al iniciar el sensor NFC. Intenta de nuevo.');
      }
      onError(err.message);
    }
  };

  const cancelScanning = () => {
    console.log('[NFC] Cancelando escaneo por usuario');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="w-full h-full">
      {status === 'scanning' && (
        <div className="relative flex flex-col items-center justify-center gap-6 py-8 h-full">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-75 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-pulse delay-150"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-25 animate-pulse delay-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-5xl">nfc</span>
            </div>
          </div>
          <p className="text-xl font-bold text-red-600">Escaneando...</p>
          <p className="text-sm text-slate-500">Acerca tu dispositivo o tarjeta NFC</p>
          <button
            onClick={cancelScanning}
            className="mt-2 px-4 py-2 text-slate-500 hover:text-slate-700 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl h-full flex items-center justify-center flex-col">
          <span className="material-symbols-outlined text-3xl">error</span>
          <p className="font-semibold">{errorMessage}</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-2 px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center text-green-600 bg-green-50 p-4 rounded-xl animate-pulse h-full flex items-center justify-center flex-col">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
          <p className="font-semibold">¡Identificación exitosa!</p>
        </div>
      )}

      {status === 'idle' && (
        <button
          onClick={startScanning}
          className="group relative flex flex-col items-center justify-center gap-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-red-500 transition-all p-8 hover:shadow-xl hover:shadow-red-500/20 w-full h-full"
        >
          <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 group-hover:text-red-700 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-300 flex-shrink-0 relative z-10">
            <span className="material-symbols-outlined text-[80px]">nfc</span>
          </div>
          <div className="text-center relative z-10">
            <span className="block text-3xl font-extrabold text-slate-800 group-hover:text-red-700 transition-colors">Identifícate</span>
            <span className="block text-3xl font-extrabold text-slate-800 group-hover:text-red-700 transition-colors">con NFC</span>
          </div>
          <p className="text-lg text-slate-400 group-hover:text-slate-500 transition-colors relative z-10">Acerca tu dispositivo NFC</p>
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 0 2px #ea2a33, 0 0 20px #ea2a33' }}></div>
        </button>
      )}
    </div>
  );
}