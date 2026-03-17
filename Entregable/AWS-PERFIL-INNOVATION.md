# Perfil AWS "innovation" para Innovation Business

## 1. Crear el perfil en AWS CLI

En PowerShell o CMD ejecuta (sustituye con tus datos reales):

```powershell
aws configure --profile innovation
```

Te pedirá:

| Campo | Qué poner |
|-------|-----------|
| **AWS Access Key ID** | Access key del usuario IAM con acceso a S3 (y luego CloudFront si aplica) |
| **AWS Secret Access Key** | Secret key del mismo usuario |
| **Default region name** | `us-east-2` (Ohio, misma que tu bucket) |
| **Default output format** | `json` (recomendado) |

Si ya tienes las claves en otro perfil y quieres copiarlas, puedes editar manualmente:

- **Windows:** `%USERPROFILE%\.aws\credentials`
- Añade o edita:

```ini
[innovation]
aws_access_key_id = TU_ACCESS_KEY
aws_secret_access_key = TU_SECRET_KEY
```

- En `%USERPROFILE%\.aws\config` añade:

```ini
[profile innovation]
region = us-east-2
output = json
```

## 2. Comprobar que el perfil funciona

```powershell
aws s3 ls s3://innovationbussines/ --profile innovation --region us-east-2
```

Si el bucket está vacío verás una lista vacía sin error.

## 3. Usar el perfil en comandos

En cualquier comando AWS CLI añade:

```powershell
--profile innovation
```

Ejemplo:

```powershell
aws s3 sync .\dist\ s3://innovationbussines/ --delete --region us-east-2 --profile innovation
```

El script `deploy-frontend-s3.ps1` usa este perfil por defecto.
