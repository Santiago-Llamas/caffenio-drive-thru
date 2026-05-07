# ⚡ Quick Start - RFID USB + NFC Integrados

**TL;DR:** 3 servicios, 3 comandos, ¡listo para demostración!

---

## 🚀 Inicio rápido (5 minutos)

### Terminal 1: Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# ✅ Espera: "Uvicorn running on http://127.0.0.1:8000"
```

### Terminal 2: Bridge RFID (Node.js)
```bash
node bridge.js
# ✅ Espera: "[Bridge] 🚀 Servidor WebSocket escuchando en ws://localhost:8081"
```

### Terminal 3: Frontend (Next.js)
```bash
cd frontend
npm install  # Solo primera vez
npm run dev
# ✅ Espera: "Local: http://localhost:3000"
```

### 🎉 ¡Listo!
1. Abre: `http://localhost:3000`
2. Presiona botón grande
3. Pasa un tag RFID por el lector
4. ¡Debería funcionar! 🎊

---

## ✅ Verificaciones rápidas

| Servicio | URL | Esperado |
|----------|-----|----------|
| Backend | `http://localhost:8000/` | JSON message |
| Bridge | Terminal log | `[Bridge] ✅ Cliente conectado` |
| Frontend DevTools | F12 → Console | `[RFID Bridge] ✅ Conectado` |

---

## 📝 Setup inicial

### 1. Añade un usuario a `backend/users.json`
```json
{
  "users": [
    {
      "uid": "0013374963",
      "nombre": "Tu nombre",
      "favoritos": []
    }
  ]
}
```

### 2. Obtén el UID de tu tag RFID

Pasa el tag por el lector en cualquier aplicación de texto. El lector emitirá el UID.

Ejemplo: `0013374963`

---

## 🐛 Problemas comunes

| Problema | Solución |
|----------|----------|
| `ws://localhost:8081 refused` | Inicia `bridge.js` |
| DevTools no muestra `[RFID Bridge]` | Recarga la página (Ctrl+R) |
| Tag no se identifica | Verifica que el UID está en `users.json` |
| Backend 502 | Reinicia `python main.py` |

---

## 📊 Archivos nuevos/modificados

```
frontend/
├── hooks/
│   └── useRFIDBridge.ts          ← NUEVO
├── components/
│   └── NFCReader.tsx              ← MODIFICADO
└── app/
    └── page.tsx                   ← MODIFICADO

root/
├── bridge.js.EJEMPLO              ← REFERENCIA
├── GUIA_INTEGRACION_RFID.md      ← COMPLETA
├── GUIA_TESTING.md                ← TESTS
└── DIAGRAMA_FLUJO.md              ← VISUALES
```

---

## 🎯 Flujo en una línea

```
[Tag RFID] → [bridge.js] → [ws://localhost:8081] → [Frontend] → [/identificar] → [Usuario!]
```

---

## 💡 Próximos pasos (opcional)

1. **Producción:** Configura `NEXT_PUBLIC_API_URL` para Vercel
2. **Logging:** Revisa logs en `GUIA_TESTING.md`
3. **Personalización:** Modifica `handleTagRead` en `page.tsx`

---

## 📚 Documentación

- **Detalles:** `GUIA_INTEGRACION_RFID.md`
- **Testing:** `GUIA_TESTING.md`
- **Diagramas:** `DIAGRAMA_FLUJO.md`

---

**¿Necesitas ayuda?** Revisa los archivos de guía o ve a los logs del navegador (F12).
