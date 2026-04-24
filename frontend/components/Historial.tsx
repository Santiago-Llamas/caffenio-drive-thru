import { useEffect, useState } from 'react';

export default function Historial({ onRepetir }: { onRepetir: (items: any[]) => void }) {
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('historial');
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  return (
    <div className="mb-[clamp(1rem,2vw,1rem)]">
      <h3 className="font-semibold text-[clamp(0.875rem,2vw,1rem)] mb-[clamp(0.5rem,1vw,0.5rem)]">Repetir pedido</h3>
      {historial.length === 0 ? (
        <p className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-gray-900">No hay pedidos anteriores</p>
      ) : (
        <div className="space-y-[clamp(0.5rem,1vw,0.5rem)]">
          {historial.map((pedido, idx) => (
            <button
              key={idx}
              onClick={() => onRepetir(pedido.items)}
              className="bg-red-200 text-left p-[clamp(0.5rem,1vw,0.5rem)] rounded w-full text-[clamp(0.75rem,1.5vw,0.875rem)] hover:bg-red-300"
            >
              {pedido.items.map((i: any) => i.nombre).join(', ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}