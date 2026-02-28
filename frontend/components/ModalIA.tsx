'use client';

import { useState } from 'react';
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
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  const buscarRecomendaciones = async () => {
    if (!consulta.trim()) return;
    setCargando(true);
    try {
      const resultados = await onRecomendar(consulta);
      setRecomendaciones(resultados);
      setSeleccionados(new Set());
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const iniciarVoz = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome, Edge o Safari.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setEscuchando(true);
    recognition.onresult = (event: any) => {
      const texto = event.results[0][0].transcript;
      setConsulta(texto);
      setEscuchando(false);
    };
    recognition.onerror = () => {
      setEscuchando(false);
      alert('No se pudo capturar la voz. Permite el micrófono e intenta de nuevo.');
    };
    recognition.onend = () => setEscuchando(false);
    recognition.start();
  };

  const toggleSeleccion = (id: number) => {
    const newSet = new Set(seleccionados);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSeleccionados(newSet);
  };

  const seleccionarTodos = () => {
    if (seleccionados.size === recomendaciones.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(recomendaciones.map((p) => p.id)));
    }
  };

  const agregarSeleccionados = () => {
    if (seleccionados.size === 0) return;
    const productosSeleccionados = recomendaciones.filter((p) => seleccionados.has(p.id));
    if (onAgregarMultiples) {
      onAgregarMultiples(productosSeleccionados);
    } else {
      productosSeleccionados.forEach((p) => onAgregar(p));
    }
    setSeleccionados(new Set()); // Opcional: limpiar selección después de agregar
  };

  // Calcular subtotal del carrito actual
  const subtotal = carritoActual.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 backdrop-blur-sm p-4 md:p-10">
      <div className="flex w-full max-w-6xl bg-[#F5F5F5] rounded-xl shadow-2xl overflow-hidden border border-white/20">
        {/* Main Interaction Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F5] relative">
          {/* Modal Header Controls */}
          <div className="p-6 flex justify-between items-center">
            <button
              onClick={onCerrar}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-black/70 hover:text-black"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-2 text-[#e42528]">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span className="font-bold text-sm uppercase tracking-widest">Caffen-IA</span>
            </div>
            <div className="w-10"></div>
          </div>

          {/* AI Content Scroll Area */}
          <div className="flex-1 overflow-y-auto px-8 pb-32">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-slate-900 text-4xl font-extrabold text-center mb-8 mt-4">
                ¿Qué te apetece hoy?
              </h1>

              {/* Search Bar & Mic & Recomendar */}
              <div className="relative flex items-center gap-4 mb-10">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-900">
                    search
                  </span>
                  <input
                    type="text"
                    value={consulta}
                    onChange={(e) => setConsulta(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarRecomendaciones()}
                    placeholder="Pide tu bebida favorita..."
                    className="w-full h-16 pl-12 pr-4 bg-white border-none rounded-xl shadow-sm text-lg focus:ring-2 focus:ring-[#e42528]/20 transition-all placeholder:text-slate-400 text-gray-900" 
                  />
                </div>

                <button
                  onClick={iniciarVoz}
                  disabled={escuchando}
                  className={`size-16 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                    escuchando
                      ? 'bg-[#e42528] text-white animate-pulse'
                      : 'bg-[#e42528] text-white shadow-lg shadow-[#e42528]/30 hover:bg-[#e42528]/90'
                  }`}
                  title="Habla para buscar"
                >
                  <span className="material-symbols-outlined text-3xl">mic</span>
                </button>

                <button
                  onClick={buscarRecomendaciones}
                  disabled={cargando || !consulta.trim()}
                  className="h-16 px-6 bg-[#e42528] text-white font-bold rounded-xl shadow-lg shadow-[#e42528]/30 hover:bg-[#e42528]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-2xl ">send</span>
                  <span className="hidden sm:inline">Recomendar</span>
                </button>
              </div>

              {/* Thinking State */}
              {cargando && (
                <div className="flex items-center justify-center gap-3 mb-10 text-[#e42528]/80 animate-pulse">
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  <p className="text-sm font-medium">Pensando en las mejores opciones para ti...</p>
                </div>
              )}

              {/* Recommendations Section */}
              {recomendaciones.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-900 font-bold text-xl">
                      Recomendaciones para ti ({recomendaciones.length})
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-sm font-medium text-slate-600 group-hover:text-[#e42528] transition-colors">
                        {seleccionados.size === recomendaciones.length
                          ? 'Deseleccionar todos'
                          : 'Seleccionar todos'}
                      </span>
                      <input
                        type="checkbox"
                        checked={seleccionados.size === recomendaciones.length && recomendaciones.length > 0}
                        onChange={seleccionarTodos}
                        className="rounded border-slate-300 text-[#e42528] focus:ring-[#e42528] size-5"
                      />
                    </label>
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recomendaciones.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative"
                      >
                        <div className="absolute top-4 right-4 z-10">
                          <input
                            type="checkbox"
                            checked={seleccionados.has(prod.id)}
                            onChange={() => toggleSeleccion(prod.id)}
                            className="rounded border-slate-300 text-[#e42528] focus:ring-[#e42528] size-6 shadow-sm"
                          />
                        </div>
                        <div className="aspect-square rounded-lg bg-slate-100 mb-3 overflow-hidden relative">
                          <img
                            src={prod.imagen}
                            alt={prod.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-1">
                          <h4 className="font-bold text-slate-900 text-base mb-1">{prod.nombre}</h4>
                          {prod.descripcion && (
                            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{prod.descripcion}</p>
                          )}
                          <p className="text-[#e42528] font-extrabold text-lg">
                            ${prod.precio.toFixed(2)}
                          </p>
                          <button
                            onClick={() => {
                              onAgregar(prod);
                              // No cerramos el modal para que pueda seguir agregando
                            }}
                            className="mt-3 w-full py-2 bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-[#e42528]/10 hover:text-[#e42528] transition-colors"
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

          {/* Sticky Footer Action */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-200">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-slate-600 text-sm font-medium">
                <span className="text-[#e42528] font-bold">{seleccionados.size}</span> producto
                {seleccionados.size !== 1 ? 's' : ''} seleccionado
                {seleccionados.size !== 1 ? 's' : ''}
              </div>
              <button
                onClick={agregarSeleccionados}
                disabled={seleccionados.size === 0}
                className={`w-full md:w-auto px-10 py-4 font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                  seleccionados.size === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#e42528] text-white shadow-[#e42528]/20 hover:bg-[#e42528]/90'
                }`}
              >
                <span className="material-symbols-outlined">shopping_cart_checkout</span>
                Agregar seleccionados al carrito
              </button>
            </div>
          </div>
        </div>

        {/* Contextual Sidebar (carrito actual) */}
        <div className="hidden lg:flex w-80 bg-white border-l border-slate-200 flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-slate-900 text-lg font-bold">Tu Pedido Actual</h2>
            <p className="text-slate-500 text-xs">
              {carritoActual.length} producto{carritoActual.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {carritoActual.length > 0 ? (
              carritoActual.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={item.imagen || 'https://via.placeholder.com/48'}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{item.nombre}</h4>
                      <span className="text-sm font-bold text-[#e42528]">
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
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="flex justify-between text-sm font-bold text-slate-800">
                <span>Subtotal</span>
                <span className="text-[#e42528]">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}