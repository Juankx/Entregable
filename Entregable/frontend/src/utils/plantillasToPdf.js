/**
 * Generación de PDF en el frontend a partir de plantillas rellenadas (API /plantillas/:id/rellenar).
 * Prioridad: 1) Plantilla .docx en templates/documentos (rellenar con JSON → PDF).
 * 2) Renderers HTML específicos o genérico.
 */
import html2pdf from 'html2pdf.js';
import { descargarAutorizacionComoPdf, generarAutorizacionPdfComoBlob } from './autorizacionJsonToPdf';
import { fillDocxAndGetPdfBlob, hasDocxTemplate } from './docxTemplateToPdf';

/** Espera a que el navegador pinte el DOM para que html2canvas capture (evita PDF en blanco). */
function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTimeout(resolve, 80));
    });
  });
}

function val(s) {
  if (s === null || s === undefined) return '—';
  if (typeof s === 'object' && !Array.isArray(s)) return JSON.stringify(s);
  if (Array.isArray(s)) return s.join(', ');
  return String(s);
}

/**
 * Genera HTML genérico a partir de cualquier JSON (secciones y pares clave-valor).
 * Útil para plantillas que aún no tienen un renderer específico.
 */
function genericJsonToHtml(data, titulo = 'Documento generado desde plantilla') {
  if (!data || typeof data !== 'object') return '';

  const rows = [];
  function walk(obj, prefix = '') {
    if (!obj || typeof obj !== 'object') return;
    Object.entries(obj).forEach(([key, value]) => {
      const label = prefix ? `${prefix}.${key}` : key;
      const labelNice = label.replace(/_/g, ' ');
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && (typeof value.toISOString !== 'function')) {
        walk(value, label);
      } else {
        const display = Array.isArray(value) ? value.join(', ') : val(value);
        if (display !== '—' && display !== '') rows.push({ label: labelNice, value: display });
      }
    });
  }
  walk(data);

  const body = rows
    .map(({ label, value }) => `<tr><td class="label">${label}</td><td class="value">${value}</td></tr>`)
    .join('');

  return `
  <div class="doc-generic">
  <style>
    .doc-generic { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; line-height: 1.4; color: #1a1a1a; padding: 20px; max-width: 210mm; background: #fff; }
    .doc-generic h1 { font-size: 14pt; color: #1a365d; border-bottom: 2px solid #2b6cb0; padding-bottom: 6px; margin-bottom: 16px; }
    .doc-generic table { width: 100%; border-collapse: collapse; }
    .doc-generic .label { font-weight: 600; color: #2d3748; padding: 4px 8px 4px 0; vertical-align: top; width: 35%; }
    .doc-generic .value { color: #1a1a1a; padding: 4px 0; }
    .doc-generic tr { border-bottom: 1px solid #e2e8f0; }
  </style>
  <h1>${titulo}</h1>
  <table><tbody>${body}</tbody></table>
  </div>
`;
}

const defaultPdfOpt = {
  margin: [10, 10, 10, 10],
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

/**
 * Genera PDF genérico como Blob (sin descargar).
 */
async function genericoPdfComoBlob(jsonData, titulo = 'Documento') {
  const html = genericJsonToHtml(jsonData, titulo);
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
  try {
    return await html2pdf().set(defaultPdfOpt).from(div).outputPdf('blob');
  } finally {
    if (div.parentNode) document.body.removeChild(div);
  }
}

/**
 * Genera y descarga un PDF genérico (cualquier JSON).
 */
async function descargarGenericoComoPdf(jsonData, filename = 'documento.pdf', titulo = 'Documento') {
  const blob = await genericoPdfComoBlob(jsonData, titulo);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

const TITULOS_POR_PLANTILLA = {
  'contrato-basico': 'Contrato de Viaje',
  'carta-diferimiento': 'Carta de Diferimiento',
  'consentimiento-grabacion': 'Consentimiento de Grabación',
  'contrato-servicios': 'Contrato de Prestación de Servicios',
  'pagare': 'Pagaré de Crédito',
  'documento-entendimiento': 'Documento de Entendimiento',
  'hoja-bienvenida': 'Hoja de Bienvenida',
  'checklist-documentos': 'Checklist de Documentos',
  'solicitud-activacion': 'Solicitud de Activación',
  'anexo-beneficios': 'Anexo de Beneficios y Ventajas'
};

/**
 * Genera y descarga el PDF según el tipo de plantilla.
 * Si existe .docx en templates/documentos, lo rellena con el JSON y genera el PDF desde el Word.
 * Si no, usa el renderer HTML (autorización o genérico).
 */
export async function generarPdfDesdePlantilla(plantillaId, jsonData, filenameBase = 'documento') {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Datos de plantilla no válidos');
  }
  const filename = `${filenameBase.replace(/\s+/g, '-')}.pdf`;

  if (hasDocxTemplate(plantillaId)) {
    try {
      const pdfBlob = await fillDocxAndGetPdfBlob(plantillaId, jsonData);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    } catch (e) {
      console.warn('PDF desde Word falló, usando HTML:', e.message);
    }
  }

  if (plantillaId === 'autorizacion-cobro-pacifico') {
    await descargarAutorizacionComoPdf(jsonData, filename);
    return;
  }

  const titulo = TITULOS_POR_PLANTILLA[plantillaId] || plantillaId.replace(/-/g, ' ');
  await descargarGenericoComoPdf(jsonData, filename, titulo);
}

/**
 * Genera el PDF como Blob (sin descargar), para guardar como adjunto.
 * Prioridad: .docx en templates/documentos; si no, HTML (autorización o genérico).
 */
export async function generarPdfComoBlob(plantillaId, jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Datos de plantilla no válidos');
  }
  if (hasDocxTemplate(plantillaId)) {
    try {
      return await fillDocxAndGetPdfBlob(plantillaId, jsonData);
    } catch (e) {
      console.warn('PDF desde Word falló, usando HTML:', e.message);
    }
  }
  if (plantillaId === 'autorizacion-cobro-pacifico') {
    return await generarAutorizacionPdfComoBlob(jsonData);
  }
  const titulo = TITULOS_POR_PLANTILLA[plantillaId] || plantillaId.replace(/-/g, ' ');
  return await genericoPdfComoBlob(jsonData, titulo);
}

/**
 * Genera un PDF desde HTML completo (p. ej. el documento del contrato devuelto por la API).
 * Usa un iframe para que el navegador parsee <html>, <head> y <body> correctamente (evita PDF en blanco).
 * @param {string} html - HTML completo del documento (<!DOCTYPE>...<html>...)
 * @returns {Promise<Blob>}
 */
export async function generarPdfDesdeHtml(html) {
  if (!html || typeof html !== 'string') throw new Error('HTML no válido');
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts'); // necesario para contentDocument y evitar "Blocked script execution"
  iframe.style.cssText = 'position:fixed;left:0;top:0;width:210mm;min-height:297mm;border:none;z-index:99999;visibility:hidden;pointer-events:none';
  document.body.appendChild(iframe);

  const loadPromise = new Promise((resolve) => {
    iframe.onload = resolve;
  });
  iframe.srcdoc = html;
  await loadPromise;
  await new Promise((r) => setTimeout(r, 250));

  const doc = iframe.contentDocument;
  const body = doc && doc.body;
  if (!body) {
    iframe.remove();
    throw new Error('El documento HTML no tiene body');
  }

  // Forzar aspecto tipo Word: fondo blanco y texto oscuro (evita fondo negro por tema de la app)
  const forceWordStyle = doc.createElement('style');
  forceWordStyle.textContent = `
    html, body { background: #ffffff !important; color: #1a1a1a !important; }
    body * { color: inherit; }
    .section { background: #f9f9f9 !important; color: #1a1a1a !important; }
    .field { background: #ffffff !important; color: #1a1a1a !important; }
    .header, .footer, .firma-box { background: #ffffff !important; color: #1a1a1a !important; }
    .field-value, .field-label, .section-title, .logo, .header div, .footer div { color: #1a1a1a !important; }
    .section-title { border-bottom-color: #0066cc !important; }
    .header { border-bottom-color: #0066cc !important; }
  `;
  (doc.head || doc.documentElement).appendChild(forceWordStyle);
  doc.documentElement.style.backgroundColor = '#ffffff';
  doc.body.style.backgroundColor = '#ffffff';
  doc.body.style.color = '#1a1a1a';

  await waitForPaint();

  const pdfOpt = {
    ...defaultPdfOpt,
    html2canvas: {
      ...defaultPdfOpt.html2canvas,
      backgroundColor: '#ffffff'
    }
  };

  try {
    return await html2pdf().set(pdfOpt).from(body).outputPdf('blob');
  } finally {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  }
}
