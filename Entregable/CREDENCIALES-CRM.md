# Credenciales CRM – Dashboards

Contraseña común para todos los usuarios listados: **admin123**

| Email | Dashboard | Ruta |
|-------|-----------|------|
| contratos@crm.com | Dashboard Contratos | `/dashboard-contratos` |
| postventa@crm.com | Dashboard Postventa | `/dashboard-postventa` |
| cobranzas@crm.com | Dashboard Cobranzas | `/dashboard-cobranzas` |
| atencion@crm.com | Dashboard Atención al cliente | `/dashboard-atencion` |
| cliente@crm.com | Dashboard Cliente Blue | `/cliente` |
| clienteib1@crm.com | Dashboard Cliente Gold | `/cliente-ib1` |
| clienteib2@crm.com | Dashboard Cliente Black | `/cliente-black` |
| admin@crm.com | Dashboard Admin | `/admin` |

## Poblar la base de datos

### Primera vez (crea DB, tablas e inserta usuarios y datos de prueba)
```bash
cd backend
npm run init-db
```

### Solo usuarios (EC2 / DB ya existente; no borra tablas)
```bash
cd backend
npm run seed-usuarios
# o
node seed-usuarios-crm.js
```

Requisitos: archivo `.env` en `backend/` con `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

**Importante:** Cambiar las contraseñas en producción.
