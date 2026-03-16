const ContratoViaje = require('../models/ContratoViaje');
const AutorizacionPago = require('../models/AutorizacionPago');
const Tarjeta = require('../models/Tarjeta');
const Cliente = require('../models/Cliente');
const PlantillaGenerator = require('../utils/plantillaGenerator');
const {
  extraerCliente,
  extraerContrato,
  generarEmailUnico,
  generarNumeroContratoUnico,
  toNum
} = require('../utils/normalizarPlantillaContrato');

/**
 * Controlador para gestión de contratos de viaje
 */
const contratoController = {
  /**
   * Obtener todos los contratos
   */
  async obtenerTodos(req, res) {
    try {
      const contratos = await ContratoViaje.getAll();
      res.json({
        success: true,
        data: contratos,
        count: contratos.length
      });
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contratos',
        error: error.message
      });
    }
  },

  /**
   * Obtener contrato por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.getById(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        data: contrato
      });
    } catch (error) {
      console.error('Error al obtener contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contrato',
        error: error.message
      });
    }
  },

  /**
   * Obtener contratos de un cliente
   */
  async obtenerPorCliente(req, res) {
    try {
      const { clienteId } = req.params;
      const contratos = await ContratoViaje.getByClienteId(clienteId);

      res.json({
        success: true,
        data: contratos,
        count: contratos.length
      });
    } catch (error) {
      console.error('Error al obtener contratos del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contratos del cliente',
        error: error.message
      });
    }
  },

  /**
   * Crear contrato completo desde plantilla.
   * Acepta varias estructuras: cliente/nombres_completos, contratante, client/full_name, etc.
   */
  async crearDesdePlantilla(req, res) {
    try {
      const plantilla = req.body && typeof req.body === 'object' ? req.body : {};
      const tieneDatosCliente = plantilla.cliente || plantilla.contratante || plantilla.client;
      let cliente_id = plantilla.cliente_id != null ? Number(plantilla.cliente_id) : undefined;
      if (cliente_id != null && !Number.isFinite(cliente_id)) cliente_id = undefined;

      if (!cliente_id && !tieneDatosCliente) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere cliente_id o datos del cliente en la plantilla (cliente, contratante o client)'
        });
      }

      // 1. Crear cliente desde plantilla si no existe

      if (!cliente_id && tieneDatosCliente) {
        const datosCliente = extraerCliente(plantilla);
        const datosContrato = extraerContrato(plantilla);

        const email = datosCliente.email || generarEmailUnico(
          datosCliente.document_number,
          datosContrato.numero_contrato
        );
        const contract_number = datosContrato.numero_contrato || generarNumeroContratoUnico();

        const clienteData = {
          first_name: datosCliente.first_name || 'Cliente',
          last_name: datosCliente.last_name || 'Plantilla',
          email,
          contract_number,
          phone: datosCliente.phone,
          document_number: datosCliente.document_number || '',
          city: datosCliente.ciudad,
          country: datosCliente.pais,
          notes: '',
          total_nights: 0,
          remaining_nights: 0,
          international_bonus: 'No',
          total_amount: 0,
          payment_status: 'sin_pago'
        };

        const clienteCreado = await Cliente.create(clienteData);
        cliente_id = clienteCreado.id;
      }

      // 2. Crear tarjeta si existe (nombre_tarjetahabiente es NOT NULL en BD)
      let tarjeta_id = null;
      if (plantilla.tarjeta && typeof plantilla.tarjeta === 'object' && plantilla.tarjeta.numero_tarjeta) {
        const nombreTitular = (plantilla.tarjeta.nombre_tarjetahabiente && String(plantilla.tarjeta.nombre_tarjetahabiente).trim()) || 'Titular';
        const tarjetaCreada = await Tarjeta.create({
          cliente_id,
          nombre_tarjetahabiente: nombreTitular,
          tipo_tarjeta: plantilla.tarjeta.tipo_tarjeta || 'Visa',
          numero_tarjeta: String(plantilla.tarjeta.numero_tarjeta),
          fecha_caducidad: plantilla.tarjeta.fecha_caducidad || null,
          es_principal: true
        });
        tarjeta_id = tarjetaCreada.id;
      }

      // 3. Crear autorización de pago (monto_numerico NOT NULL en BD)
      let autorizacion_pago_id = null;
      if (plantilla.autorizacion && typeof plantilla.autorizacion === 'object') {
        const montoNum = toNum(plantilla.autorizacion.valor?.monto_numerico);
        const autorizacionCreada = await AutorizacionPago.create({
          cliente_id,
          tarjeta_id,
          empresa_razon_social: plantilla.autorizacion.empresa?.razon_social || undefined,
          empresa_nombre_comercial: plantilla.autorizacion.empresa?.nombre_comercial || undefined,
          empresa_ruc: plantilla.autorizacion.empresa?.ruc || undefined,
          monto_numerico: montoNum != null ? Number(montoNum) : 0,
          monto_letras: plantilla.autorizacion.valor?.monto_letras || undefined,
          motivo: plantilla.autorizacion.motivo || undefined,
          voucher_lote: plantilla.autorizacion.voucher?.lote || undefined,
          voucher_referencia: plantilla.autorizacion.voucher?.referencia || undefined,
          voucher_aprobacion: plantilla.autorizacion.voucher?.aprobacion || undefined,
          voucher_modalidad: plantilla.autorizacion.voucher?.modalidad || undefined,
          fecha_autorizacion: plantilla.autorizacion.fecha_autorizacion || undefined,
          estado: 'pendiente',
          metadata: plantilla.metadata && typeof plantilla.metadata === 'object' ? plantilla.metadata : {}
        });
        autorizacion_pago_id = autorizacionCreada.id;
      }

      // 4. Crear contrato (valores numéricos normalizados para evitar NaN)
      const datosContratoNorm = extraerContrato(plantilla);
      const valorContrato = toNum(plantilla.contrato?.valor_contrato) ??
        toNum(plantilla.autorizacion?.valor?.monto_numerico) ??
        datosContratoNorm.valor_contrato ?? 0;
      const anosContrato = toNum(plantilla.contrato?.anos_contrato) ?? datosContratoNorm.anos_contrato;
      const numeroNoches = toNum(plantilla.contrato?.numero_noches) ?? datosContratoNorm.numero_noches;

      // Clon seguro de la plantilla para datos_completos (evita errores por referencias circulares)
      let datosCompletosSafe = {};
      try {
        datosCompletosSafe = JSON.parse(JSON.stringify(plantilla || {}));
      } catch (_) {
        datosCompletosSafe = { cliente: plantilla?.cliente, contrato: plantilla?.contrato, metadata: plantilla?.metadata };
      }

      const contratoData = {
        cliente_id,
        autorizacion_pago_id,
        fecha_contrato: plantilla.contrato?.fecha || datosContratoNorm.fecha || new Date(),
        valor_contrato: Number(valorContrato) || 0,
        anos_contrato: anosContrato != null ? Number(anosContrato) : null,
        tarjeta_y_banco: plantilla.contrato?.tarjeta_y_banco || datosContratoNorm.tarjeta_y_banco || null,
        numero_noches: numeroNoches != null ? Number(numeroNoches) : null,
        pagare_numero: plantilla.contrato?.pagare?.numero || datosContratoNorm.pagare_numero || null,
        pagare_fecha_vencimiento: plantilla.contrato?.pagare?.fecha_vencimiento || datosContratoNorm.pagare_fecha_vencimiento || null,
        estadia_internacional: plantilla.estadia?.internacional || null,
        estadia_nacional: plantilla.estadia?.nacional || null,
        cortesias_por_asistencia: plantilla.beneficios?.cortesias_por_asistencia || null,
        ofrecimientos_adicionales: plantilla.beneficios?.ofrecimientos_adicionales || null,
        aceptacion_cliente: plantilla.aceptacion_cliente || null,
        datos_completos: datosCompletosSafe,
        creado_por: plantilla.metadata?.creado_por || req.user?.email || 'sistema',
        metadata: plantilla.metadata && typeof plantilla.metadata === 'object' ? plantilla.metadata : {}
      };

      const contrato = await ContratoViaje.create(contratoData);

      res.status(201).json({
        success: true,
        message: 'Contrato creado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al crear contrato:', error);
      const msg = error && (error.message || String(error));
      res.status(500).json({
        success: false,
        message: 'Error al crear contrato',
        error: msg
      });
    }
  },

  /**
   * Crear contrato simple
   */
  async crear(req, res) {
    try {
      const contrato = await ContratoViaje.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Contrato creado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al crear contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear contrato',
        error: error.message
      });
    }
  },

  /**
   * Actualizar contrato
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.update(id, req.body);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato actualizado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar contrato',
        error: error.message
      });
    }
  },

  /**
   * Firmar contrato
   */
  async firmar(req, res) {
    try {
      const { id } = req.params;
      const { firma, nombre, fecha } = req.body;

      if (!firma || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'Firma y nombre son requeridos'
        });
      }

      const contrato = await ContratoViaje.firmar(id, { firma, nombre, fecha });

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato firmado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al firmar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al firmar contrato',
        error: error.message
      });
    }
  },

  /**
   * Activar contrato
   */
  async activar(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.activar(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato activado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al activar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al activar contrato',
        error: error.message
      });
    }
  },

  /**
   * Cancelar contrato
   */
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const contrato = await ContratoViaje.cancelar(id, motivo);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato cancelado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al cancelar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar contrato',
        error: error.message
      });
    }
  },

  /**
   * Eliminar contrato
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.delete(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar contrato',
        error: error.message
      });
    }
  },

  /**
   * Obtener contratos por estado
   */
  async obtenerPorEstado(req, res) {
    try {
      const { estado } = req.params;
      const contratos = await ContratoViaje.getByEstado(estado);

      res.json({
        success: true,
        data: contratos,
        count: contratos.length
      });
    } catch (error) {
      console.error('Error al obtener contratos por estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contratos por estado',
        error: error.message
      });
    }
  },

  /**
   * Obtener estadísticas de contratos
   */
  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await ContratoViaje.getEstadisticas();

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  },

  /**
   * Generar plantilla rellena del contrato
   */
  async generarPlantilla(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.getById(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      // Generar plantilla con datos del contrato
      const plantilla = PlantillaGenerator.generarPlantilla(contrato);

      res.json({
        success: true,
        data: plantilla
      });
    } catch (error) {
      console.error('Error al generar plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar plantilla',
        error: error.message
      });
    }
  },

  /**
   * Generar documento HTML del contrato
   */
  async generarDocumento(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.getById(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      // Generar plantilla y HTML
      const plantilla = PlantillaGenerator.generarPlantilla(contrato);
      const html = PlantillaGenerator.generarHTML(plantilla);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error al generar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar documento',
        error: error.message
      });
    }
  },

  /**
   * Generar documento PDF del contrato
   */
  async generarDocumentoPdf(req, res) {
    let browser;
    try {
      const { id } = req.params;
      console.log('📄 Generando PDF para contrato ID:', id);
      
      const contrato = await ContratoViaje.getById(id);
      console.log('📋 Contrato obtenido:', contrato ? 'SÍ' : 'NO');

      if (!contrato) {
        console.log('❌ Contrato no encontrado');
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      console.log('🔧 Generando plantilla...');
      const plantilla = PlantillaGenerator.generarPlantilla(contrato);
      console.log('🌐 Generando HTML...');
      const html = PlantillaGenerator.generarHTML(plantilla);
      console.log('✅ HTML generado, longitud:', html.length);

      console.log('🚀 Iniciando Puppeteer...');
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      console.log('✅ Puppeteer iniciado');

      const page = await browser.newPage();
      console.log('📄 Página creada, cargando contenido...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('✅ Contenido cargado, generando PDF...');
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      console.log('✅ PDF generado, tamaño:', pdfBuffer.length, 'bytes');

      // Configurar headers correctamente
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `inline; filename="contrato-${id}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Enviar el buffer directamente
      res.end(pdfBuffer, 'binary');
      console.log('✅ PDF enviado al cliente');
    } catch (error) {
      console.error('❌ ERROR COMPLETO al generar PDF:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error al generar PDF',
        error: error.message,
        stack: error.stack
      });
    } finally {
      if (browser) {
        console.log('🔒 Cerrando navegador...');
        await browser.close();
      }
    }
  }
};

module.exports = contratoController;
