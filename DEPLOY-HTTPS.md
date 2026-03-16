# Contenido mixto (Mixed Content) – API en HTTPS

## Qué está pasando

El mensaje **"Se ha bloqueado la carga del contenido activo mixto"** aparece cuando:

- El **sitio** se sirve por **HTTPS** (ej. `https://innovationbussines.com`)
- El **frontend** llama al API por **HTTP** (ej. `http://100.48.64.159:5000/api`)

Los navegadores **no permiten** peticiones HTTP desde una página cargada por HTTPS (política de contenido mixto). Por eso el login y el chatbot fallan con `Network Error`.

## Solución: exponer el API por HTTPS

El backend en EC2 debe ser accesible por **HTTPS**, no por HTTP.

### Opción recomendada: subdominio con SSL (ej. api.innovationbussines.com)

1. **DNS**  
   Crea un registro (A o CNAME) que apunte a la IP o al dominio de tu instancia EC2, por ejemplo:
   - `api.innovationbussines.com` → IP de EC2 (o nombre del balanceador).

2. **En EC2: Nginx (o Caddy) con SSL**  
   - Instala Nginx (o Caddy).
   - Obtén un certificado SSL para `api.innovationbussines.com` (p. ej. Let's Encrypt con `certbot`).
   - Configura el proxy al backend Node:
     - Escucha en el puerto 443 (HTTPS).
     - Hace proxy a `http://127.0.0.1:5000` (tu app Node).

3. **Build del frontend con la URL HTTPS del API**  
   Antes de hacer el build que subes a S3, define la variable de entorno con la URL **HTTPS** del API, por ejemplo:

   ```bash
   # En la máquina donde haces el build del frontend (o en tu pipeline)
   export VITE_API_URL=https://api.innovationbussines.com/api
   npm run build
   ```

   Si usas un `.env.production` en el frontend, pon ahí:

   ```
   VITE_API_URL=https://api.innovationbussines.com/api
   ```

4. **Vuelve a desplegar el frontend** (sube el nuevo `dist/` a S3 / CloudFront) para que el sitio use esa URL.

### Resumen

| Antes (bloqueado) | Después (correcto) |
|-------------------|--------------------|
| Sitio: `https://innovationbussines.com` | Igual |
| API: `http://100.48.64.159:5000/api` | API: `https://api.innovationbussines.com/api` |
| Build: `VITE_API_URL=http://...` | Build: `VITE_API_URL=https://api.innovationbussines.com/api` |

Mientras el sitio esté en HTTPS, **la URL del API en producción debe ser siempre HTTPS** (mismo dominio o subdominio con certificado válido).
