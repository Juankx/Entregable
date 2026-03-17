function v(s) {
  if (s === null || s === undefined) return '';
  if (typeof s === 'object') return Array.isArray(s) ? s.join(', ') : JSON.stringify(s);
  return String(s);
}

function escapeHtml(str) {
  return v(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(n) {
  if (n === null || n === undefined || n === '') return '';
  const x = Number(n);
  return Number.isNaN(x) ? escapeHtml(n) : x.toFixed(2);
}

function buildAddress(address = {}) {
  const parts = [
    address.street,
    address.building,
    address.floor ? `Piso N.º ${address.floor}` : '',
    address.office ? `Ofic N.º ${address.office}` : '',
  ].filter(Boolean);
  return parts.join(', ');
}

export function autorizacionCobroPacificoToHtml(data) {
  if (!data || typeof data !== 'object') return '';

  const company = data.company || {};
  const contact = company.contact || {};
  const address = contact.address || {};

  const client = data.client || {};
  const card = data.card_authorization || {};
  const amount = card.amount || {};
  const voucher = card.voucher || {};
  const signature = data.signature || {};
  const commercial = data.commercial_data || {};
  const contract = commercial.contract || {};
  const payment = commercial.payment_details || {};
  const promissory = payment.promissory_note || {};
  const stay = commercial.stay_details || {};
  const international = stay.international || {};
  const national = stay.national || {};
  const acceptance = data.client_acceptance || {};

  const companyAddress = buildAddress(address);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Autorización de Cobro Pacific</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #111;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.35;
    }

    .doc {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      padding: 4mm 2mm 6mm 2mm;
    }

    .top-fields {
      margin-bottom: 20px;
    }

    .field-line {
      margin-bottom: 12px;
    }

    .line {
      display: inline-block;
      min-width: 360px;
      border-bottom: 1px solid #000;
      padding: 0 4px 2px 4px;
      vertical-align: bottom;
    }

    .line.short {
      min-width: 220px;
    }

    .line.medium {
      min-width: 280px;
    }

    .title {
      text-align: center;
      font-weight: bold;
      font-size: 15pt;
      text-transform: uppercase;
      margin: 28px 0 26px 0;
    }

    .section-space {
      height: 12px;
    }

    .paragraph {
      margin: 18px 0;
      text-align: justify;
    }

    .signature-block {
      margin-top: 22px;
      margin-bottom: 30px;
    }

    .signature-line {
      display: inline-block;
      min-width: 280px;
      border-bottom: 1px solid #000;
      padding: 0 4px 2px 4px;
      vertical-align: bottom;
    }

    .bottom-title {
      text-align: center;
      font-weight: bold;
      margin: 26px 0 20px 0;
      text-transform: uppercase;
      font-size: 12pt;
    }

    table.meta {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 24px;
      font-size: 10.5pt;
    }

    table.meta td {
      border: 1px solid #000;
      padding: 8px 10px;
      vertical-align: top;
      height: 34px;
    }

    table.meta .label {
      width: 28%;
      font-weight: bold;
      background: #f5f5f5;
    }

    table.meta .value {
      width: 22%;
    }

    .acceptance {
      margin-top: 18px;
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
    }

    .acceptance-signatures {
      margin-top: 18px;
      display: flex;
      justify-content: center;
      gap: 90px;
    }

    .acceptance-signatures .sig {
      width: 170px;
      border-top: 1px solid #000;
      height: 20px;
    }

    .footer {
      margin-top: 28px;
      text-align: left;
      font-size: 10.5pt;
    }

    .footer strong {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="doc">
    <div class="top-fields">
      <div class="field-line">
        <strong>Nombres completos del cliente:</strong>
        <span class="line">${escapeHtml(client.full_name)}</span>
      </div>

      <div class="field-line">
        <strong>Ciudad y país:</strong>
        <span class="line short">${escapeHtml(client.city_country)}</span>
      </div>

      <div class="field-line">
        <strong>Teléfono:</strong>
        <span class="line short">${escapeHtml(client.phone)}</span>
      </div>
    </div>

    <div class="title">AUTORIZACION DE CARGO A TARJETA DE CREDITO</div>

    <div class="field-line">
      <strong>Nombre del tarjetahabiente:</strong>
      <span class="line">${escapeHtml(card.cardholder_name)}</span>
    </div>

    <div class="field-line">
      <strong>Tipo de tarjeta:</strong>
      <span class="line">${escapeHtml(card.card_type)}</span>
    </div>

    <div class="field-line">
      <strong>Numero de tarjeta:</strong>
      <span class="line">${escapeHtml(card.card_number)}</span>
    </div>

    <div class="field-line">
      <strong>Fecha de caducidad:</strong>
      <span class="line medium">${escapeHtml(card.expiration_date)}</span>
    </div>

    <div class="section-space"></div>

    <div class="paragraph">
      <strong>AUTORIZACION:</strong><br><br>
      Yo, <span class="line short">${escapeHtml(signature.cardholder_name || card.cardholder_name)}</span>,
      autorizo a ${escapeHtml(company.legal_name)}, con RUC No. ${escapeHtml(company.ruc)},
      con nombre comercial ${escapeHtml(company.commercial_name)},
      a realizar el cargo a mi tarjeta de débito por el valor de
      $(${money(amount.numeric)}) ${escapeHtml(amount.text)}
      ${amount.currency ? ` ${escapeHtml(amount.currency)}` : ''}
      con el motivo de ${escapeHtml(card.purpose)}.
    </div>

    <div class="paragraph">
      Dicho consumo se refleja en el voucher, con
      Lote N.º <span class="line short">${escapeHtml(voucher.batch_number)}</span>;
      Referencia N.º <span class="line short">${escapeHtml(voucher.reference_number)}</span>
      y Aprobación N.º <span class="line short">${escapeHtml(voucher.approval_number)}</span>.
      Modalidad <span class="line short">${escapeHtml(voucher.payment_method)}</span>.
    </div>

    <div class="signature-block">
      <div class="field-line">
        <strong>Firma del tarjetahabiente:</strong>
        <span class="signature-line">${escapeHtml(signature.cardholder_signature)}</span>
      </div>

      <div class="field-line">
        <strong>Nombres y apellidos:</strong>
        <span class="signature-line">${escapeHtml(signature.cardholder_name)}</span>
      </div>

      <div class="field-line">
        <strong>No. de cédula:</strong>
        <span class="signature-line">${escapeHtml(signature.id_number)}</span>
      </div>

      <div class="field-line">
        <strong>Fecha:</strong>
        <span class="line short">${escapeHtml(signature.signed_at)}</span>
      </div>
    </div>

    <div class="bottom-title">LINER Y CLOSER</div>

    <table class="meta">
      <tr>
        <td class="label">LINER Y CLOSER</td>
        <td class="value">${escapeHtml(commercial.liner)}</td>
        <td class="value">${escapeHtml(commercial.closer)}</td>
      </tr>
      <tr>
        <td class="label">FECHA</td>
        <td colspan="2">${escapeHtml(contract.date)}</td>
      </tr>
      <tr>
        <td class="label">CONTRATO</td>
        <td colspan="2">${escapeHtml(contract.contract_number)}</td>
      </tr>
      <tr>
        <td class="label">VALOR DEL CONTRATO</td>
        <td>${money(contract.contract_value)}</td>
        <td class="label">AÑOS DE CONTRATO</td>
      </tr>
      <tr>
        <td class="value">${escapeHtml(contract.contract_years)}</td>
        <td class="label">TARJETA Y BANCO</td>
        <td>${escapeHtml(payment.card_and_bank)}</td>
      </tr>
      <tr>
        <td class="label"># DE NOCHES</td>
        <td>${escapeHtml(international.nights)}</td>
        <td class="label">PAGARE Y FECHA DE VENCIMIENTO</td>
      </tr>
      <tr>
        <td>${promissory.exists ? 'Sí' : 'No'}</td>
        <td colspan="2">${escapeHtml(promissory.due_date)}</td>
      </tr>
      <tr>
        <td class="label">ESTADIA INTERNACIONAL</td>
        <td>${escapeHtml(international.nights)}</td>
        <td class="label">NUMERO DE PAX</td>
      </tr>
      <tr>
        <td>${escapeHtml(international.pax)}</td>
        <td class="label">ESTADIA NACIONAL</td>
        <td>${escapeHtml(national.pax)}</td>
      </tr>
      <tr>
        <td class="label">NUMERO DE PAX</td>
        <td colspan="2">${escapeHtml(national.pax)}</td>
      </tr>
      <tr>
        <td class="label">CORTESIAS POR ASISTENCIA</td>
        <td colspan="2">${escapeHtml(commercial.courtesies)}</td>
      </tr>
      <tr>
        <td class="label">OFRECIMIENTOS ADICIONALES</td>
        <td colspan="2">${escapeHtml(commercial.additional_offers)}</td>
      </tr>
    </table>

    <div class="acceptance">ACEPTACION DEL CLIENTE</div>
    <div class="acceptance-signatures">
      <div class="sig"></div>
      <div class="sig"></div>
    </div>

    <div class="footer">
      <strong>DATOS PARA CONTRATOS</strong><br>
      Contáctanos: ${escapeHtml(contact.email)} / ${escapeHtml(contact.phone)}<br>
      Dir.: ${escapeHtml(companyAddress)}
    </div>
  </div>
</body>
</html>`;
}