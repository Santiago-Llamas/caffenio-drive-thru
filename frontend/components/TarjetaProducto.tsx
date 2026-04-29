'use client';

import { Producto } from '../data/productos';

interface Props {
  producto: Producto;
  onPersonalizar: (producto: Producto) => void;
}

export default function TarjetaProducto({ producto, onPersonalizar }: Props) {
  return (
    <div className="bg-white rounded-[clamp(0.75rem,2vw,1.25rem)] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg hover:scale-105 transition-all cursor-pointer active:scale-95" onClick={() => onPersonalizar(producto)}>
      <div className="h-[clamp(6rem,30vw,12rem)] bg-slate-100 relative overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-[clamp(0.875rem,2.5vw,1.5rem)] flex flex-col h-[clamp(6rem,20vw,7.5rem)] justify-between">
        <div>
          <h3 className="font-bold text-[clamp(0.875rem,2.5vw,1.125rem)] text-slate-900 mb-[clamp(0.25rem,0.75vw,0.5rem)] line-clamp-2">{producto.nombre}</h3>
          {producto.descripcion && (
            <p className="text-[clamp(0.75rem,1.75vw,0.875rem)] text-slate-500 line-clamp-2">{producto.descripcion}</p>
          )}
        </div>
        <div className="flex justify-between items-center mt-[clamp(0.75rem,1.5vw,1rem)]">
          <span className="text-[clamp(1rem,2.5vw,1.25rem)] font-extrabold text-[#ea2a33]">${producto.precio.toFixed(2)}</span>
          <div className="bg-[#ea2a33]/10 p-[clamp(0.4rem,0.75vw,0.5rem)] rounded-lg text-[#ea2a33] text-[clamp(0.75rem,1.5vw,0.875rem)]">
            <span className="material-symbols-outlined text-[clamp(1rem,1.75vw,1.125rem)]">add</span>
          </div>
        </div>
      </div>
    </div>
  );
}