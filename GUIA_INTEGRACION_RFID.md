# 🚀 Guía de Integración RFID USB con Caffenio Drive-Thru

## 📋 Resumen de cambios

Se han realizado las siguientes modificaciones para integrar un lector RFID USB (125 kHz) en el sistema existente:

### Nuevos archivos creados:
1. **`frontend/hooks/useRFIDBridge.ts`** - Hook personalizado para conectar al WebSocket del bridge RFID
2. **Este documento** - Guía de ejecución

### Archivos modificados:
1. **`frontend/components/NFCReader.tsx`** - Refactorizado para extraer la lógica de procesamiento de UID
2. **`frontend/app/page.tsx`** - Integración del hook RFID y función centralizada de manejo de tags

---

## 🔧 Requisitos previos

### Hardware
- **Lector RFID USB** (125 kHz) que funcione como teclado HID
- **PC/Laptop** con Windows/Mac/Linux
- **Tags RFID** o llaveros para probar

### Software
- **Node.js** v14+ (para ejecutar el bridge)
- **npm** o **yarn**
- **Git** (para clonar el proyecto)

### Bridge RFID
Tu script `bridge.js` debe estar funcional y:
- Capturar entrada de teclado del lector RFID
- Ejecutarse en `localhost:8081` como servidor WebSocket
- Emitir mensajes en formato: `{ "type": "RFID_TAG", "id": "0013374963" }`

---

## 🎯 Arquitectura del flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA INTEGRADA                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  LECTURA RFID USB (125 kHz)                                 │
│  ├─ Lector USB conectado → simula teclado HID               │
│  └─ Captura entrada: "0013374963<Enter>"                   │
│                                                               │
│  ↓ (vía bridge.js)                                           │
│                                                               │
│  BRIDGE NODE.JS                                             │
│  ├─ Escucha entrada del teclado (keyspy/iohook)           │
│  ├─ Convierte a JSON: { "type": "RFID_TAG", "id": "..." } │
│  └─ Emite por WebSocket en ws://localhost:8081             │
│                                                               │
│  ↓                                                            │
│                                                               │
│  FRONTEND (localhost:3000)                                  │
│  ├─ Hook useRFIDBridge.ts                                   │
│  │  ├─ Se conecta al WebSocket (solo en localhost)          │
│  │  ├─ Escucha mensajes RFID_TAG                            │
│  │  └─ Ejecuta callback onTag(uid)                          │
│  │                                                            │
│  └─ Componente NFCReader.tsx                                │
│     ├─ Función handleTagRead(uid)                           │
│     ├─ Envía UID al backend: POST /identificar              │
│     └─ Actualiza estado: setUsuario, setPantalla           │
│                                                               │
│  ↓                                                            │
│                                                               │
│  BACKEND (FastAPI)                                          │
│  ├─ Endpoint: POST /identificar                             │
│  ├─ Busca UID en users.json                                 │
│  └─ Devuelve: { "success": true/false, "user": {...} }    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Guía de ejecución

### Paso 1: Preparar el Backend (FastAPI)

```bash
# Navega a la carpeta del backend
cd backend/

# Crea un entorno virtual (si no lo has hecho)
python -m venv venv

# Activa el entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instala dependencias
pip install -r requirements.txt

# Ejecuta el backend (escucha en http://localhost:8000)
python main.py
```

**Verificar que el backend esté corriendo:**
- Abre en el navegador: `http://localhost:8000/`
- Deberías ver: `{"message": "Bienvenido al servidor backend de la Cafetería Caffenio"}`

---

### Paso 2: Ejecutar el Bridge RFID (Node.js)

**Nota:** Tu script `bridge.js` debe estar en la raíz del proyecto o en `backend/`.

```bash
# Desde la raíz del proyecto (o donde esté bridge.js)
cd path/to/bridge.js

# Instala dependencias (si no están instaladas)
npm install

# Ejecuta el bridge
node bridge.js
```

**Verificar que el bridge esté corriendo:**
- Deberías ver en la consola: `[Bridge] Servidor WebSocket escuchando en ws://localhost:8081`
- Pasa un tag RFID por el lector
- En la consola verás: `[Bridge] Tag detectado: 0013374963`

---

### Paso 3: Ejecutar el Frontend (Next.js)

```bash
# Navega a la carpeta del frontend
cd frontend/

# Instala dependencias (si no las has instalado)
npm install

# Ejecuta el servidor de desarrollo
npm run dev
```

**Verificar que el frontend esté corriendo:**
- Abre en el navegador: `http://localhost:3000`
- Deberías ver la pantalla de bienvenida de Caffenio

---

## ✅ Prueba del flujo completo

### 1. **Verificación de conectividad**

Abre las DevTools del navegador (F12) y ve a la consola. Deberías ver:

```
[RFID Bridge] Conectando a ws://localhost:8081...
[RFID Bridge] ✅ Conectado al bridge RFID
```

Si ves un error de conexión, verifica que:
- El bridge Node.js está corriendo en `localhost:8081`
- No hay conflictos de puertos
- El firewall permite WebSocket en localhost

### 2. **Prueba con un tag RFID**

1. Navega a `http://localhost:3000`
2. En la pantalla de bienvenida, presiona el botón grande o espera
3. Verás 3 opciones: NFC, QR e Invitado
4. Pasa tu tag RFID por el lector USB
5. En la consola deberías ver:
   ```
   [RFID Bridge] Tag leído: 0013374963
   [NFCReader] Procesando UID: 0013374963
   [App] Procesando UID: 0013374963
   ```
6. Si el UID está en `backend/users.json`, el sistema identificará al usuario y pasará a la pantalla de favoritos
7. Si el UID no está registrado, mostrará un alerta

### 3. **Prueba del flujo NFC en móvil** (sin cambios)

- En un dispositivo móvil con NFC activado, abre `http://localhost:3000` (o tu URL en Vercel)
- Funciona exactamente igual que antes
- El WebSocket no se conecta en móvil (solo en localhost)

---

## 📊 Estructura del flujo de código

### Hook: `useRFIDBridge.ts`

```typescript
useRFIDBridge(onTag, autoConnect)
```

**Parámetros:**
- `onTag: (uid: string) => void` - Callback ejecutado cuando se lee un tag
- `autoConnect: boolean` - Si true, se conecta automáticamente (default: true)

**Características:**
- Solo se conecta en `localhost` (desarrollo)
- Reconexión automática con backoff exponencial
- Máximo 5 reintentos
- Manejo de errores robusto

**Uso en `page.tsx`:**
```typescript
useRFIDBridge(handleTagRead);
```

---

### Componente: `NFCReader.tsx`

**Cambios clave:**
- Ahora es un componente `forwardRef` con ref
- Expone la función `handleTagRead` mediante `useImperativeHandle`
- Acepta prop `onTagRead` para inyectar lógica externa
- La función `handleTagRead` maneja UIDs de NFC y RFID

**Props:**
```typescript
interface NFCReaderProps {
  onSuccess: (userData: any) => void;
  onError: (error: string) => void;
  onUnregistered: (uid: string) => void;
  onTimeout?: () => void;
  apiUrl: string;
  onTagRead?: (uid: string) => Promise<void>; // NUEVA
}
```

**Uso en `page.tsx`:**
```typescript
<NFCReader
  ref={nfcReaderRef}
  onTagRead={handleTagRead}
  {...otrasProps}
/>
```

---

### Función centralizada: `handleTagRead` en `page.tsx`

```typescript
const handleTagRead = async (uid: string) => {
  // 1. Envía UID al backend
  // 2. Recibe respuesta { success, user }
  // 3. Actualiza estado: setUsuario, setPantalla
};
```

**Flujo:**
1. Se llama desde dos fuentes:
   - Hook `useRFIDBridge` (RFID USB vía WebSocket)
   - Componente `NFCReader` (NFC nativo)
2. Envía POST a `{apiUrl}/identificar`
3. Si éxito → identifica usuario → pantalla favoritos
4. Si fallo → muestra alerta → permite nuevo intento

---

## 🔒 Seguridad: ¿Por qué solo en localhost?

El hook `useRFIDBridge` **solo se conecta en desarrollo** (`localhost`) porque:

1. **En producción (Vercel):** El WebSocket en `localhost:8081` no existe, así que intentar conectar causaría errores
2. **Solo para demostraciones:** El lector RFID USB está conectado a tu laptop, no es accesible desde internet
3. **Flujo NFC sin cambios:** En móvil/producción sigue funcionando el NFC Web API nativo

**Verificación en código:**
```typescript
const isLocalhost = useCallback(() => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}, []);

if (!isLocalhost()) {
  console.log('[RFID Bridge] No en localhost, bridge desactivado.');
  return;
}
```

---

## 🐛 Troubleshooting

### Error: "ws://localhost:8081 refused to connect"

**Causa:** El bridge Node.js no está corriendo o no está en el puerto correcto

**Solución:**
```bash
# Verifica que bridge.js está ejecutándose
node bridge.js

# Comprueba que escucha en el puerto 8081
netstat -an | grep 8081  # En Mac/Linux
netstat -ano | findstr 8081  # En Windows
```

### Error: "Tag no vinculado"

**Causa:** El UID leído no existe en `backend/users.json`

**Solución:**
1. Verifica el UID en la consola del bridge
2. Añade el UID a `users.json`:
```json
{
  "users": [
    {
      "uid": "0013374963",
      "nombre": "Test User",
      "favoritos": []
    }
  ]
}
```

### El frontend no conecta al backend

**Causa:** Variable de entorno `NEXT_PUBLIC_API_URL` no configurada

**Solución:**
1. En desarrollo, por defecto usa `http://localhost:8000`
2. Para producción, crea `.env.local`:
```
NEXT_PUBLIC_API_URL=https://tu-backend.vercel.app
```

### El lector RFID no emite eventos

**Causa:** El bridge no captura correctamente la entrada del teclado

**Solución:**
1. Verifica que el lector está conectado por USB
2. Pasa un tag y verifica que aparece texto en `bridge.js`
3. Revisa el código de captura de teclado en `bridge.js` (keyspy/iohook)

---

## 📝 Resumen de comandos

```bash
# Terminal 1: Backend (FastAPI)
cd backend
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
python main.py

# Terminal 2: Bridge RFID (Node.js)
node bridge.js

# Terminal 3: Frontend (Next.js)
cd frontend
npm install
npm run dev

# Luego abre en navegador:
http://localhost:3000
```

---

## 🎓 Conceptos clave

### ¿Por qué refactorizar NFCReader?

El componente original tenía toda la lógica de lectura y procesamiento mezclada. Al extraer `handleTagRead`, ahora:
- Se puede reutilizar desde el hook RFID
- Es más testeable
- Facilita agregar nuevas fuentes de UID en el futuro (códigos de barras, RFID de otra frecuencia, etc.)

### ¿Por qué un hook en lugar de un componente?

Los hooks son ideales para lógica reutilizable (conexiones, suscripciones, estado):
- `useRFIDBridge` captura el UID y ejecuta un callback
- Es agnóstico del componente que lo usa
- Facilita testing

### ¿Cómo se ejecutan dos flujos al mismo tiempo?

1. **NFC (móvil):** Flujo Web NFC API nativo, sin cambios
2. **RFID USB (laptop):** Flujo alternativo vía WebSocket + hook

Ambos convergen en `handleTagRead` en `page.tsx`, que es la función centralizada que comunica con el backend.

---

## 📚 Referencias útiles

- **Web NFC API:** https://developer.mozilla.org/en-US/docs/Web/API/NFC_API
- **WebSocket API:** https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- **Next.js Hooks:** https://nextjs.org/docs/app/building-your-application/rendering/use-client
- **FastAPI:** https://fastapi.tiangolo.com/

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12 → Console)
2. Revisa los logs del backend (FastAPI)
3. Revisa los logs del bridge (Node.js)
4. Verifica que todos los servicios están corriendo en los puertos correctos:
   - Backend: `http://localhost:8000`
   - Bridge: `ws://localhost:8081`
   - Frontend: `http://localhost:3000`

---

**¡Listo para demostración! 🎉**
