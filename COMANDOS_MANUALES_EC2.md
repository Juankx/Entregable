# Comandos manuales – Backend a EC2

**Instancia:** innovationbackend  
**IP pública:** 100.48.64.159  
**DNS público:** ec2-100-48-64-159.compute-1.amazonaws.com  
**PEM:** `backend/innovationbussinesbackend.pem`

Si usas **Ubuntu** en la instancia, cambia `ec2-user` por `ubuntu` en todos los comandos.

---

## 1. Conectar por SSH

Desde PowerShell o CMD, en la carpeta del proyecto (donde está `Entregable`):

```powershell
cd "c:\Users\Elfit\OneDrive\Desktop\Programación\Innovation Bussines\Entregable"
ssh -i backend/innovationbussinesbackend.pem ec2-user@100.48.64.159
```

Si pide confirmación del host, escribe `yes`.

---

## 2. En tu PC: subir la carpeta backend con SCP

Abre **otra** terminal (deja la SSH abierta o ciérrala). En la carpeta `Entregable`:

```powershell
cd "c:\Users\Elfit\OneDrive\Desktop\Programación\Innovation Bussines\Entregable"
scp -i backend/innovationbussinesbackend.pem -r backend ec2-user@100.48.64.159:~/
```

Esto sube toda la carpeta `backend` al home del usuario en EC2 (`~/backend`).  
**Nota:** No sube `.env` si está en `.gitignore`; tendrás que crear/copiar `.env` en el servidor.

---

## 3. En EC2: instalar Node.js (solo la primera vez)

Conectado por SSH a la instancia:

**Amazon Linux 2:**

```bash
sudo yum update -y
sudo yum install -y nodejs npm
node -v
npm -v
```

**Ubuntu:**

```bash
sudo apt update -y
sudo apt install -y nodejs npm
# Si Node queda muy viejo:
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt install -y nodejs
```

---

## 4. En EC2: instalar dependencias y arrancar el backend

```bash
cd ~/backend
npm install --production
```

Crear o editar `.env` con tu base de datos y secretos (en EC2):

```bash
nano .env
```

Variables mínimas (PostgreSQL):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (clave segura en producción)
- `PORT=5000` (o el que use tu app)

Guardar: `Ctrl+O`, Enter, `Ctrl+X`.

Iniciar el servidor:

```bash
node server.js
```

Para dejarlo corriendo en segundo plano (recomendado):

```bash
sudo npm install -g pm2
pm2 start server.js --name backend
pm2 save
pm2 startup
```

---

## 5. Probar el backend

En el navegador o Postman:

- `http://100.48.64.159:5000` (o el puerto que uses)

Asegúrate de que el **security group** de la instancia permita tráfico entrante en el puerto **5000** (y 22 para SSH).

---

## 6. Resumen de comandos (copiar/pegar)

**En tu PC (una vez por despliegue):**

```powershell
cd "c:\Users\Elfit\OneDrive\Desktop\Programación\Innovation Bussines\Entregable"
scp -i backend/innovationbussinesbackend.pem -r backend ec2-user@100.48.64.159:~/
```

**En EC2 (primera vez: Node + PM2; cada vez: instalar y arrancar):**

```bash
cd ~/backend
npm install --production
# Crear/editar .env si hace falta
node server.js
# o con PM2:
# pm2 start server.js --name backend && pm2 save
```

---

## Subir solo archivos cambiados (rsync, si tienes Git Bash o WSL)

```bash
rsync -avz -e "ssh -i backend/innovationbussinesbackend.pem" --exclude 'node_modules' --exclude '.env' --exclude '.git' backend/ ec2-user@100.48.64.159:~/backend/
```

Luego en EC2: `cd ~/backend && npm install --production && pm2 restart backend`.

---

## Despliegue automático con script (PowerShell)

En la carpeta `Entregable`:

```powershell
cd "c:\Users\Elfit\OneDrive\Desktop\Programación\Innovation Bussines\Entregable"
.\deploy-backend-ec2.ps1
```

El script:

- Excluye `node_modules`, `.env` y `.git` al subir.
- Sube el contenido de `backend` a `~/backend` en EC2.
- Se conecta por SSH y ejecuta `npm install --production` y arranca con PM2 (o con `node server.js` si PM2 no está instalado).

**Requisitos:**

- OpenSSH en tu PC (Windows 10/11 suele traerlo; si no, instala Git para tener `ssh`/`scp`).
- En EC2: Node.js instalado (ver paso 3 arriba). La primera vez puede que tengas que instalar PM2: `sudo npm install -g pm2`.
- Archivo `.env` creado en el servidor (el script no sube `.env` por seguridad).
