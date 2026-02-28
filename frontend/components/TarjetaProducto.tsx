'use client';

import { Producto } from '../data/productos';

interface Props {
  producto: Producto;
  onPersonalizar: (producto: Producto) => void;
}

export default function TarjetaProducto({ producto, onPersonalizar }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition-all cursor-pointer" onClick={() => onPersonalizar(producto)}>
      <div className="h-44 bg-slate-100 relative overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-900 mb-1">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">{producto.descripcion}</p>
        )}
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-extrabold text-[#ea2a33]">${producto.precio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}