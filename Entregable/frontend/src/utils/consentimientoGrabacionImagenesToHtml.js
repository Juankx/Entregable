export function consentimientoGrabacionImagenesToHtml(data) {
  const documento = data?.documento || {};
  const cliente = data?.cliente || {};
  const empresa = data?.empresa || {};
  const autorizaciones = data?.autorizaciones || {};
  const documentosRelacionados = Array.isArray(data?.documentos_relacionados)
    ? data.documentos_relacionados
    : [];
  const lugarGrabacion = data?.lugar_grabacion || {};
  const condiciones = data?.condiciones_divulgacion || {};
  const derechos = data?.derechos_empresa || {};
  const cesion = data?.cesion_derechos_imagen || {};
  const voucher = data?.ratificacion_voucher || {};
  const firmas = data?.firmas || {};
  const contacto = data?.contacto || {};

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${documento.titulo || 'Consentimiento informado para la grabación de imágenes y vídeos'}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 32px 38px;
            line-height: 1.5;
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
            margin-bottom: 12px;
          }

          ul {
            margin: 6px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 4px;
          }

          .firmas {
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
        <h1>${documento.titulo || 'Consentimiento informado para la grabación de imágenes y vídeos'}</h1>
        <div class="sub">
          ${documento.lugar || ''} ${documento.fecha ? ' - ' + documento.fecha : ''}
        </div>

        <div class="box">
          <p><strong>Tipo:</strong> ${documento.tipo || ''}</p>
          <p><strong>Cliente:</strong> ${cliente.nombres_completos || ''}</p>
          <p><strong>Cédula:</strong> ${cliente.cedula || ''}</p>
          <p><strong>Empresa:</strong> ${empresa.razon_social || ''}</p>
          <p><strong>Nombre comercial:</strong> ${empresa.nombre_comercial || ''}</p>
          <p><strong>RUC:</strong> ${empresa.ruc || ''}</p>
        </div>

        <p>
          Yo, <strong>${cliente.nombres_completos || ''}</strong>, con cédula
          <strong>${cliente.cedula || ''}</strong>, declaro que he sido informado(a)
          y autorizo libremente la grabación de imágenes, videos, audio y documentación
          relacionada con el proceso contractual y comercial, bajo los términos descritos
          en este documento.
        </p>

        <h2>Autorizaciones otorgadas</h2>
        <ul>
          <li>Captación de imagen: ${autorizaciones.captacion_imagen ? 'Sí' : 'No'}</li>
          <li>Captación de video: ${autorizaciones.captacion_video ? 'Sí' : 'No'}</li>
          <li>Captación de audio: ${autorizaciones.captacion_audio ? 'Sí' : 'No'}</li>
          <li>Grabación de documentos: ${autorizaciones.grabacion_documentos ? 'Sí' : 'No'}</li>
          <li>Almacenamiento digital: ${autorizaciones.almacenamiento_digital ? 'Sí' : 'No'}</li>
          <li>Uso exclusivo por parte de la empresa: ${autorizaciones.uso_exclusivo_empresa ? 'Sí' : 'No'}</li>
        </ul>

        <h2>Documentos relacionados</h2>
        <ul>
          ${
            documentosRelacionados.length > 0
              ? documentosRelacionados.map(item => `<li>${item}</li>`).join('')
              : '<li>No aplica</li>'
          }
        </ul>

        <h2>Lugar de grabación</h2>
        <div class="box">
          <p><strong>Instalaciones:</strong> ${lugarGrabacion.instalaciones || ''}</p>
          <p><strong>Descripción:</strong> ${lugarGrabacion.descripcion || ''}</p>
        </div>

        <h2>Condiciones de divulgación</h2>
        <p>
          La divulgación de este material se encuentra permitida en los siguientes casos:
        </p>
        <ul>
          ${
            Array.isArray(condiciones?.permitido_en_caso_de) && condiciones.permitido_en_caso_de.length > 0
              ? condiciones.permitido_en_caso_de.map(item => `<li>${item}</li>`).join('')
              : '<li>No especificado</li>'
          }
        </ul>
        <p>
          <strong>Exoneración de responsabilidad de la empresa:</strong>
          ${condiciones.exoneracion_responsabilidad_empresa ? 'Sí' : 'No'}
        </p>

        <h2>Derechos de la empresa</h2>
        <ul>
          <li>Derecho de defensa: ${derechos.derecho_defensa ? 'Sí' : 'No'}</li>
          <li>Derecho a acciones legales: ${derechos.derecho_acciones_legales ? 'Sí' : 'No'}</li>
          <li>Derecho de repetición contra vendedores: ${derechos.derecho_repeticion_contra_vendedores ? 'Sí' : 'No'}</li>
        </ul>

        <h2>Cesión de derechos de imagen</h2>
        <div class="box">
          <p><strong>Cesión gratuita:</strong> ${cesion.gratuita ? 'Sí' : 'No'}</p>
          <p><strong>Cesión revocable:</strong> ${cesion.revocable ? 'Sí' : 'No'}</p>
        </div>

        <h2>Ratificación de voucher / consumo</h2>
        <div class="box">
          <p><strong>Fecha:</strong> ${voucher.fecha || ''}</p>
          <p><strong>Monto USD:</strong> ${Number(voucher.monto_usd || 0).toFixed(2)}</p>
          <p><strong>Banco:</strong> ${voucher.banco || ''}</p>
          <p><strong>Modalidad:</strong> ${voucher.modalidad || ''}</p>
          <p><strong>Reconocimiento de consumo:</strong> ${voucher.reconocimiento_consumo ? 'Sí' : 'No'}</p>
        </div>

        <h2>Contacto</h2>
        <div class="box">
          <p><strong>Email:</strong> ${contacto.email || ''}</p>
          <p><strong>Teléfono:</strong> ${contacto.telefono || ''}</p>
          <p><strong>Dirección:</strong> ${contacto.direccion || ''}</p>
        </div>

        <div class="firmas">
          <div class="firma-box">
            <div><strong>${firmas?.cliente?.nombre || cliente.nombres_completos || ''}</strong></div>
            <div class="small">Cliente</div>
          </div>

          <div class="firma-box">
            <div><strong>${empresa.nombre_comercial || empresa.razon_social || 'Empresa'}</strong></div>
            <div class="small">Empresa receptora</div>
          </div>
        </div>
      </body>
    </html>
  `;
}