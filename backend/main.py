from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import time
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://caffenio-drive-thru.vercel.app",
        "https://caffenio.koyeb.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Configuración de Gemini ====================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODELO = "gemini-2.5-flash-lite"

# ==================== Modelos Pydantic ====================
class Consulta(BaseModel):
    mensaje: str

class ItemPedido(BaseModel):
    id: int
    nombre: str
    precio: float
    cantidad: int
    tamanoSeleccionado: Optional[str] = None
    lecheSeleccionada: Optional[str] = None
    toppingsSeleccionados: Optional[List[str]] = []

class PedidoRecibido(BaseModel):
    items: List[ItemPedido]
    fecha: str

class PedidoOut(BaseModel):
    id: int
    fecha: str
    items: List[dict]
    total: float
    estado: str
    tiempo_limite: int

class EstadoUpdate(BaseModel):
    nuevo_estado: str

# ==================== Persistencia ====================
PEDIDOS_FILE = "pedidos.json"

def cargar_pedidos():
    try:
        with open(PEDIDOS_FILE, "r", encoding="utf-8") as f:
            pedidos = json.load(f)
    except FileNotFoundError:
        return []
    for p in pedidos:
        if "tiempo_limite" not in p:
            p["tiempo_limite"] = 300000
    return pedidos

def guardar_pedidos(pedidos):
    with open(PEDIDOS_FILE, "w", encoding="utf-8") as f:
        json.dump(pedidos, f, indent=2, ensure_ascii=False)

# ==================== Endpoints de pedidos ====================
@app.post("/pedidos", response_model=dict)
async def crear_pedido(pedido: PedidoRecibido):
    pedidos = cargar_pedidos()
    nuevo_id = max([p["id"] for p in pedidos], default=0) + 1
    total = sum(item.precio * item.cantidad for item in pedido.items)
    nuevo_pedido = {
        "id": nuevo_id,
        "fecha": pedido.fecha,
        "items": [item.dict() for item in pedido.items],
        "total": total,
        "estado": "recibido",
        "tiempo_limite": 300000
    }
    pedidos.append(nuevo_pedido)
    guardar_pedidos(pedidos)
    print(f"\n🆕 Nuevo pedido #{nuevo_id} recibido a las {datetime.now().strftime('%H:%M:%S')}")
    print(f"   Total: ${total:.2f}")
    for item in pedido.items:
        detalles = []
        if item.tamanoSeleccionado: detalles.append(item.tamanoSeleccionado)
        if item.lecheSeleccionada: detalles.append(item.lecheSeleccionada)
        if item.toppingsSeleccionados: detalles.append(", ".join(item.toppingsSeleccionados))
        detalles_str = f" ({', '.join(detalles)})" if detalles else ""
        print(f"     - {item.cantidad}x {item.nombre}{detalles_str} = ${item.precio * item.cantidad:.2f}")
    print("-" * 40)
    return {"mensaje": "Pedido recibido", "numero_pedido": nuevo_id, "total": total}

@app.get("/pedidos", response_model=List[PedidoOut])
async def listar_pedidos(estado: Optional[List[str]] = Query(None)):
    pedidos = cargar_pedidos()
    if estado:
        pedidos = [p for p in pedidos if p["estado"] in estado]
    pedidos.sort(key=lambda x: x["fecha"], reverse=True)
    return pedidos

@app.patch("/pedidos/{pedido_id}/estado", response_model=dict)
async def actualizar_estado(pedido_id: int, update: EstadoUpdate):
    nuevo_estado = update.nuevo_estado
    if nuevo_estado not in ["recibido", "preparación", "listo"]:
        raise HTTPException(status_code=400, detail="Estado no válido")
    pedidos = cargar_pedidos()
    for p in pedidos:
        if p["id"] == pedido_id:
            p["estado"] = nuevo_estado
            guardar_pedidos(pedidos)
            print(f"🔄 Pedido #{pedido_id} actualizado a estado: {nuevo_estado}")
            return {"mensaje": "Estado actualizado", "pedido_id": pedido_id, "nuevo_estado": nuevo_estado}
    raise HTTPException(status_code=404, detail="Pedido no encontrado")

@app.patch("/pedidos/{pedido_id}/urgente", response_model=dict)
async def marcar_urgente(pedido_id: int):
    pedidos = cargar_pedidos()
    for p in pedidos:
        if p["id"] == pedido_id:
            p["tiempo_limite"] = int(p.get("tiempo_limite", 300000) * 0.6)
            guardar_pedidos(pedidos)
            print(f"🚨 Pedido #{pedido_id} marcado como urgente, nuevo límite: {p['tiempo_limite']}ms")
            return {"mensaje": "Pedido marcado como urgente", "nuevo_limite": p["tiempo_limite"]}
    raise HTTPException(status_code=404, detail="Pedido no encontrado")

@app.delete("/pedidos/{pedido_id}", response_model=dict)
async def eliminar_pedido(pedido_id: int):
    pedidos = cargar_pedidos()
    nuevos_pedidos = [p for p in pedidos if p["id"] != pedido_id]
    if len(nuevos_pedidos) == len(pedidos):
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    guardar_pedidos(nuevos_pedidos)
    return {"mensaje": "Pedido eliminado", "pedido_id": pedido_id}

# ==================== Función para construir el prompt completo ====================
def construir_prompt_completo(consulta: str) -> str:
    """Devuelve el prompt base más la consulta del usuario."""
    prompt_base = """
Eres un barista experto y apasionado en una cafetería de especialidad llamada "Caffenio". 
Tu misión es ayudar a los clientes a encontrar la bebida, alimento o postre perfecto según sus gustos, estado de ánimo o necesidades. 
Debes ser amable, conocedor y ofrecer recomendaciones precisas basadas en las descripciones detalladas de los productos. 
Siempre que sea relevante, menciona la posibilidad de personalizar: tipo de leche, toppings, temperatura, sabores adicionales, etc.

A continuación se presenta el menú completo de Caffenio con descripciones exhaustivas. Utiliza esta información para sugerir productos, pero si el cliente pide algo específico, respeta su elección y ofrece variaciones cuando corresponda.

--- BEBIDAS CALIENTES ---
- Espresso: Shot de café espresso, intenso y clásico de Caffenio. (Simple o doble)
- Latte: Leche cremada con espresso vertido encima — sabor suave donde predomina la leche.
- Frappé: Bebida frappé a base de café, leche y hielo triturado.
- Chai Latte: Mezcla de finas especias y té negro con leche cremada; puede pedirse con espresso extra ("Dirty Chai").
- Cappuccino: Preparado con espresso y leche cremada — una mezcla clásica de café fuerte con textura espumosa.
- Cappuccino Nutella®: Cappuccino con base de espresso, leche cremada y un toque delicioso de Nutella.
- Cappuccino Lotus®: Cappuccino con café espresso, leche y crema de galleta Lotus caramelizada — dulce y cremoso.
- Latte Caliente: Leche cremada con espresso vertido encima — sabor suave donde predomina la leche.
- Mexicano (tipo Americano): Café caliente elaborado con granos mexicanos de calidad Pluma Hidalgo.
- Mexicano Espresso (tipo Americano): Café caliente a base de espresso con granos mexicanos, intenso en aroma.
- Mexicano Espresso con Leche: Café espresso mexicano servido con leche.
- Mexicano con Leche: Café americano tipo mexicano servido con leche.
- Espresso (doble): Doble shot de café espresso, intenso y clásico.
- Té Chai Latte caliente: Mezcla de finas especias (canela, jengibre, clavo) y té negro con leche cremada.
- Chocolate Oaxaqueño caliente: El sabor de la tradición — bebida de chocolate mexicano con leche cremada (bombones opcionales).
- Chocolate Blanco Caliente: Bebida caliente de chocolate blanco hecha con leche cremada.
- Horchata Caliente: Bebida caliente con sabor a horchata de arroz y toques de canela; opcional con espresso.
- Tisana caliente: Infusión de frutas, hierbas y especias en agua caliente — sin café, muy aromática.
- Té Matcha caliente: Té verde matcha preparado con leche cremada.
- Té Honeybush caliente: Té con aroma y sabor ligeramente dulce y afrutado.
- Avena (caliente): Avena esponjosa preparada con leche o agua, con trocitos (fresa deshidratada o almendra).

--- CAFÉS FRÍOS ---
- Lateada®: Bebida fría a base de café espresso y leche, cremosa y refrescante.
- Mexicano Frío: Café frío elaborado con granos mexicanos, servido con hielo.
- Mexicano Espresso Frío: Café a base de espresso servido frío, intenso y aromático.
- Mexicano con Leche Frío: Café mexicano frío mezclado con leche y hielo.
- Americano Frío: Espresso con agua y hielo, ligero y refrescante.
- Latte Frío: Leche y espresso servidos con hielo, sabor suave y cremoso.
- Cappuccino Frío: Espresso con leche fría y hielo, con textura ligera.

--- BEBIDAS FRÍAS (sabores y sin café) ---
- Lateada® Vainilla: Lateada fría con sabor vainilla.
- Lateada® Caramelo: Lateada fría con toque dulce de caramelo.
- Lateada® Moka: Lateada fría con chocolate.
- Lateada® Cajeta: Lateada fría con sabor tradicional a cajeta.
- Chai Latte Frío: Mezcla de té negro con especias y leche, servido con hielo.
- Matcha Frío: Té verde matcha mezclado con leche y hielo.
- Chocolate Oaxaqueño Frío: Bebida fría de chocolate mexicano con leche y hielo.
- Chocolate Blanco Frío: Chocolate blanco mezclado con leche y hielo.
- Horchata Fría: Bebida sabor horchata con hielo; puede pedirse con espresso.
- Tisana Fría: Infusión frutal y herbal servida fría, sin café.

-- BEBIDAS REFRESCANTES, FRESCAS ---
- Kombucha: Bebida fermentada, ligeramente gasificada y refrescante.

--- BEBIDAS TIPO FRAPPÉ ---
- Kfreeze®: Bebida frappé a base de café, leche y hielo triturado.
- Kfreeze® Vainilla: Versión frappé con sabor vainilla.
- Kfreeze® Caramelo: Versión frappé con caramelo.
- Kfreeze® Moka: Versión frappé con chocolate.
- Kfreeze® Cajeta: Versión frappé con cajeta.

--- ALIMENTOS ---
- Panini Italiano: Pan a las finas hierbas acompañado de jamón de pierna, salami italiano, queso gouda y aderezo de tomate.
- Croissant: Pan finamente seleccionado, con un toque de mantequilla, relleno de jamón y queso. Disfrútalo frío o caliente.
- Chapata: Elaborado con delicioso pan tipo chapata, jamón, queso manchego y chilorio.
- Waffle: Esponjoso waffle dorado, ideal para acompañar con miel, mermelada o crema.
- Bagel de Huevito: Pan tipo bagel con fritatta de huevo, tocino ahumado y queso gouda.
- Club Sándwich: Elaborado con pan integral, tocino ahumado, pechuga de pollo, queso gouda, queso manchego, jamón, mayonesa, mostaza y salsa de chiltepín.
- Sándwich Doble: Sandwich de pan integral, jamón de pavo, queso gouda, queso manchego y aderezo chipotle.
- Baguette Carnes Frías: Pan baguette finas hierbas con queso parmesano horneado, jamón de pavo, queso manchego, salami, pepperoni y aderezo mayonesa-mostaza.
- Rollo Italiano: Esponjoso rollo horneado relleno de pepperoni, mezcla de quesos, tocino y cebolla, acompañado con salsa cremosa de chipotle.
- Sándwich Cremoso: Pan tostado a la perfección con jamón y queso crema, irresistible.
- Rollo Ranchero: Rollo horneado relleno de arrachera, chicharrón, salsa y queso derretido; cubierto con queso parmesano y ajonjolí negro.
- Panini Ligero: Pan panino doradito con aderezo italiano, pechuga de pavo y queso panela, opción ligera con mucho sabor.
- Avena (alimento): Avena caliente cremosa, ideal como desayuno nutritivo o acompañamiento energético.

--- REPOSTERÍA ---
- Galleta con chispas de chocolate: Galleta suave por dentro y ligeramente crujiente por fuera, con chispas de chocolate.
- Espiral de canela: Clásico enrollado de azúcar canela cubierto de un dulce glaseado. Puede pedirse caliente.
- Brownie: Esponjoso brownie de chocolate y chispas de chocolate.
- Dona: Dona con cubierta de chocolate.
- Polvorón: Tradicional polvorón de textura suave y sabor dulce, perfecto con café.
- Repostería con nieve: Tu postre favorito acompañado de una bola de nieve cremosa.
- Chocolatín: Hojaldre dorado y crujiente relleno de chocolate, perfecto para un antojo dulce.
- Coyota: Tradicional coyota rellena de piloncillo, textura suave y sabor casero.
- Panecillo de Plátano: Pan suave y húmedo con delicioso sabor a plátano.
- Recién Horneado: Pan dulce recién salido del horno, con aroma irresistible y textura suave.
- Pastel Red Velvet: Esponjoso pastel Red Velvet con suave betún cremoso.

--- INSTRUCCIONES IMPORTANTES ---
- El cliente puede pedir recomendaciones generales ("¿qué me recomiendas?") o específicas ("quiero algo dulce", "un café fuerte", "algo sin cafeína", "un desayuno ligero", etc.).
- Basándote en las descripciones detalladas, sugiere de 2 a 4 productos que mejor se ajusten a su petición. Si pide algo muy concreto, puedes sugerir menos.
- Siempre que sea relevante, ten en cuenta la posibilidad de personalizar (tipo de leche, toppings, temperatura, sabores adicionales), pero no lo menciones en la respuesta a menos que el cliente pregunte.
- Devuelve ÚNICAMENTE los nombres de los productos recomendados, separados por comas. No añadas explicaciones, puntos finales, comillas, ni texto adicional. La respuesta debe ser una lista simple de nombres de productos, tal como aparecen en el menú (por ejemplo: "Cappuccino, Latte, Chai Latte").
- Tómate el tiempo de pensar y analizar el menú completo antes de responder. Queremos las mejores recomendaciones posibles. Gracias.
"""
    return prompt_base + f"\n\nEl cliente dice: '{consulta}'. Recomiéndale productos de la lista."

# ==================== Endpoints de recomendaciones ====================
@app.get("/")
def read_root():
    return {"message": "Bienvenido al servidor backend de la Cafetería Caffenio"}

@app.post("/recomendar")
async def recomendar(consulta: Consulta):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="API key no configurada")
    try:
        prompt_completo = construir_prompt_completo(consulta.mensaje)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt_completo}]}]
        }
        print(f"🔍 Consultando Gemini sin caché...")
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        texto = data["candidates"][0]["content"]["parts"][0]["text"]
        nombres = [nombre.strip() for nombre in texto.split(",") if nombre.strip()]
        return {"recomendaciones": nombres}
    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=502, detail=str(e))

@app.options("/recomendar")
async def recomendar_options():
    return {"message": "OK"}
# ==================== Panel de cocina ====================
@app.get("/cocina", response_class=HTMLResponse)
async def vista_cocina():
    pedidos = cargar_pedidos()
    pedidos_activos = [p for p in pedidos if p["estado"] != "listo"]
    # Orden inicial por tiempo restante (menor primero)
    ahora = datetime.now().timestamp() * 1000
    for p in pedidos_activos:
        creacion = datetime.fromisoformat(p["fecha"].replace('Z', '+00:00')).timestamp() * 1000
        p["tiempo_restante"] = p.get("tiempo_limite", 300000) - (ahora - creacion)
    pedidos_activos.sort(key=lambda x: x["tiempo_restante"])

    html = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel de Cocina - Caffenio</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
        <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8f6f6; }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
            .progress-ring__circle {
                transition: stroke-dashoffset 0.35s;
                transform: rotate(-90deg);
                transform-origin: 50% 50%;
            }
            /* Estilos para tarjeta prioritaria */
            .order-card.prioritario {
                border-width: 3px;
                border-color: #ef4444;
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
                animation: pulse-border 1.5s infinite;
            }
            @keyframes pulse-border {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            .prioritario .timer {
                color: #ef4444 !important;
                font-weight: 900;
                animation: heartbeat 1.5s ease-in-out infinite;
            }
            @keyframes heartbeat {
                0% { transform: scale(1); }
                30% { transform: scale(1.1); }
                50% { transform: scale(1); }
                70% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        </style>
    </head>
    <body class="p-8">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center gap-3 mb-8">
                <span class="material-symbols-outlined text-4xl text-[#ea2a33]">restaurant_menu</span>
                <h1 class="text-4xl font-black text-slate-900">Panel de Cocina</h1>
                <span id="ultima-actualizacion" class="ml-auto text-sm font-bold text-slate-500"></span>
            </div>
            <div id="pedidos-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    """

    if not pedidos_activos:
        html += """
        <div class="bg-white rounded-2xl shadow-lg p-12 text-center col-span-3">
            <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">celebration</span>
            <h2 class="text-2xl font-bold text-slate-700">¡Todo listo!</h2>
            <p class="text-slate-500">No hay pedidos pendientes en este momento.</p>
        </div>
        """
    else:
        for pedido in pedidos_activos:
            estado_color = {
                "recibido": "bg-yellow-100 text-yellow-800 border-yellow-300",
                "preparación": "bg-blue-100 text-blue-800 border-blue-300",
            }.get(pedido["estado"], "bg-gray-100 text-gray-800 border-gray-300")

            fecha_creacion = datetime.fromisoformat(pedido["fecha"].replace('Z', '+00:00')).timestamp() * 1000
            tiempo_limite = pedido.get("tiempo_limite", 300000)

            card_id = f"pedido-{pedido['id']}"

            html += f"""
            <div id="{card_id}" class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden order-card" data-creacion="{fecha_creacion}" data-limite="{tiempo_limite}" data-id="{pedido['id']}" data-estado="{pedido['estado']}">
                <div class="p-5 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pedido #{pedido['id']}</span>
                        <p class="text-sm text-slate-500">{pedido['fecha'][:19].replace('T', ' ')}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="estado-badge px-3 py-1 rounded-full text-xs font-bold uppercase {estado_color}">{pedido['estado']}</span>
                        <span class="urgente-badge hidden px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">¡URGENTE!</span>
                        <span class="prioridad-badge hidden px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">🔥 PRIORIDAD</span>
                    </div>
                </div>
                <div class="p-5 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            """
            for item in pedido["items"]:
                detalles = []
                if item.get("tamanoSeleccionado"):
                    detalles.append(item["tamanoSeleccionado"])
                if item.get("lecheSeleccionada"):
                    detalles.append(item["lecheSeleccionada"])
                if item.get("toppingsSeleccionados"):
                    detalles.append(", ".join(item["toppingsSeleccionados"]))
                detalles_str = f"<span class='text-xs text-slate-500 block'>{', '.join(detalles)}</span>" if detalles else ""

                html += f"""
                <div class="flex justify-between items-start">
                    <div>
                        <span class="font-bold text-slate-800">{item['cantidad']}x {item['nombre']}</span>
                        {detalles_str}
                    </div>
                    <span class="font-bold text-[#ea2a33]">${item['precio'] * item['cantidad']:.2f}</span>
                </div>
                """

            html += f"""
                </div>
                <div class="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span class="font-black text-slate-700">Total</span>
                    <span class="text-2xl font-black text-[#ea2a33]">${pedido['total']:.2f}</span>
                </div>
                <div class="p-4 border-t border-slate-100">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <svg class="progress-ring" width="50" height="50">
                                <circle class="progress-ring__circle" stroke="#ea2a33" stroke-width="4" fill="transparent" r="20" cx="25" cy="25"/>
                            </svg>
                            <span class="timer text-lg font-bold text-slate-700">5:00</span>
                        </div>
                        <div class="flex gap-2">
                            <button class="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full hover:bg-red-600" onclick="marcarUrgente({pedido['id']})">🚨 Urgente</button>
                        </div>
                    </div>
                </div>
                <div class="flex border-t border-slate-100">
                    <button class="flex-1 py-3 text-sm font-bold text-slate-400 cursor-not-allowed" disabled>📥 Recibido</button>
                    <button class="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors" onclick="cambiarEstado({pedido['id']}, 'preparación', this)">👨‍🍳 Preparar</button>
                    <button class="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors" onclick="cambiarEstado({pedido['id']}, 'listo', this)">✅ Listo</button>
                </div>
            </div>
            """

    html += """
            </div>
        </div>
        <script>
        console.log('Panel de cocina iniciado');
        const audio = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f38=');
        audio.volume = 0.5;
        let audioPermitido = false;

        function formatearTiempo(ms) {
            if (ms < 0) ms = 0;
            const totalSegundos = Math.floor(ms / 1000);
            const minutos = Math.floor(totalSegundos / 60);
            const segundos = totalSegundos % 60;
            return `${minutos}:${segundos.toString().padStart(2, '0')}`;
        }

        function calcularTiempoRestante(card) {
            const ahora = Date.now();
            const creacion = parseFloat(card.dataset.creacion);
            const limite = parseFloat(card.dataset.limite);
            return limite - (ahora - creacion);
        }

        function actualizarTemporizadores() {
            const ahora = Date.now();
            const cards = document.querySelectorAll('.order-card');
            if (cards.length === 0) return;

            cards.forEach(card => {
                if (!card.dataset.creacion) return;
                const creacion = parseFloat(card.dataset.creacion);
                const limite = parseFloat(card.dataset.limite);
                const tiempoTranscurrido = ahora - creacion;
                const tiempoRestante = limite - tiempoTranscurrido;

                const timerSpan = card.querySelector('.timer');
                const urgenteSpan = card.querySelector('.urgente-badge');
                if (!timerSpan) return;

                timerSpan.textContent = formatearTiempo(tiempoRestante);

                const circle = card.querySelector('.progress-ring__circle');
                if (circle) {
                    const radio = 20;
                    const circunferencia = 2 * Math.PI * radio;
                    const offset = circunferencia * (1 - Math.min(1, tiempoTranscurrido / limite));
                    circle.style.strokeDasharray = `${circunferencia} ${circunferencia}`;
                    circle.style.strokeDashoffset = offset;
                }

                if (tiempoRestante <= 0) {
                    timerSpan.classList.add('text-red-600', 'font-black');
                    timerSpan.classList.remove('text-slate-700');
                    if (urgenteSpan) urgenteSpan.classList.remove('hidden');
                    if (!card.dataset.played && audioPermitido) {
                        audio.play().catch(e => console.log('Error al reproducir audio', e));
                        card.dataset.played = 'true';
                    }
                } else if (tiempoRestante < 60000) {
                    timerSpan.classList.add('text-orange-500', 'font-bold');
                    timerSpan.classList.remove('text-slate-700');
                    if (urgenteSpan) urgenteSpan.classList.add('hidden');
                } else {
                    timerSpan.classList.remove('text-red-600', 'text-orange-500');
                    timerSpan.classList.add('text-slate-700');
                    if (urgenteSpan) urgenteSpan.classList.add('hidden');
                }
            });
        }

        function reordenarTarjetas() {
            const container = document.getElementById('pedidos-container');
            if (!container) return;
            const cards = Array.from(container.querySelectorAll('.order-card'));

            cards.sort((a, b) => {
                const tiempoA = calcularTiempoRestante(a);
                const tiempoB = calcularTiempoRestante(b);
                return tiempoA - tiempoB;
            });

            cards.forEach(card => container.appendChild(card));

            // Marcar la primera tarjeta como prioritaria
            cards.forEach((card, index) => {
                const prioridadBadge = card.querySelector('.prioridad-badge');
                if (index === 0) {
                    card.classList.add('prioritario');
                    if (prioridadBadge) prioridadBadge.classList.remove('hidden');
                } else {
                    card.classList.remove('prioritario');
                    if (prioridadBadge) prioridadBadge.classList.add('hidden');
                }
            });
        }

        function generarTarjetaHTML(pedido) {
            const fechaCreacion = new Date(pedido.fecha).getTime();
            const tiempoLimite = pedido.tiempo_limite || 300000;
            const estadoColor = {
                'recibido': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                'preparación': 'bg-blue-100 text-blue-800 border-blue-300'
            }[pedido.estado] || 'bg-gray-100 text-gray-800 border-gray-300';

            let itemsHTML = '';
            pedido.items.forEach(item => {
                const detalles = [];
                if (item.tamanoSeleccionado) detalles.push(item.tamanoSeleccionado);
                if (item.lecheSeleccionada) detalles.push(item.lecheSeleccionada);
                if (item.toppingsSeleccionados && item.toppingsSeleccionados.length > 0) detalles.push(item.toppingsSeleccionados.join(', '));
                const detallesStr = detalles.length ? `<span class="text-xs text-slate-500 block">${detalles.join(' · ')}</span>` : '';
                itemsHTML += `
                <div class="flex justify-between items-start">
                    <div>
                        <span class="font-bold text-slate-800">${item.cantidad}x ${item.nombre}</span>
                        ${detallesStr}
                    </div>
                    <span class="font-bold text-[#ea2a33]">$${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
                `;
            });

            return `
            <div id="pedido-${pedido.id}" class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden order-card" data-creacion="${fechaCreacion}" data-limite="${tiempoLimite}" data-id="${pedido.id}" data-estado="${pedido.estado}">
                <div class="p-5 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pedido #${pedido.id}</span>
                        <p class="text-sm text-slate-500">${new Date(pedido.fecha).toLocaleString()}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="estado-badge px-3 py-1 rounded-full text-xs font-bold uppercase ${estadoColor}">${pedido.estado}</span>
                        <span class="urgente-badge hidden px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">¡URGENTE!</span>
                        <span class="prioridad-badge hidden px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">🔥 PRIORIDAD</span>
                    </div>
                </div>
                <div class="p-5 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    ${itemsHTML}
                </div>
                <div class="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span class="font-black text-slate-700">Total</span>
                    <span class="text-2xl font-black text-[#ea2a33]">$${pedido.total.toFixed(2)}</span>
                </div>
                <div class="p-4 border-t border-slate-100">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <svg class="progress-ring" width="50" height="50">
                                <circle class="progress-ring__circle" stroke="#ea2a33" stroke-width="4" fill="transparent" r="20" cx="25" cy="25"/>
                            </svg>
                            <span class="timer text-lg font-bold text-slate-700">5:00</span>
                        </div>
                        <div class="flex gap-2">
                            <button class="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full hover:bg-red-600" onclick="marcarUrgente(${pedido.id})">🚨 Urgente</button>
                        </div>
                    </div>
                </div>
                <div class="flex border-t border-slate-100">
                    <button class="flex-1 py-3 text-sm font-bold text-slate-400 cursor-not-allowed" disabled>📥 Recibido</button>
                    <button class="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors" onclick="cambiarEstado(${pedido.id}, 'preparación', this)">👨‍🍳 Preparar</button>
                    <button class="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors" onclick="cambiarEstado(${pedido.id}, 'listo', this)">✅ Listo</button>
                </div>
            </div>
            `;
        }

        async function cargarPedidos() {
            try {
                const res = await fetch('/pedidos?estado=recibido&estado=preparación');
                if (!res.ok) throw new Error('Error al cargar pedidos');
                const pedidos = await res.json();
                const container = document.getElementById('pedidos-container');
                if (!container) return;

                document.getElementById('ultima-actualizacion').textContent = 'Última actualización: ' + new Date().toLocaleTimeString();

                if (pedidos.length === 0) {
                    container.innerHTML = `
                    <div class="bg-white rounded-2xl shadow-lg p-12 text-center col-span-3">
                        <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">celebration</span>
                        <h2 class="text-2xl font-bold text-slate-700">¡Todo listo!</h2>
                        <p class="text-slate-500">No hay pedidos pendientes en este momento.</p>
                    </div>
                    `;
                    return;
                }

                const ahora = Date.now();
                pedidos.sort((a, b) => {
                    const tiempoA = a.tiempo_limite - (ahora - new Date(a.fecha).getTime());
                    const tiempoB = b.tiempo_limite - (ahora - new Date(b.fecha).getTime());
                    return tiempoA - tiempoB;
                });

                let html = '';
                pedidos.forEach(pedido => {
                    html += generarTarjetaHTML(pedido);
                });
                container.innerHTML = html;

                // Después de cargar, reordenar y marcar prioridad
                reordenarTarjetas();
            } catch (error) {
                console.error('Error al actualizar pedidos:', error);
            }
        }

        // Polling cada 20 segundos
        setInterval(cargarPedidos, 20000);
        cargarPedidos();

        // Temporizadores cada segundo y reordenamiento
        setInterval(() => {
            actualizarTemporizadores();
            reordenarTarjetas();
        }, 1000);

        function marcarUrgente(id) {
            if (!audioPermitido) {
                audioPermitido = true;
                audio.volume = 0;
                audio.play().then(() => {
                    audio.pause();
                    audio.volume = 0.5;
                }).catch(e => console.log('Audio no permitido aún'));
            }

            fetch(`/pedidos/${id}/urgente`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => {
                if (!res.ok) throw new Error('Error al marcar urgente');
                return res.json();
            })
            .then(data => {
                const card = document.getElementById(`pedido-${id}`);
                if (card) {
                    card.dataset.limite = data.nuevo_limite;
                    const badge = card.querySelector('.urgente-badge');
                    if (badge) badge.classList.remove('hidden');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error al marcar urgente');
            });
        }

        function cambiarEstado(id, nuevoEstado, boton) {
            const card = document.getElementById(`pedido-${id}`);
            boton.disabled = true;
            boton.classList.add('opacity-50', 'cursor-not-allowed');

            fetch(`/pedidos/${id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nuevo_estado: nuevoEstado })
            })
            .then(res => {
                if (!res.ok) throw new Error('Error al actualizar');
                return res.json();
            })
            .then(data => {
                if (nuevoEstado === 'listo') {
                    if (card) card.remove();

                    const container = document.getElementById('pedidos-container');
                    if (container && container.children.length === 0) {
                        container.innerHTML = `
                        <div class="bg-white rounded-2xl shadow-lg p-12 text-center col-span-3">
                            <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">celebration</span>
                            <h2 class="text-2xl font-bold text-slate-700">¡Todo listo!</h2>
                            <p class="text-slate-500">No hay pedidos pendientes en este momento.</p>
                        </div>
                        `;
                    }
                } else if (nuevoEstado === 'preparación') {
                    const badge = card.querySelector('.estado-badge');
                    if (badge) {
                        badge.textContent = 'preparación';
                        badge.className = 'estado-badge px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border-blue-300';
                    }
                    boton.disabled = false;
                    boton.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error al cambiar estado');
                boton.disabled = false;
                boton.classList.remove('opacity-50', 'cursor-not-allowed');
            });
        }

        document.addEventListener('click', function() {
            if (!audioPermitido) {
                audioPermitido = true;
                audio.volume = 0;
                audio.play().then(() => {
                    audio.pause();
                    audio.volume = 0.5;
                }).catch(e => console.log('Audio no permitido aún'));
            }
        }, { once: true });
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)