'use client';

import { useState } from 'react';
import { Producto } from '../data/productos';

interface Props {
  producto: Producto;
  onCerrar: () => void;
  onAgregar: (producto: Producto, opciones: any) => void;
  onAgregarAcompanante?: (producto: Producto) => void; // Para agregar desde recomendaciones
  onEnviarPedido?: () => void;
  // NUEVA PROPIEDAD PARA PAGAR AHORA
  onPagarAhora?: (producto: Producto, opciones: any) => void;
}

type Paso = 'tamano' | 'sabor' | 'toppings' | 'confirmacion';

// Sabores de ejemplo (puedes moverlos a producto.opciones si quieres)
const sabores = [
  { id: 'vainilla', nombre: 'Vainilla', descripcion: 'Sutil y dulce', icono: 'water_drop' },
  { id: 'avellana', nombre: 'Avellana', descripcion: 'Tostado clásico', icono: 'nutrition' },
  { id: 'caramelo', nombre: 'Caramelo', descripcion: 'Toque artesanal', icono: 'cookie' },
  { id: 'chocolate', nombre: 'Chocolate', descripcion: 'Cacao intenso', icono: 'icecream' },
  { id: 'canela', nombre: 'Canela', descripcion: 'Aroma especiado', icono: 'grain' },
  { id: 'sin', nombre: 'Sin Sabor', descripcion: 'Sabor original', icono: 'block' },
];

// Precio base por topping (si no viene definido en producto)
const PRECIO_TOPPING_BASE = 10;

// Productos de ejemplo para acompañamientos (puedes reemplazar con datos reales)
const acompanantesEjemplo: Producto[] = [
  {
    id: 48,
    nombre: 'Waffle',
    categoria: 'comida',
    precio: 50,
    imagen: 'https://tse4.mm.bing.net/th/id/OIP.KuEUp1t6Ooo_MfvGQiESZAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    descripcion: 'Esponjoso waffle dorado, ideal para acompañar con miel, mermelada o crema.',
    opciones: {
      tamanos: ['único'],
      toppings: ['miel', 'mermelada', 'crema', 'chocolate']
    }
  },
  {
    id: 46,
    nombre: 'Croissant',
    categoria: 'comida',
    precio: 76,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20020@2x.png',
    descripcion: 'Pan finamente seleccionado, con un toque de mantequilla, relleno de jamón y queso. Disfrútalo frío o caliente.',
    opciones: {
      tamanos: ['único'],
      toppings: ['caliente', 'frío']
    }
  }
];

export default function ModalPersonalizar({
  producto,
  onCerrar,
  onAgregar,
  onAgregarAcompanante,
  onEnviarPedido,
  onPagarAhora // NUEVA PROP
}: Props) {
  const [paso, setPaso] = useState<Paso>('tamano');
  const [tamano, setTamano] = useState<string | null>(null);
  const [sabor, setSabor] = useState<string | null>(null);
  const [toppings, setToppings] = useState<{ [key: string]: number }>({});

  // Precios adicionales por tamaño (puedes personalizarlos)
  const preciosTamano: Record<string, number> = {
    chico: 0,
    mediano: 10,
    grande: 20,
  };

  // Construir lista de toppings desde producto.opciones.toppings o usar fallback
  const toppingsDisponibles = producto.opciones.toppings && producto.opciones.toppings.length > 0
    ? producto.opciones.toppings.map(nombre => ({
        id: nombre.toLowerCase().replace(/\s+/g, ''),
        nombre,
        precio: PRECIO_TOPPING_BASE,
        icono: 'cookie' // icono por defecto, puedes personalizarlo
      }))
    : []; // Si no hay toppings, se mostrará vacío

  const handleIncrementTopping = (id: string) => {
    setToppings(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrementTopping = (id: string) => {
    setToppings(prev => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  const calcularTotal = () => {
    let total = producto.precio;
    if (tamano) total += preciosTamano[tamano] || 0;
    Object.entries(toppings).forEach(([id, cantidad]) => {
      const topping = toppingsDisponibles.find(t => t.id === id);
      if (topping) total += topping.precio * cantidad;
    });
    return total;
  };

  const handleConfirmar = () => {
    const opciones = {
      tamano,
      sabor,
      toppings: Object.fromEntries(
        Object.entries(toppings).filter(([_, cant]) => cant > 0)
      ),
    };
    onAgregar(producto, opciones);
    setPaso('confirmacion');
  };

  // NUEVO: Función para manejar el pago inmediato
  const handlePagarAhora = () => {
    const opciones = {
      tamano,
      sabor,
      toppings: Object.fromEntries(
        Object.entries(toppings).filter(([_, cant]) => cant > 0)
      ),
    };
    // Si existe la prop onPagarAhora, la llamamos (agregará al carrito y abrirá pago)
    if (onPagarAhora) {
      onPagarAhora(producto, opciones);
    } else {
      // Fallback: si no está definida, solo agregamos al carrito
      onAgregar(producto, opciones);
    }
    onCerrar(); // Cerramos el modal de personalización
  };

  const handleFinalizar = () => {
    if (onEnviarPedido) onEnviarPedido();
    onCerrar();
  };

  const handleAgregarOtro = () => {
    onCerrar();
  };

  // Sidebar izquierdo (resumen)
  const SidebarIzquierdo = () => (
    <aside className="w-[320px] border-r border-slate-200 flex flex-col h-full bg-white">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight uppercase italic text-[#ea2a33]">Configuración</h2>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div
            className="w-full aspect-square rounded-lg bg-cover bg-center mb-4"
            style={{ backgroundImage: `url(${producto.imagen})` }}
          />
          <h3 className="font-bold text-black">{producto.nombre}</h3>
        </div>
      </div>
      <div className="flex-1 p-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Seleccionado hasta ahora</h4>
        <div className="space-y-4">
          <div className={`flex items-center gap-3 ${tamano ? 'text-[#ea2a33]' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-sm">
              {tamano ? 'check_circle' : 'radio_button_checked'}
            </span>
            <span className="font-medium">Tamaño: {tamano ? (tamano === 'chico' ? 'Chico' : tamano === 'mediano' ? 'Mediano' : 'Grande') : 'Pendiente'}</span>
          </div>
          <div className={`flex items-center gap-3 ${sabor ? 'text-[#ea2a33]' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-sm">
              {sabor ? 'check_circle' : 'radio_button_checked'}
            </span>
            <span className="font-medium">Sabor: {sabor || 'Pendiente'}</span>
          </div>
          <div className={`flex items-center gap-3 ${Object.keys(toppings).length > 0 ? 'text-[#ea2a33]' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-sm">
              {Object.keys(toppings).length > 0 ? 'check_circle' : 'radio_button_checked'}
            </span>
            <span className="font-medium">Toppings: {Object.keys(toppings).length || 'Pendiente'}</span>
          </div>
        </div>
      </div>
    </aside>
  );

  // Sidebar derecho (recomendaciones interactivas)
  const SidebarDerecho = () => (
    <aside className="w-[280px] bg-slate-50 border-l border-slate-200 flex flex-col p-6 pt-16">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm text-[#ea2a33]">auto_awesome</span>
        Acompáñalo con
      </h4>
      <div className="space-y-6">
        {acompanantesEjemplo.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-[#ea2a33]/30 transition-all active:scale-95" onClick={() => onAgregarAcompanante?.(item)}>
            <div
              className="w-full aspect-video rounded-lg bg-cover bg-center mb-3"
              style={{ backgroundImage: `url(${item.imagen})` }}
            />
            <p className="font-bold text-black leading-tight mb-2">{item.nombre}</p>
            <div className="flex justify-between items-center">
              <span className="text-[#ea2a33] font-black">${item.precio.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );

  // Contenido central según paso
  const ContenidoCentral = () => {
    switch (paso) {
      case 'tamano':
        return (
          <div className="flex-1 flex flex-col p-12 pt-16 bg-white">
            <div className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">¿De qué tamaño lo prefieres?</h1>
              <p className="text-xl text-slate-500">Elige la medida ideal para tu café</p>
            </div>
            <div className="grid grid-cols-3 gap-6 flex-1 max-h-[450px]">
              {producto.opciones.tamanos?.map((t) => {
                const selected = tamano === t;
                const iconSize = t === 'chico' ? 80 : t === 'mediano' ? 100 : 120;
                const precioConTamano = producto.precio + (preciosTamano[t] || 0);
                return (
                  <button
                    key={t}
                    onClick={() => setTamano(t)}
                    className={`bg-white rounded-3xl p-8 flex flex-col items-center justify-between shadow-lg transition-all group relative overflow-hidden ${
                      selected
                        ? 'border-4 border-[#ea2a33] shadow-xl'
                        : 'border-2 border-transparent hover:border-[#ea2a33]'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-0 right-0 p-4">
                        <span className="material-symbols-outlined text-[#ea2a33]">check_circle</span>
                      </div>
                    )}
                    {t === 'mediano' && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#ea2a33] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-b-lg">
                        Recomendado
                      </div>
                    )}
                    <div className="flex-1 flex items-end mb-8">
                      <span
                        className="material-symbols-outlined text-slate-300 group-hover:text-[#ea2a33] transition-colors"
                        style={{ fontSize: iconSize }}
                      >
                        coffee
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-black mb-1 capitalize text-slate-900">{t}</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                        {t === 'chico' ? '12 oz / 355 ml' : t === 'mediano' ? '16 oz / 473 ml' : '20 oz / 591 ml'}
                      </p>
                      <p className="text-[#ea2a33] font-black text-xl mt-4">
                        ${precioConTamano.toFixed(2)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 'sabor':
        return (
          <div className="flex-1 flex flex-col p-12 pt-16 bg-white overflow-y-auto">
            <header className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Elige tu Sabor Favorito</h1>
              <p className="text-xl text-slate-500">Selecciona el sabor que más te guste</p>
            </header>
            <div className="grid grid-cols-3 gap-6">
              {sabores.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSabor(s.nombre)}
                  className={`bg-white p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all group relative ${
                    sabor === s.nombre
                      ? 'border-[#ea2a33] shadow-md'
                      : 'border-transparent hover:border-[#ea2a33]'
                  }`}
                >
                  {sabor === s.nombre && (
                    <div className="absolute top-3 right-3 text-[#ea2a33]">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  )}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      sabor === s.nombre ? 'bg-[#ea2a33]' : 'bg-[#ea2a33]/5 group-hover:scale-110 transition-transform'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-4xl ${
                        sabor === s.nombre ? 'text-white' : 'text-[#ea2a33]'
                      }`}
                    >
                      {s.icono}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">{s.nombre}</span>
                  <span className="text-sm text-slate-500 font-medium mt-1">{s.descripcion}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'toppings':
        return (
          <div className="flex-1 flex flex-col p-12 pt-16 bg-white overflow-y-auto">
            <header className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Personaliza tu bebida</h1>
              <p className="text-xl text-slate-500">Selecciona tus toppings favoritos</p>
            </header>
            {toppingsDisponibles.length === 0 ? (
              <p className="text-center text-slate-500">No hay toppings disponibles para este producto.</p>
            ) : (
              <div className="space-y-4">
                {toppingsDisponibles.map(t => {
                  const cantidad = toppings[t.id] || 0;
                  return (
                    <div
                      key={t.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-[#ea2a33]">
                          <span className="material-symbols-outlined text-3xl">{t.icono}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-slate-900">{t.nombre}</h4>
                          <p className="text-slate-500 font-bold">+${t.precio.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleDecrementTopping(t.id)}
                          className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-400 hover:text-[#ea2a33] transition-colors"
                        >
                          <span className="material-symbols-outlined text-3xl">remove</span>
                        </button>
                        <span className="text-2xl font-black w-8 text-center text-slate-900">{cantidad}</span>
                        <button
                          onClick={() => handleIncrementTopping(t.id)}
                          className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#ea2a33] shadow-lg shadow-[#ea2a33]/20 text-white"
                        >
                          <span className="material-symbols-outlined text-3xl">add</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'confirmacion':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white">
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
              <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-xl border-8 border-green-500 mb-10">
                <span className="material-symbols-outlined text-[120px] text-green-500">check_circle</span>
              </div>
              <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">¡Tu pedido fue exitoso!</h1>
              <p className="text-3xl text-slate-500 font-medium max-w-2xl leading-relaxed">Gracias por tu preferencia</p>
            </div>
            <div className="mt-16 w-full max-w-xl flex gap-6">
              <button
                onClick={handleAgregarOtro}
                className="flex-1 py-6 bg-white border-4 border-slate-200 rounded-2xl hover:border-[#ea2a33]/40 transition-all flex items-center justify-center gap-4"
              >
                <span className="material-symbols-outlined text-4xl text-[#ea2a33]">add_circle</span>
                <span className="text-2xl font-black text-slate-900">Agregar otro</span>
              </button>
              {/* NUEVO: Botón "Pagar ahora" en confirmación */}
              <button
                onClick={handlePagarAhora} // Llama a la nueva función
                className="flex-1 py-6 bg-[#ea2a33] rounded-2xl shadow-2xl shadow-[#ea2a33]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-white"
              >
                <span className="material-symbols-outlined text-4xl">payments</span>
                <span className="text-2xl font-black">Pagar ahora</span>
              </button>
            </div>
          </div>
        );
    }
  };

  // Barra de navegación inferior (con botones hacia los bordes)
  const Navegacion = () => {
    if (paso === 'confirmacion') return null;

    const pasosTotales = 3;
    const pasoActual = paso === 'tamano' ? 1 : paso === 'sabor' ? 2 : 3;
    const progreso = (pasoActual / pasosTotales) * 100;

    return (
      <div className="absolute bottom-0 right-0 left-[0px] h-24 border-t border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center">
        {/* Bloque izquierdo: Anterior */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => {
              if (paso === 'tamano') onCerrar();
              else if (paso === 'sabor') setPaso('tamano');
              else if (paso === 'toppings') setPaso('sabor');
            }}
            className="flex items-center gap-2 font-bold text-slate-500 hover:text-[#ea2a33] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="hidden md:inline">Anterior</span>
          </button>
        </div>

        {/* Bloque central: Paso actual */}
        <div className="flex-1 flex justify-left">
          <div className="w-48 text-center">
            <div className="text-xs font-bold text-[#ea2a33] uppercase tracking-widest">
              Paso {pasoActual} de {pasosTotales}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#ea2a33] transition-all duration-300" style={{ width: `${progreso}%` }} />
            </div>
          </div>
        </div>

        {/* Bloque derecho: Continuar */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => {
              if (paso === 'tamano' && tamano) setPaso('sabor');
              else if (paso === 'sabor' && sabor) setPaso('toppings');
              else if (paso === 'toppings') handleConfirmar();
            }}
            disabled={
              (paso === 'tamano' && !tamano) ||
              (paso === 'sabor' && !sabor)
            }
            className="flex items-center gap-2 px-6 py-2 rounded-full font-extrabold text-white bg-[#ea2a33] shadow-lg shadow-[#ea2a33]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden md:inline">{paso === 'toppings' ? 'Confirmar' : 'Continuar'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="flex h-[800px] w-[1280px] bg-white shadow-2xl overflow-hidden relative">
        <SidebarIzquierdo />
        <div className="flex-1 flex flex-col relative">
          <ContenidoCentral />
          <Navegacion />
        </div>
        {paso !== 'confirmacion' && <SidebarDerecho />}
      </div>
    </div>
  );
}