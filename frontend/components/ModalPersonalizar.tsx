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
    <aside className="w-[clamp(15rem,25vw,20rem)] border-r border-slate-200 flex flex-col h-full bg-white">
      <div className="p-[clamp(0.75rem,2vw,1.5rem)] border-b border-slate-100">
        <div className="flex items-center gap-[clamp(0.75rem,1vw,0.75rem)] mb-[clamp(0.75rem,2vw,1rem)]">
          <div className="w-[clamp(2rem,3vw,2.5rem)] h-[clamp(2rem,3vw,2.5rem)] items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[clamp(1rem,2vw,1.25rem)] font-extrabold tracking-tight uppercase italic text-[#ea2a33]">Configuración</h2>
        </div>
        <div className="bg-slate-50 rounded-xl p-[clamp(0.5rem,1.5vw,1rem)] border border-slate-100">
          <div
            className="w-full aspect-square rounded-lg bg-cover bg-center mb-[clamp(0.5rem,1vw,1rem)]"
            style={{ backgroundImage: `url(${producto.imagen})` }}
          />
          <h3 className="font-bold text-[clamp(0.875rem,1.5vw,1rem)] text-black">{producto.nombre}</h3>
        </div>
      </div>
      <div className="flex-1 p-[clamp(0.75rem,2vw,1.5rem)]">
        <h4 className="text-[clamp(0.65rem,1vw,0.75rem)] font-black text-slate-400 uppercase tracking-[0.2em] mb-[clamp(0.75rem,1.5vw,1rem)]">Seleccionado hasta ahora</h4>
        <div className="space-y-[clamp(0.75rem,1.5vw,1rem)]">
          <div className={`flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] ${tamano ? 'text-[#ea2a33]' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[clamp(0.75rem,1.5vw,1rem)]">
              {tamano ? 'check_circle' : 'radio_button_checked'}
            </span>
            <span className="font-medium text-[clamp(0.75rem,1.5vw,0.875rem)]">Tamaño: {tamano ? (tamano === 'chico' ? 'Chico' : tamano === 'mediano' ? 'Mediano' : 'Grande') : 'Pendiente'}</span>
          </div>
          <div className={`flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] ${sabor ? 'text-[#ea2a33]' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[clamp(0.75rem,1.5vw,1rem)]">
              {sabor ? 'check_circle' : 'radio_button_checked'}
            </span>
            <span className="font-medium text-[clamp(0.75rem,1.5vw,0.875rem)]">Sabor: {sabor || 'Pendiente'}</span>
          </div>
          <div className={`flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] ${Object.keys(toppings).length > 0 ? 'text-[#ea2a33]' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[clamp(0.75rem,1.5vw,1rem)]">
              {Object.keys(toppings).length > 0 ? 'check_circle' : 'radio_button_checked'}
            </span>
            <span className="font-medium text-[clamp(0.75rem,1.5vw,0.875rem)]">Toppings: {Object.keys(toppings).length || 'Pendiente'}</span>
          </div>
        </div>
      </div>
    </aside>
  );

  // Sidebar derecho (recomendaciones interactivas)
  const SidebarDerecho = () => (
    <aside className="w-[clamp(15rem,25vw,20rem)] bg-slate-50 border-l border-slate-200 flex flex-col p-[clamp(0.75rem,2vw,1.5rem)] pt-[clamp(2rem,5vw,4rem)]">
      <h4 className="text-[clamp(0.65rem,1vw,0.75rem)] font-black text-slate-400 uppercase tracking-[0.2em] mb-[clamp(0.75rem,2vw,1.5rem)] flex items-center gap-[clamp(0.25rem,0.5vw,0.5rem)]">
        <span className="material-symbols-outlined text-[clamp(0.75rem,1.5vw,1rem)] text-[#ea2a33]">auto_awesome</span>
        Acompáñalo con
      </h4>
      <div className="space-y-[clamp(0.75rem,2vw,1.5rem)]">
        {acompanantesEjemplo.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-[clamp(0.5rem,1.5vw,1rem)] shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-[#ea2a33]/30 transition-all active:scale-95" onClick={() => onAgregarAcompanante?.(item)}>
            <div
              className="w-full aspect-video rounded-lg bg-cover bg-center mb-[clamp(0.5rem,1.5vw,0.75rem)]"
              style={{ backgroundImage: `url(${item.imagen})` }}
            />
            <p className="font-bold text-[clamp(0.875rem,1.5vw,1rem)] text-black leading-tight mb-[clamp(0.25rem,1vw,0.5rem)]">{item.nombre}</p>
            <div className="flex justify-between items-center">
              <span className="text-[#ea2a33] font-black text-[clamp(0.875rem,1.5vw,1rem)]">${item.precio.toFixed(2)}</span>
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
          <div className="flex-1 flex flex-col p-[clamp(1.5rem,6vw,3rem)] pt-[clamp(2rem,8vw,4rem)] bg-white">
            <div className="mb-[clamp(1.5rem,4vw,2.5rem)]">
              <h1 className="text-[clamp(2rem,10vw,3.5rem)] font-black tracking-tight text-slate-900 mb-[clamp(0.5rem,1.5vw,0.75rem)]">¿De qué tamaño lo prefieres?</h1>
              <p className="text-[clamp(1rem,3vw,1.25rem)] text-slate-500">Elige la medida ideal para tu café</p>
            </div>
            <div className="grid grid-cols-3 gap-[clamp(0.75rem,2vw,1.5rem)] flex-1 max-h-[450px]">
              {producto.opciones.tamanos?.map((t) => {
                const selected = tamano === t;
                const precioConTamano = producto.precio + (preciosTamano[t] || 0);
                return (
                  <button
                    key={t}
                    onClick={() => setTamano(t)}
                    className={`bg-white rounded-3xl p-[clamp(1rem,3vw,2rem)] flex flex-col items-center justify-between shadow-lg transition-all group relative overflow-hidden ${
                      selected
                        ? 'border-4 border-[#ea2a33] shadow-xl'
                        : 'border-2 border-transparent hover:border-[#ea2a33]'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-0 right-0 p-[clamp(0.75rem,1.5vw,1rem)]">
                        <span className="material-symbols-outlined text-[clamp(1.25rem,2.5vw,1.5rem)] text-[#ea2a33]">check_circle</span>
                      </div>
                    )}
                    {t === 'mediano' && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#ea2a33] text-white text-[clamp(0.65rem,1vw,0.75rem)] font-black uppercase tracking-[0.2em] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.25rem,0.5vw,0.35rem)] rounded-b-lg">
                        Recomendado
                      </div>
                    )}
                    <div className="flex-1 flex items-end mb-[clamp(1rem,3vw,2rem)]">
                      <span
                        className="material-symbols-outlined text-slate-300 group-hover:text-[#ea2a33] transition-colors"
                        style={{ fontSize: `clamp(4rem, ${t === 'chico' ? '10vw' : t === 'mediano' ? '12vw' : '14vw'}, 8rem)` }}
                      >
                        coffee
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-[clamp(1.5rem,4vw,2.25rem)] font-black mb-[clamp(0.25rem,0.75vw,0.5rem)] capitalize text-slate-900">{t}</h3>
                      <p className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-slate-500 font-bold uppercase tracking-widest">
                        {t === 'chico' ? '12 oz / 355 ml' : t === 'mediano' ? '16 oz / 473 ml' : '20 oz / 591 ml'}
                      </p>
                      <p className="text-[#ea2a33] font-black text-[clamp(1.25rem,3vw,1.75rem)] mt-[clamp(0.75rem,1.5vw,1rem)]">
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
          <div className="flex-1 flex flex-col p-[clamp(1.5rem,6vw,3rem)] pt-[clamp(2rem,8vw,4rem)] bg-white overflow-y-auto">
            <header className="mb-[clamp(1.5rem,4vw,2.5rem)]">
              <h1 className="text-[clamp(2rem,10vw,3.5rem)] font-black tracking-tight text-slate-900 mb-[clamp(0.5rem,1.5vw,0.75rem)]">Elige tu Sabor Favorito</h1>
              <p className="text-[clamp(1rem,3vw,1.25rem)] text-slate-500">Selecciona el sabor que más te guste</p>
            </header>
            <div className="grid grid-cols-3 gap-[clamp(0.75rem,2vw,1.5rem)]">
              {sabores.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSabor(s.nombre)}
                  className={`bg-white p-[clamp(0.75rem,1.5vw,1.5rem)] rounded-2xl border-2 flex flex-col items-center text-center transition-all group relative ${
                    sabor === s.nombre
                      ? 'border-[#ea2a33] shadow-md'
                      : 'border-transparent hover:border-[#ea2a33]'
                  }`}
                >
                  {sabor === s.nombre && (
                    <div className="absolute top-[clamp(0.5rem,1vw,0.75rem)] right-[clamp(0.5rem,1vw,0.75rem)] text-[#ea2a33]">
                      <span className="material-symbols-outlined text-[clamp(1.25rem,2.5vw,1.5rem)]">check_circle</span>
                    </div>
                  )}
                  <div
                    className={`w-[clamp(2.5rem,5vw,4rem)] h-[clamp(2.5rem,5vw,4rem)] rounded-full flex items-center justify-center mb-[clamp(0.75rem,1.5vw,1rem)] ${
                      sabor === s.nombre ? 'bg-[#ea2a33]' : 'bg-[#ea2a33]/5 group-hover:scale-110 transition-transform'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[clamp(1.75rem,3.5vw,2.25rem)] ${
                        sabor === s.nombre ? 'text-white' : 'text-[#ea2a33]'
                      }`}
                    >
                      {s.icono}
                    </span>
                  </div>
                  <span className="text-[clamp(0.875rem,1.75vw,1.125rem)] font-bold text-slate-900">{s.nombre}</span>
                  <span className="text-[clamp(0.65rem,1.25vw,0.85rem)] text-slate-500 font-medium mt-[clamp(0.25rem,0.5vw,0.5rem)]">{s.descripcion}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'toppings':
        return (
          <div className="flex-1 flex flex-col p-[clamp(1.5rem,6vw,3rem)] pt-[clamp(2rem,8vw,4rem)] bg-white overflow-y-auto">
            <header className="mb-[clamp(1.5rem,4vw,2.5rem)]">
              <h1 className="text-[clamp(2rem,10vw,3.5rem)] font-black tracking-tight text-slate-900 mb-[clamp(0.5rem,1.5vw,0.75rem)]">Personaliza tu bebida</h1>
              <p className="text-[clamp(1rem,3vw,1.25rem)] text-slate-500">Selecciona tus toppings favoritos</p>
            </header>
            {toppingsDisponibles.length === 0 ? (
              <p className="text-center text-slate-500 text-[clamp(0.875rem,1.5vw,1rem)]">No hay toppings disponibles para este producto.</p>
            ) : (
              <div className="space-y-[clamp(0.75rem,1.5vw,1rem)]">
                {toppingsDisponibles.map(t => {
                  const cantidad = toppings[t.id] || 0;
                  return (
                    <div
                      key={t.id}
                      className="bg-white p-[clamp(0.75rem,1.5vw,1.25rem)] rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-[clamp(0.75rem,1.5vw,1rem)]">
                        <div className="w-[clamp(2rem,4vw,4rem)] h-[clamp(2rem,4vw,4rem)] rounded-xl bg-slate-100 flex items-center justify-center text-[#ea2a33]">
                          <span className="material-symbols-outlined text-[clamp(1.25rem,2.5vw,1.875rem)]">{t.icono}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-[clamp(0.875rem,1.75vw,1.125rem)] text-slate-900">{t.nombre}</h4>
                          <p className="text-slate-500 font-bold text-[clamp(0.75rem,1.25vw,0.875rem)]">+${t.precio.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-[clamp(0.75rem,1.5vw,1.5rem)] bg-slate-50 p-[clamp(0.25rem,0.5vw,0.5rem)] rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleDecrementTopping(t.id)}
                          className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-400 hover:text-[#ea2a33] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[clamp(1.25rem,2.5vw,1.875rem)]">remove</span>
                        </button>
                        <span className="text-[clamp(1.125rem,2vw,1.5rem)] font-black w-[clamp(1.5rem,3vw,2rem)] text-center text-slate-900">{cantidad}</span>
                        <button
                          onClick={() => handleIncrementTopping(t.id)}
                          className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] flex items-center justify-center rounded-lg bg-[#ea2a33] shadow-lg shadow-[#ea2a33]/20 text-white"
                        >
                          <span className="material-symbols-outlined text-[clamp(1.25rem,2.5vw,1.875rem)]">add</span>
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
      <div className="absolute bottom-0 right-0 left-[0px] h-[clamp(4rem,10vw,6rem)] border-t border-slate-200 bg-white/80 backdrop-blur-md px-[clamp(0.75rem,2vw,1.5rem)] flex items-center">
        {/* Bloque izquierdo: Anterior */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => {
              if (paso === 'tamano') onCerrar();
              else if (paso === 'sabor') setPaso('tamano');
              else if (paso === 'toppings') setPaso('sabor');
            }}
            className="flex items-center gap-[clamp(0.25rem,0.75vw,0.5rem)] font-bold text-slate-500 hover:text-[#ea2a33] transition-colors text-[clamp(0.75rem,1.5vw,0.875rem)]"
          >
            <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)]">arrow_back</span>
            <span className="hidden md:inline">Anterior</span>
          </button>
        </div>

        {/* Bloque central: Paso actual */}
        <div className="flex-1 flex justify-left">
          <div className="w-[clamp(8rem,15vw,12rem)] text-center">
            <div className="text-[clamp(0.65rem,1vw,0.75rem)] font-bold text-[#ea2a33] uppercase tracking-widest">
              Paso {pasoActual} de {pasosTotales}
            </div>
            <div className="w-full bg-slate-200 h-[clamp(0.25rem,0.5vw,0.35rem)] rounded-full overflow-hidden mt-[clamp(0.25rem,0.5vw,0.5rem)]">
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
            className="flex items-center gap-[clamp(0.25rem,0.75vw,0.5rem)] px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-full font-extrabold text-white bg-[#ea2a33] shadow-lg shadow-[#ea2a33]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[clamp(0.75rem,1.5vw,0.875rem)]"
          >
            <span className="hidden md:inline">{paso === 'toppings' ? 'Confirmar' : 'Continuar'}</span>
            <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)]">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-[clamp(0.5rem,2vw,1rem)]">
      <div className="flex h-[clamp(30rem,90vh,50rem)] w-[clamp(20rem,95vw,80rem)] bg-white shadow-2xl overflow-hidden relative">
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