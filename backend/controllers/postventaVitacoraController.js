const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const VITACORA_FILE = path.join(DATA_DIR, 'postventa_vitacora.json');

const ESTADOS = ['pendiente', 'en_analisis', 'resuelto', 'no_quiso_solucionar'];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

async function readVitacora() {
  try {
    const content = await fs.readFile(VITACORA_FILE, 'utf8');
    const list = JSON.parse(content || '[]');
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

async function writeVitacora(list) {
  await ensureDataDir();
  await fs.writeFile(VITACORA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

/**
 * GET /api/postventa-vitacora
 * Lista todas las entradas de la bitácora, ordenadas por fecha (más reciente primero)
 */
exports.list = async (req, res) => {
  try {
    const list = await readVitacora();
    list.sort((a, b) => new Date(b.fecha_registro || b.created_at) - new Date(a.fecha_registro || a.created_at));
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error listando bitácora postventa:', err);
    res.status(500).json({ success: false, message: 'Error al listar la bitácora' });
  }
};

/**
 * POST /api/postventa-vitacora
 * Crea una nueva entrada (cliente reclamando)
 * Body: { cliente_id?, cliente_nombre?, cliente_email?, numero_contrato?, anotacion?, asignado_a? }
 */
exports.create = async (req, res) => {
  try {
    const {
      cliente_id,
      cliente_nombre,
      cliente_email,
      numero_contrato,
      anotacion,
      asignado_a
    } = req.body || {};

    const userName = req.user?.nombre || req.user?.email || 'Postventa';
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      cliente_id: cliente_id || null,
      cliente_nombre: (cliente_nombre || '').trim() || null,
      cliente_email: (cliente_email || '').trim() || null,
      numero_contrato: (numero_contrato || '').trim() || null,
      fecha_registro: new Date().toISOString().split('T')[0],
      anotaciones: anotacion ? [{ fecha: new Date().toISOString(), texto: anotacion, por: userName }] : [],
      estado: 'pendiente',
      asignado_a: asignado_a || userName,
      creado_por: userName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const list = await readVitacora();
    list.unshift(entry);
    await writeVitacora(list);

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error('Error creando entrada bitácora:', err);
    res.status(500).json({ success: false, message: 'Error al crear la entrada' });
  }
};

/**
 * PATCH /api/postventa-vitacora/:id
 * Actualiza una entrada: añade anotación y/o cambia estado
 * Body: { anotacion?, estado? }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { anotacion, estado } = req.body || {};

    const list = await readVitacora();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
    }

    const entry = list[index];
    const userName = req.user?.nombre || req.user?.email || 'Postventa';

    if (anotacion && typeof anotacion === 'string' && anotacion.trim()) {
      entry.anotaciones = entry.anotaciones || [];
      entry.anotaciones.push({
        fecha: new Date().toISOString(),
        texto: anotacion.trim(),
        por: userName
      });
    }
    if (estado && ESTADOS.includes(estado)) {
      entry.estado = estado;
    }
    entry.updated_at = new Date().toISOString();

    await writeVitacora(list);
    res.json({ success: true, data: entry });
  } catch (err) {
    console.error('Error actualizando bitácora:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
};

/**
 * GET /api/postventa-vitacora/plantilla-72h
 * Devuelve el texto de la plantilla "72 horas hábiles" con el nombre de quien analiza
 * Query: asignado_a (opcional, si no se envía se usa el usuario actual)
 */
exports.getPlantilla72h = (req, res) => {
  try {
    const asignado = req.query.asignado_a || req.user?.nombre || req.user?.email || 'el equipo de Postventa';
    const texto = `Le informamos que su caso ha sido recibido. Se le contestará en un plazo de 72 horas hábiles.\n\nLa persona que analizará su caso es: ${asignado}.\n\nQuedamos atentos.`;
    res.json({ success: true, plantilla: texto, asignado_a: asignado });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al generar plantilla' });
  }
};
