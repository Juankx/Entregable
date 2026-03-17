export function solicitudActivacionContratoToHtml(data) {
  const company = data?.company || {};
  const contact = company?.contact || {};
  const address = contact?.address || {};
  const client = data?.client || {};
  const contract = data?.contract || {};
  const acceptance = contract?.acceptance || {};
  const signatures = data?.signatures || {};

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Solicitud de Activación de Contrato</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 38px 44px;
            line-height: 1.5;
            font-size: 14px;
          }

          h1 {
            text-align: center;
            font-size: 20px;
            margin-bottom: 24px;
            text-transform: uppercase;
          }

          h2 {
            font-size: 15px;
            margin: 22px 0 10px;
          }

          p {
            margin: 8px 0;
            text-align: justify;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 14px;
            margin-bottom: 14px;
          }

          ul {
            margin: 8px 0 0 20px;
            padding: 0;
          }

          li {
            margin-bottom: 6px;
          }

          .firma {
            margin-top: 55px;
            width: 50%;
          }

          .linea {
            border-top: 1px solid #000;
            margin-top: 42px;
            padding-top: 8px;
            text-align: center;
          }

          .small {
            font-size: 12px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <h1>Solicitud de Activación de Contrato</h1>

        <div class="box">
          <p><strong>Empresa:</strong> ${company.name || ''}</p>
          <p><strong>Email:</strong> ${contact.email || ''}</p>
          <p><strong>Teléfono:</strong> ${contact.phone || ''}</p>
          <p>
            <strong>Dirección:</strong>
            ${address.street || ''},
            ${address.building || ''},
            piso ${address.floor || ''},
            oficina ${address.office || ''}
          </p>
        </div>

        <div class="box">
          <p><strong>Cliente:</strong> ${client.full_name || ''}</p>
          <p><strong>Tipo de documento:</strong> ${client.document_type || ''}</p>
          <p><strong>Número de documento:</strong> ${client.document_number || ''}</p>
          <p><strong>Número de contrato:</strong> ${contract.contract_number || ''}</p>
          <p><strong>Motivo de activación:</strong> ${contract.activation_reason || ''}</p>
        </div>

        <h2>Declaración</h2>
        <p>${data?.statement || ''}</p>

        <h2>Aceptaciones</h2>
        <ul>
          <li>Presentación aceptada: ${acceptance.accepted_presentation ? 'Sí' : 'No'}</li>
          <li>Oferta aceptada: ${acceptance.accepted_offer ? 'Sí' : 'No'}</li>
          <li>Pago confirmado: ${acceptance.payment_confirmed ? 'Sí' : 'No'}</li>
          <li>Costos administrativos reconocidos: ${acceptance.administrative_costs_acknowledged ? 'Sí' : 'No'}</li>
        </ul>

        <div class="firma">
          <div class="linea">
            <div><strong>${signatures.client_name || client.full_name || ''}</strong></div>
            <div class="small">Documento: ${signatures.client_document || client.document_number || ''}</div>
            <div class="small">Fecha: ${signatures.signed_at || ''}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}