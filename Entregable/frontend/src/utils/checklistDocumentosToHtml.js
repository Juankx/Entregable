export function checklistDocumentosToHtml(data) {
  const documento = data?.documento || {};
  const cliente = data?.cliente || {};
  const ubicacion = data?.ubicacion || {};
  const documentosEntregados = Array.isArray(data?.documentos_entregados)
    ? data.documentos_entregados
    : [];
  const firmas = data?.firmas || {};

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Check List de Documentos Entregados</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 30px 36px;
            line-height: 1.45;
            font-size: 12px;
          }

          h1 {
            text-align: center;
            font-size: 19px;
            margin-bottom: 8px;
          }

          .sub {
            text-align: center;
            color: #555;
            margin-bottom: 18px;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 14px;
          }

          p {
            margin: 5px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th, td {
            border: 1px solid #cfcfcf;
            padding: 8px;
            text-align: left;
            vertical-align: top;
            font-size: 12px;
          }

          th {
            background: #f3f3f3;
          }

          .firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 28px;
          }

          .firma-box {
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 30px;
            text-align: center;
          }

          .small {
            font-size: 11px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <h1>Check List de Documentos Entregados</h1>
        <div class="sub">
          ${documento.lugar_suscripcion || ''} ${documento.fecha_suscripcion ? ' - ' + documento.fecha_suscripcion : ''}
        </div>

        <div class="box">
          <p><strong>Tipo:</strong> ${documento.tipo || ''}</p>
          <p><strong>Número de contrato:</strong> ${documento.numero_contrato || ''}</p>
          <p><strong>Cliente número:</strong> ${documento.cliente_numero || ''}</p>
          <p><strong>Sala:</strong> ${documento.sala || ''}</p>
          <p><strong>Lugar sala:</strong> ${ubicacion.lugar_sala || ''}</p>
          <p><strong>Responsable:</strong> ${documento.responsable || ''}</p>
          <p><strong>Cliente:</strong> ${cliente.nombres_completos || ''}</p>
          <p><strong>Cédula:</strong> ${cliente.cedula || ''}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 6%;">#</th>
              <th style="width: 34%;">Documento</th>
              <th style="width: 14%;">Entregado</th>
              <th style="width: 14%;">Firma cliente</th>
              <th style="width: 32%;">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${
              documentosEntregados.length > 0
                ? documentosEntregados.map((item) => `
                    <tr>
                      <td>${item?.id || ''}</td>
                      <td>${item?.nombre || ''}</td>
                      <td>${item?.entregado ? 'Sí' : 'No'}</td>
                      <td>${item?.firma_cliente ? 'Sí' : 'No'}</td>
                      <td>${item?.observaciones || ''}</td>
                    </tr>
                  `).join('')
                : `
                    <tr>
                      <td>1</td>
                      <td>Sin documentos registrados</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  `
            }
          </tbody>
        </table>

        <div class="firmas">
          <div class="firma-box">
            <div><strong>${firmas?.empresa?.nombre || 'Empresa'}</strong></div>
            <div class="small">RUC: ${firmas?.empresa?.ruc || ''}</div>
          </div>

          <div class="firma-box">
            <div><strong>${firmas?.cliente?.nombre || cliente.nombres_completos || ''}</strong></div>
            <div class="small">Cédula: ${firmas?.cliente?.cedula || cliente.cedula || ''}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}