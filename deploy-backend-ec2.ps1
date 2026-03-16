# =============================================================================
# Script de despliegue del backend a EC2 (Innovation Business)
# Uso: .\deploy-backend-ec2.ps1
# Requiere: OpenSSH (ssh/scp) en PATH (viene con Windows 10/11 o Git)
# =============================================================================

$ErrorActionPreference = "Stop"

# --- Configuración: instancia innovationbackend (EC2 Console) ---
$EC2_IP       = "3.142.221.214"
$EC2_USER     = "ec2-user"   # usar "ubuntu" si la AMI es Ubuntu
# Par de claves para SSH/SCP (instancia 3.142.221.214)
$PEM_PATH     = "backend\innovationparclavenuevo.pem"
$BACKEND_SRC  = "backend"
$REMOTE_DIR   = "~/backend"

# Rutas absolutas desde la carpeta del script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PEM_FULL   = Join-Path $ScriptDir $PEM_PATH
$BACKEND_FULL = Join-Path $ScriptDir $BACKEND_SRC

if (-not (Test-Path $PEM_FULL)) {
    Write-Host "ERROR: No se encuentra el PEM: $PEM_FULL" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $BACKEND_FULL)) {
    Write-Host "ERROR: No se encuentra la carpeta backend: $BACKEND_FULL" -ForegroundColor Red
    exit 1
}

# Carpeta temporal para subir (sin node_modules ni .env)
$TempUpload = Join-Path $env:TEMP "innovation-backend-upload"
if (Test-Path $TempUpload) { Remove-Item $TempUpload -Recurse -Force }
New-Item -ItemType Directory -Path $TempUpload | Out-Null

Write-Host "Preparando archivos (excluyendo node_modules, .env, .git, .pem)..." -ForegroundColor Cyan
$exclude = @('node_modules', '.env', '.git')
Get-ChildItem -Path $BACKEND_FULL -Force | Where-Object { $exclude -notcontains $_.Name -and $_.Extension -ne '.pem' } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $TempUpload $_.Name) -Recurse -Force
}

Write-Host "Subiendo backend a EC2 ($EC2_USER@$EC2_IP)..." -ForegroundColor Cyan
# Normalizar ruta PEM para scp (sin espacios raros)
$PEMNorm = (Resolve-Path $PEM_FULL).Path
& scp -i "`"$PEMNorm`"" -o StrictHostKeyChecking=accept-new -r "$TempUpload\*" "${EC2_USER}@${EC2_IP}:${REMOTE_DIR}/"
if ($LASTEXITCODE -ne 0) {
    Remove-Item $TempUpload -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "ERROR: Fallo al subir archivos (scp). Revisa PEM, IP y que el security group permita SSH (22)." -ForegroundColor Red
    exit 1
}

Remove-Item $TempUpload -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Archivos subidos correctamente." -ForegroundColor Green

# Ejecutar en EC2: npm install y reiniciar backend (prioridad: systemd > pm2 > nohup)
$OneLiner = "cd $REMOTE_DIR && npm install --production && (systemctl is-active --quiet innovation-backend.service 2>/dev/null && sudo systemctl restart innovation-backend.service && echo 'Backend reiniciado (systemd).') || (command -v pm2 >/dev/null 2>&1 && (pm2 restart backend 2>/dev/null || pm2 start server.js --name backend) && pm2 save 2>/dev/null && echo 'Backend reiniciado (pm2).') || (pkill -f 'node server.js' 2>/dev/null; sleep 1; nohup node server.js > backend.log 2>&1 & echo 'Backend arrancado (nohup).')"
Write-Host "Ejecutando en EC2: npm install y reinicio del backend (systemd / pm2 / nohup)..." -ForegroundColor Cyan
& ssh -i "`"$PEMNorm`"" -o StrictHostKeyChecking=accept-new "${EC2_USER}@${EC2_IP}" $OneLiner
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO: La conexión SSH o los comandos remotos fallaron. Puedes conectarte manualmente y ejecutar:" -ForegroundColor Yellow
    Write-Host "  cd $REMOTE_DIR && npm install --production && sudo systemctl restart innovation-backend.service" -ForegroundColor Yellow
    exit 1
}

Write-Host "Despliegue completado. API: https://api.innovationbussines.com (backend en ${EC2_IP}:5000)" -ForegroundColor Green
Write-Host "Recuerda: crear/editar .env en el servidor (DB_*, JWT_SECRET, PORT) si no lo has hecho." -ForegroundColor Yellow
