/**
 * Normaliza datos de cliente y contrato desde distintas estructuras de plantilla
 * (contrato-prestacion-servicios, solicitud-activacion, GestionContratos form, etc.)
 */
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStr(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

/**
 * Extrae datos del cliente desde cualquier estructura de plantilla
 */
function extraerCliente(plantilla) {
  const c = plantilla.cliente || {};
  const contratante = plantilla.contratante || {};
  const client = plantilla.client || {};

  const nombres = toStr(c.nombres_completos || contratante.nombres_completos || client.full_name);
  const partes = nombres.split(/\s+/).filter(Boolean);
  const first_name = partes[0] || '';
  const last_name = partes.slice(1).join(' ') || '';

  return {
    first_name,
    last_name,
    document_number: toStr(c.cedula || contratante.cedula || client.document_number),
    phone: toStr(c.telefono || contratante.telefono),
    ciudad: toStr(c.ciudad || contratante.ciudad),
    pais: toStr(c.pais || contratante.pais || 'Ecuador'),
    email: toStr(c.correo || c.email || contratante.correo),
    direccion: toStr(c.direccion || contratante.direccion)
  };
}

/**
 * Extrae número de contrato y valor desde cualquier estructura de plantilla
 */
function extraerContrato(plantilla) {
  const doc = plantilla.documento || {};
  const contrato = plantilla.contrato || {};
  const contract = plantilla.contract || {};
  const precio = plantilla.precio_y_pago || {};

  const numero_contrato = toStr(
    contrato.numero_contrato || doc.numero_contrato || contract.contract_number
  );
  const valor = toNum(
    contrato.valor_contrato || precio.valor_total_usd ||
    plantilla.autorizacion?.valor?.monto_numerico
  );
  const anos_contrato = toNum(contrato.anos_contrato);
  const numero_noches = toNum(contrato.numero_noches);

  return {
    numero_contrato,
    valor_contrato: valor,
    anos_contrato,
    numero_noches,
    fecha: contrato.fecha || doc.fecha_firma || new Date(),
    tarjeta_y_banco: toStr(contrato.tarjeta_y_banco),
    pagare_numero: toStr(contrato.pagare?.numero),
    pagare_fecha_vencimiento: toStr(contrato.pagare?.fecha_vencimiento)
  };
}

/**
 * Genera email único para cliente cuando no viene en la plantilla
 */
function generarEmailUnico(cedula, numeroContrato) {
  const base = (numeroContrato || cedula || Date.now()).toString().replace(/\s+/g, '-');
  const sufijo = Math.random().toString(36).slice(2, 8);
  return `contrato-${base}-${sufijo}@cliente.crm.com`;
}

/**
 * Genera número de contrato único cuando no viene en la plantilla
 */
function generarNumeroContratoUnico() {
  const t = new Date();
  const y = t.getFullYear().toString().slice(-2);
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INB TMP ${y}${m}-${r}`;
}

module.exports = {
  extraerCliente,
  extraerContrato,
  generarEmailUnico,
  generarNumeroContratoUnico,
  toNum,
  toStr
};
