# 📐 Diagrama de Flujo - Sistema RFID + NFC Integrado

## 🔄 Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DE IDENTIFICACIÓN                      │
└─────────────────────────────────────────────────────────────────────────┘

                         PANTALLA DE BIENVENIDA
                              (page.tsx)
                                  │
                                  ▼
                         Presiona "Iniciar"
                                  │
                                  ▼
                    PANTALLA DE IDENTIFICACIÓN
                    ┌──────┬──────────┬──────┐
                    ▼      ▼          ▼      ▼
                   NFC    QR      Invitado RFID←─────┐
                    │      │          │        │      │
                    │      │          │        │   [RFID USB]
                    │      │          │        │   125 kHz, USB
                    │      │          │        │        ▲
                    │      │          │        └────────┤
                    │      │          │                 │
                    │      │          └─────────────────┤
                    │      │                            │
                    │      └───────────────────────────┐│
                    │                                   ││
                    └───────────────────────────────────┘│
                                                         │
                                    ┌────────────────────┘
                                    │
                    ┌───────────────▼──────────────┐
                    │    Backend: /identificar     │
                    │  (FastAPI en localhost:8000)│
                    └──────────────┬───────────────┘
                                   │
                        ┌──────────┬┴────────────┐
                        ▼                       ▼
                   ✅ Éxito              ❌ Fallo
                        │                   │
                        ▼                   ▼
                   FAVORITOS           ALERTA
                   (Dashboard)         (Nuevo UID?)
```

---

## 🔌 RFID USB → Frontend: Flujo específico

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUJO RFID USB COMPLETO                    │
└──────────────────────────────────────────────────────────────┘

[LECTOR RFID USB] ──HID──> [TECLADO CAPTURADO]
    125 kHz                      bridge.js
      │                              │
      │  Emula: "0013374963\n"       │
      │         (UID + Enter)        │
      │                              │
      └──────────────────────────────┘
                    │
                    ▼
           WebSocket Buffer
       (currentBuffer + ENTER)
                    │
                    ▼
        { "type": "RFID_TAG",
          "id": "0013374963" }
                    │
                    ▼
        ws://localhost:8081
     (Bridge WebSocket Server)
                    │
                    ▼
      ┌──────────────────────────┐
      │   FRONTEND (React)       │
      │ useRFIDBridge Hook       │
      └──────────┬───────────────┘
                 │
                 ▼
         onTag("0013374963")
                 │
                 ▼
      handleTagRead("0013374963")
       (Función en page.tsx)
                 │
                 ▼
        POST /identificar
        {"uid": "0013374963"}
                 │
                 ▼
      Backend: busca en users.json
                 │
          ┌──────┴──────┐
          ▼             ▼
         ✅            ❌
        Encontrado   No encontrado
          │             │
          ▼             ▼
    setUsuario()    Alerta
    setPantalla()
```

---

## 🔀 Comparación: NFC vs RFID

```
┌────────────────────────────────────────────────────────────────┐
│           COMPARACIÓN: NFC NATIVO vs RFID USB BRIDGE            │
├─────────────────────────┬────────────────────┬─────────────────┤
│     CARACTERÍSTICA      │  NFC Web API       │   RFID USB      │
├─────────────────────────┼────────────────────┼─────────────────┤
│ Hardware requerido      │ Móvil con NFC      │ Lector USB      │
│ Frecuencia              │ 13.56 MHz (NFC)    │ 125 kHz (LF)    │
│ Conexión                │ Nativa del móvil   │ USB + Bridge    │
│ Distancia de lectura    │ 1-10 cm            │ 5-15 cm (aprox) │
│ Donde funciona          │ Producción (móvil) │ Desarrollo      │
│ Rango de uso            │ Internet (global)  │ Localhost solo  │
│ UID leído               │ Del tag NFC        │ Del tag RFID    │
│ Procesamiento           │ Web NFC API event  │ WebSocket msg   │
│ Backend endpoint        │ /identificar       │ /identificar    │
│ Resultado final         │ Mismo             │ Idéntico        │
└─────────────────────────┴────────────────────┴─────────────────┘

🎯 CONVERGEN EN: handleTagRead(uid) → Backend → Misma experiencia
```

---

## 🏗️ Arquitectura de Componentes

```
frontend/
├── app/
│   └── page.tsx
│       ├── [ESTADO]
│       │   ├── usuario (setUsuario)
│       │   ├── pantalla (setPantalla)
│       │   └── carrito, favoritos, etc.
│       │
│       ├── [HOOK RFID]
│       │   └── useRFIDBridge(handleTagRead)
│       │       └── Conecta: ws://localhost:8081
│       │
│       ├── [FUNCIÓN CENTRAL]
│       │   └── handleTagRead(uid)
│       │       ├── POST /identificar
│       │       ├── setUsuario(data.user)
│       │       └── setPantalla('favoritos')
│       │
│       └── [JSX]
│           └── <NFCReader ref={nfcReaderRef} onTagRead={handleTagRead} />
│
├── components/
│   └── NFCReader.tsx
│       ├── useRef: abortController, timeout
│       ├── Función: handleTagRead(uid) ← EXPUESTA vía ref
│       ├── Evento: reader.addEventListener('reading')
│       └── Flujo NFC: startScanning → handleTagRead
│
└── hooks/
    └── useRFIDBridge.ts
        ├── useRef: WebSocket, reconnect attempts
        ├── Función: connect() → ws://localhost:8081
        ├── Evento: ws.onmessage → onTag(uid)
        └── Flujo RFID: Tag detectado → onTag → handleTagRead
```

---

## 📊 Estado: De tag a pantalla

```
[RFID leído o NFC leído]
         ▼
   [UID obtenido]
         ▼
   [POST /identificar]
         │
    ┌────┴────┐
    ▼         ▼
 success?  error?
    │         │
    ▼         ▼
  true       false
    │         │
    ▼         ▼
setUsuario   setError
 {            │
  uid: "...", └─→ Alert: "Tag no vinculado"
  nombre: "...",   ← Usuario presiona OK
  ...              └─→ [Espera nuevo UID]
 }
    │
    ▼
setPantalla('favoritos')
    │
    ▼
[PANTALLA DE FAVORITOS ABIERTA]
```

---

## 🔐 Control de Acceso: Localhost Check

```
┌─────────────────┐
│  page.tsx carga │
│   useRFIDBridge │
└────────┬────────┘
         │
         ▼
    ¿Localhost?
    │      │
   SÍ      NO
   │       │
   ▼       ▼
Connect  Log: "No localhost,
   │     bridge desactivado"
   │       │
   └───┐   │
       ▼   ▼
    [Skip]
       │
    NFC sigue
    funcionando
    (móvil/Vercel)
```

---

## 🚦 Ciclo de vida del hook

```
[Component monta]
     ▼
[useRFIDBridge se llama]
     ▼
[¿Localhost? → SÍ]
     ▼
[Intenta conectar]
     │
     ├─→ Éxito ─→ [Escuchando WebSocket]
     │              │
     │              ├─→ [Tag leído] ─→ onTag(uid)
     │              │
     │              └─→ [Desconexión] ─→ [Reintentar]
     │
     └─→ Fallo ─→ [Error log] ─→ [Reintentar (max 5)]
                                    │
                                    └─→ [Exponential backoff]
                                        1s, 2s, 4s, 8s, 16s

[Component desmonta]
     ▼
[useRFIDBridge limpia]
     ▼
[Desconectar WebSocket]
```

---

## 🔄 Ciclo: Tag → Backend → UI

```
┌─ INICIO ─┐
│  Tag     │
│ leído    │
└────┬─────┘
     ▼
┌──────────────────┐
│ uid = "0013374963│
└────┬─────────────┘
     ▼
┌──────────────────────────────────────┐
│ handleTagRead(uid)                   │
│   ├─ console.log: "Procesando..."   │
│   ├─ apiUrl = process.env URL       │
│   └─ Prepara: { uid }               │
└────┬─────────────────────────────────┘
     ▼
┌──────────────────────────────────────┐
│ fetch POST /identificar              │
│   ├─ Headers: Content-Type: json     │
│   └─ Body: { "uid": "..." }         │
└────┬─────────────────────────────────┘
     ▼
┌──────────────────────────────────────┐
│ Backend responde:                    │
│ {                                    │
│   "success": true,                   │
│   "user": { nombre: "...", ... }    │
│ }                                    │
└────┬─────────────────────────────────┘
     ▼
┌──────────────────────────────────────┐
│ ¿success == true?                    │
└────┬─────────────┬──────────────────┘
     │ SÍ          │ NO
     ▼             ▼
┌─────────┐   ┌──────────────┐
│ ✅ Éxito│   │ ❌ Fallo    │
└────┬────┘   └──────┬───────┘
     ▼               ▼
setUsuario        Alert:
setPantalla       "¿Vincular?"
('favoritos')     
     ▼               ▼
┌──────────┐   ┌──────────────┐
│ Renderiza│   │ Espera nuevo │
│Favoritos │   │ tag          │
└──────────┘   └──────────────┘
```

---

## 🎯 Conclusión visual

```
        ┌─────────────────────────────┐
        │  INTEGRACIÓN EXITOSA ✅     │
        │ RFID USB + NFC Web API      │
        └──────────┬──────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    [LAPTOP]              [MÓVIL]
 Lector RFID USB       NFC Nativo
   125 kHz              13.56 MHz
      │                    │
      └────┬────────────┬──┘
           ▼            ▼
      handleTagRead(uid)
           │
           ▼
    POST /identificar
           │
           ▼
      Backend identifica
           │
           ▼
    USUARIO AUTENTICADO
```

---

## 📝 Leyenda

- `→` = Flujo de datos/ejecución
- `▼` = Siguiente paso
- `┌─┐` = Contenedor/Componente
- `│` = Línea de conexión
- `├─` = Ramificación
- `✅` = Éxito
- `❌` = Error/Fallo
- `🔌` = Hardware/Conexión
- `📡` = Red/WebSocket
- `💾` = Almacenamiento

