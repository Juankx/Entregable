/**
 * Rellena una plantilla JSON con datos de cliente y contrato.
 * Solo sobrescribe valores vacíos ('', 0, null, undefined).
 */
function setByPath(obj, path, value) {
  if (!path || path.length === 0) return obj;
  const key = path[0];
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  if (path.length === 1) {
    copy[key] = value;
    return copy;
  }
  const next = obj && obj[key] !== undefined ? obj[key] : (typeof path[1] === 'number' ? [] : {});
  copy[key] = setByPath(next, path.slice(1), value);
  return copy;
}

function isEmpty(v) {
  return v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v));
}

function getByPath(obj, path) {
  let current = obj;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

/**
 * Aplica valores de datos sobre la plantilla (solo donde la plantilla está "vacía").
 */
function mergeIntoTemplate(template, datos) {
  let result = JSON.parse(JSON.stringify(template));
  for (const { path, value } of datos) {
    if (value === undefined || value === null) continue;
    const current = getByPath(result, path);
    if (isEmpty(current)) {
      result = setByPath(result, path, value);
    }
  }
  return result;
}

/**
 * Genera lista de { path, value } para rellenar plantillas a partir de cliente y contrato.
 * path es array de keys, ej. ['contratante', 'nombres_completos']
 */
function buildDatosRelleno(cliente, contrato) {
  const nombreCompleto = [cliente.first_name, cliente.last_name].filter(Boolean).join(' ').trim() || '';
  const numeroContrato = contrato?.numero_contrato || cliente.contract_number || '';
  const valorContrato = contrato != null ? Number(contrato.valor_contrato) : Number(cliente.total_amount) || 0;
  const fechaContrato = contrato?.fecha_contrato
    ? (typeof contrato.fecha_contrato === 'string' ? contrato.fecha_contrato : contrato.fecha_contrato?.toISOString?.()?.split('T')[0])
    : new Date().toISOString().split('T')[0];
  const ciudad = cliente.ciudad || '';
  const telefono = cliente.phone || cliente.telefono || '';
  const cedula = cliente.document_number || '';
  const email = cliente.email || '';
  const direccion = cliente.direccion || '';

  return [
    // contrato-prestacion-servicios, documento-entendimiento, etc.
    { path: ['documento', 'numero_contrato'], value: numeroContrato },
    { path: ['documento', 'ciudad'], value: ciudad },
    { path: ['documento', 'fecha_firma'], value: fechaContrato },
    { path: ['contratante', 'nombres_completos'], value: nombreCompleto },
    { path: ['contratante', 'cedula'], value: cedula },
    { path: ['contratante', 'correo'], value: email },
    { path: ['contratante', 'telefono'], value: telefono },
    { path: ['contratante', 'direccion'], value: direccion },
    { path: ['precio_y_pago', 'valor_total_usd'], value: valorContrato },
    { path: ['metadata', 'creado_por'], value: 'sistema' },
    { path: ['metadata', 'fecha_creacion'], value: new Date().toISOString() },
    // solicitud-activacion-contrato (client, contract)
    { path: ['client', 'full_name'], value: nombreCompleto },
    { path: ['client', 'document_number'], value: cedula },
    { path: ['contract', 'contract_number'], value: numeroContrato },
  ];
}

module.exports = {
  mergeIntoTemplate,
  buildDatosRelleno,
};
