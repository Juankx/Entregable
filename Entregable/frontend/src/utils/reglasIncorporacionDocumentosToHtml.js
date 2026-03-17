export function reglasIncorporacionDocumentosToHtml(data) {
  const base = data?.reglas_incorporacion_documentos || {};
  const documentos = Array.isArray(base?.documentos) ? base.documentos : [];
  const reglas = base?.reglas_generales || {};
  const flujos = base?.flujos_tipicos || {};

  const renderList = (items) => {
    if (!Array.isArray(items) || items.length === 0) return '<li>No aplica</li>';
    return items.map(item => `<li>${item}</li>`).join('');
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Reglas de Incorporación de Documentos</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 30px 34px;
            line-height: 1.4;
            font-size: 12px;
          }

          h1 {
            text-align: center;
            font-size: 19px;
            margin-bottom: 6px;
          }

          .sub {
            text-align: center;
            color: #555;
            margin-bottom: 20px;
          }

          h2 {
            font-size: 15px;
            margin: 18px 0 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }

          .doc-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }

          p {
            margin: 5px 0;
            text-align: justify;
          }

          ul {
            margin: 6px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 3px;
          }

          .chip-line {
            margin-top: 6px;
            font-size: 12px;
          }

          .flow-box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Reglas de Incorporación de Documentos</h1>
        <div class="sub">${base.descripcion || ''}</div>

        <h2>Documentos y secuencia</h2>
        ${documentos.map(doc => `
          <div class="doc-card">
            <p><strong>${doc.secuencia || ''}. ${doc.nombre || ''}</strong></p>
            <p><strong>Tipo:</strong> ${doc.tipo || ''}</p>
            <p><strong>Momento:</strong> ${doc.momento || ''}</p>
            <p><strong>Fase:</strong> ${doc.fase || ''}</p>
            <p><strong>Responsable:</strong> ${doc.responsable || ''}</p>
            <p><strong>Descripción:</strong> ${doc.descripcion || ''}</p>

            <p><strong>Documentos previos requeridos:</strong></p>
            <ul>${renderList(doc.documentos_previos_requeridos)}</ul>

            <p><strong>Requisitos del cliente:</strong></p>
            <ul>${renderList(doc.requisitos_cliente)}</ul>

            <p><strong>Validaciones:</strong></p>
            <ul>${renderList(doc.validaciones)}</ul>

            <p><strong>Efectos de agregación:</strong></p>
            <ul>${renderList(doc.efectos_agregacion)}</ul>

            <div class="chip-line">
              <strong>Crítico:</strong> ${doc.critico ? 'Sí' : 'No'}
              &nbsp; | &nbsp;
              <strong>Condicional:</strong> ${doc.condicional || 'No'}
              &nbsp; | &nbsp;
              <strong>Automatizable:</strong> ${doc.automatizable ? 'Sí' : 'No'}
            </div>
          </div>
        `).join('')}

        <h2>Reglas generales</h2>
        <div class="doc-card">
          <p><strong>Bloqueadores:</strong></p>
          <ul>${renderList(reglas.bloqueadores)}</ul>

          <p><strong>Secuencia mínima obligatoria:</strong></p>
          <ul>${Array.isArray(reglas.secuencia_minima_obligatoria) ? reglas.secuencia_minima_obligatoria.map(item => `<li>${item}</li>`).join('') : '<li>No definida</li>'}</ul>

          <p><strong>Automáticos:</strong></p>
          <ul>${Array.isArray(reglas.automaticos) ? reglas.automaticos.map(item => `<li>${item}</li>`).join('') : '<li>No definidos</li>'}</ul>

          <p><strong>Validar antes de agregar:</strong> ${reglas.validar_antes_agregar || ''}</p>

          <p><strong>Inmutables:</strong></p>
          <ul>${Array.isArray(reglas.inmutables) ? reglas.inmutables.map(item => `<li>${item}</li>`).join('') : '<li>No definidos</li>'}</ul>

          <p><strong>Comentario clave:</strong> ${reglas.comentario_clave || ''}</p>
        </div>

        <h2>Flujos típicos</h2>
        ${Object.entries(flujos).map(([key, flujo]) => `
          <div class="flow-box">
            <p><strong>${key.replace(/_/g, ' ')}</strong></p>
            <p><strong>Descripción:</strong> ${flujo?.descripcion || ''}</p>
            <p><strong>Secuencia:</strong> ${Array.isArray(flujo?.secuencia) ? flujo.secuencia.join(' → ') : ''}</p>
            <p><strong>Duración promedio:</strong> ${flujo?.duracion_promedio_dias || 0} día(s)</p>
            ${
              typeof flujo?.requiere_aprobacion_gerencia !== 'undefined'
                ? `<p><strong>Requiere aprobación de gerencia:</strong> ${flujo.requiere_aprobacion_gerencia ? 'Sí' : 'No'}</p>`
                : ''
            }
          </div>
        `).join('')}
      </body>
    </html>
  `;
}