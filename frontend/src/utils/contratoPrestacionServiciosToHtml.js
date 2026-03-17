/**
 * Genera el HTML del documento "Contrato de Prestación de Servicios"
 * siguiendo la estructura de contrato-prestacion-servicios.json (y el .docx de referencia).
 * Fondo blanco, tipografía clara, aspecto documento Word.
 */
function v(s) {
  if (s === null || s === undefined) return '';
  if (typeof s === 'object') return Array.isArray(s) ? s.join(', ') : JSON.stringify(s);
  return String(s);
}

function num(n) {
  if (n === null || n === undefined) return '0';
  const x = Number(n);
  return isNaN(x) ? '0' : x.toFixed(2);
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

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato de Prestación de Servicios - ${v(doc.numero_contrato)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; color: #1a1a1a; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
    .container { max-width: 210mm; margin: 0 auto; padding: 20px 24px; }
    .titulo-principal { text-align: center; font-size: 16pt; font-weight: bold; color: #1a365d; border-bottom: 2px solid #0066cc; padding-bottom: 12px; margin-bottom: 20px; }
    .subtitulo { font-size: 12pt; font-weight: bold; color: #1a365d; margin-top: 18px; margin-bottom: 8px; }
    .bloque { margin-bottom: 14px; }
    .fila { margin-bottom: 4px; }
    .etiqueta { font-weight: 600; color: #374151; }
    p { margin: 8px 0; }
    .lista { margin: 6px 0 6px 18px; padding-left: 8px; }
    .firma-box { margin-top: 24px; padding: 16px; border: 1px solid #d1d5db; border-radius: 6px; background: #f9fafb; }
    .footer-doc { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10pt; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="titulo-principal">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>

    <div class="bloque">
      <div class="subtitulo">Identificación del documento</div>
      <div class="fila"><span class="etiqueta">Número de contrato:</span> ${v(doc.numero_contrato)}</div>
      <div class="fila"><span class="etiqueta">Ciudad:</span> ${v(doc.ciudad)}</div>
      <div class="fila"><span class="etiqueta">Fecha de firma:</span> ${v(doc.fecha_firma)}</div>
      <div class="fila"><span class="etiqueta">Vigencia (años):</span> ${v(doc.vigencia_anios)}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Parte proveedora – Empresa</div>
      <div class="fila"><span class="etiqueta">Razón social:</span> ${v(empresa.razon_social)}</div>
      <div class="fila"><span class="etiqueta">Nombre comercial:</span> ${v(empresa.nombre_comercial)}</div>
      <div class="fila"><span class="etiqueta">RUC:</span> ${v(empresa.ruc)}</div>
      <div class="fila"><span class="etiqueta">Representante legal:</span> ${v(repLegal.nombre)} – ${v(repLegal.cargo)}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Comercializadora</div>
      <div class="fila"><span class="etiqueta">Razón social:</span> ${v(comercializadora.razon_social)}</div>
      <div class="fila"><span class="etiqueta">RUC:</span> ${v(comercializadora.ruc)}</div>
      <div class="fila"><span class="etiqueta">Rol:</span> ${v(comercializadora.rol)}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Contratante (cliente)</div>
      <div class="fila"><span class="etiqueta">Nombres completos:</span> ${v(contratante.nombres_completos)}</div>
      <div class="fila"><span class="etiqueta">Cédula:</span> ${v(contratante.cedula)}</div>
      <div class="fila"><span class="etiqueta">Correo:</span> ${v(contratante.correo)}</div>
      <div class="fila"><span class="etiqueta">Teléfono:</span> ${v(contratante.telefono)}</div>
      <div class="fila"><span class="etiqueta">Dirección:</span> ${v(contratante.direccion)}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Objeto del contrato</div>
      <p>${v(objeto.descripcion)}</p>
      <div class="fila"><span class="etiqueta">Incluye tiquetes aéreos:</span> ${objeto.incluye_tiquetes_aereos ? 'Sí' : 'No'}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Beneficios generales y canales</div>
      <div class="fila"><span class="etiqueta">Asesoría turística:</span> ${beneficios.asesoria_turistica ? 'Sí' : 'No'}</div>
      <div class="fila"><span class="etiqueta">Cotizaciones y proformas:</span> ${beneficios.cotizaciones_proformas ? 'Sí' : 'No'}</div>
      <div class="fila"><span class="etiqueta">Reservas de servicios:</span> ${beneficios.reservas_servicios ? 'Sí' : 'No'}</div>
      <div class="fila"><span class="etiqueta">Tarifas preferenciales:</span> ${beneficios.tarifas_preferenciales ? 'Sí' : 'No'}</div>
      <div class="fila"><span class="etiqueta">Tiempo de respuesta (días):</span> ${v(beneficios.tiempo_respuesta_dias)}</div>
      <p><span class="etiqueta">Canales autorizados:</span> Tel. ${v(canales.telefono)} | ${v(canales.email)} | ${v(canales.direccion)} | ${v(canales.horario)}</p>
    </div>

    <div class="bloque">
      <div class="subtitulo">Precio y forma de pago</div>
      <div class="fila"><span class="etiqueta">Valor total (USD):</span> $${num(precio.valor_total_usd)}</div>
      <div class="fila"><span class="etiqueta">Incluye IVA:</span> ${precio.incluye_iva ? 'Sí' : 'No'}</div>
      <div class="fila"><span class="etiqueta">Derechos de contrato (USD):</span> $${num(precio.derechos_contrato_usd)}</div>
      <div class="fila"><span class="etiqueta">No reembolsable:</span> ${precio.no_reembolsable ? 'Sí' : 'No'}</div>
      <div class="fila"><span class="etiqueta">Tarjeta de crédito – Marca/Banco:</span> ${v(tarjeta.marca)} / ${v(tarjeta.banco)} – $${num(tarjeta.monto)} – ${v(tarjeta.modalidad)}</div>
      <div class="fila"><span class="etiqueta">Crédito directo – Monto/Vencimiento/Pagaré:</span> $${num(credito.monto)} | ${v(credito.fecha_vencimiento)} | ${credito.pagare ? 'Sí' : 'No'}</div>
      <div class="fila"><span class="etiqueta">Declaración de origen de fondos:</span> ${precio.declaracion_origen_fondos ? 'Sí' : 'No'}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Activación del servicio</div>
      <div class="fila">Firma del contrato: ${activacion.firma_contrato ? 'Sí' : 'No'}</div>
      <div class="fila">Solicitud escrita: ${activacion.solicitud_escrita ? 'Sí' : 'No'}</div>
      <div class="fila">Uso de certificados: ${activacion.uso_certificados ? 'Sí' : 'No'}</div>
      <div class="fila">Uso de beneficios con proveedores: ${activacion.uso_beneficios_proveedores ? 'Sí' : 'No'}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Uso del servicio</div>
      <div class="fila">Solicitud por email: ${uso.solicitud_por_email ? 'Sí' : 'No'}</div>
      <div class="fila">Responsabilidad de datos del cliente: ${uso.responsabilidad_datos_cliente ? 'Sí' : 'No'}</div>
      <div class="fila">Responsabilidad del proveedor turístico: ${uso.responsabilidad_proveedor_turistico ? 'Sí' : 'No'}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Beneficiarios</div>
      <div class="fila">Beneficiario principal: ${beneficiarios.beneficiario_principal ? 'Sí' : 'No'}</div>
      <div class="fila">Extensible por consanguinidad hasta: ${v(beneficiarios.extensible_consanguinidad_hasta)}</div>
      <div class="fila">Uso por terceros / Requiere autorización escrita: ${v(beneficiarios.uso_por_terceros)} / ${beneficiarios.requiere_autorizacion_escrita ? 'Sí' : 'No'}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Terminación</div>
      <div class="fila"><span class="etiqueta">Tipo:</span> ${v(terminacion.tipo)}</div>
      <div class="fila"><span class="etiqueta">Retención (%):</span> ${v(terminacion.retencion_porcentaje)}</div>
      <div class="fila">Derechos de contrato no reembolsables: ${terminacion.derechos_contrato_no_reembolsable ? 'Sí' : 'No'}</div>
      <div class="fila">Terminación 72 h – Descuento: ${v(term72.descuento)} | Requiere pago total: ${term72.requiere_pago_total ? 'Sí' : 'No'}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Mejoramiento de oferta</div>
      <div class="fila">Aplica: ${mejoramiento.aplica ? 'Sí' : 'No'}</div>
      <div class="fila">Excluye tiquetes aéreos: ${mejoramiento.excluye_tiquetes_aereos ? 'Sí' : 'No'}</div>
      ${Array.isArray(mejoramiento.condiciones) && mejoramiento.condiciones.length ? `<ul class="lista">${mejoramiento.condiciones.map(c => `<li>${v(c)}</li>`).join('')}</ul>` : ''}
    </div>

    <div class="bloque">
      <div class="subtitulo">Beneficios de hospedaje</div>
      <div class="fila">Noches por año: ${v(hospedaje.noches_por_anio)}</div>
      <div class="fila">Temporada baja/media – Feriados: ${hospedaje.temporada_baja_media ? 'Sí' : 'No'} / ${hospedaje.feriados_nacionales ? 'Sí' : 'No'}</div>
      <div class="fila">Destinos: ${Array.isArray(hospedaje.destinos) ? hospedaje.destinos.join(', ') : v(hospedaje.destinos)}</div>
      <div class="fila">Uso compartido – Uso familiar: ${hospedaje.uso_compartido ? 'Sí' : 'No'} / ${hospedaje.uso_familiar ? 'Sí' : 'No'}</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Beneficios especiales (Getaway Weeks / Planes)</div>
      <div class="fila">Getaway Weeks: ${especiales.getaway_weeks ? 'Sí' : 'No'}</div>
      <div class="fila">Plan Premium – desde USD ${v(planes.premium?.precio_desde)} – anticipación ${v(planes.premium?.anticipacion_dias)} días</div>
      <div class="fila">Plan Standard – desde USD ${v(planes.standard?.precio_desde)} – anticipación ${v(planes.standard?.anticipacion_horas)} h</div>
      <div class="fila">Plan Plus – desde USD ${v(planes.plus?.precio_desde)} – anticipación ${v(planes.plus?.anticipacion_dias)} días</div>
    </div>

    <div class="bloque">
      <div class="subtitulo">Jurisdicción</div>
      <div class="fila">Centro de arbitraje: ${v(jurisdiccion.centro_arbitraje)}</div>
      <div class="fila">Tipo: ${v(jurisdiccion.tipo)} – Número de árbitros: ${v(jurisdiccion.numero_arbitros)}</div>
    </div>

    <div class="firma-box">
      <div class="subtitulo">Firmas</div>
      <div class="fila"><span class="etiqueta">Empresa:</span> ${v(firmas.empresa?.firma)} – Fecha: ${v(firmas.empresa?.fecha)}</div>
      <div class="fila"><span class="etiqueta">Contratante:</span> ${v(firmas.contratante?.firma)} – Fecha: ${v(firmas.contratante?.fecha)}</div>
    </div>

    <div class="footer-doc">
      Contacto: ${v(contacto.email)} | ${v(contacto.telefono)} | ${v(contacto.direccion)}
    </div>
  </div>
</body>
</html>`;
}
