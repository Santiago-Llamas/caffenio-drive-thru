'use client';

import { useState, useRef } from 'react';
import { productos, Producto, ItemCarrito } from '../data/productos';
import TarjetaProducto from '../components/TarjetaProducto';
import ModalPersonalizar from '../components/ModalPersonalizar';
import NFCReader from '../components/NFCReader'; 
import Carrito from '../components/Carrito';
import { GiCoffeeCup } from 'react-icons/gi';
import ModalIA from '../components/ModalIA';

// Sidebar izquierdo (sin cambios)
function SidebarIzquierdo({ onOpenIA, onPersonalizar }: { onOpenIA: () => void; onPersonalizar: (producto: Producto) => void }) {
  const especiales = [
    productos.find(p => p.nombre === 'Latte'),
    productos.find(p => p.nombre === 'Brownie'),
  ].filter(Boolean) as Producto[];

  return (
    <aside className="w-70 bg-white border-r border-slate-200 flex flex-col shadow-sm z-30 shrink-0">
      <div className="p-6 flex items-center gap-4 border-b border-slate-100">
        <div className="w-14 h-14 items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 leading-none">CAFFENIO</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drive-Thru</p>
        </div>
      </div>
      <nav className="flex flex-col gap-3 w-full px-2 py-3 border-b border-slate-100">
        <a className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all text-slate-400 hover:bg-slate-50 active:scale-95 group" href="#postres">
          <span className="material-symbols-outlined text-3xl group-hover:text-[#ea2a33]">cake</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Postres</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all text-slate-400 hover:bg-slate-50 active:scale-95 group" href="#comida">
          <span className="material-symbols-outlined text-3xl group-hover:text-[#ea2a33]">fastfood</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Comida</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all text-slate-400 hover:bg-slate-50 active:scale-95 group" href="#frios">
          <span className="material-symbols-outlined text-3xl group-hover:text-[#ea2a33]">ac_unit</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Fríos</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all text-slate-400 hover:bg-slate-50 active:scale-95 group" href="#cafe">
          <span className="material-symbols-outlined text-3xl group-hover:text-[#ea2a33]">local_cafe</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Calientes</span>
        </a>
      </nav>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Promociones</h3>
          <span className="px-2 py-0.5 bg-[#ea2a33]/10 text-[#ea2a33] text-[10px] font-bold rounded-md">DE TEMPORADA</span>
        </div>
        <div className="space-y-4">
          {especiales.map(product => (
            <div key={product.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-3 group hover:shadow-lg transition-all cursor-pointer" onClick={() => onPersonalizar(product)}>
              <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-200">
                <img alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.imagen} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">{product.nombre}</h4>
                {product.descripcion && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{product.descripcion}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-black text-[#ea2a33]">${product.precio.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onOpenIA}
          className="w-full flex items-center justify-center gap-3 bg-[#ea2a33] text-white px-6 py-4 rounded-2xl font-black text-lg hover:bg-[#ea2a33]/90 transition-all active:scale-95 shadow-lg shadow-[#ea2a33]/20"
        >
          <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          <span className="tracking-tight">Asistente IA</span>
        </button>
      </div>
    </aside>
  );
}

// Función para agrupar productos por categoría (sin cambios)
function getCategorias(productos: Producto[]) {
  const postres = productos.filter(p => p.categoria === 'postre');
  const comida = productos.filter(p => p.categoria === 'comida');
  const palabrasFrias = ['frío', 'fría', 'frappé', 'kfreeze', 'lateada', 'helado', 'refrescante'];
  const bebidasFrias = productos.filter(p => 
    p.categoria === 'bebida' && palabrasFrias.some(palabra => p.nombre.toLowerCase().includes(palabra))
  );
  const bebidasCalientes = productos.filter(p => 
    p.categoria === 'bebida' && !palabrasFrias.some(palabra => p.nombre.toLowerCase().includes(palabra))
  );
  return { postres, comida, bebidasFrias, bebidasCalientes };
}

export default function Home() {
  const [pantalla, setPantalla] = useState<'bienvenida' | 'identificacion' | 'favoritos' | 'menu'>('bienvenida');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [mostrarIA, setMostrarIA] = useState(false);
  // ✅ Estado de usuario mutable (inicia como null)
  const [usuario, setUsuario] = useState<{ nombre: string; uid: string; favoritos?: number[] } | null>(null);

  // Estados para el flujo de pago
  const [mostrarMetodosPago, setMostrarMetodosPago] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  // Estado para favoritos (conjunto de IDs)
  const [favoritos, setFavoritos] = useState<Set<number>>(new Set());

  // Solo mantenemos la animación QR (NFC ahora es real, sin simulación)
  const [mostrarEscaneoQR, setMostrarEscaneoQR] = useState(false);
  const timeoutRefQR = useRef<NodeJS.Timeout | null>(null);

  // ❌ Eliminamos las variables y handlers de NFC simulados
  // (Ya no se usan mostrarEscaneoNFC, timeoutRefNFC, handleClickNFC, handleCancelarNFC)

  const toggleFavorito = (id: number) => {
    setFavoritos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const agregarAlCarrito = (producto: Producto, opciones: any) => {
    const item: ItemCarrito = { ...producto, ...opciones, cantidad: 1 };
    setCarrito([...carrito, item]);
    alert(`${producto.nombre} agregado al carrito con opciones`);
  };

  const cambiarCantidad = (index: number, nuevaCantidad: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].cantidad = nuevaCantidad;
    setCarrito(nuevoCarrito);
  };

  const eliminarDelCarrito = (index: number) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const recomendarConAPI = async (consulta: string): Promise<Producto[]> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/recomendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: consulta })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error en la respuesta:', res.status, errorText);
        throw new Error(`Error del servidor: ${res.status}`);
      }
      const data = await res.json();
      const nombresRecomendados = data.recomendaciones.map((n: string) => n.toLowerCase());
      return productos.filter(p => nombresRecomendados.includes(p.nombre.toLowerCase()));
    } catch (error) {
      console.error('Error al recomendar con API:', error);
      return [];
    }
  };

  const enviarPedido = async () => {
    const pedido = { items: carrito, fecha: new Date().toISOString() };
    const historial = JSON.parse(localStorage.getItem('historial') || '[]');
    historial.push(pedido);
    localStorage.setItem('historial', JSON.stringify(historial.slice(-3)));
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
      if (!res.ok) throw new Error('Error al enviar pedido al backend');
      const data = await res.json();
      console.log('Pedido registrado en backend con número:', data.numero_pedido);
    } catch (error) {
      console.error('Error al enviar pedido al backend:', error);
      alert('Hubo un problema al enviar el pedido a la cocina, pero se guardó localmente.');
    }
  };

  const handleSeleccionarMetodo = async () => {
    await enviarPedido();
    setMostrarMetodosPago(false);
    setMostrarExito(true);
  };

  const handleFinalizar = () => {
    setMostrarExito(false);
    setCarrito([]);
    setPantalla('bienvenida');
  };

  const handlePagarAhora = (producto: Producto, opciones: any) => {
    const item: ItemCarrito = { ...producto, ...opciones, cantidad: 1 };
    setCarrito([...carrito, item]);
    setMostrarMetodosPago(true);
  };

  // Handlers para QR (se mantienen)
  const handleClickQR = () => {
    setMostrarEscaneoQR(true);
    timeoutRefQR.current = setTimeout(() => {
      setMostrarEscaneoQR(false);
      setPantalla('favoritos');
    }, 3000);
  };

  const handleCancelarQR = () => {
    if (timeoutRefQR.current) clearTimeout(timeoutRefQR.current);
    setMostrarEscaneoQR(false);
  };

  // ==================== PANTALLA DE BIENVENIDA ====================
  if (pantalla === 'bienvenida') {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#f5f5e9] bg-gradient-to-br from-[#efefe0] to-[#f7e7e7]">
        <div className="w-[1280px] h-[800px] flex flex-col items-center justify-center py-16 px-12 relative">
          <main className="flex flex-col items-center justify-center flex-grow space-y-20">
            <button
              onClick={() => setPantalla('identificacion')}
              className="relative group outline-none"
            >
              <div className="w-96 h-96 rounded-full bg-white flex flex-col items-center justify-center text-center p-10 border-[16px] border-[#ea2a33] shadow-[0_0_80px_rgba(234,42,51,0.15),0_20px_40px_rgba(109,54,40,0.1)] transform transition-all active:scale-95 hover:scale-105">
                <span className="material-symbols-outlined text-[#ea2a33] text-9xl mb-4">touch_app</span>
                <span className="text-[#0A0A0A] text-4xl font-extrabold leading-tight px-4">
                  Presiona para iniciar
                </span>
              </div>
            </button>
            <div className="text-center space-y-4">
              <h1 className="text-8xl font-extrabold text-[#6d3628] tracking-tight">¡Bienvenido!</h1>
              <p className="text-4xl font-medium text-[#6d3628]/80 tracking-wide">¿Qué se te antoja hoy?</p>
            </div>
          </main>
          <footer className="w-full flex justify-center mt-auto">
            <div className="flex gap-16 text-sm font-bold uppercase tracking-[0.3em] text-[#6d3628]/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl"></span>
                <span></span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // ==================== PANTALLA DE IDENTIFICACIÓN ====================
  if (pantalla === 'identificacion') {
    // Pantalla de escaneo QR
    if (mostrarEscaneoQR) {
      return (
        <div className="h-screen w-full bg-gradient-to-br from-red-50 to-slate-100 overflow-hidden relative">
          <div className="absolute top-10 left-10 z-20">
            <button
              onClick={handleCancelarQR}
              className="group flex items-center gap-3 text-white hover:text-primary transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 dark:bg-red-600 flex items-center justify-center group-hover:bg-primary/10">
                <span className="material-symbols-outlined text-3xl text-white dark:text-white transition-colors duration-200 group-hover:text-red-800">
                  arrow_back
                </span>
              </div>
              <span className="font-bold text-xl uppercase tracking-wider text-slate-900 dark:text-black group-hover:text-primary transition-colors">
                Regresar
              </span>
            </button>
          </div>
          <main className="h-full flex flex-col items-center justify-between pt-24 pb-10 px-16 text-center">
            <div className="space-y-4 shrink-0">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-black tracking-tight">
                Escaneando Código QR...
              </h1>
              <p className="text-2xl text-slate-500 dark:text-slate-400 font-semibold">
                Coloca tu código frente a la cámara
              </p>
            </div>
            <div className="relative flex-1 w-full flex items-center justify-center min-h-0 py-4">
              <div className="relative group">
                <div className="absolute -inset-7 border-2 border-slate-400 dark:border-slate-800 rounded-[3rem]"></div>
                <div className="qr-frame w-80 h-80 bg-white dark:bg-slate-50 rounded-3xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                  <div className="scan-line animate-scan"></div>
                  <div className="absolute top-5 left-5 w-10 h-10 border-t-[6px] border-l-[6px] border-primary rounded-tl-xl"></div>
                  <div className="absolute top-5 right-5 w-10 h-10 border-t-[6px] border-r-[6px] border-primary rounded-tr-xl"></div>
                  <div className="absolute bottom-5 left-5 w-10 h-10 border-b-[6px] border-l-[6px] border-primary rounded-bl-xl"></div>
                  <div className="absolute bottom-5 right-5 w-10 h-10 border-b-[6px] border-r-[6px] border-primary rounded-br-xl"></div>
                  <span className="material-symbols-outlined text-[240px] text-black drop-shadow-lg">
                    qr_code_2
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full max-w-3xl shrink-0">
              <div className="inline-flex items-center gap-6 bg-slate-50 dark:bg-red-600 px-12 py-7 rounded-full border border-slate-100 dark:border-red-700 shadow-md">
                <span className="material-symbols-outlined text-primary text-3xl">qr_code_scanner</span>
                <p className="text-2xl font-extrabold text-red-600 dark:text-slate-100">
                  Coloque su código QR frente a la cámara
                </p>
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Pantalla de identificación normal (con NFC real y QR)
    return (
      <div className="flex h-screen w-full bg-gradient-to-br from-red-50 to-slate-100 overflow-hidden">
        <main className="flex-1 flex flex-col p-16 bg-white/40 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 mb-12">
            <h1 className="text-7xl font-black tracking-tighter text-slate-900 mb-2">
              <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">¡Hola!</span>
            </h1>
            <p className="text-2xl text-slate-600 font-medium">Selecciona cómo quieres continuar</p>
          </div>

          <div className="grid grid-cols-3 gap-8 flex-1">
            {/* ✅ Opción NFC - Usando el componente NFCReader real */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-red-500 transition-all overflow-hidden hover:shadow-xl hover:shadow-red-500/20">
              <NFCReader
                apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                onSuccess={(userData) => {
                  setUsuario(userData);
                  setPantalla('favoritos');
                }}
                onError={(error) => {
                  console.error('Error NFC:', error);
                  alert('No se pudo leer el tag. Asegúrate de tener NFC activado y acerca el tag.');
                }}
                onUnregistered={(uid) => {
                  alert(`Tag no registrado (UID: ${uid}). ¿Deseas vincularlo a tu cuenta?`);
                }}
                onTimeout={() => {
                  // Después de 30 segundos sin lectura, regresa a la pantalla de identificación
                  setPantalla('identificacion');
                }}
              />
            </div>

            {/* Opción QR - Azul */}
            <button
              onClick={handleClickQR}
              className="group relative flex flex-col items-center justify-center gap-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all p-8 overflow-hidden hover:shadow-xl hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:text-blue-600 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-300">
                <span className="material-symbols-outlined text-[80px]">qr_code_scanner</span>
              </div>
              <div className="relative text-center">
                <span className="block text-3xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">Identifícate</span>
                <span className="block text-3xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">con QR</span>
              </div>
              <p className="relative text-lg text-slate-400 group-hover:text-slate-500 transition-colors">Escanea desde la App</p>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 0 2px #3b82f6, 0 0 20px #3b82f6' }}></div>
            </button>

            {/* Opción Invitado - Gris con toque rojo */}
            <button
              onClick={() => setPantalla('menu')}
              className="group relative flex flex-col items-center justify-center gap-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-slate-400 transition-all p-8 overflow-hidden hover:shadow-xl hover:shadow-slate-400/20"
            >
              <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-300">
                <span className="material-symbols-outlined text-[80px]">person_outline</span>
              </div>
              <div className="relative text-center">
                <span className="block text-3xl font-extrabold text-slate-800 group-hover:text-red-600 transition-colors">Invitado</span>
              </div>
              <p className="relative text-lg text-slate-400 group-hover:text-slate-500 transition-colors">Continuar sin cuenta</p>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 0 2px #9ca3af, 0 0 20px #9ca3af' }}></div>
            </button>
          </div>

          <div className="mt-12 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase italic text-slate-800">Caffenio</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="text-lg font-bold text-slate-400">Punto de Venta: DRIVE-THRU TSM-1</div>
                <div>
                  <h6 className="text-lg font-bold text-slate-900">Developed by CODEX</h6>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================== PANTALLA DE FAVORITOS ====================
  if (pantalla === 'favoritos') {
    const favoritosMock = [
      productos.find(p => p.nombre === '') || productos[56],
      productos.find(p => p.nombre === 'Kfreeze® Caramelo') || productos[1],
      productos.find(p => p.nombre === 'Latte Frío') || productos[2],
    ];

    return (
      <div className="flex h-screen w-full bg-[#f8f6f6] overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50 relative pb-20">
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <button
              onClick={() => setPantalla('identificacion')}
              className="bg-white border border-gray-100 px-6 py-2 rounded-full text-slate-600 flex items-center space-x-2 active:bg-gray-50 transition-colors shadow-sm"
            >
              <span className="material-icons-round text-lg font-bold">arrow_back</span>
              <span className="text-base font-bold">Regresar</span>
            </button>
            {/* ✅ Mostrar nombre del usuario o "Invitado" */}
            <div className="bg-white px-6 py-3 rounded-full flex items-center space-x-3 border border-gray-100 shadow-sm">
              <span className="material-icons-round text-slate-400">account_circle</span>
              <span className="text-base text-[#6d3628] font-bold">
                ¿Qué se te antoja hoy, <span className="text-[#7c5c54] font-bold">{usuario?.nombre || "Invitado"}?</span>
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Tus Favoritos</h1>
              <p className="text-lg text-slate-500 mt-1">Selecciona tu bebida favorita para comenzar</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {favoritosMock.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-[40px] p-6 shadow-lg flex flex-col items-center justify-center border border-transparent hover:border-slate-200 transition-all group relative"
                >
                  <div className="relative w-40 h-40 mb-3 flex items-center justify-center">
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl text-slate-900 font-bold leading-tight">{product.nombre}</h3>
                    <p className="text-slate-500 text-base mt-1 tracking-wide font-bold">
                      ${product.precio.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => agregarAlCarrito(product, {})}
                    className="bg-[#ea2a33] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  >
                    <span className="material-icons-round text-2xl font-bold">add</span>
                  </button>
                  <div className="absolute top-6 right-6 text-slate-200 group-hover:text-red-100 transition-colors">
                    <span className="material-icons-round text-2xl">favorite</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center space-x-12">
              <button
                onClick={() => setPantalla('menu')}
                className="flex flex-col items-center group"
              >
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-2 border border-slate-100 group-hover:border-slate-200 transition-all active:scale-95">
                  <span className="material-icons-round text-xl text-slate-400 group-hover:text-[#ea2a33]">add_circle_outline</span>
                </div>
                <span className="text-slate-500 text-sm font-bold">Explorar Menú</span>
              </button>
              <button
                onClick={() => alert('Próximamente: Promociones especiales')}
                className="flex flex-col items-center group"
              >
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-2 border border-slate-100 group-hover:border-slate-200 transition-all active:scale-95">
                  <span className="material-icons-round text-xl text-slate-400 group-hover:text-[#ea2a33]">loyalty</span>
                </div>
                <span className="text-slate-500 text-sm font-bold">Promociones</span>
              </button>
            </div>
          </div>
        </main>

        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20 shrink-0">
          <Carrito
            items={carrito}
            onEliminar={eliminarDelCarrito}
            onEnviar={() => setMostrarMetodosPago(true)}
            onCambiarCantidad={cambiarCantidad}
            favoritos={favoritos}
            onToggleFavorito={toggleFavorito}
          />
        </aside>

        {mostrarMetodosPago && (
          <ModalMetodosPago
            onClose={() => setMostrarMetodosPago(false)}
            onSeleccionar={handleSeleccionarMetodo}
            total={carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)}
            items={carrito}
          />
        )}
        {mostrarExito && <ModalExito onFinalizar={handleFinalizar} />}

        {mostrarIA && (
          <ModalIA
            onCerrar={() => setMostrarIA(false)}
            onRecomendar={recomendarConAPI}
            onAgregar={(producto) => setCarrito([...carrito, { ...producto, cantidad: 1 }])}
            onAgregarMultiples={(productos) => {
              const nuevosItems = productos.map(p => ({ ...p, cantidad: 1 }));
              setCarrito([...carrito, ...nuevosItems]);
            }}
            carritoActual={carrito}
          />
        )}

        {productoSeleccionado && (
          <ModalPersonalizar
            producto={productoSeleccionado}
            onCerrar={() => setProductoSeleccionado(null)}
            onAgregar={agregarAlCarrito}
            onAgregarAcompanante={(p) => {
              const item: ItemCarrito = { ...p, cantidad: 1 };
              setCarrito(prev => [...prev, item]);
            }}
            onPagarAhora={handlePagarAhora}
          />
        )}
      </div>
    );
  }

  // ==================== MENÚ PRINCIPAL ====================
  const { postres, comida, bebidasFrias, bebidasCalientes } = getCategorias(productos);

  return (
    <div className="flex h-screen w-full bg-[#f8f6f6] overflow-hidden">
      <SidebarIzquierdo onOpenIA={() => setMostrarIA(true)} onPersonalizar={setProductoSeleccionado} />

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 relative pb-20">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPantalla('identificacion')}
              className="group flex items-center gap-3 text-white hover:text-primary transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 dark:bg-red-600 flex items-center justify-center group-hover:bg-primary/10">
                <span className="material-symbols-outlined text-3xl text-white dark:text-white transition-colors duration-200 group-hover:text-red-800">
                  arrow_back
                </span>
              </div>
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Menú Principal</h1>
              <p className="text-slate-500 font-medium">Disfruta nuestro menú</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-16">
          {postres.length > 0 && (
            <section className="scroll-mt-28" id="postres">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-8 bg-[#ea2a33] rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-slate-900">Postres</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postres.map(product => (
                  <TarjetaProducto key={product.id} producto={product} onPersonalizar={setProductoSeleccionado} />
                ))}
              </div>
            </section>
          )}

          {comida.length > 0 && (
            <section className="scroll-mt-28" id="comida">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-8 bg-[#ea2a33] rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-slate-900">Comida</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comida.map(product => (
                  <TarjetaProducto key={product.id} producto={product} onPersonalizar={setProductoSeleccionado} />
                ))}
              </div>
            </section>
          )}

          {bebidasFrias.length > 0 && (
            <section className="scroll-mt-28" id="frios">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-8 bg-[#ea2a33] rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-slate-900">Bebidas Frías</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bebidasFrias.map(product => (
                  <TarjetaProducto key={product.id} producto={product} onPersonalizar={setProductoSeleccionado} />
                ))}
              </div>
            </section>
          )}

          {bebidasCalientes.length > 0 && (
            <section className="scroll-mt-28" id="cafe">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-8 bg-[#ea2a33] rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-slate-900">Bebidas Calientes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bebidasCalientes.map(product => (
                  <TarjetaProducto key={product.id} producto={product} onPersonalizar={setProductoSeleccionado} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="p-10 flex items-center justify-end gap-2 text-slate-300">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
          </svg>
          <span className="font-black text-sm tracking-widest uppercase">CAFFENIO</span>
        </div>
      </main>

      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20 shrink-0">
        <Carrito
          items={carrito}
          onEliminar={eliminarDelCarrito}
          onEnviar={() => setMostrarMetodosPago(true)}
          onCambiarCantidad={cambiarCantidad}
          favoritos={favoritos}
          onToggleFavorito={toggleFavorito}
        />
      </aside>

      {mostrarMetodosPago && (
        <ModalMetodosPago
          onClose={() => setMostrarMetodosPago(false)}
          onSeleccionar={handleSeleccionarMetodo}
          total={carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)}
          items={carrito}
        />
      )}
      {mostrarExito && <ModalExito onFinalizar={handleFinalizar} />}

      {mostrarIA && (
        <ModalIA
          onCerrar={() => setMostrarIA(false)}
          onRecomendar={recomendarConAPI}
          onAgregar={(producto) => setCarrito([...carrito, { ...producto, cantidad: 1 }])}
          onAgregarMultiples={(productos) => {
            const nuevosItems = productos.map(p => ({ ...p, cantidad: 1 }));
            setCarrito([...carrito, ...nuevosItems]);
          }}
          carritoActual={carrito}
        />
      )}

      {productoSeleccionado && (
        <ModalPersonalizar
          producto={productoSeleccionado}
          onCerrar={() => setProductoSeleccionado(null)}
          onAgregar={agregarAlCarrito}
          onAgregarAcompanante={(p) => {
            const item: ItemCarrito = { ...p, cantidad: 1 };
            setCarrito(prev => [...prev, item]);
          }}
          onPagarAhora={handlePagarAhora}
        />
      )}
    </div>
  );
}

// ==================== MODALES (sin cambios) ====================
interface ModalMetodosPagoProps {
  onClose: () => void;
  onSeleccionar: () => void;
  total: number;
  items: ItemCarrito[];
}

function ModalMetodosPago({ onClose, onSeleccionar, total, items }: ModalMetodosPagoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex h-[800px] w-[1280px] bg-white dark:bg-slate-950 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-4/5 bg-[#ea2a33]"></div>
          <div className="flex-1 bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <aside className="w-[380px] border-r border-slate-200 dark:border-black flex flex-col h-full bg-white dark:bg-white">
          <div className="p-8">
            <button onClick={onClose} className="group flex items-center gap-3 text-white hover:text-primary transition-all mb-6">
              <div className="w-14 h-14 rounded-full bg-red-600 dark:bg-red-600 flex items-center justify-center group-hover:bg-primary/10">
                <span className="material-symbols-outlined text-3xl text-white dark:text-white transition-colors duration-200 group-hover:text-red-800">
                  arrow_back
                </span>
              </div>
              <span className="font-bold text-xl uppercase tracking-wider text-slate-900 dark:text-black group-hover:text-primary transition-colors">
                Regresar
              </span>
            </button>
            <div className="flex items-center gap-3 mb-2 text-b">
              <span className="material-symbols-outlined text-[#ea2a33] text-3xl">receipt_long</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-black">Resumen</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-8 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 uppercase text-sm tracking-tight">
                    {item.nombre} x{item.cantidad}
                  </span>
                  {item.tamanoSeleccionado && <span className="text-xs text-slate-900">{item.tamanoSeleccionado}</span>}
                  {item.lecheSeleccionada && <span className="text-xs text-slate-900">{item.lecheSeleccionada}</span>}
                </div>
                <span className="font-bold text-black dark:text-red-600 text-lg">${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <div className="bg-[#ea2a33] rounded-3xl p-8 text-white shadow-xl shadow-[#ea2a33]/30">
              <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-sm mb-2">Total a Pagar</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$</span>
                <span className="text-6xl font-black tracking-tighter">{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="p-8 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-lg tracking-tighter uppercase italic text-slate-800">Caffenio</span>
            </div>
            <span className="text-xs font-bold">POS-04</span>
          </div>
        </aside>

        <main className="flex-1 flex flex-col p-12 bg-slate-50">
          <header className="mb-12">
            <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900">Selecciona tu método de pago</h1>
            <p className="text-2xl text-slate-500 font-medium italic">¿Cómo prefieres finalizar tu orden?</p>
          </header>
          <div className="grid grid-cols-3 gap-8 flex-1">
            <button onClick={onSeleccionar} className="bg-white rounded-3xl p-10 flex flex-col items-center justify-between border-4 border-transparent hover:border-[#ea2a33]/40 hover:shadow-2xl transition-all group">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-[#ea2a33] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-7xl">credit_card</span>
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black leading-tight text-slate-800">Tarjeta de Crédito/Débito</h3>
                <p className="text-slate-500 font-medium">Pago rápido y seguro</p>
              </div>
            </button>
            <button onClick={onSeleccionar} className="bg-white rounded-3xl p-10 flex flex-col items-center justify-between border-4 border-transparent hover:border-[#ea2a33]/40 hover:shadow-2xl transition-all group">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-[#ea2a33] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-7xl">storefront</span>
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black leading-tight text-slate-800">Pago en Efectivo</h3>
                <p className="text-slate-500 font-medium">Paga al recoger tu pedido</p>
              </div>
            </button>
            <button onClick={onSeleccionar} className="bg-white rounded-3xl p-10 flex flex-col items-center justify-between border-4 border-transparent hover:border-[#ea2a33]/40 hover:shadow-2xl transition-all group">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-[#ea2a33] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black leading-tight text-slate-800">Puntos App</h3>
                <p className="text-slate-500 font-medium">Usa tus puntos acumulados</p>
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

interface ModalExitoProps {
  onFinalizar: () => void;
}

function ModalExito({ onFinalizar }: ModalExitoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[1280px] h-[800px] bg-white shadow-2xl relative flex flex-col items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-xl border-8 border-green-500 mb-10">
            <span className="material-symbols-outlined text-[120px] text-green-500">check_circle</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">¡Tu pedido fue exitoso!</h1>
          <p className="text-3xl text-slate-500 font-medium max-w-2xl leading-relaxed">Gracias por tu preferencia</p>
        </div>
        <div className="absolute bottom-24 w-full flex justify-center px-12">
          <button onClick={onFinalizar} className="w-full max-w-xl py-8 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-4 group">
            <span className="text-4xl font-extrabold tracking-wide uppercase">Finalizar</span>
            <span className="material-symbols-outlined text-4xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </button>
        </div>
        <div className="absolute bottom-8 right-12 flex flex-col items-end opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic text-slate-800">Caffenio</span>
          </div>
        </div>
      </div>
    </div>
  );
}