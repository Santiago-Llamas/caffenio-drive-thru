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

  // Verificar soporte NFC al montar el componente
  useEffect(() => {
    if (!('NDEFReader' in window)) {
      setStatus('unsupported');
      setErrorMessage('Tu navegador no soporta NFC. Por favor, usa QR o el botón Invitado.');
    }
  }, []);

  const startScanning = async () => {
    if (status === 'unsupported') {
      onError('NFC no soportado');
      return;
    }

    setStatus('scanning');
    setErrorMessage('');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const reader = new window.NDEFReader();
      
      reader.addEventListener('reading', async (event: any) => {
        const serialNumber = event.serialNumber;
        if (!serialNumber) {
          setStatus('error');
          setErrorMessage('No se pudo leer el UID del tag. Intenta de nuevo.');
          return;
        }

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        setStatus('idle');

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
          console.error('Error al comunicarse con el backend:', err);
          setStatus('error');
          setErrorMessage('Error de conexión. Intenta de nuevo.');
          onError('Error de conexión');
        }
      });

      await reader.scan({ signal: abortControllerRef.current.signal });
      
    } catch (err: any) {
      console.error('Error al iniciar el escaneo NFC:', err);
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Permiso denegado. Debes hacer clic en un botón para iniciar el escaneo.');
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
    setErrorMessage('');
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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