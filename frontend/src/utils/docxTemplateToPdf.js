/**
 * Lee plantillas .docx de templates/documentos, las rellena con el JSON de la plantilla
 * (mismo que plantillaContratos) y permite generar PDF desde el Word rellenado.
 * Los .docx deben usar placeholders {{campo.subcampo}} según COMO-USAR-PLANTILLAS-WORD.md
 */
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';

// Mismo mapeo que el backend: plantillaId -> nombre del archivo JSON (y del .docx)
const PLANTILLA_A_ARCHIVO = {
  'contrato-basico': 'plantilla-contrato-ejemplo',
  'autorizacion-cobro-pacifico': 'autorizacion-cobro-pacifico',
  'carta-diferimiento': 'carta-diferimiento',
  'consentimiento-grabacion': 'consentimiento-grabacion-imagenes',
  'contrato-servicios': 'contrato-prestacion-servicios',
  'pagare': 'pagare-credito',
  'documento-entendimiento': 'documento-entendimiento-aceptacion',
  'hoja-bienvenida': 'hoja-bienvenida',
  'checklist-documentos': 'checklist-documentos-entregados',
  'solicitud-activacion': 'solicitud-activacion-contrato',
  'anexo-beneficios': 'anexo-beneficios-ventajas'
};

/** Convierte null/undefined a string vacío en todo el objeto para que docxtemplater no falle. */
function sanitizeForDocx(obj) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForDocx);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const val = sanitizeForDocx(v);
    out[k] = val === null || val === undefined ? '' : val;
  }
  return out;
}

/**
 * Devuelve el nombre del archivo .docx para una plantilla (sin ruta).
 * @param {string} plantillaId - id de la plantilla (ej: 'contrato-servicios')
 * @returns {string|null} - ej: 'contrato-prestacion-servicios.docx' o null si no hay mapeo
 */
export function getDocxFilenameForPlantilla(plantillaId) {
  const base = PLANTILLA_A_ARCHIVO[plantillaId];
  return base ? `${base}.docx` : null;
}

/**
 * Carga el .docx desde public/templates/documentos y lo rellena con data.
 * @param {string} plantillaId - id de la plantilla
 * @param {Object} data - JSON rellenado (misma estructura que la plantilla)
 * @returns {Promise<Blob>} - Word rellenado como Blob
 */
export async function loadAndFillDocx(plantillaId, data) {
  const docxFilename = getDocxFilenameForPlantilla(plantillaId);
  if (!docxFilename) throw new Error(`No hay plantilla Word para: ${plantillaId}`);

  const url = `/templates/documentos/${docxFilename}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar la plantilla: ${docxFilename} (${res.status})`);

  const arrayBuffer = await res.arrayBuffer();
  const zip = new PizZip(arrayBuffer);

  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true
  });

  const safeData = sanitizeForDocx(data || {});
  doc.render(safeData);

  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  return blob;
}

/**
 * Convierte un Blob de .docx a HTML usando mammoth (para luego generar PDF).
 * @param {Blob} docxBlob
 * @returns {Promise<string>} - HTML del contenido del documento
 */
export async function docxBlobToHtml(docxBlob) {
  const arrayBuffer = await docxBlob.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value || '';
}

/** Espera a que el navegador pinte (para html2canvas). */
function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTimeout(resolve, 150));
    });
  });
}

/**
 * Genera un PDF a partir del Word rellenado: Word -> HTML (mammoth) -> PDF (html2pdf).
 * @param {string} plantillaId
 * @param {Object} data - JSON rellenado
 * @returns {Promise<Blob>} - PDF como Blob
 */
export async function fillDocxAndGetPdfBlob(plantillaId, data) {
  const docxBlob = await loadAndFillDocx(plantillaId, data);
  const html = await docxBlobToHtml(docxBlob);
  if (!html || !html.trim()) throw new Error('El documento generado está vacío');

  const wrapHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>body{font-family:Segoe UI,Arial,sans-serif;background:#fff;color:#1a1a1a;padding:24px;line-height:1.5;}</style></head><body>${html}</body></html>`;

  const div = document.createElement('div');
  div.innerHTML = wrapHtml;
  div.style.position = 'fixed';
  div.style.left = '0';
  div.style.top = '0';
  div.style.width = '210mm';
  div.style.minHeight = '297mm';
  div.style.background = '#ffffff';
  div.style.zIndex = '99999';
  div.style.pointerEvents = 'none';
  // Mantener el contenido visible para que html2canvas lo renderice,
  // pero transparente y sin interacción para que el usuario no lo vea.
  div.style.opacity = '0';
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
    if (div.parentNode) div.parentNode.removeChild(div);
  }
}

/**
 * Indica si existe plantilla Word para generar PDF desde .docx.
 * @param {string} plantillaId
 * @returns {boolean}
 */
export function hasDocxTemplate(plantillaId) {
  return Boolean(getDocxFilenameForPlantilla(plantillaId));
}
