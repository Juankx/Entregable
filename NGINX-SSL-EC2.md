# Nginx + SSL en EC2 para api.innovationbussines.com

Guía para exponer tu backend Node (puerto 5000) por HTTPS usando Nginx y Let's Encrypt en una instancia EC2.

---

## Requisitos previos

- Instancia EC2 con tu backend Node corriendo en el puerto **5000** (pm2 o similar).
- Dominio **innovationbussines.com** (o el que uses) con acceso al DNS para crear un subdominio.
- EC2 con **IP elástica (Elastic IP)** para que la IP no cambie al reiniciar.

---

## 1. DNS: crear el subdominio del API

En el panel donde gestionas el DNS del dominio (Route 53, Cloudflare, GoDaddy, etc.):

1. Crea un registro **A** (o **CNAME** si te lo indican):
   - **Nombre / Host:** `api` (resultado: `api.innovationbussines.com`)
   - **Valor / Apunta a:** la **IP pública** de tu instancia EC2 (la IP elástica si la tienes asignada)
   - TTL: 300 o por defecto

Espera unos minutos (hasta 1 hora en algunos proveedores) a que el DNS propague.

Comprueba desde tu PC:
```bash
ping api.innovationbussines.com
```
Debe responder con la IP de tu EC2.

---

## 2. Conectar por SSH a EC2

```bash
ssh -i "tu-llave.pem" ec2-user@TU_IP_EC2
```

(Si usas Ubuntu, el usuario suele ser `ubuntu` en lugar de `ec2-user`.)

---

## 3. Abrir el puerto 443 en el Security Group

En AWS: **EC2 → Security Groups →** el grupo asociado a tu instancia:

- **Inbound rules → Edit:**
  - Tipo: **HTTPS**
  - Puerto: **443**
  - Origen: **0.0.0.0/0** (o restringe después por IP si quieres)
- Guardar.

---

## 4. Instalar Nginx

**Amazon Linux 2023** (AL2023; no usa `amazon-linux-extras`):

```bash
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**Amazon Linux 2** (si tu instancia es AL2):

```bash
sudo yum update -y
sudo amazon-linux-extras install nginx1 -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

**Ubuntu:**

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 5. Instalar Certbot (Let's Encrypt)

**Amazon Linux 2023** (usar venv; no hay `pip3` global ni paquete certbot en dnf):

```bash
sudo dnf install -y augeas-libs
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

**Amazon Linux 2:**

```bash
sudo yum install -y python3
sudo pip3 install certbot certbot-nginx
```

**Ubuntu:**

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## 6. Configurar Nginx para el API (antes de SSL)

Crear el sitio para `api.innovationbussines.com` y proxy al Node:

```bash
sudo nano /etc/nginx/conf.d/api-innovationbussines.conf
```

Pega esta configuración (sustituye `api.innovationbussines.com` si usas otro dominio):

```nginx
# Redirigir HTTP a HTTPS (se activará bien después de tener SSL)
# Por ahora solo proxy
server {
    listen 80;
    server_name api.innovationbussines.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Guarda (Ctrl+O, Enter, Ctrl+X).

Comprueba la configuración y recarga Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Obtener el certificado SSL con Certbot

Ejecuta (sustituye el email):

```bash
sudo certbot --nginx -d api.innovationbussines.com --non-interactive --agree-tos -m tu-email@ejemplo.com
```

Certbot modificará automáticamente la config de Nginx para usar HTTPS y redirigir HTTP → HTTPS.

**Renovación automática** (Let's Encrypt caduca a los 90 días):

```bash
sudo certbot renew --dry-run
```

Si no da error, el cron que instala Certbot renovará solo. En Amazon Linux a veces hay que añadir un cron:

```bash
echo "0 3 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab
```

---

## 8. Revisar la configuración final de Nginx

Después de Certbot, algo así debería estar en `/etc/nginx/conf.d/` o en el sitio que Certbot haya creado:

```bash
sudo cat /etc/nginx/conf.d/api-innovationbussines.conf
```

Verás líneas con `listen 443 ssl`, `ssl_certificate` y `ssl_certificate_key`. Si quieres tener todo en un solo archivo, puedes usar esta versión manual (solo si Certbot no lo hizo bien):

```nginx
server {
    listen 80;
    server_name api.innovationbussines.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.innovationbussines.com;

    ssl_certificate /etc/letsencrypt/live/api.innovationbussines.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.innovationbussines.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 9. CORS en el backend (Node)

Tu frontend está en `https://innovationbussines.com` y el API en `https://api.innovationbussines.com`. El navegador enviará el header `Origin: https://innovationbussines.com`. El backend debe aceptar ese origen.

En tu `server.js` (o donde configures CORS), asegúrate de tener algo como:

```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'https://innovationbussines.com',
    'https://www.innovationbussines.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

Reinicia el backend después de cambiar CORS.

---

## 10. Probar el API por HTTPS

Desde tu PC:

```bash
curl -I https://api.innovationbussines.com/api/chatbot/faq
```

Debe devolver `200` (o el código que corresponda), sin errores de certificado.

En el navegador:  
`https://api.innovationbussines.com/api/chatbot/faq`  
— debe cargar sin avisos de “conexión no segura”.

---

## 11. Frontend: build y despliegue

En tu máquina local (o en el pipeline donde construyas el frontend):

- Asegúrate de que en **`.env.production`** tengas:
  ```env
  VITE_API_URL=https://api.innovationbussines.com/api
  ```
- Luego:
  ```bash
  cd frontend
  npm run build
  ```
- Sube el contenido de `dist/` a S3 (o tu hosting). El sitio en `https://innovationbussines.com` dejará de tener “contenido mixto” y el login/chatbot usarán el API por HTTPS.

---

## Resumen de pasos

| Paso | Acción |
|------|--------|
| 1 | DNS: A record `api.innovationbussines.com` → IP de EC2 |
| 2 | Security Group: abrir puerto 443 |
| 3 | En EC2: instalar Nginx y Certbot |
| 4 | Configurar Nginx proxy a `http://127.0.0.1:5000` |
| 5 | `sudo certbot --nginx -d api.innovationbussines.com ...` |
| 6 | CORS en Node: permitir `https://innovationbussines.com` |
| 7 | Build frontend con `VITE_API_URL=https://api.innovationbussines.com/api` y desplegar |

Si en algún paso te sale un error concreto (certbot, Nginx o CORS), copia el mensaje y lo vemos.
