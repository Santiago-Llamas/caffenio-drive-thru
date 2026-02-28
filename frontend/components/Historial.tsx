import { useEffect, useState } from 'react';

export default function Historial({ onRepetir }: { onRepetir: (items: any[]) => void }) {
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('historial');
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Repetir pedido</h3>
      {historial.length === 0 ? (
        <p className="text-sm text-gray-900">No hay pedidos anteriores</p>
      ) : (
        <div className="space-y-2">
          {historial.map((pedido, idx) => (
            <button
              key={idx}
              onClick={() => onRepetir(pedido.items)}
              className="bg-red-200 text-left p-2 rounded w-full text-sm hover:bg-red-300"
            >
              {pedido.items.map((i: any) => i.nombre).join(', ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}