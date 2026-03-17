# Corregir "Ident authentication failed" en PostgreSQL (EC2)

El error ocurre porque PostgreSQL está configurado con **ident**: solo el usuario del sistema `postgres` puede conectarse como usuario de base de datos `postgres`. Tu backend corre como `ec2-user` y necesita entrar con **usuario + contraseña**.

---

## Pasos en EC2 (por SSH)

### 1. Editar la configuración de autenticación

```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

Busca las líneas que dicen `ident` para IPv4 e IPv6 local (algo como):

```
# IPv4 local connections:
host    all    all    127.0.0.1/32    ident
# IPv6 local connections:
host    all    all    ::1/128         ident
```

**Cámbialas** para usar `scram-sha-256` (o `md5` si tu versión es antigua):

```
# IPv4 local connections:
host    all    all    127.0.0.1/32    scram-sha-256
# IPv6 local connections:
host    all    all    ::1/128         scram-sha-256
```

Guarda: `Ctrl+O`, Enter, `Ctrl+X`.

### 2. Reiniciar PostgreSQL

```bash
sudo systemctl restart postgresql
```

### 3. Asignar contraseña al usuario postgres

Usa la **misma contraseña** que tienes en el `.env` del servidor en `DB_PASSWORD`:

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'TU_PASSWORD_DEL_ENV';"
```

Sustituye `TU_PASSWORD_DEL_ENV` por la contraseña real (la de `DB_PASSWORD` en `~/backend/.env`).

### 4. Reiniciar el backend

```bash
cd ~/backend
pm2 restart backend
pm2 logs backend --lines 20
```

Deberías ver que la base de datos sincroniza sin el error "Ident authentication failed" y que el servidor escucha en el puerto (por ejemplo 5000).

---

## Resumen

| Paso | Acción |
|------|--------|
| 1 | En `pg_hba.conf`: cambiar `ident` → `scram-sha-256` para 127.0.0.1 y ::1 |
| 2 | `sudo systemctl restart postgresql` |
| 3 | `ALTER USER postgres WITH PASSWORD 'tu_password';` |
| 4 | `pm2 restart backend` |

Si en el `.env` usas otro usuario (por ejemplo `tu_usuario`), en el paso 3 cambia `postgres` por ese usuario y asegúrate de que la base de datos exista y sea accesible para ese usuario.
