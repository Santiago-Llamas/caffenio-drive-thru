'use client';

import { useState, useRef, useEffect } from 'react';
import { Producto, ItemCarrito } from '../data/productos';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Props {
  onCerrar: () => void;
  onRecomendar: (consulta: string) => Promise<Producto[]>;
  onAgregar: (producto: Producto) => void;
  onAgregarMultiples?: (productos: Producto[]) => void;
  carritoActual?: ItemCarrito[]; // Carrito actual para mostrar en el sidebar
}

export default function ModalIA({
  onCerrar,
  onRecomendar,
  onAgregar,
  onAgregarMultiples,
  carritoActual = [],
}: Props) {
  const [consulta, setConsulta] = useState('');
  const [recomendaciones, setRecomendaciones] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef<any>(null);
  const intervaloTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ LIMPIAR RECURSOS AL CERRAR EL MODAL
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error al abortar recognition:', error);
        }
      }
      if (intervaloTimeoutRef.current) {
        clearTimeout(intervaloTimeoutRef.current);
      }
    };
  }, []);

  const buscarRecomendaciones = async () => {
    if (!consulta.trim()) return;
    setCargando(true);
    try {
      const resultados = await onRecomendar(consulta);
      setRecomendaciones(resultados);
      seleccionarTodos([]);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const iniciarVoz = () => {
    // ✅ SI YA ESTÁ ESCUCHANDO, DETENER
    if (escuchando && recognitionRef.current) {
      recognitionRef.current.stop();
      setEscuchando(false);
      if (intervaloTimeoutRef.current) {
        clearTimeout(intervaloTimeoutRef.current);
        intervaloTimeoutRef.current = null;
      }
      return;
    }

    // Validar soporte
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome, Edge o Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; // ✅ GUARDAR REFERENCIA
    
    // ✅ OPTIMIZACIONES DE CAPTURA DE AUDIO
    recognition.lang = 'es-ES';
    recognition.continuous = true;  // ✅ Permitir habla continua (no cortar rápido)
    recognition.interimResults = true;  // ✅ Mostrar resultados intermedios
    recognition.maxAlternatives = 3;  // ✅ Mejor precisión con múltiples alternativas
    
    // ✅ TIMEOUTS EXTENDIDOS
    (recognition as any).maxDuration = 60000;  // Máximo 60 segundos
    
    let textoFinal = '';
    let resultadoRecibido = false;

    setEscuchando(true);

    // ✅ CAPTURA DE RESULTADOS INTERMEDIOS Y FINALES
    recognition.onresult = (event: any) => {
      let textoInterino = '';
      
      // Procesar todos los resultados
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // ✅ Resultado final (usuario pausó)
          textoFinal += transcript + ' ';
          resultadoRecibido = true;
        } else {
          // ✅ Resultado intermedio (usuario sigue hablando)
          textoInterino += transcript;
        }
      }

      // Mostrar texto en tiempo real
      const textoCombinado = (textoFinal + textoInterino).trim();
      if (textoCombinado) {
        setConsulta(textoCombinado);
      }
    };

    // ✅ MANEJO DE ERRORES MEJORADO
    recognition.onerror = (event: any) => {
      console.error('Error de reconocimiento:', event.error);
      
      const mensajes: { [key: string]: string } = {
        'no-speech': 'No se detectó audio. Habla más cerca del micrófono.',
        'audio-capture': 'Error al acceder al micrófono. Verifica los permisos.',
        'network': 'Error de red. Intenta de nuevo.',
        'permission-denied': 'Permiso de micrófono denegado.',
      };
      
      const mensaje = mensajes[event.error] || `Error: ${event.error}. Intenta de nuevo.`;
      
      if (event.error !== 'no-speech') {
        alert(mensaje);
      }
      
      setEscuchando(false);
      if (intervaloTimeoutRef.current) {
        clearTimeout(intervaloTimeoutRef.current);
        intervaloTimeoutRef.current = null;
      }
    };

    // ✅ FINALIZACIÓN AUTOMÁTICA CON TIMEOUT
    recognition.onend = () => {
      setEscuchando(false);
      if (intervaloTimeoutRef.current) {
        clearTimeout(intervaloTimeoutRef.current);
        intervaloTimeoutRef.current = null;
      }
      
      // Si capturó texto, usar ese
      if (textoFinal.trim()) {
        setConsulta(textoFinal.trim());
      }
    };

    // ✅ TIMEOUT PARA EVITAR ESCUCHA INFINITA (30 segundos)
    intervaloTimeoutRef.current = setTimeout(() => {
      recognition.stop();
      if (textoFinal.trim()) {
        setConsulta(textoFinal.trim());
      }
      setEscuchando(false);
    }, 30000);

    // ✅ INICIAR CON ESTABILIDAD
    try {
      recognition.start();
    } catch (error) {
      console.error('Error al iniciar reconocimiento:', error);
      setEscuchando(false);
      alert('No se pudo iniciar el reconocimiento. Intenta de nuevo.');
    }
  };

  const toggleSeleccion = () => {};
  const seleccionarTodos = (p0: never[]) => {};
  const agregarSeleccionados = () => {};

  // Calcular subtotal del carrito actual
  const subtotal = carritoActual.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 backdrop-blur-sm p-[clamp(1rem,4vw,2.5rem)]" style={{ minHeight: '100dvh' }}>
      <div className="flex w-full max-w-6xl bg-[#F5F5F5] rounded-xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh]">
        {/* Main Interaction Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F5] relative">
          {/* Modal Header Controls */}
          <div className="p-[clamp(1rem,2vw,1.5rem)] flex justify-between items-center">
            <button
              onClick={onCerrar}
              className="p-[clamp(0.5rem,1vw,0.5rem)] hover:bg-slate-200 rounded-full transition-colors text-black/70 hover:text-black"
            >
              <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)]">close</span>
            </button>
            <div className="flex items-center gap-[clamp(0.5rem,1vw,0.5rem)] text-[#e42528]">
              <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)]">auto_awesome</span>
              <span className="font-bold text-[clamp(0.75rem,1.5vw,0.875rem)] uppercase tracking-widest">Caffen-IA</span>
            </div>
            <div className="w-[clamp(2.5rem,5vw,2.5rem)]"></div>
          </div>

          {/* AI Content Scroll Area */}
          <div className="flex-1 overflow-y-auto px-[clamp(1rem,4vw,2rem)] pb-[clamp(2rem,8vw,8rem)]">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-slate-900 text-[clamp(2rem,12vw,2.25rem)] font-extrabold text-center mb-[clamp(1.5rem,6vw,2rem)] mt-[clamp(0.5rem,2vw,1rem)]">
                ¿Qué te apetece hoy?
              </h1>

              {/* Search Bar & Mic & Recomendar */}
              <div className="relative flex items-center gap-[clamp(0.5rem,2vw,1rem)] mb-[clamp(1.5rem,6vw,2.5rem)]">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-[clamp(0.5rem,2vw,1rem)] top-1/2 -translate-y-1/2 text-slate-900 text-[clamp(1rem,2vw,1.25rem)]">
                    search
                  </span>
                  <input
                    type="text"
                    value={consulta}
                    onChange={(e) => setConsulta(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarRecomendaciones()}
                    placeholder="Pide tu bebida favorita..."
                    className="w-full h-[clamp(3rem,8vw,4rem)] pl-[clamp(2rem,5vw,3rem)] pr-[clamp(1rem,2vw,1rem)] bg-white border-none rounded-xl shadow-sm text-[clamp(1rem,2vw,1.125rem)] focus:ring-2 focus:ring-[#e42528]/20 transition-all placeholder:text-slate-400 text-gray-900" 
                  />
                </div>

                <button
                  onClick={iniciarVoz}
                  className={`w-[clamp(3rem,8vw,4rem)] h-[clamp(3rem,8vw,4rem)] rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                    escuchando
                      ? 'bg-[#e42528] text-white animate-pulse shadow-lg shadow-[#e42528]/50'
                      : 'bg-[#e42528] text-white shadow-lg shadow-[#e42528]/30 hover:bg-[#e42528]/90'
                  }`}
                  title={escuchando ? 'Click para detener' : 'Habla para buscar'}
                >
                  <span className="material-symbols-outlined text-[clamp(1.5rem,3vw,1.875rem)]">
                    {escuchando ? 'mic' : 'mic'}
                  </span>
                </button>

                <button
                  onClick={buscarRecomendaciones}
                  disabled={cargando || !consulta.trim()}
                  className="h-[clamp(3rem,8vw,4rem)] px-[clamp(1rem,2vw,1.5rem)] bg-[#e42528] text-white font-bold rounded-xl shadow-lg shadow-[#e42528]/30 hover:bg-[#e42528]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]"
                >
                  <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)]">send</span>
                  <span className="hidden sm:inline text-[clamp(0.75rem,1.5vw,1rem)]">Recomendar</span>
                </button>
              </div>

              {/* Thinking State */}
              {cargando && (
                <div className="flex items-center justify-center gap-[clamp(0.75rem,1.5vw,0.75rem)] mb-[clamp(1.5rem,6vw,2.5rem)] text-[#e42528]/80 animate-pulse">
                  <span className="material-symbols-outlined text-[clamp(0.875rem,2vw,1rem)] animate-spin">
                    progress_activity
                  </span>
                  <p className="text-[clamp(0.875rem,2vw,1rem)] font-medium">Pensando en las mejores opciones para ti...</p>
                </div>
              )}

              {/* Recommendations Section */}
              {recomendaciones.length > 0 && (
                <div className="space-y-[clamp(1rem,3vw,1.5rem)]">
                  <div>
                    <h3 className="text-slate-900 font-bold text-[clamp(1rem,2.5vw,1.25rem)]">
                      Recomendaciones para ti ({recomendaciones.length})
                    </h3>
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(1rem,2vw,1rem)]">
                    {recomendaciones.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-xl p-[clamp(1rem,2vw,1rem)] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                      >
                        <div className="aspect-square rounded-lg bg-slate-100 mb-[clamp(0.75rem,2vw,0.75rem)] overflow-hidden relative">
                          <img
                            src={prod.imagen}
                            alt={prod.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-[clamp(0.25rem,1vw,0.25rem)]">
                          <h4 className="font-bold text-slate-900 text-[clamp(1rem,2vw,1rem)] mb-[clamp(0.25rem,1vw,0.25rem)]">{prod.nombre}</h4>
                          {prod.descripcion && (
                            <p className="text-[clamp(0.75rem,1.5vw,0.75rem)] text-slate-500 mb-[clamp(0.5rem,1vw,0.5rem)] line-clamp-2">{prod.descripcion}</p>
                          )}
                          <p className="text-[#e42528] font-extrabold text-[clamp(1rem,2vw,1.125rem)]">
                            ${prod.precio.toFixed(2)}
                          </p>
                          <button
                            onClick={() => {
                              onAgregar(prod);
                              // No cerramos el modal para que pueda seguir agregando
                            }}
                            className="mt-[clamp(0.75rem,2vw,0.75rem)] w-full py-[clamp(0.5rem,1vw,0.5rem)] bg-slate-50 border border-slate-100 text-slate-700 text-[clamp(0.75rem,1.5vw,0.875rem)] font-bold rounded-lg hover:bg-[#e42528]/10 hover:text-[#e42528] transition-colors"
                          >
                            Agregar rápido
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contextual Sidebar (carrito actual) */}
        <div className="hidden lg:flex w-[clamp(15rem,25vw,20rem)] bg-white border-l border-slate-200 flex-col">
          <div className="p-[clamp(1rem,2vw,1.5rem)] border-b border-slate-100">
            <h2 className="text-slate-900 text-[clamp(1rem,2vw,1.125rem)] font-bold">Tu Pedido Actual</h2>
            <p className="text-slate-500 text-[clamp(0.65rem,1.5vw,0.75rem)]">
              {carritoActual.length} producto{carritoActual.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-[clamp(1rem,2vw,1rem)] space-y-[clamp(1rem,2vw,1rem)]">
            {carritoActual.length > 0 ? (
              carritoActual.map((item, idx) => (
                <div key={idx} className="flex gap-[clamp(0.75rem,2vw,0.75rem)]">
                  <div className="w-[clamp(2.5rem,5vw,3rem)] h-[clamp(2.5rem,5vw,3rem)] rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={item.imagen || 'https://via.placeholder.com/48'}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[clamp(0.75rem,1.5vw,0.875rem)] font-bold text-slate-800 truncate">{item.nombre}</h4>
                      <span className="text-[clamp(0.75rem,1.5vw,0.875rem)] font-bold text-[#e42528]">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {item.cantidad}x
                      {item.tamanoSeleccionado && ` ${item.tamanoSeleccionado}`}
                      {item.lecheSeleccionada && ` · ${item.lecheSeleccionada}`}
                      {item.toppingsSeleccionados&& item.toppingsSeleccionados.length > 0 && ` · ${item.toppingsSeleccionados.join(', ')}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 text-sm py-6">
                <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
                <p>Tu carrito está vacío</p>
                <p className="text-xs mt-1">¡Agrega algo delicioso!</p>
              </div>
            )}
          </div>
          {carritoActual.length > 0 && (
            <div className="p-[clamp(1rem,2vw,1rem)] bg-slate-50 border-t border-slate-100 space-y-[clamp(0.75rem,1.5vw,0.75rem)]">
              <div className="flex justify-between text-sm font-bold text-slate-800">
                <span>Subtotal</span>
                <span className="text-[#e42528]">${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={onCerrar}
                className="w-full py-[clamp(0.75rem,1.5vw,1rem)] px-[clamp(1rem,2vw,1.5rem)] bg-[#e42528] text-white font-bold rounded-lg shadow-lg shadow-[#e42528]/20 hover:bg-[#e42528]/90 transition-all active:scale-95 flex items-center justify-center gap-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(0.75rem,1.5vw,0.875rem)]"
              >
                <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.125rem)]">payment</span>
                Ir a Pagar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}