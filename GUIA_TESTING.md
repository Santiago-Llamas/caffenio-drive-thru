# 🧪 Guía de Testing Manual - Sistema RFID + NFC

Este documento describe cómo validar que todo funciona correctamente.

---

## 1️⃣ Testing del Backend (FastAPI)

### ✅ Paso 1.1: Verificar que el servidor está corriendo

```bash
curl http://localhost:8000/
```

**Esperado:**
```json
{"message": "Bienvenido al servidor backend de la Cafetería Caffenio"}
```

### ✅ Paso 1.2: Probar el endpoint `/identificar` con un UID válido

**Primero, verifica qué UIDs hay en `backend/users.json`:**

```bash
cat backend/users.json
```

Debería verse algo como:
```json
{
  "users": [
    {
      "uid": "0013374963",
      "nombre": "Juan Pérez",
      "favoritos": [1, 5, 10]
    }
  ]
}
```

**Luego, prueba el endpoint:**

```bash
curl -X POST http://localhost:8000/identificar \
  -H "Content-Type: application/json" \
  -d '{"uid": "0013374963"}'
```

**Esperado:**
```json
{
  "success": true,
  "user": {
    "uid": "0013374963",
    "nombre": "Juan Pérez",
    "favoritos": [1, 5, 10]
  }
}
```

### ✅ Paso 1.3: Probar con un UID no registrado

```bash
curl -X POST http://localhost:8000/identificar \
  -H "Content-Type: application/json" \
  -d '{"uid": "9999999999"}'
```

**Esperado:**
```json
{
  "success": false,
  "message": "Tag no vinculado. ¿Deseas vincularlo a tu cuenta Mi CAFFENIO?"
}
```

---

## 2️⃣ Testing del Bridge RFID (Node.js)

### ✅ Paso 2.1: Verificar que el bridge está corriendo

En la consola del bridge deberías ver:
```
[Bridge] Iniciando servidor WebSocket en ws://localhost:8081
[Bridge] Monitoreo de teclado iniciado. Acerca un tag RFID...
[Bridge] 🚀 Servidor WebSocket escuchando en ws://localhost:8081
```

### ✅ Paso 2.2: Pasa un tag RFID por el lector

Acerca tu tag/llavero al lector USB.

**Esperado en consola del bridge:**
```
[Bridge] Tag RFID detectado: 0013374963
[Bridge] ✅ Cliente conectado desde el frontend
[Bridge] Mensaje enviado a cliente: 0013374963
```

---

## 3️⃣ Testing del Frontend (Next.js)

### ✅ Paso 3.1: Verificar que el frontend cargó

1. Abre `http://localhost:3000` en tu navegador
2. Deberías ver la pantalla de bienvenida con el botón grande "Presiona para iniciar"
3. Abre DevTools (F12 → Console)

### ✅ Paso 3.2: Verificar la conexión del hook RFID

En la consola del navegador (DevTools) deberías ver:

```
[RFID Bridge] Conectando a ws://localhost:8081...
[RFID Bridge] ✅ Conectado al bridge RFID
```

Si ves este mensaje, ¡el hook está conectado! ✅

### ✅ Paso 3.3: Pasar un tag y verificar el flujo

1. Presiona el botón grande en la pantalla de bienvenida
2. Se abrirá la pantalla de identificación con 3 opciones: NFC, QR e Invitado
3. Acerca tu tag RFID al lector USB

**Esperado en la consola del navegador:**
```
[RFID Bridge] Tag leído: 0013374963
[NFCReader] Procesando UID: 0013374963
[App] Procesando UID: 0013374963
[App] ✅ Usuario identificado: {nombre: "Juan Pérez", uid: "0013374963", ...}
```

**Esperado en la pantalla:**
- Se cierra la pantalla de identificación
- Se abre la pantalla de favoritos
- Se muestra el nombre del usuario (o los favoritos del usuario)

### ✅ Paso 3.4: Probar con un tag no registrado

Si tienes otro tag cuyo UID no está en `users.json`:

1. Pasa el tag por el lector
2. En la consola verás:
```
[RFID Bridge] Tag leído: 9999999999
[App] ❌ Tag no vinculado: 9999999999
```

**Esperado en la pantalla:**
- Se muestra una alerta: `Tag no registrado (UID: 9999999999). ¿Deseas vincularlo a tu cuenta?`

---

## 4️⃣ Testing del flujo NFC (en móvil)

### ✅ Paso 4.1: Verificar NFC en dispositivo móvil

1. En un móvil Android/iOS con NFC activado, abre `http://localhost:3000` (o `https://tu-app-en-vercel.app`)
2. Ve a la pantalla de identificación
3. Presiona el botón "Identifícate con NFC"
4. Acerca tu tag NFC al móvil

**Esperado:**
- Se lee el UID del tag NFC
- Se envía al backend
- Se identifica el usuario
- Se abre la pantalla de favoritos

**En la consola del navegador (móvil) verás:**
```
[NFC] Tag detectado, UID: 04:CD:FF:01:43:35:81
[NFCReader] Procesando UID: 04:CD:FF:01:43:35:81
[App] Procesando UID: 04:CD:FF:01:43:35:81
```

---

## 5️⃣ Testing de Integración: Todos los sistemas juntos

### Escenario: Demostración en vivo

**Setup:**
- Backend (FastAPI) corriendo en `http://localhost:8000`
- Bridge (Node.js) corriendo en `ws://localhost:8081`
- Frontend (Next.js) corriendo en `http://localhost:3000`
- Lector RFID USB conectado a la laptop

**Flujo de demostración:**

1. ✅ Abre el navegador en `http://localhost:3000`
   - Verifica: Se carga la pantalla de bienvenida
   - DevTools: Se ve `[RFID Bridge] ✅ Conectado al bridge RFID`

2. ✅ Presiona el botón de bienvenida
   - Verifica: Se abre la pantalla de identificación

3. ✅ Pasa un tag RFID por el lector
   - Verifica: Se identifican datos del usuario
   - Verifica: Se abre la pantalla de favoritos con el nombre del usuario

4. ✅ Presiona atrás o regresa a la pantalla de identificación

5. ✅ En móvil, abre la misma app y prueba NFC
   - Verifica: Funciona de la misma forma

---

## 🔍 Checklist de Debugging

### El frontend no conecta al bridge

- [ ] ¿Está el bridge corriendo? (`node bridge.js` en otra terminal)
- [ ] ¿El bridge escucha en `ws://localhost:8081`?
- [ ] ¿El frontend está en `localhost` (no IP externa)?
- [ ] ¿El firewall permite WebSocket en localhost?
- [ ] ¿El puerto 8081 está disponible? (`lsof -i :8081` en Mac/Linux)

### El tag RFID no se detecta

- [ ] ¿El lector USB está conectado?
- [ ] ¿El lector emite datos? (intenta escribir manualmente en cualquier aplicación)
- [ ] ¿El bridge captura la entrada? (verifica logs de `bridge.js`)
- [ ] ¿El tag está dentro del rango del lector?

### El backend no reconoce el UID

- [ ] ¿El UID en `users.json` es exacto? (puede tener mayúsculas/minúsculas)
- [ ] ¿El archivo `users.json` tiene el formato correcto?
- [ ] ¿El backend está reiniciado después de cambiar `users.json`?

### El usuario se identifica pero no avanza a favoritos

- [ ] ¿La respuesta del backend tiene el campo `success: true`?
- [ ] ¿El usuario en `users.json` tiene todos los campos requeridos?
- [ ] ¿Hay errores en la consola del navegador?

---

## 📊 Test Case Table

| ID | Descripción | Entrada | Esperado | Estado |
|----|----|----|----|-----|
| TC1 | Backend responde | GET `/` | `{"message": "..."}` | ✅ |
| TC2 | UID válido | POST `/identificar` (UID registrado) | `{"success": true, "user": {...}}` | ✅ |
| TC3 | UID inválido | POST `/identificar` (UID no registrado) | `{"success": false, "message": "..."}` | ✅ |
| TC4 | Bridge recibe tag | RFID pasado por lector | Logs: `Tag RFID detectado: XXX` | ✅ |
| TC5 | Frontend conecta bridge | Carga `localhost:3000` | Logs: `✅ Conectado al bridge RFID` | ✅ |
| TC6 | RFID flujo completo | RFID en laptop | Pantalla de favoritos abierta | ✅ |
| TC7 | NFC flujo completo | NFC en móvil | Pantalla de favoritos abierta | ✅ |
| TC8 | UID no registrado | RFID no en `users.json` | Alert mostrado, backend responde con `false` | ✅ |

---

## 📝 Notas importantes

1. **No mezclar puertos:** Asegúrate de que:
   - Backend: `8000`
   - Bridge: `8081`
   - Frontend: `3000`

2. **Localhost solo:** El hook RFID solo funciona en `localhost`. En producción (Vercel), se deshabilita automáticamente.

3. **CORS:** Si el frontend está en un dominio diferente, asegúrate de que el backend tiene CORS habilitado:
   ```python
   # En main.py
   allow_origins=["http://localhost:3000", "https://tu-dominio.com"]
   ```

4. **UIDs sensibles a caso:** Algunos backends podrían ser sensibles a mayúsculas. El backend actual hace búsqueda `.lower()`, así que `0013374963` y `0013374963` son iguales.

---

## 🎉 ¡Todo funcionando!

Si pasaste todos los tests, tu sistema está listo para demostración en vivo. ¡Felicidades! 🚀
