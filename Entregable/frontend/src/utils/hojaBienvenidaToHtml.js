export function hojaBienvenidaToHtml(data) {
  const documento = data?.documento || {};
  const mensaje = data?.mensaje_bienvenida || {};
  const empresa = data?.empresa || {};
  const canales = data?.canales_atencion || {};
  const telefonos = canales?.telefonos || {};
  const horarios = canales?.horarios_atencion || {};
  const direccion = data?.direccion || {};

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Hoja de Bienvenida</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 40px 48px;
            line-height: 1.6;
            font-size: 14px;
          }

          .title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .subtitle {
            text-align: center;
            font-size: 14px;
            color: #444;
            margin-bottom: 30px;
          }

          .hero {
            border: 1px solid #dcdcdc;
            border-radius: 10px;
            padding: 22px;
            margin: 25px 0;
            background: #fafafa;
          }

          .hero h2 {
            margin: 0 0 12px 0;
            font-size: 20px;
          }

          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 28px 0 10px;
          }

          .info-box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-top: 12px;
          }

          p {
            margin: 8px 0;
            text-align: justify;
          }

          ul {
            margin: 8px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 6px;
          }

          .footer {
            margin-top: 35px;
            font-size: 12px;
            color: #555;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="title">${documento.titulo || 'Hoja de Bienvenida'}</div>
        <div class="subtitle">
          ${documento.fecha_emision || ''}
        </div>

        <div class="hero">
          <h2>${mensaje.encabezado || ''}</h2>
          <p>${mensaje.contenido || ''}</p>
        </div>

        <div class="section-title">Información del programa</div>
        <div class="info-box">
          <p><strong>Empresa:</strong> ${empresa.razon_social || ''}</p>
          <p><strong>Programa:</strong> ${empresa.programa || ''}</p>
          <p><strong>Estado del documento:</strong> ${documento.estado || ''}</p>
        </div>

        <div class="section-title">Canales de atención</div>
        <div class="info-box">
          <p><strong>Servicio al cliente:</strong> ${telefonos.servicio_al_cliente || ''}</p>
          <p><strong>Emergencias:</strong> ${telefonos.emergencias || ''}</p>
          <p><strong>Correo electrónico:</strong> ${canales.correo_electronico || ''}</p>
          <p>
            <strong>Horario de atención:</strong>
            ${horarios.dias || ''},
            ${horarios.desde || ''} a ${horarios.hasta || ''}
          </p>
        </div>

        <div class="section-title">Dirección</div>
        <div class="info-box">
          <p>${direccion.descripcion || ''}</p>
          <p>${direccion.edificio || ''}</p>
          <p>${direccion.piso || ''}</p>
          <p>${direccion.oficina || ''}</p>
        </div>

        <div class="footer">
          ${empresa.razon_social || ''} · Documento de carácter informativo
        </div>
      </body>
    </html>
  `;
}