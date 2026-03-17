# =============================================================================
# Despliegue del frontend a S3 (bucket innovationbussines) con perfil "innovation"
# Uso: .\deploy-frontend-s3.ps1
# Requiere: AWS CLI instalado y perfil "innovation" configurado (ver AWS-PERFIL-INNOVATION.md)
# =============================================================================

$ErrorActionPreference = "Stop"

$AWS_PROFILE   = "innovation"
$S3_BUCKET     = "innovationbussines"
$AWS_REGION    = "us-east-2"
# URL del API en producción (obligatoria para evitar contenido mixto en HTTPS)
# .env.local puede sobrescribir .env.production; aquí forzamos la URL correcta en el build
$VITE_API_URL_PRODUCTION = "https://api.innovationbussines.com/api"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ScriptDir "frontend"
$DistDir = Join-Path $FrontendDir "dist"

if (-not (Test-Path $FrontendDir)) {
    Write-Host "ERROR: No se encuentra la carpeta frontend: $FrontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "Perfil AWS: $AWS_PROFILE | Bucket: $S3_BUCKET | Región: $AWS_REGION" -ForegroundColor Cyan
Write-Host ""

# Build del frontend con URL de producción forzada (sobrescribe .env.local)
$env:VITE_API_URL = $VITE_API_URL_PRODUCTION
Write-Host "Instalando dependencias y generando build (VITE_API_URL=$VITE_API_URL_PRODUCTION)..." -ForegroundColor Cyan
Push-Location $FrontendDir
try {
    npm ci 2>$null
    if ($LASTEXITCODE -ne 0) { npm install }
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Fallo en npm run build" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

if (-not (Test-Path $DistDir)) {
    Write-Host "ERROR: No se generó la carpeta dist en $DistDir" -ForegroundColor Red
    exit 1
}

# Sincronizar a S3 con el perfil innovation
Write-Host "Subiendo a S3 (s3://$S3_BUCKET/) con perfil $AWS_PROFILE..." -ForegroundColor Cyan
& aws s3 sync $DistDir "s3://$S3_BUCKET/" --delete --region $AWS_REGION --profile $AWS_PROFILE
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al subir a S3. Revisa:" -ForegroundColor Red
    Write-Host "  1. Perfil configurado: aws configure --profile innovation" -ForegroundColor Yellow
    Write-Host "  2. Permisos del usuario IAM (s3:PutObject, s3:DeleteObject, etc.)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Despliegue completado. Frontend en S3 bucket: $S3_BUCKET" -ForegroundColor Green
Write-Host "URL del bucket (si tienes hosting estático o CloudFront): ver en consola AWS" -ForegroundColor Gray
