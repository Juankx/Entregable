# Corrige permisos del archivo .pem para que SSH/SCP lo acepte.
# Ejecutar una vez. Si falla, abre PowerShell "Como administrador" y vuelve a ejecutar.

$PEM = Join-Path $PSScriptRoot "backend\innovationparclavenuevo.pem"
if (-not (Test-Path $PEM)) {
    Write-Host "No se encuentra: $PEM" -ForegroundColor Red
    exit 1
}

# Quitar herencia y dejar solo el usuario actual con lectura (evita "UNPROTECTED PRIVATE KEY FILE")
icacls $PEM /inheritance:r
icacls $PEM /grant:r "$($env:USERNAME):R"

Write-Host "Permisos del PEM actualizados. Vuelve a ejecutar deploy-backend-ec2.ps1" -ForegroundColor Green
