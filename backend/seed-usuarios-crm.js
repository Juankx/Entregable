/**
 * Seed de usuarios CRM para EC2 / producción.
 * Inserta o actualiza los 8 usuarios de dashboards sin borrar tablas.
 * Uso: node seed-usuarios-crm.js
 * Requiere: .env con DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
const { Client } = require('pg');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const PASSWORD_PLAIN = 'admin123';

const USUARIOS_CRM = [
  { nombre: 'Administrador', email: 'admin@crm.com', rol: 'admin' },
  { nombre: 'Contratos', email: 'contratos@crm.com', rol: 'contratos' },
  { nombre: 'Postventa', email: 'postventa@crm.com', rol: 'postventa' },
  { nombre: 'Cobranzas', email: 'cobranzas@crm.com', rol: 'cobranzas' },
  { nombre: 'Atención Cliente', email: 'atencion@crm.com', rol: 'atencion' },
  { nombre: 'Cliente Blue', email: 'cliente@crm.com', rol: 'blue' },
  { nombre: 'Cliente Gold', email: 'clienteib1@crm.com', rol: 'gold' },
  { nombre: 'Cliente Black', email: 'clienteib2@crm.com', rol: 'black' },
];

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    const hashedPassword = await bcryptjs.hash(PASSWORD_PLAIN, 10);

    for (const u of USUARIOS_CRM) {
      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol, activo)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (email) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           password = EXCLUDED.password,
           rol = EXCLUDED.rol,
           activo = EXCLUDED.activo,
           fecha_actualizacion = CURRENT_TIMESTAMP`,
        [u.nombre, u.email, hashedPassword, u.rol]
      );
      console.log(`   ${u.email} → ${u.rol}`);
    }

    console.log('');
    console.log('✅ Usuarios CRM actualizados. Contraseña: ' + PASSWORD_PLAIN);
    console.log('   Ver CREDENCIALES-CRM.md para la lista de dashboards.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
