/**
 * Genera el HTML del documento "Contrato de Prestación de Servicios"
 * con apariencia de contrato formal listo para PDF / impresión.
 */

function v(s) {
  if (s === null || s === undefined) return '';
  if (typeof s === 'object') return Array.isArray(s) ? s.join(', ') : JSON.stringify(s);
  return String(s);
}

function num(n) {
  if (n === null || n === undefined || n === '') return '0.00';
  const x = Number(n);
  return isNaN(x) ? '0.00' : x.toFixed(2);
}

function boolText(value, yes = 'Sí', no = 'No') {
  return value ? yes : no;
}

function escapeHtml(str) {
  return v(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function listToHtml(items) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

export function contratoPrestacionServiciosToHtml(data) {
  if (!data || typeof data !== 'object') return '';

  const doc = data.documento || {};
  const empresa = data.empresa || {};
  const comercializadora = data.comercializadora || {};
  const contratante = data.contratante || {};
  const objeto = data.objeto_contrato || {};
  const beneficios = data.beneficios_generales || {};
  const canales = beneficios.canales_autorizados || {};
  const precio = data.precio_y_pago || {};
  const formaPago = precio.forma_pago || {};
  const tarjeta = formaPago.tarjeta_credito || {};
  const credito = formaPago.credito_directo || {};
  const activacion = data.activacion_servicio || {};
  const uso = data.uso_servicio || {};
  const beneficiarios = data.beneficiarios || {};
  const terminacion = data.terminacion || {};
  const term72 = terminacion.terminacion_72_horas || {};
  const mejoramiento = data.mejoramiento_oferta || {};
  const hospedaje = data.beneficios_hospedaje || {};
  const especiales = data.beneficios_especiales || {};
  const planes = especiales.planes || {};
  const jurisdiccion = data.jurisdiccion || {};
  const firmas = data.firmas || {};
  const contacto = data.contacto || {};
  const repLegal = empresa.representante_legal || {};

  const numeroContrato = escapeHtml(doc.numero_contrato);
  const ciudad = escapeHtml(doc.ciudad);
  const fechaFirma = escapeHtml(doc.fecha_firma);
  const vigenciaAnios = escapeHtml(doc.vigencia_anios);

  const empresaRazon = escapeHtml(empresa.razon_social);
  const empresaNombre = escapeHtml(empresa.nombre_comercial);
  const empresaRuc = escapeHtml(empresa.ruc);
  const empresaRepresentante = escapeHtml(repLegal.nombre);
  const empresaCargo = escapeHtml(repLegal.cargo || 'Representante Legal');

  const comercializadoraRazon = escapeHtml(comercializadora.razon_social);
  const comercializadoraRuc = escapeHtml(comercializadora.ruc);

  const clienteNombre = escapeHtml(contratante.nombres_completos);
  const clienteCedula = escapeHtml(contratante.cedula);
  const clienteCorreo = escapeHtml(contratante.correo);
  const clienteDireccion = escapeHtml(contratante.direccion);
  const clienteTelefono = escapeHtml(contratante.telefono);

  const objetoDescripcion = escapeHtml(objeto.descripcion);
  const incluyeTiquetes = boolText(objeto.incluye_tiquetes_aereos, 'Sí', 'No');

  const canalesTexto = [
    canales.telefono ? `vía telefónica al ${escapeHtml(canales.telefono)}` : '',
    canales.email ? `al correo electrónico: ${escapeHtml(canales.email)}` : '',
    canales.direccion ? `en las oficinas ubicadas en ${escapeHtml(canales.direccion)}` : '',
    canales.horario ? `en los horarios de ${escapeHtml(canales.horario)}` : ''
  ]
    .filter(Boolean)
    .join(', ');

  const valorTotal = num(precio.valor_total_usd);
  const derechosContrato = num(precio.derechos_contrato_usd);
  const tarjetaMonto = num(tarjeta.monto);
  const creditoMonto = num(credito.monto);

  const premiumPrecio = escapeHtml(planes.premium?.precio_desde || '');
  const premiumAnt = escapeHtml(planes.premium?.anticipacion_dias || '');
  const standardPrecio = escapeHtml(planes.standard?.precio_desde || '');
  const standardAnt = escapeHtml(planes.standard?.anticipacion_horas || '');
  const plusPrecio = escapeHtml(planes.plus?.precio_desde || '');
  const plusAnt = escapeHtml(planes.plus?.anticipacion_dias || '');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contrato de Prestación de Servicios - ${numeroContrato}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #e5e7eb;
    }

    body {
      padding: 32px 0;
    }

    .page-shell {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 0 20px;
    }

    .documento {
      width: 794px;
      min-height: 1123px;
      background: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,0.16);
      border-radius: 4px;
      padding: 28mm 0;
    }

    .contenido-documento {
      width: 75%;
      max-width: 510px;
      margin: 0 auto;
    }

    .titulo-numero {
      text-align: center;
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .titulo-principal {
      text-align: center;
      font-weight: bold;
      font-size: 14pt;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }

    .tabla-beneficiario {
      width: 100%;
      border-collapse: collapse;
      margin: 12px auto 18px auto;
      font-size: 10.8pt;
    }

    .tabla-beneficiario td {
      border: 1px solid #000;
      padding: 6px 8px;
      vertical-align: top;
    }

    .tabla-beneficiario .label {
      width: 32%;
      font-weight: bold;
      background: #f5f5f5;
    }

    .clausula-titulo {
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 14px;
      margin-bottom: 8px;
    }

    ul {
      margin: 6px 0 10px 22px;
      padding: 0;
    }

    li {
      margin-bottom: 4px;
      text-align: justify;
    }

    .firma-section {
      margin-top: 28px;
      width: 100%;
    }

    .firmas-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 36px;
      align-items: end;
    }

    .firma-box {
      text-align: center;
      padding-top: 40px;
    }

    .firma-linea {
      border-top: 1px solid #000;
      margin: 0 auto 6px auto;
      width: 85%;
    }

    .firma-nombre {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10.5pt;
    }

    .firma-sub {
      font-size: 10pt;
    }

    .small {
      font-size: 10pt;
    }

    .spacer {
      height: 8px;
    }

    @media print {
      html, body {
        background: #fff;
      }

      body {
        padding: 0;
      }

      .page-shell {
        padding: 0;
        display: block;
      }

      .documento {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
        border-radius: 0;
      }

      .contenido-documento {
        width: auto;
        max-width: none;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="page-shell">
    <div class="documento">
      <div class="contenido-documento">
        <div class="titulo-numero">CONTRATO N.º - ${numeroContrato}</div>
        <div class="titulo-principal">CONTRATO CIVIL DE PRESTACIÓN DE SERVICIOS</div>

        <p>
          En la ciudad de ${ciudad}, el ${fechaFirma}, comparecen a la celebración del presente contrato,
          por una parte el señor ${empresaRepresentante}, en su calidad de ${empresaCargo}
          de ${empresaRazon}, con RUC No. ${empresaRuc}, con nombre comercial ${empresaNombre},
          a quien para efectos del presente contrato se denominará <strong>LA EMPRESA</strong>; la compañía
          ${comercializadoraRazon}, con RUC: ${comercializadoraRuc}, la cual es la comercializadora autorizada
          de ${empresaNombre}; y por otra parte el señor/a:
        </p>

        <table class="tabla-beneficiario">
          <tr>
            <td class="label">BENEFICIARIO N.º 1</td>
            <td>${clienteNombre}</td>
          </tr>
          <tr>
            <td class="label">NOMBRE Y APELLIDO</td>
            <td>${clienteNombre}</td>
          </tr>
          <tr>
            <td class="label">CÉDULA</td>
            <td>${clienteCedula}</td>
          </tr>
          <tr>
            <td class="label">CORREO</td>
            <td>${clienteCorreo}</td>
          </tr>
          <tr>
            <td class="label">DIRECCIÓN</td>
            <td>${clienteDireccion}</td>
          </tr>
          <tr>
            <td class="label">TELÉFONO</td>
            <td>${clienteTelefono}</td>
          </tr>
        </table>

        <p>
          quien para efectos del presente contrato se denominará <strong>EL CONTRATANTE</strong>,
          las partes por sus propios derechos, siendo mayores de edad y en general capaces para celebrar
          todo tipo de acto, acuerdos, negociaciones y contratos permitidos por la ley.
        </p>

        <div class="clausula-titulo">I. PRIMERA: ANTECEDENTES.-</div>
        <p>
          a. ${empresaNombre} es una compañía legalmente constituida en el Ecuador, regida bajo los permisos
          de las entidades de control que rigen su actividad de agencia de viajes.
        </p>
        <p>
          b. EL CONTRATANTE requiere servicio especializado en el área turística, tanto en asesoría
          como en procesos de reservas en los distintos productos turísticos.
        </p>
        <p>
          c. EL CONTRATANTE reconoce y está de acuerdo que ${comercializadoraRazon} es comercializadora
          autorizada de ${empresaRazon}, por lo tanto acepta de manera libre y voluntaria que el pago
          se realizará a la comercializadora, mientras que el cumplimiento del contrato, beneficios y
          ventajas son responsabilidad de ${empresaRazon}.
        </p>

        <div class="clausula-titulo">II. SEGUNDA: OBJETO DEL CONTRATO.-</div>
        <p>
          Con los antecedentes expuestos, EL CONTRATANTE declara haber recibido una presentación del producto
          con información clara, veraz y oportuna; haber solventado sus dudas; y aceptar de manera libre
          y voluntaria la adquisición del servicio de ${empresaNombre}, consistente en:
        </p>
        <p>${objetoDescripcion}</p>
        <p>
          Incluye tiquetes aéreos: <strong>${incluyeTiquetes}</strong>.
        </p>

        <div class="clausula-titulo">III. TERCERA: BENEFICIOS Y VENTAJAS.-</div>
        <p>
          Las partes aceptan que los beneficios fueron explicados y negociados, los cuales incluyen:
        </p>
        <ul>
          <li>Asesoría turística: ${boolText(beneficios.asesoria_turistica)}</li>
          <li>Cotizaciones y proformas: ${boolText(beneficios.cotizaciones_proformas)}</li>
          <li>Reservas de servicios: ${boolText(beneficios.reservas_servicios)}</li>
          <li>Tarifas preferenciales: ${boolText(beneficios.tarifas_preferenciales)}</li>
          <li>Tiempo estimado de respuesta: ${escapeHtml(beneficios.tiempo_respuesta_dias || '')} días</li>
        </ul>
        <p>
          Los canales autorizados son: ${escapeHtml(canalesTexto)}.
        </p>

        <div class="clausula-titulo">IV. CUARTA: PRECIO ACORDADO A PAGAR.-</div>
        <p>
          Las partes reconocen haber negociado y acordado que el valor total a pagar por EL CONTRATANTE
          es de <strong>USD $${valorTotal}</strong>.
          ${precio.incluye_iva ? 'Este valor incluye IVA.' : 'Este valor no incluye IVA.'}
        </p>
        <p>
          Las partes aceptan además que el valor de derechos del contrato asciende a
          <strong>USD $${derechosContrato}</strong>,
          y ${precio.no_reembolsable ? 'no es reembolsable' : 'está sujeto a las condiciones pactadas'}.
        </p>

        <div class="clausula-titulo">V. QUINTA: FORMA DE PAGO Y RECONOCIMIENTO.-</div>
        <p>
          EL CONTRATANTE reconoce que la forma de pago acordada contempla:
        </p>
        <ul>
          <li>
            Tarjeta de crédito:
            ${escapeHtml(tarjeta.marca || '')}
            ${tarjeta.banco ? ` / ${escapeHtml(tarjeta.banco)}` : ''}
            ${tarjeta.modalidad ? ` / modalidad ${escapeHtml(tarjeta.modalidad)}` : ''}
            / monto USD $${tarjetaMonto}
          </li>
          <li>
            Crédito directo:
            monto USD $${creditoMonto}
            ${credito.fecha_vencimiento ? ` / vencimiento ${escapeHtml(credito.fecha_vencimiento)}` : ''}
            / pagaré ${boolText(credito.pagare)}
          </li>
          <li>
            Declaración de origen lícito de fondos: ${boolText(precio.declaracion_origen_fondos)}
          </li>
        </ul>

        <div class="clausula-titulo">VI. SEXTA: VIGENCIA ACORDADA DEL SERVICIO.-</div>
        <p>
          Este contrato civil tendrá una vigencia de <strong>${vigenciaAnios} AÑO(S)</strong> a partir
          de la firma del presente contrato, cuyo uso será ilimitado según lo negociado por las partes.
        </p>

        <div class="clausula-titulo">VII. SÉPTIMA: ACTIVACIÓN E INICIO DE FUNCIONAMIENTO DEL SERVICIO Y/O PRODUCTO.-</div>
        <p>
          Se entiende que EL CONTRATANTE ha activado o hecho uso de los servicios o producto contratado cuando:
        </p>
        <ul>
          <li>Con la firma del contrato: ${boolText(activacion.firma_contrato)}</li>
          <li>Solicitud escrita de activación: ${boolText(activacion.solicitud_escrita)}</li>
          <li>Uso de certificados entregados: ${boolText(activacion.uso_certificados)}</li>
          <li>Uso de beneficios con proveedores externos: ${boolText(activacion.uso_beneficios_proveedores)}</li>
        </ul>

        <div class="clausula-titulo">VIII. OCTAVA: USO DEL SERVICIO.-</div>
        <p>
          El servicio será solicitado y procesado conforme a los canales autorizados por LA EMPRESA.
          Las partes reconocen además:
        </p>
        <ul>
          <li>Solicitud por email: ${boolText(uso.solicitud_por_email)}</li>
          <li>Responsabilidad de datos del cliente: ${boolText(uso.responsabilidad_datos_cliente)}</li>
          <li>Responsabilidad del proveedor turístico: ${boolText(uso.responsabilidad_proveedor_turistico)}</li>
        </ul>

        <div class="clausula-titulo">IX. NOVENA: BENEFICIARIOS.-</div>
        <p>
          EL CONTRATANTE es el beneficiario principal del presente contrato:
          <strong>${boolText(beneficiarios.beneficiario_principal)}</strong>.
          El beneficio puede extenderse hasta <strong>${escapeHtml(beneficiarios.extensible_consanguinidad_hasta || '')}</strong>
          y el uso por terceros es <strong>${escapeHtml(beneficiarios.uso_por_terceros || '')}</strong>,
          requiriendo autorización escrita: <strong>${boolText(beneficiarios.requiere_autorizacion_escrita)}</strong>.
        </p>

        <div class="clausula-titulo">X. DÉCIMA: TERMINACIÓN.-</div>
        <p>
          Las partes aceptan que la terminación del contrato se sujeta a las condiciones pactadas:
        </p>
        <ul>
          <li>Tipo: ${escapeHtml(terminacion.tipo || '')}</li>
          <li>Retención porcentual: ${escapeHtml(terminacion.retencion_porcentaje || '')}</li>
          <li>Derechos del contrato no reembolsables: ${boolText(terminacion.derechos_contrato_no_reembolsable)}</li>
          <li>
            Terminación dentro de 72 horas:
            descuento ${escapeHtml(term72.descuento || '')},
            requiere pago total: ${boolText(term72.requiere_pago_total)}
          </li>
        </ul>

        <div class="clausula-titulo">XI. DÉCIMA PRIMERA: BENEFICIO DE MEJORAMIENTO DE OFERTA.-</div>
        <p>
          Este beneficio ${mejoramiento.aplica ? 'sí aplica' : 'no aplica'}.
          Excluye tiquetes aéreos: <strong>${boolText(mejoramiento.excluye_tiquetes_aereos)}</strong>.
        </p>
        ${listToHtml(mejoramiento.condiciones)}

        <div class="clausula-titulo">XII. DÉCIMA SEGUNDA: BENEFICIOS DE HOSPEDAJE.-</div>
        <p>
          El presente contrato concede el derecho de uso de los beneficios de hospedaje conforme a las condiciones acordadas:
        </p>
        <ul>
          <li>Noches por año: ${escapeHtml(hospedaje.noches_por_anio || '')}</li>
          <li>Temporada baja/media: ${boolText(hospedaje.temporada_baja_media)}</li>
          <li>Feriados nacionales: ${boolText(hospedaje.feriados_nacionales)}</li>
          <li>Destinos: ${Array.isArray(hospedaje.destinos) ? hospedaje.destinos.map(escapeHtml).join(', ') : escapeHtml(hospedaje.destinos || '')}</li>
          <li>Uso compartido: ${boolText(hospedaje.uso_compartido)}</li>
          <li>Uso familiar: ${boolText(hospedaje.uso_familiar)}</li>
        </ul>

        <div class="clausula-titulo">XIII. DÉCIMA TERCERA: BENEFICIOS ESPECIALES.-</div>
        <p>
          Los beneficios especiales están sujetos a disponibilidad y temporada.
          Getaway Weeks: <strong>${boolText(especiales.getaway_weeks)}</strong>.
        </p>
        <ul>
          <li>Plan Premium: desde USD ${premiumPrecio || '—'} / anticipación ${premiumAnt || '—'} días</li>
          <li>Plan Standard: desde USD ${standardPrecio || '—'} / anticipación ${standardAnt || '—'} horas</li>
          <li>Plan Plus: desde USD ${plusPrecio || '—'} / anticipación ${plusAnt || '—'} días</li>
        </ul>

        <div class="clausula-titulo">XIV. DÉCIMA CUARTA: TÉRMINOS Y CONDICIONES.-</div>
        <p>
          Las partes aceptan que todo lo expuesto en este documento ha sido acordado, negociado y aceptado
          libre y voluntariamente en beneficio de ambas partes.
        </p>

        <div class="clausula-titulo">XV. DÉCIMA QUINTA: JURISDICCIÓN, COMPETENCIA Y CONTROVERSIA.-</div>
        <p>
          En caso de controversia, las partes se someten a
          <strong>${escapeHtml(jurisdiccion.centro_arbitraje || '')}</strong>,
          bajo modalidad <strong>${escapeHtml(jurisdiccion.tipo || '')}</strong>,
          con un número de árbitros de <strong>${escapeHtml(jurisdiccion.numero_arbitros || '')}</strong>.
        </p>

        <div class="firma-section">
          <p>
            Para constancia de la aceptación de lo expresado, las partes firman como muestra de su conformidad.
          </p>

          <div class="firmas-grid">
            <div class="firma-box">
              <div class="firma-linea"></div>
              <div class="firma-nombre">${empresaNombre || 'LA EMPRESA'}</div>
              <div class="firma-sub">${empresaRuc}</div>
              ${firmas.empresa?.fecha ? `<div class="small">Fecha: ${escapeHtml(firmas.empresa.fecha)}</div>` : ''}
            </div>

            <div class="firma-box">
              <div class="firma-linea"></div>
              <div class="firma-nombre">${clienteNombre || 'EL CONTRATANTE'}</div>
              <div class="firma-sub">${clienteCedula}</div>
              ${firmas.contratante?.fecha ? `<div class="small">Fecha: ${escapeHtml(firmas.contratante.fecha)}</div>` : ''}
            </div>
          </div>
        </div>

        <div class="clausula-titulo">XVI. DÉCIMA SEXTA: ACUERDOS Y NEGOCIACIONES.-</div>
        <p>
          Las partes reconocen que ${comercializadoraRazon} es comercializadora autorizada de ${empresaRazon},
          por lo tanto esta última es responsable del cumplimiento del presente documento, dejando libre
          de responsabilidad a la comercializadora en los términos pactados. Asimismo, las partes aceptan
          de forma voluntaria que lo plasmado en este contrato civil ha sido acordado y negociado en su totalidad.
        </p>

        ${(contacto.email || contacto.telefono || contacto.direccion) ? `
          <div class="spacer"></div>
          <p class="small">
            <strong>Contacto:</strong>
            ${escapeHtml(contacto.email || '')}
            ${contacto.email && contacto.telefono ? ' | ' : ''}
            ${escapeHtml(contacto.telefono || '')}
            ${(contacto.email || contacto.telefono) && contacto.direccion ? ' | ' : ''}
            ${escapeHtml(contacto.direccion || '')}
          </p>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}