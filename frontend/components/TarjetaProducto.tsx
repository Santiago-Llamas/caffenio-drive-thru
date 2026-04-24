'use client';

import { Producto } from '../data/productos';

interface Props {
  producto: Producto;
  onPersonalizar: (producto: Producto) => void;
}

export default function TarjetaProducto({ producto, onPersonalizar }: Props) {
  return (
    <div className="bg-white rounded-[clamp(0.5rem,2vw,1rem)] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition-all cursor-pointer" onClick={() => onPersonalizar(producto)}>
      <div className="h-[clamp(8rem,25vw,11rem)] bg-slate-100 relative overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-[clamp(1rem,2vw,1.25rem)]">
        <h3 className="font-bold text-[clamp(1rem,3vw,1.125rem)] text-slate-900 mb-[clamp(0.25rem,1vw,0.25rem)]">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="text-[clamp(0.875rem,2vw,0.875rem)] text-slate-500 mb-[clamp(0.75rem,2vw,0.75rem)] line-clamp-2">{producto.descripcion}</p>
        )}
        <div className="flex justify-between items-center mt-[clamp(1rem,2vw,1rem)]">
          <span className="text-[clamp(1rem,3vw,1.25rem)] font-extrabold text-[#ea2a33]">${producto.precio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}