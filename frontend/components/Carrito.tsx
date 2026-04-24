'use client';

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  tamano?: string;
  leche?: string;
  toppings?: string[];
}

interface Props {
  items: ItemCarrito[];
  onEliminar: (index: number) => void;
  onEnviar: () => void;
  onCambiarCantidad: (index: number, nuevaCantidad: number) => void;
  favoritos: Set<number>;
  onToggleFavorito: (id: number) => void;
}

export default function Carrito({ 
  items, 
  onEliminar, 
  onEnviar, 
  onCambiarCantidad,
  favoritos,
  onToggleFavorito
}: Props) {
  const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-[clamp(1rem,2vw,1.5rem)] border-b border-slate-100">
        <h2 className="text-[clamp(1rem,2.5vw,1.25rem)] font-extrabold text-slate-900">Tu Pedido</h2>
        <p className="text-[clamp(0.65rem,1.5vw,0.875rem)] text-slate-400 font-medium">Auto-servicio #124</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-[clamp(1rem,2vw,1.5rem)] space-y-[clamp(1rem,2vw,1.5rem)]">
        {items.length === 0 ? (
          <p className="text-slate-500 text-center text-[clamp(0.875rem,2vw,1rem)]">El carrito está vacío</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex gap-[clamp(1rem,2vw,1rem)]">
              <div className="w-[clamp(3rem,8vw,4rem)] h-[clamp(3rem,8vw,4rem)] rounded-[clamp(0.5rem,1vw,0.75rem)] bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={item.imagen || 'https://via.placeholder.com/64'}
                  alt={item.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-800 truncate text-[clamp(0.875rem,2vw,1rem)]">{item.nombre}</h4>
                  <span className="font-bold text-slate-900 text-[clamp(0.875rem,2vw,1rem)]">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
                <p className="text-[clamp(0.55rem,1vw,0.75rem)] text-slate-400">
                  {item.tamano && `${item.tamano}`}
                  {item.leche && `, ${item.leche}`}
                  {item.toppings && item.toppings.length > 0 && `, ${item.toppings.join(', ')}`}
                </p>
                <div className="flex items-center gap-[clamp(0.5rem,1vw,0.5rem)] mt-[clamp(0.5rem,1vw,0.5rem)]">
                  <button
                    onClick={() => onCambiarCantidad(idx, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    className="w-[clamp(1.5rem,3vw,1.5rem)] h-[clamp(1.5rem,3vw,1.5rem)] border border-slate-200 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-50 text-[clamp(0.75rem,1.5vw,0.875rem)]"
                  >
                    -
                  </button>
                  <span className="text-[clamp(0.75rem,1.5vw,0.875rem)] font-bold w-[clamp(1rem,2vw,1rem)] text-center">{item.cantidad}</span>
                  <button
                    onClick={() => onCambiarCantidad(idx, item.cantidad + 1)}
                    className="w-[clamp(1.5rem,3vw,1.5rem)] h-[clamp(1.5rem,3vw,1.5rem)] border border-slate-200 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 text-[clamp(0.75rem,1.5vw,0.875rem)]"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onToggleFavorito(item.id)}
                    className="ml-[clamp(0.5rem,1vw,0.5rem)]"
                  >
                    <span className={`material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)] ${favoritos.has(item.id) ? 'text-red-500' : 'text-gray-400'}`}>
                      favorite
                    </span>
                  </button>
                  <button
                    onClick={() => onEliminar(idx)}
                    className="text-[clamp(0.55rem,1.5vw,0.75rem)] text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-[clamp(1rem,2vw,1.5rem)] bg-slate-50 border-t border-slate-200 space-y-[clamp(1rem,2vw,1rem)]">
        <div className="space-y-[clamp(0.5rem,1vw,0.5rem)]">
          <div className="flex justify-between text-[clamp(0.75rem,1.5vw,0.875rem)] text-slate-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[clamp(1rem,2.5vw,1.125rem)] font-extrabold text-slate-900">
            <span>Total</span>
            <span className="text-[#ea2a33]">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={onEnviar}
          className="w-full bg-[#ea2a33] text-white py-[clamp(1rem,2vw,1rem)] rounded-2xl font-black text-[clamp(0.875rem,2vw,1rem)] shadow-lg shadow-[#ea2a33]/30 hover:bg-[#ea2a33]/95 transition-all active:scale-[0.98] flex items-center justify-center gap-[clamp(0.5rem,1vw,0.75rem)]"
        >
          <span className="material-symbols-outlined text-[clamp(1rem,2vw,1.25rem)]">payments</span>
          PAGAR AHORA
        </button>
      </div>
    </div>
  );
}