export function documentoEntendimientoAceptacionToHtml(data) {
  const documento = data?.documento || {};
  const contrato = data?.contrato || {};
  const empresa = data?.empresa || {};
  const canales = empresa?.canales_autorizados || {};
  const aceptaciones = Array.isArray(data?.aceptaciones) ? data.aceptaciones : [];
  const beneficiarios = Array.isArray(data?.beneficiarios) ? data.beneficiarios : [];
  const verificacion = data?.verificacion_contrato || {};

  const renderDetalleAceptacion = (item) => {
    let extra = '';

    if (item?.valor) {
      extra += `<div><strong>Valor:</strong> ${item.valor}</div>`;
    }

    if (typeof item?.noches_anuales !== 'undefined' && item?.noches_anuales !== null) {
      extra += `<div><strong>Noches anuales:</strong> ${item.noches_anuales}</div>`;
    }

    if (typeof item?.anio_inicio !== 'undefined' && item?.anio_inicio !== null && item?.anio_inicio !== 0) {
      extra += `<div><strong>Año de inicio:</strong> ${item.anio_inicio}</div>`;
    }

    if (typeof item?.valor_usd !== 'undefined' && item?.valor_usd !== null) {
      extra += `<div><strong>Valor USD:</strong> ${Number(item.valor_usd).toFixed(2)}</div>`;
    }

    if (Array.isArray(item?.destinos) && item.destinos.length > 0) {
      extra += `<div><strong>Destinos:</strong> ${item.destinos.join(', ')}</div>`;
    }

    if (typeof item?.dias_respuesta !== 'undefined' && item?.dias_respuesta !== null) {
      extra += `<div><strong>Días de respuesta:</strong> ${item.dias_respuesta}</div>`;
    }

    if (item?.condiciones) {
      extra += `
        <div><strong>Condiciones:</strong></div>
        <ul>
          <li>Personas: ${item.condiciones.personas || ''}</li>
          <li>Anticipación: ${item.condiciones.anticipacion_dias || ''} días</li>
          <li>Costo temporada baja: ${Number(item.condiciones.costo_temporada_baja || 0).toFixed(2)} USD</li>
          <li>Costo temporada alta: ${Number(item.condiciones.costo_temporada_alta || 0).toFixed(2)} USD</li>
          <li>Aplica feriados: ${item.condiciones.aplica_feriados ? 'Sí' : 'No'}</li>
        </ul>
      `;
    }

    return extra;
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${documento.titulo || 'Documento de Entendimiento y Aceptación'}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 32px 38px;
            line-height: 1.45;
            font-size: 13px;
          }

          h1 {
            text-align: center;
            font-size: 20px;
            margin-bottom: 8px;
          }

          .sub {
            text-align: center;
            font-size: 13px;
            color: #555;
            margin-bottom: 24px;
          }

          h2 {
            font-size: 15px;
            margin: 20px 0 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }

          p {
            margin: 6px 0;
            text-align: justify;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
          }

          .item {
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
          }

          .estado {
            margin-top: 8px;
            font-weight: bold;
          }

          ul {
            margin: 6px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 4px;
          }

          .firma-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 30px;
          }

          .firma-box {
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 30px;
            text-align: center;
          }

          .small {
            font-size: 12px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <h1>${documento.titulo || 'Documento de Entendimiento y Aceptación'}</h1>
        <div class="sub">
          ${documento.lugar || ''} ${documento.fecha ? ' - ' + documento.fecha : ''}
        </div>

        <div class="box">
          <p><strong>Tipo:</strong> ${documento.tipo || ''}</p>
          <p><strong>Número de contrato:</strong> ${contrato.numero_contrato || ''}</p>
          <p><strong>Vigencia:</strong> ${contrato.vigencia_anios || 0} años</p>
          <p><strong>Empresa:</strong> ${empresa.razon_social || ''}</p>
          <p><strong>Teléfono:</strong> ${canales.telefono || ''}</p>
          <p><strong>Email:</strong> ${canales.email || ''}</p>
        </div>

        <h2>Aceptaciones del cliente</h2>
        ${aceptaciones.map(item => `
          <div class="item">
            <div><strong>${item.id}. ${item.descripcion || ''}</strong></div>
            ${renderDetalleAceptacion(item)}
            <div class="estado">
              Aceptado: ${item.aceptado ? 'Sí' : 'No'}
            </div>
          </div>
        `).join('')}

        <h2>Beneficiarios</h2>
        ${beneficiarios.length > 0 ? beneficiarios.map(item => `
          <div class="item">
            <p><strong>Tipo:</strong> ${item.tipo || ''}</p>
            <p><strong>Nombre:</strong> ${item.nombre || ''}</p>
            <p><strong>Documento:</strong> ${item.documento || ''}</p>
            <p><strong>Fecha:</strong> ${item.fecha || ''}</p>
          </div>
        `).join('') : '<p>No hay beneficiarios registrados.</p>'}

        <h2>Verificación del contrato</h2>
        <div class="box">
          <p><strong>Verificado por:</strong> ${verificacion?.verificado_por?.nombre || ''}</p>
        </div>

        <div class="firma-grid">
          <div class="firma-box">
            <div><strong>Cliente / Beneficiarios</strong></div>
            <div class="small">Firmas registradas en aceptaciones y beneficiarios</div>
          </div>

          <div class="firma-box">
            <div><strong>${verificacion?.verificado_por?.nombre || 'Verificado por'}</strong></div>
            <div class="small">Verificación del contrato</div>
          </div>
        </div>
      </body>
    </html>
  `;
}