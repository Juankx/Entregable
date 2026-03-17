export function pagareCreditoToHtml(data) {
  const documento = data?.documento || {};
  const acreedor = data?.acreedor || {};
  const deudor = data?.deudor || {};
  const obligacion = data?.obligacion || {};
  const planPago = data?.plan_pago || {};
  const intereses = data?.intereses || {};
  const condiciones = data?.condiciones_adicionales || {};
  const autorizaciones = data?.autorizaciones || {};
  const relacion = data?.relacion_contractual || {};
  const firmas = data?.firmas || {};
  const contacto = data?.contacto || {};
  const causales = Array.isArray(data?.causales_vencimiento_anticipado)
    ? data.causales_vencimiento_anticipado
    : [];

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Pagaré a la Orden</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 34px 42px;
            line-height: 1.45;
            font-size: 13px;
          }

          h1 {
            text-align: center;
            font-size: 20px;
            margin-bottom: 22px;
            text-transform: uppercase;
          }

          h2 {
            font-size: 15px;
            margin: 20px 0 8px;
          }

          p {
            margin: 7px 0;
            text-align: justify;
          }

          ul {
            margin: 6px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 4px;
          }

          .firmas {
            margin-top: 55px;
            display: flex;
            justify-content: space-between;
            gap: 30px;
          }

          .firma {
            width: 46%;
            text-align: center;
          }

          .linea {
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
        <h1>Pagaré a la Orden</h1>

        <p>
          En la ciudad de <strong>${documento.ciudad_suscripcion || ''}</strong>,
          a los <strong>${documento.fecha_suscripcion || ''}</strong>,
          yo, <strong>${deudor.nombres_completos || ''}</strong>,
          con cédula <strong>${deudor.cedula || ''}</strong>,
          me obligo de manera <strong>${obligacion.responsabilidad || ''}</strong>
          a pagar a la orden de <strong>${acreedor.razon_social || ''}</strong>,
          RUC <strong>${acreedor.ruc || ''}</strong>,
          la suma de <strong>${obligacion.monto_letras || ''}</strong>
          (<strong>${Number(obligacion.monto_total_usd || 0).toFixed(2)} ${obligacion.moneda || 'USD'}</strong>).
        </p>

        <p>
          La presente obligación tiene su origen en:
          <strong>${obligacion.origen || ''}</strong>,
          relacionada con el contrato número
          <strong>${relacion.numero_contrato || ''}</strong>,
          de tipo <strong>${relacion.tipo_contrato || ''}</strong>.
        </p>

        <h2>Plan de pago</h2>
        <p><strong>Saldo inicial:</strong> ${Number(planPago.saldo_inicial_usd || 0).toFixed(2)} USD</p>
        <p><strong>Número de cuotas:</strong> ${planPago.numero_cuotas || 0}</p>
        <p><strong>Monto por cuota:</strong> ${Number(planPago.monto_cuota_usd || 0).toFixed(2)} USD</p>
        <p><strong>Periodicidad:</strong> ${planPago.periodicidad || ''}</p>
        <p><strong>Fecha de inicio:</strong> ${documento.fecha_inicio || ''}</p>
        <p><strong>Fecha de vencimiento:</strong> ${documento.fecha_vencimiento || ''}</p>

        <h2>Intereses</h2>
        <p>
          <strong>Interés corriente:</strong>
          ${intereses?.interes_corriente?.aplica ? 'Sí' : 'No'}
          ${intereses?.interes_corriente?.tasa ? `- ${intereses.interes_corriente.tasa}` : ''}
        </p>
        <p>
          <strong>Interés por mora:</strong>
          ${intereses?.interes_mora?.aplica ? 'Sí' : 'No'}
          ${intereses?.interes_mora?.tasa_maxima_legal ? '- Hasta la tasa máxima legal aplicable' : ''}
        </p>

        <h2>Causales de vencimiento anticipado</h2>
        <ul>
          ${causales.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h2>Condiciones adicionales</h2>
        <p><strong>Capitalización de intereses:</strong> ${condiciones.capitalizacion_intereses ? 'Sí' : 'No'}</p>
        <p><strong>Endoso y cesión autorizados:</strong> ${condiciones.endoso_y_cesion_autorizados ? 'Sí' : 'No'}</p>
        <p><strong>Costos de cobranza a cargo del deudor:</strong> ${condiciones.costos_cobranza_a_cargo_deudor ? 'Sí' : 'No'}</p>

        <h2>Autorizaciones</h2>
        <p><strong>Consulta en centrales de riesgo:</strong> ${autorizaciones.consulta_centrales_riesgo ? 'Sí' : 'No'}</p>
        <p><strong>Reporte de comportamiento crediticio:</strong> ${autorizaciones.reporte_comportamiento_crediticio ? 'Sí' : 'No'}</p>

        <h2>Datos del deudor</h2>
        <p><strong>Nombre:</strong> ${deudor.nombres_completos || ''}</p>
        <p><strong>Cédula:</strong> ${deudor.cedula || ''}</p>
        <p><strong>Lugar de expedición:</strong> ${deudor.lugar_expedicion_cedula || ''}</p>
        <p><strong>Dirección:</strong> ${deudor.direccion || ''}</p>
        <p><strong>Teléfono:</strong> ${deudor.telefono || ''}</p>

        <h2>Contacto del acreedor</h2>
        <p><strong>Email:</strong> ${contacto.email || ''}</p>
        <p><strong>Teléfono:</strong> ${contacto.telefono || ''}</p>
        <p><strong>Dirección:</strong> ${contacto.direccion || ''}</p>

        <div class="firmas">
          <div class="firma">
            <div class="linea">
              <div><strong>${firmas?.acreedor?.nombre_representante || 'Representante del acreedor'}</strong></div>
              <div class="small">${acreedor.razon_social || ''}</div>
              <div class="small">Fecha: ${firmas?.acreedor?.fecha || ''}</div>
            </div>
          </div>

          <div class="firma">
            <div class="linea">
              <div><strong>${deudor.nombres_completos || ''}</strong></div>
              <div class="small">CI: ${deudor.cedula || ''}</div>
              <div class="small">Fecha: ${firmas?.deudor?.fecha || ''}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}