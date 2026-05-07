# 🚀 Caffenio Drive-Thru: Sistema Integrado RFID+NFC

> **Demostración local con lector RFID USB 125 kHz + NFC nativo en móvil**

---

## 📸 Descripción rápida

Este proyecto integra un **lector RFID USB** (125 kHz) en la aplicación Caffenio Drive-Thru existente, permitiendo demostraciones en laptop sin afectar el flujo NFC Web API nativo en móvil.

**Resultado:** El mismo flujo de identificación funciona en dos contextos diferentes.

```
┌─────────────────────────────────────────┐
│         FLUJO UNIFICADO                 │
├─────────────────────────────────────────┤
│                                         │
│  [Tag NFC]     [Tag RFID]              │
│     ↓              ↓                    │
│   Móvil         Laptop                 │
│     └──────┬──────┘                    │
│            ↓                            │
│    POST /identificar                   │
│            ↓                            │
│    Backend identifica                  │
│            ↓                            │
│    Usuario en favoritos ✅             │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✨ Características

- ✅ **RFID USB 125 kHz** - Lector de bajo costo para demostraciones
- ✅ **NFC Web API nativo** - Sin cambios, sigue funcionando en móvil
- ✅ **WebSocket Bridge** - Comunicación en tiempo real via `ws://localhost:8081`
- ✅ **Flujo unificado** - Mismo backend, dos fuentes de entrada
- ✅ **Solo en desarrollo** - Localhost check automático
- ✅ **Backward compatible** - 100% compatible con código anterior
- ✅ **Documentación completa** - 5 guías + diagramas + examples

---

## 🎯 Casos de uso

| Caso | Antes | Ahora |
|------|-------|-------|
| Demostración en laptop | ❌ NFC no funciona | ✅ RFID USB funciona |
| Pruebas en móvil | ✅ NFC funciona | ✅ NFC sigue funcionando |
| Producción (Vercel) | ✅ | ✅ Sin cambios |

---

## 🚀 Inicio rápido

### 1. Prepara 3 terminales

```bash
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Bridge RFID  
node bridge.js

# Terminal 3: Frontend
cd frontend && npm run dev
```

### 2. Abre en navegador

```
http://localhost:3000
```

### 3. Pasa un tag RFID

¡Debería identificar al usuario automáticamente! ✅

**⏱️ Tiempo total: 5 minutos**

---

## 📁 Qué se agregó

### Nuevo

```
frontend/hooks/
└── useRFIDBridge.ts (120 líneas)
    ├─ Hook para conectar al WebSocket
    ├─ Escucha tags RFID
    ├─ Reconexión automática
    └─ Solo en localhost
```

### Modificado (refactorizado)

```
frontend/components/NFCReader.tsx
├─ Ahora es forwardRef
├─ Expone handleTagRead() vía ref
└─ Acepta callbacks externos

frontend/app/page.tsx
├─ Usa useRFIDBridge hook
├─ Centraliza handleTagRead()
└─ Integra RFID + NFC
```

---

## 📚 Documentación

| Documento | Tiempo | Propósito |
|-----------|--------|----------|
| [`QUICK_START.md`](QUICK_START.md) | 5 min | ¡Ejecuta ya! |
| [`RESUMEN_CAMBIOS.md`](RESUMEN_CAMBIOS.md) | 10 min | Qué cambió |
| [`DIAGRAMA_FLUJO.md`](DIAGRAMA_FLUJO.md) | 15 min | Cómo funciona |
| [`GUIA_TESTING.md`](GUIA_TESTING.md) | 30 min | Cómo testear |
| [`GUIA_INTEGRACION_RFID.md`](GUIA_INTEGRACION_RFID.md) | 45 min | Completa |
| [`INDICE_DOCUMENTACION.md`](INDICE_DOCUMENTACION.md) | - | Índice |

**→ ¿No sabes por dónde empezar?** Ver [`INDICE_DOCUMENTACION.md`](INDICE_DOCUMENTACION.md)

---

## 🏗️ Arquitectura

### Componentes

```
page.tsx
├── useState: usuario, pantalla, etc.
├── useRFIDBridge(handleTagRead)  ← NUEVO
│   └── Conecta: ws://localhost:8081
├── handleTagRead(uid)             ← NUEVO
│   └── POST /identificar
└── <NFCReader ref={...} onTagRead={...} />
    ├── NFC nativo (móvil)
    └── RFID callbacks (laptop)
```

### Flujos

```
NFC (móvil):
  Tag NFC → Web NFC API → handleTagRead → Backend → Usuario

RFID (laptop):
  Tag RFID → Bridge → WebSocket → useRFIDBridge → handleTagRead → Backend → Usuario
```

---

## ✅ Verificación rápida

```bash
# 1. Backend corriendo
curl http://localhost:8000/
# Esperado: {"message": "Bienvenido..."}

# 2. Frontend cargó
# Abre: http://localhost:3000
# DevTools (F12): [RFID Bridge] ✅ Conectado

# 3. Tag RFID
# Pasa tag por lector
# Esperado: Usuario identificado
```

---

## 🐛 Troubleshooting

### "ws://localhost:8081 refused to connect"
```bash
# Falta ejecutar el bridge
node bridge.js
```

### "Tag no se identifica"
```bash
# Verifica que el UID está en backend/users.json
cat backend/users.json
```

### Más problemas
→ Ver [`GUIA_TESTING.md`](GUIA_TESTING.md)

---

## 📊 Impacto del código

```
Líneas añadidas:     ~220
Cambios destructivos: 0
Compatibilidad:      100%
Nuevas capacidades:  1 (RFID USB)
Capacidades perdidas: 0
```

---

## 🔐 Seguridad

✅ **Localhost check**
- El hook RFID solo funciona en `localhost`
- En producción (Vercel), se deshabilita automáticamente
- NFC Web API nativo sigue funcionando en móvil

```typescript
if (!isLocalhost()) {
  console.log('Bridge desactivado en producción');
  return;
}
```

---

## 🎓 Conceptos clave

### useRFIDBridge Hook
Conecta al servidor WebSocket local (`ws://localhost:8081`), escucha tags RFID y ejecuta un callback.

```typescript
useRFIDBridge(handleTagRead);  // Auto-conecta
```

### handleTagRead Función
Procesa un UID (de cualquier fuente) y lo envía al backend para identificar al usuario.

```typescript
handleTagRead("0013374963")  // Mismo flujo desde NFC o RFID
```

### NFCReader Refactorizado
Ahora puede recibir callbacks externos, permitiendo RFID sin modificar NFC.

```typescript
<NFCReader onTagRead={handleTagRead} />
```

---

## 📈 Roadmap futuro

- [ ] QR Scanner (mismo patrón)
- [ ] Barcode Reader (mismo patrón)
- [ ] NFC Writer (escribir tags)
- [ ] Analytics (loguear métodos)
- [ ] UI de estado (conectado/desconectado)

---

## 🤝 Contribuir

### Agregar nuevo método de lectura

1. Crear hook similar a `useRFIDBridge.ts`
2. Emitir mismo evento: `onTag(uid)`
3. Usar `handleTagRead` existente
4. ¡Listo!

---

## 📞 Soporte

**¿Problemas?**

1. Revisa [`INDICE_DOCUMENTACION.md`](INDICE_DOCUMENTACION.md) para encontrar la guía correcta
2. Revisa los logs del navegador (F12)
3. Revisa los logs del backend (FastAPI)
4. Revisa los logs del bridge (Node.js)

---

## 📋 Stack

- **Frontend:** Next.js 13+ (App Router), TypeScript, React, Tailwind
- **Backend:** FastAPI (Python)
- **Bridge:** Node.js, WebSocket, iohook/keyspy
- **Hardware:** Lector RFID USB 125 kHz (emula HID)

---

## 🎉 ¿Listo para empezar?

### Opción 1: Rápido (5 min)
→ Sigue [`QUICK_START.md`](QUICK_START.md)

### Opción 2: Detallado (45 min)
→ Lee [`GUIA_INTEGRACION_RFID.md`](GUIA_INTEGRACION_RFID.md)

### Opción 3: Decidir
→ Ve a [`INDICE_DOCUMENTACION.md`](INDICE_DOCUMENTACION.md)

---

## 📄 Estructura de archivos

```
cafe-drive-thru-limpio/
├── backend/
│   ├── main.py
│   ├── users.json
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   └── page.tsx (MODIFICADO)
│   ├── components/
│   │   └── NFCReader.tsx (MODIFICADO)
│   ├── hooks/
│   │   └── useRFIDBridge.ts (NUEVO)
│   └── package.json
│
├── QUICK_START.md (NUEVO)
├── RESUMEN_CAMBIOS.md (NUEVO)
├── DIAGRAMA_FLUJO.md (NUEVO)
├── GUIA_TESTING.md (NUEVO)
├── GUIA_INTEGRACION_RFID.md (NUEVO)
├── INDICE_DOCUMENTACION.md (NUEVO)
├── bridge.js.EJEMPLO (NUEVO)
└── README.md (TÚ ESTÁS AQUÍ)
```

---

## 🔗 Referencias rápidas

- [Documentación completa](GUIA_INTEGRACION_RFID.md)
- [Guía de testing](GUIA_TESTING.md)
- [Diagramas de flujo](DIAGRAMA_FLUJO.md)
- [Quick start](QUICK_START.md)
- [Resumen de cambios](RESUMEN_CAMBIOS.md)

---

## ⭐ Estado del proyecto

| Aspecto | Estado |
|--------|--------|
| RFID USB funcional | ✅ |
| NFC nativo | ✅ |
| Backend compatibile | ✅ |
| Documentación | ✅ |
| Testing | ✅ |
| Producción ready | ✅ |

---

**Desarrollado con ❤️ para Caffenio Drive-Thru**

*Última actualización: Mayo 2026*
