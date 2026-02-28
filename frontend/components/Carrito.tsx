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
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-extrabold text-slate-900">Tu Pedido</h2>
        <p className="text-sm text-slate-400 font-medium">Auto-servicio #124</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {items.length === 0 ? (
          <p className="text-slate-500 text-center">El carrito está vacío</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={item.imagen || 'https://via.placeholder.com/64'}
                  alt={item.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-800 truncate">{item.nombre}</h4>
                  <span className="font-bold text-slate-900">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {item.tamano && `${item.tamano}`}
                  {item.leche && `, ${item.leche}`}
                  {item.toppings && item.toppings.length > 0 && `, ${item.toppings.join(', ')}`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onCambiarCantidad(idx, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    className="w-6 h-6 border border-slate-200 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                  <button
                    onClick={() => onCambiarCantidad(idx, item.cantidad + 1)}
                    className="w-6 h-6 border border-slate-200 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onToggleFavorito(item.id)}
                    className="ml-2"
                  >
                    <span className={`material-symbols-outlined text-xl ${favoritos.has(item.id) ? 'text-red-500' : 'text-gray-400'}`}>
                      favorite
                    </span>
                  </button>
                  <button
                    onClick={() => onEliminar(idx)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold text-slate-900">
            <span>Total</span>
            <span className="text-[#ea2a33]">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={onEnviar}
          className="w-full bg-[#ea2a33] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#ea2a33]/30 hover:bg-[#ea2a33]/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined">payments</span>
          PAGAR AHORA
        </button>
      </div>
    </div>
  );
}