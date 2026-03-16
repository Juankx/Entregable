/**
 * Convierte el JSON de autorización de cobro a un PDF descargable (en el navegador).
 * Útil cuando el servidor guardó la plantilla como JSON por no tener Chromium.
 */
import html2pdf from 'html2pdf.js';

/** Espera a que el navegador pinte el DOM para que html2canvas capture el contenido (evita PDF en blanco). */
function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTimeout(resolve, 80));
    });
  });
}

function val(s) {
  if (s === null || s === undefined) return '—';
  if (typeof s === 'object') return JSON.stringify(s);
  return String(s);
}

function obj(o, def = '') {
  if (!o || typeof o !== 'object') return def;
  return o;
}

/**
 * Genera el HTML del documento de autorización de cobro a partir del JSON.
 */
export function autorizacionJsonToHtml(data) {
  const company = obj(data.company);
  const client = obj(data.client);
  const cardAuth = obj(data.card_authorization);
  const purpose = data.purpose || cardAuth?.purpose || '';
  const voucher = data.voucher || cardAuth?.voucher || {};
  const contact = obj(company.contact);
  const address = obj(contact.address);
  const amount = obj(cardAuth?.amount);

  const html = `
  <div class="doc-autorizacion">
  <style>
    .doc-autorizacion { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; padding: 24px; max-width: 210mm; background: #fff; }
    .doc-autorizacion h1 { font-size: 16pt; color: #1a365d; border-bottom: 2px solid #2b6cb0; padding-bottom: 8px; margin-bottom: 20px; }
    .doc-autorizacion h2 { font-size: 12pt; color: #1a365d; margin-top: 18px; margin-bottom: 8px; }
    .doc-autorizacion .block { margin-bottom: 14px; }
    .doc-autorizacion .row { display: flex; margin-bottom: 4px; }
    .doc-autorizacion .label { font-weight: 600; color: #2d3748; min-width: 140px; }
    .doc-autorizacion .value { color: #1a1a1a; }
    .doc-autorizacion .firma { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10pt; color: #4a5568; }
  </style>
  <h1>AUTORIZACIÓN DE CARGO A TARJETA</h1>

  <h2>Empresa</h2>
  <div class="block">
    <div class="row"><span class="label">Razón social:</span> <span class="value">${val(company.legal_name)}</span></div>
    <div class="row"><span class="label">Nombre comercial:</span> <span class="value">${val(company.commercial_name)}</span></div>
    <div class="row"><span class="label">RUC:</span> <span class="value">${val(company.ruc)}</span></div>
    <div class="row"><span class="label">Contacto:</span> <span class="value">${val(contact.email)} | ${val(contact.phone)}</span></div>
    <div class="row"><span class="label">Dirección:</span> <span class="value">${val(address.street)} ${val(address.building)} ${val(address.floor)} ${val(address.office)}</span></div>
  </div>

  <h2>Cliente</h2>
  <div class="block">
    <div class="row"><span class="label">Nombre completo:</span> <span class="value">${val(client.full_name)}</span></div>
    <div class="row"><span class="label">Ciudad / País:</span> <span class="value">${val(client.city_country)}</span></div>
    <div class="row"><span class="label">Teléfono:</span> <span class="value">${val(client.phone)}</span></div>
    <div class="row"><span class="label">Nº documento:</span> <span class="value">${val(client.id_number)}</span></div>
  </div>

  <h2>Autorización de tarjeta</h2>
  <div class="block">
    <div class="row"><span class="label">Titular:</span> <span class="value">${val(cardAuth.cardholder_name)}</span></div>
    <div class="row"><span class="label">Tipo de tarjeta:</span> <span class="value">${val(cardAuth.card_type)}</span></div>
    <div class="row"><span class="label">Nº tarjeta:</span> <span class="value">${val(cardAuth.card_number)}</span></div>
    <div class="row"><span class="label">Vencimiento:</span> <span class="value">${val(cardAuth.expiration_date)}</span></div>
    <div class="row"><span class="label">Monto:</span> <span class="value">${val(amount.currency)} ${val(amount.numeric)} (${val(amount.text)})</span></div>
  </div>

  <h2>Finalidad</h2>
  <div class="block">
    <p class="value">${val(purpose)}</p>
  </div>

  <h2>Voucher / Referencia</h2>
  <div class="block">
    <div class="row"><span class="label">Lote:</span> <span class="value">${val(voucher.batch_number)}</span></div>
    <div class="row"><span class="label">Nº referencia:</span> <span class="value">${val(voucher.reference_number)}</span></div>
    <div class="row"><span class="label">Nº aprobación:</span> <span class="value">${val(voucher.approval_number)}</span></div>
    <div class="row"><span class="label">Modalidad:</span> <span class="value">${val(voucher.payment_method)}</span></div>
  </div>

  <div class="firma">
    Documento generado a partir de la autorización de cobro. Este PDF tiene el mismo valor que el documento firmado.
  </div>
  </div>
`;
  return html;
}

/**
 * Genera y descarga un PDF a partir del JSON de autorización de cobro.
 * @param {Object} jsonData - Objeto JSON (autorizacion_cargo_tarjeta)
 * @param {string} filename - Nombre del archivo (ej: autorizacion-cobro-pacifico.pdf)
 */
export async function descargarAutorizacionComoPdf(jsonData, filename = 'autorizacion-cobro.pdf') {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Datos de autorización no válidos');
  }
  const html = autorizacionJsonToHtml(jsonData);
  const div = document.createElement('div');
  div.innerHTML = html;
  // Debe estar en pantalla y visible para que html2canvas capture el contenido (si no, el PDF sale en blanco)
  div.style.position = 'fixed';
  div.style.left = '0';
  div.style.top = '0';
  div.style.width = '210mm';
  div.style.minHeight = '297mm';
  div.style.background = '#fff';
  div.style.zIndex = '99999';
  div.style.pointerEvents = 'none';
  div.style.boxShadow = '0 0 0 1px #eee';
  document.body.appendChild(div);
  await waitForPaint();

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(div).save();
  } finally {
    if (div.parentNode) document.body.removeChild(div);
  }
}

/**
 * Genera el PDF de autorización como Blob (sin descargar). Para guardar como adjunto.
 * @param {Object} jsonData - Objeto JSON de autorización
 * @returns {Promise<Blob>}
 */
export async function generarAutorizacionPdfComoBlob(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Datos de autorización no válidos');
  }
  const html = autorizacionJsonToHtml(jsonData);
  const div = document.createElement('div');
  div.innerHTML = html;
  div.style.position = 'fixed';
  div.style.left = '0';
  div.style.top = '0';
  div.style.width = '210mm';
  div.style.minHeight = '297mm';
  div.style.background = '#fff';
  div.style.zIndex = '99999';
  div.style.pointerEvents = 'none';
  div.style.boxShadow = '0 0 0 1px #eee';
  document.body.appendChild(div);
  await waitForPaint();

  const opt = {
    margin: [10, 10, 10, 10],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    return await html2pdf().set(opt).from(div).outputPdf('blob');
  } finally {
    if (div.parentNode) document.body.removeChild(div);
  }
}
