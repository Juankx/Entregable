# Configuración de CloudFront para Innovation Business

Objetivo: servir el frontend desde S3 a través de CloudFront y, opcionalmente, enrutar `/api` al backend en EC2.

---

## Parte 1: Crear la distribución (solo frontend desde S3)

### 1. Ir a CloudFront

En la consola AWS: **CloudFront** → **Create distribution**.

### 2. Origen (Origin 1 – S3)

- **Origin domain:** elige el bucket `innovationbussines.s3.us-east-2.amazonaws.com` (no el endpoint de “website”).
- **Name:** se rellena solo (ej. `S3-innovationbussines`).
- **Origin access:**  
  - **Origin access control settings (recommended)** → **Create control setting**  
  - Dejar valores por defecto → **Create**  
  - En la pantalla de CloudFront, confirma que el origen use esa OAC.
- **Enable Origin Shield:** No (opcional).

### 3. Configuración por defecto (Default Cache Behavior)

- **Viewer protocol policy:** Redirect HTTP to HTTPS (o “HTTP and HTTPS” si aún no tienes certificado).
- **Allowed HTTP methods:** GET, HEAD, OPTIONS.
- **Cache policy:** CachingOptimized (o **CachingDisabled** si quieres probar sin caché).
- **Compress objects automatically:** Yes.

### 4. Configuración general (Settings)

- **Price class:** Use only North America and Europe (o la que prefieras).
- **Alternate domain names (CNAMEs):** vacío por ahora (luego puedes poner ej. `app.tudominio.com`).
- **Custom SSL certificate:** Default CloudFront certificate si no usas dominio propio.
- **Default root object:** `index.html`.
- **Error pages (Custom error responses):**  
  Para que la SPA (React) funcione al refrescar en rutas como `/login` o `/admin`:

  - **Create custom error response**
    - **HTTP error code:** 403
    - **Customize error response:** Yes
    - **Response page path:** `/index.html`
    - **HTTP response code:** 200
  - **Create custom error response**
    - **HTTP error code:** 404
    - **Customize error response:** Yes
    - **Response page path:** `/index.html`
    - **HTTP response code:** 200

### 5. Crear la distribución

**Create distribution**. En 5–10 minutos el estado pasará a **Enabled**.

### 6. Permitir que CloudFront acceda al bucket

CloudFront te mostrará un mensaje tipo: “The S3 bucket policy needs to be updated”.  
Haz clic en **Copy policy**, luego:

- Ve a **S3** → bucket **innovationbussines** → **Permissions** → **Bucket policy** → **Edit**.
- Pega la política copiada (sustituye la que haya) → **Save changes**.

Si no aparece el botón, en la misma pantalla de CloudFront suele haber un enlace directo al bucket para aplicar la política.

---

## Parte 2: Probar el frontend

Cuando la distribución esté **Enabled**:

- **URL de la distribución:** `https://d1234abcd.cloudfront.net` (tu ID será distinto).
- Abre esa URL en el navegador: deberías ver la app.
- El frontend ya usa `http://100.48.64.159:5000/api` como API (lo definiste en el build). Esa llamada va directa al EC2; no pasa por CloudFront.

---

## Parte 3 (Opcional): Pasar el API por CloudFront

Si quieres que todo vaya por el mismo dominio (ej. `https://d1234abcd.cloudfront.net` para la app y `https://d1234abcd.cloudfront.net/api` para el backend):

### 1. Añadir un segundo origen (EC2)

- En la distribución → **Origins** → **Create origin**.
- **Origin domain:**  
  - No puedes poner solo la IP. Opciones:  
    - Usar el **DNS público de la instancia**, ej. `ec2-100-48-64-159.compute-1.amazonaws.com`,  
    - O un nombre propio (ej. `api.tudominio.com`) que apunte a la IP de la EC2.
- **Protocol:** HTTP (o HTTPS si ya tienes certificado en EC2).
- **Name:** ej. `API-EC2`.
- **HTTP port:** 80 o el puerto donde escucha tu app (5000).  
  **Importante:** CloudFront por defecto usa 80/443. Si tu backend escucha en 5000, en “Origin” suele usarse un proxy (Nginx) en EC2 en 80 que reenvíe a 5000, o configurar **Custom origin** con puerto 5000 si tu versión de consola lo permite (en “Origin protocol policy” y puerto).

En muchas consolas CloudFront el “Origin domain” para custom origin puede ser:

- `ec2-100-48-64-159.compute-1.amazonaws.com`
- Y en **Origin protocol policy** = HTTP only, **HTTP port** = 5000 (si la interfaz lo permite).

### 2. Crear un comportamiento para `/api`

- **Behaviors** → **Create behavior**.
- **Path pattern:** `api/*`
- **Origin:** el origen EC2 que creaste (ej. `API-EC2`).
- **Viewer protocol policy:** Redirect HTTP to HTTPS (o la misma que el default).
- **Cache policy:** **CachingDisabled** (para el API).
- **Create**.

### 3. Ajustar el frontend para usar la misma URL que CloudFront

Si el API pasa por CloudFront:

- En el próximo build del frontend usa:  
  `VITE_API_URL=https://d1234abcd.cloudfront.net/api`  
  (sustituye por tu URL de distribución).
- Vuelve a ejecutar `.\deploy-frontend-s3.ps1` (o el script que use `VITE_API_URL`).

Si no pasas el API por CloudFront, no hace falta cambiar nada: el frontend sigue usando `http://100.48.64.159:5000/api`.

---

## Resumen rápido

| Paso | Acción |
|------|--------|
| 1 | CloudFront → Create distribution |
| 2 | Origin = bucket S3, OAC, default root `index.html` |
| 3 | Error pages 403 y 404 → `/index.html` con código 200 |
| 4 | Aplicar la política de bucket que te indica CloudFront en S3 |
| 5 | Probar con la URL `https://xxxxx.cloudfront.net` |

Cuando tengas la URL de tu distribución (ej. `https://d1234abcd.cloudfront.net`), puedes usarla como “URL del frontend” y, si configuraste el comportamiento `/api`, como base del API también.
