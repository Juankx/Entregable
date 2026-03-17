export function anexoBeneficiosVentajasToHtml(data) {
  const documento = data?.documento || {};
  const contrato = data?.contrato || {};
  const titular = data?.titular || {};
  const empresa = data?.empresa || {};
  const declaracion = data?.declaracion_general || {};
  const beneficios = data?.beneficios || {};
  const condiciones = data?.condiciones_generales || {};
  const firmas = data?.firmas || {};
  const contacto = data?.contacto || {};

  const premium = beneficios?.getaway_planes?.premium || {};
  const standard = beneficios?.getaway_planes?.standard || {};
  const plus = beneficios?.getaway_planes?.plus || {};
  const incentivos = beneficios?.incentivos_primera_visita || {};
  const educativos = beneficios?.beneficios_educativos || {};
  const workTravel = beneficios?.work_and_travel || {};

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${documento.titulo || 'Carta de Aceptación de Beneficios y Ventajas'}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            padding: 30px 34px;
            line-height: 1.45;
            font-size: 12px;
          }

          h1 {
            text-align: center;
            font-size: 19px;
            margin-bottom: 6px;
          }

          .sub {
            text-align: center;
            color: #555;
            margin-bottom: 20px;
          }

          h2 {
            font-size: 15px;
            margin: 18px 0 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }

          p {
            margin: 5px 0;
            text-align: justify;
          }

          ul {
            margin: 6px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 3px;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
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
        <h1>${documento.titulo || 'Carta de Aceptación de Beneficios y Ventajas'}</h1>
        <div class="sub">
          Programa: ${documento.programa || ''} ${documento.fecha_firma ? ' - ' + documento.fecha_firma : ''}
        </div>

        <div class="box">
          <p><strong>Tipo:</strong> ${documento.tipo || ''}</p>
          <p><strong>Número de contrato:</strong> ${contrato.numero_contrato || ''}</p>
          <p><strong>Beneficiario No.:</strong> ${contrato.beneficiario_numero || ''}</p>
          <p><strong>Titular:</strong> ${titular.nombres_completos || ''}</p>
          <p><strong>Documento de identidad:</strong> ${titular.documento_identidad || ''}</p>
          <p><strong>Empresa:</strong> ${empresa.razon_social || ''}</p>
          <p><strong>RUC:</strong> ${empresa.ruc || ''}</p>
        </div>

        <h2>Declaración general</h2>
        <ul>
          <li>Información recibida de forma clara: ${declaracion.informacion_recibida_clara ? 'Sí' : 'No'}</li>
          <li>Aceptación de beneficios: ${declaracion.aceptacion_beneficios ? 'Sí' : 'No'}</li>
          <li>Aceptación de costos y condiciones: ${declaracion.aceptacion_costos_y_condiciones ? 'Sí' : 'No'}</li>
        </ul>

        <h2>Beneficios principales</h2>
        <div class="box">
          <p><strong>Tiquetes aéreos:</strong> Fee de emisión ${beneficios?.tiquetes_aereos?.fee_emision || ''}</p>
          <p><strong>Hoteles:</strong> ${beneficios?.hoteles?.cantidad_hoteles || 0} hoteles disponibles</p>
          <p><strong>Garantía mejor tarifa:</strong> ${beneficios?.hoteles?.garantia_mejor_tarifa ? 'Sí' : 'No'}</p>
          <p><strong>Condición de igualación:</strong> ${beneficios?.hoteles?.condicion_igualacion || ''}</p>
          <p><strong>Alquiler de autos:</strong> Mejor tarifa de mercado ${beneficios?.alquiler_autos?.mejor_tarifa_mercado ? 'Sí' : 'No'}</p>
          <p><strong>Cruceros:</strong> Tarifas reguladas ${beneficios?.cruceros?.tarifas_reguladas ? 'Sí' : 'No'}</p>
          <p><strong>Paquetes vacacionales:</strong> Tarifa más baja de mercado ${beneficios?.paquetes_vacacionales?.tarifa_mas_baja_mercado ? 'Sí' : 'No'}</p>
          <p><strong>Innovation Getaway Weeks:</strong> ${beneficios?.innovation_getaway_weeks?.descripcion || ''}</p>
        </div>

        <h2>Getaway Planes</h2>
        <div class="box">
          <p><strong>Premium:</strong></p>
          <ul>
            <li>Precio desde: ${Number(premium.precio_desde_usd || 0).toFixed(2)} USD</li>
            <li>Pasajeros: ${premium.pasajeros || ''}</li>
            <li>Anticipación: ${premium.anticipacion_dias || ''} días</li>
            <li>Destinos: ${Array.isArray(premium.destinos_aplicables) ? premium.destinos_aplicables.join(', ') : ''}</li>
          </ul>

          <p><strong>Standard:</strong></p>
          <ul>
            <li>Precio desde: ${Number(standard.precio_desde_usd || 0).toFixed(2)} USD</li>
            <li>Precio hasta: ${Number(standard.precio_hasta_usd || 0).toFixed(2)} USD</li>
            <li>Pasajeros: ${standard.pasajeros || ''}</li>
            <li>Anticipación: ${standard.anticipacion_horas || ''} horas</li>
          </ul>

          <p><strong>Plus:</strong></p>
          <ul>
            <li>Precio desde: ${Number(plus.precio_desde_usd || 0).toFixed(2)} USD</li>
            <li>Precio hasta: ${Number(plus.precio_hasta_usd || 0).toFixed(2)} USD</li>
            <li>Pasajeros: ${plus.pasajeros || ''}</li>
            <li>Anticipación: ${plus.anticipacion_dias || ''} días</li>
          </ul>
        </div>

        <h2>Incentivos de primera visita</h2>
        <div class="box">
          <p><strong>Asesoría de visado:</strong></p>
          <ul>
            <li>Tipos: ${Array.isArray(incentivos?.asesoria_visado?.tipos) ? incentivos.asesoria_visado.tipos.join(', ') : ''}</li>
            <li>Costo preferencial: ${incentivos?.asesoria_visado?.costo_preferencial ? 'Sí' : 'No'}</li>
            <li>Exclusivo titular: ${incentivos?.asesoria_visado?.exclusivo_titular ? 'Sí' : 'No'}</li>
          </ul>

          <p><strong>Innovation Lawyers:</strong></p>
          <ul>
            <li>Asesoría legal: ${incentivos?.innovation_lawyers?.asesoria_legal ? 'Sí' : 'No'}</li>
            <li>Costo: ${Number(incentivos?.innovation_lawyers?.costo || 0).toFixed(2)} USD</li>
          </ul>

          <p><strong>Bono hospedaje nacional:</strong></p>
          <ul>
            <li>${incentivos?.bono_hospedaje_nacional?.dias || 0} días / ${incentivos?.bono_hospedaje_nacional?.noches || 0} noches</li>
            <li>Hasta ${incentivos?.bono_hospedaje_nacional?.personas || 0} personas</li>
            <li>Vigencia: ${incentivos?.bono_hospedaje_nacional?.vigencia_anios || 0} año(s)</li>
            <li>Requiere pago de impuestos: ${incentivos?.bono_hospedaje_nacional?.requiere_pago_impuestos ? 'Sí' : 'No'}</li>
            <li>Uso exclusivo departamentos empresa: ${incentivos?.bono_hospedaje_nacional?.uso_exclusivo_departamentos_empresa ? 'Sí' : 'No'}</li>
          </ul>

          <p><strong>Asesoría importación incluye:</strong></p>
          <ul>
            ${
              Array.isArray(incentivos?.asesoria_importacion?.incluye)
                ? incentivos.asesoria_importacion.incluye.map(item => `<li>${item}</li>`).join('')
                : '<li>No especificado</li>'
            }
          </ul>
        </div>

        <h2>Beneficios educativos</h2>
        <div class="box">
          <p><strong>Experiencia internacional:</strong> ${educativos.experiencia_internacional ? 'Sí' : 'No'}</p>
          <p><strong>Alianzas universitarias:</strong> ${Array.isArray(educativos.alianzas_universitarias) ? educativos.alianzas_universitarias.join(', ') : ''}</p>
          <p><strong>Educación accesible:</strong> ${educativos.educacion_accesible ? 'Sí' : 'No'}</p>
          <p><strong>Descuentos:</strong> ${educativos.descuentos_porcentaje || ''}</p>
        </div>

        <h2>Work and Travel</h2>
        <div class="box">
          <p><strong>Alianzas especializadas:</strong> ${workTravel.alianzas_especializadas ? 'Sí' : 'No'}</p>
          <p><strong>Tarifas preferenciales:</strong> ${workTravel.tarifas_preferenciales ? 'Sí' : 'No'}</p>
          <p><strong>Proveedor variable:</strong> ${workTravel.proveedor_variable ? 'Sí' : 'No'}</p>
        </div>

        <h2>Condiciones generales</h2>
        <ul>
          <li>Uso de beneficios sujeto a disponibilidad: ${condiciones.uso_beneficios_sujeto_disponibilidad ? 'Sí' : 'No'}</li>
          <li>Cambio de proveedor sin notificación: ${condiciones.cambio_proveedor_sin_notificacion ? 'Sí' : 'No'}</li>
          <li>Los beneficios forman parte del contrato: ${condiciones.beneficios_forman_parte_contrato ? 'Sí' : 'No'}</li>
        </ul>

        <h2>Contacto</h2>
        <div class="box">
          <p><strong>Email:</strong> ${contacto.email || ''}</p>
          <p><strong>Teléfono:</strong> ${contacto.telefono || ''}</p>
          <p><strong>Dirección:</strong> ${contacto.direccion || ''}</p>
        </div>

        <div class="firmas">
          <div class="firma-box">
            <div><strong>${empresa.razon_social || 'Empresa'}</strong></div>
            <div class="small">Fecha: ${firmas?.empresa?.fecha || ''}</div>
          </div>

          <div class="firma-box">
            <div><strong>${titular.nombres_completos || ''}</strong></div>
            <div class="small">Fecha: ${firmas?.titular?.fecha || ''}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}