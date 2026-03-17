export function cartaDiferimientoToHtml(data) {
  const documento = data?.documento || {};
  const cliente = data?.cliente || {};
  const transaccion = data?.transaccion || {};
  const empresa = data?.empresa || {};
  const firmas = data?.firmas || {};

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Carta de Diferimiento</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 40px 48px;
            line-height: 1.6;
            font-size: 14px;
          }

          .header-right {
            text-align: right;
            margin-bottom: 30px;
          }

          .title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 24px 0 30px;
            text-transform: uppercase;
          }

          p {
            margin: 10px 0;
            text-align: justify;
          }

          .firma-wrap {
            margin-top: 70px;
            display: flex;
            justify-content: space-between;
            gap: 40px;
          }

          .firma-box {
            width: 45%;
            text-align: center;
          }

          .firma-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 8px;
          }

          .small {
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header-right">
          <div><strong>${documento.ciudad || ''}</strong></div>
          <div>${documento.fecha_emision || ''}</div>
        </div>

        <div class="title">Carta de Diferimiento</div>

        <p>
          Yo, <strong>${cliente.nombres_completos || ''}</strong>,
          portador(a) del documento de identidad
          <strong>${cliente.documento_identidad || ''}</strong>,
          relacionado(a) con el contrato número
          <strong>${documento.numero_contrato || ''}</strong>,
          dejo constancia de que la transacción realizada el día
          <strong>${transaccion.fecha_transaccion || ''}</strong>
          permanece en modalidad
          <strong>${transaccion.modalidad_actual || ''}</strong>.
        </p>

        <p>
          ${transaccion.detalle_responsabilidad || ''}
        </p>

        <p>
          Asimismo, reconozco que cualquier solicitud de cambio de modalidad,
          diferimiento o gestión posterior deberá realizarse directamente ante
          la entidad bancaria emisora, deslindando de responsabilidad a
          <strong>${empresa.nombre_comercial || ''}</strong>.
        </p>

        <p>
          Para cualquier aclaración adicional, la empresa pone a disposición los
          siguientes canales de contacto:
          correo <strong>${empresa.contacto_email || ''}</strong>,
          teléfono <strong>${empresa.contacto_telefono || ''}</strong>,
          dirección <strong>${empresa.direccion || ''}</strong>.
        </p>

        <div class="firma-wrap">
          <div class="firma-box">
            <div class="firma-line">
              <div><strong>Compañía</strong></div>
              <div class="small">${empresa.nombre_comercial || ''}</div>
            </div>
          </div>

          <div class="firma-box">
            <div class="firma-line">
              <div><strong>${firmas.nombre_cliente_firma || cliente.nombres_completos || ''}</strong></div>
              <div class="small">CI: ${firmas.documento_cliente_firma || cliente.documento_identidad || ''}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}