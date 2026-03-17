import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { descargarAutorizacionComoPdf } from '../utils/autorizacionJsonToPdf';
import { generarPdfDesdeHtml } from '../utils/plantillasToPdf';
import { contratoPrestacionServiciosToHtml } from '../utils/contratoPrestacionServiciosToHtml';
import { renderPlantillaHtml } from '../utils/renderPlantillaHtml';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const crearPlantillaInicial = (user) => ({
  cliente: {
    nombres_completos: '',
    ciudad: '',
    pais: 'Ecuador',
    telefono: '',
    cedula: '',
    email: '',
    direccion: ''
  },
  tarjeta: {
    nombre_tarjetahabiente: '',
    tipo_tarjeta: 'Visa',
    numero_tarjeta: '',
    fecha_caducidad: ''
  },
  autorizacion: {
    empresa: {
      razon_social: 'PACIFIC ADVENTURE PACITURE S.A.S',
      nombre_comercial: 'INNOVATION BUSSINES',
      ruc: '1793230574001'
    },
    valor: {
      monto_numerico: 0,
      monto_letras: ''
    },
    motivo: 'Prestación de servicios turísticos nacionales e internacionales',
    voucher: {
      lote: '',
      referencia: '',
      aprobacion: '',
      modalidad: 'venta'
    }
  },
  contrato: {
    fecha: new Date().toISOString().split('T')[0],
    valor_contrato: 0,
    anos_contrato: 2,
    numero_noches: 10,
    tarjeta_y_banco: '',
    pagare: {
      numero: '',
      fecha_vencimiento: ''
    }
  },
  estadia: {
    internacional: {
      incluye: true,
      numero_pax: 2
    },
    nacional: {
      incluye: true,
      numero_pax: 2
    }
  },
  beneficios: {
    cortesias_por_asistencia: '',
    ofrecimientos_adicionales: ''
  },
  metadata: {
    creado_por: user?.email || 'sistema',
    estado: 'pendiente'
  }
});

export default function GestionContratos() {
  const { user } = useAuth();

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('lista');
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const [adjuntos, setAdjuntos] = useState([]);
  const [cargandoAdjuntos, setCargandoAdjuntos] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [anexosSeleccionados, setAnexosSeleccionados] = useState([]);
  const [generandoDoc, setGenerandoDoc] = useState(false);
  const [plantillaIdParaDoc, setPlantillaIdParaDoc] = useState('');

  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);

  const [plantilla, setPlantilla] = useState(crearPlantillaInicial(user));
  const [formEdicion, setFormEdicion] = useState(crearPlantillaInicial(user));

  useEffect(() => {
    cargarContratos();
    cargarEstadisticas();
    cargarPlantillas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  const contratosOrdenados = useMemo(() => {
    return [...contratos].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  }, [contratos]);

  const cargarContratos = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/contratos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContratos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      alert('Error al cargar contratos');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/contratos/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEstadisticas(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarPlantillas = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/plantillas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlantillasDisponibles(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  };

  const usarPlantilla = async (plantillaId) => {
    try {
      const token = getAuthToken();
      const contratoId = contratoSeleccionado?.id;

      const response = await axios.get(`${API_URL}/plantillas/${plantillaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const contenidoPlantilla = response.data.data || {};

      const esFormulario = Boolean(
        contenidoPlantilla.cliente &&
          contenidoPlantilla.tarjeta &&
          contenidoPlantilla.autorizacion &&
          contenidoPlantilla.contrato
      );

      if (esFormulario) {
        setPlantillaSeleccionada(plantillaId);
        setPlantilla((prev) => ({
          ...prev,
          cliente: { ...prev.cliente, ...contenidoPlantilla.cliente },
          tarjeta: { ...prev.tarjeta, ...contenidoPlantilla.tarjeta },
          autorizacion: { ...prev.autorizacion, ...contenidoPlantilla.autorizacion },
          contrato: { ...prev.contrato, ...contenidoPlantilla.contrato },
          estadia: { ...prev.estadia, ...(contenidoPlantilla.estadia || {}) },
          beneficios: { ...prev.beneficios, ...(contenidoPlantilla.beneficios || {}) }
        }));
        alert('✅ Plantilla de contrato cargada exitosamente');
      } else {
        setPlantillaSeleccionada(plantillaId);

        setAnexosSeleccionados((prev) => {
          const existe = prev.find((anexo) => anexo.id === plantillaId);
          if (existe) {
            return prev.map((anexo) =>
              anexo.id === plantillaId ? { ...anexo, data: contenidoPlantilla } : anexo
            );
          }
          return [...prev, { id: plantillaId, data: contenidoPlantilla }];
        });

        if (!contratoId) {
          alert('ℹ️ Guarda el contrato para adjuntar esta plantilla como PDF.');
          return;
        }

        setCargandoAdjuntos(true);

        const respuestaAdjunto = await axios.post(
          `${API_URL}/adjuntos/${contratoId}/desde-plantilla/${plantillaId}`,
          { plantilla: contenidoPlantilla },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (respuestaAdjunto.data.success) {
          alert(`✅ Plantilla "${plantillaId}" añadida como adjunto al contrato`);
          if (contratoId) await cargarAdjuntos(contratoId);
        }
      }
    } catch (error) {
      console.error('Error al usar plantilla:', error);
      alert('❌ Error al procesar plantilla: ' + (error.response?.data?.message || error.message));
    } finally {
      setCargandoAdjuntos(false);
    }
  };

  const crearContrato = async () => {
    try {
      const token = getAuthToken();

      const payload = {
        ...plantilla,
        metadata: {
          ...plantilla.metadata,
          creado_por: user?.email || 'sistema',
          estado: plantilla.metadata?.estado || 'pendiente'
        },
        plantilla_id: plantillaSeleccionada || null
      };

      const response = await axios.post(`${API_URL}/contratos/plantilla`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const contratoCreadoId = response.data?.data?.id;

      if (contratoCreadoId && anexosSeleccionados.length > 0) {
        for (const anexo of anexosSeleccionados) {
          await axios.post(
            `${API_URL}/adjuntos/${contratoCreadoId}/desde-plantilla/${anexo.id}`,
            { plantilla: anexo.data },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }

      alert('¡Contrato creado exitosamente! Número: ' + response.data.data.numero_contrato);
      setAnexosSeleccionados([]);
      setPlantilla(crearPlantillaInicial(user));
      setPlantillaSeleccionada('');
      setVistaActual('lista');
      cargarContratos();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al crear contrato:', error);
      const detalle = error.response?.data?.error || error.response?.data?.message || error.message;
      alert('Error al crear contrato:\n\n' + detalle);
    }
  };

  const verDetalle = async (id, abrirEnEdicion = false) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/contratos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data;
      setContratoSeleccionado(data);
      setVistaActual('detalle');
      setModoEdicionDetalle(abrirEnEdicion);
      setFormEdicion(mapearContratoAFormulario(data));
      setPlantillaIdParaDoc(data?.plantilla_id || '');
      cargarAdjuntos(id);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar detalle del contrato');
    }
  };

  const cargarAdjuntos = async (contratoId) => {
    try {
      setCargandoAdjuntos(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/adjuntos/${contratoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdjuntos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar adjuntos:', error);
      setAdjuntos([]);
    } finally {
      setCargandoAdjuntos(false);
    }
  };

  const subirPDF = async (contratoId, archivo, descripcion = '', tipoDocumento = 'otro') => {
    try {
      setSubiendo(true);
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('pdf', archivo);
      formData.append('descripcion', descripcion);
      formData.append('tipo_documento', tipoDocumento);

      const response = await axios.post(`${API_URL}/adjuntos/${contratoId}/subir`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('✅ PDF subido exitosamente');
      await cargarAdjuntos(contratoId);
      return response.data.data;
    } catch (error) {
      console.error('Error al subir PDF:', error);
      alert('❌ Error al subir PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubiendo(false);
    }
  };

  const descargarPDF = async (adjuntoId, nombreOriginal) => {
    const esAutorizacionJson =
      nombreOriginal &&
      /\.json$/i.test(nombreOriginal) &&
      /autorizacion|autorización|cobro/i.test(nombreOriginal);

    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/adjuntos/descargar/${adjuntoId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = response.data;

      if (esAutorizacionJson) {
        const text = await blob.text();
        let jsonData;
        try {
          jsonData = JSON.parse(text);
        } catch (_) {
          alert('El archivo no es un JSON válido de autorización.');
          return;
        }
        const nombrePdf = (nombreOriginal || 'autorizacion-cobro').replace(/\.json$/i, '.pdf');
        await descargarAutorizacionComoPdf(jsonData, nombrePdf);
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreOriginal || `adjunto-${adjuntoId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          alert(json.message || 'Error al descargar');
        } catch (_) {
          alert('Error al descargar el archivo');
        }
      } else {
        alert(error.response?.data?.message || 'Error al descargar el adjunto');
      }
    }
  };

  const eliminarAdjunto = async (adjuntoId) => {
    if (!window.confirm('¿Eliminar este adjunto?')) return;

    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/adjuntos/${adjuntoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Adjunto eliminado');
      await cargarAdjuntos(contratoSeleccionado.id);
    } catch (error) {
      console.error('Error al eliminar adjunto:', error);
      alert('❌ Error al eliminar adjunto');
    }
  };

  const verDocumento = async (contratoId, clienteId = null) => {
    const token = getAuthToken();
    try {
      let cid = clienteId;
      if (cid == null) {
        const cr = await axios.get(`${API_URL}/contratos/${contratoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        cid = cr.data?.data?.cliente_id ?? cr.data?.cliente_id;
      }
      if (cid == null) throw new Error('No se pudo obtener el cliente del contrato');

      const res = await axios.get(`${API_URL}/plantillas/contrato-servicios/rellenar`, {
        params: { cliente_id: cid, contrato_id: contratoId },
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data?.data;
      if (!data) throw new Error('Sin datos de plantilla');

      const html = contratoPrestacionServiciosToHtml(data);
      if (!html.trim()) throw new Error('No se pudo generar el documento');

      const blob = await generarPdfDesdeHtml(html);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Error al generar el documento';
      alert('❌ ' + msg);
    }
  };

  const obtenerDatosRellenados = async () => {
    if (!contratoSeleccionado?.cliente_id || !plantillaIdParaDoc) return null;

    const token = getAuthToken();
    const res = await axios.get(`${API_URL}/plantillas/${plantillaIdParaDoc}/rellenar`, {
      params: {
        cliente_id: contratoSeleccionado.cliente_id,
        contrato_id: contratoSeleccionado.id
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data?.data ?? null;
  };

  const generarPdfBlobDesdePlantillaData = async (plantillaId, data) => {
    const html = renderPlantillaHtml(plantillaId, data);

    if (!html || !html.trim()) {
      throw new Error('No existe renderizador HTML para esta plantilla');
    }

    return await generarPdfDesdeHtml(html);
  };

  const generarPdfDesdePlantillaHandler = async () => {
    if (!contratoSeleccionado?.cliente_id || !plantillaIdParaDoc) {
      alert('Selecciona una plantilla');
      return;
    }

    setGenerandoDoc(true);

    try {
      const data = await obtenerDatosRellenados();
      if (!data) throw new Error('Sin datos');

      const blob = await generarPdfBlobDesdePlantillaData(plantillaIdParaDoc, data);
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${plantillaIdParaDoc}-${(contratoSeleccionado.numero_contrato || 'doc').replace(/\s+/g, '-')}.pdf`;
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 60000);
      alert('✅ PDF generado y descargado');
    } catch (e) {
      alert('❌ Error: ' + (e.response?.data?.message || e.message));
    } finally {
      setGenerandoDoc(false);
    }
  };

  const guardarPdfComoAdjuntoHandler = async () => {
    if (!contratoSeleccionado?.cliente_id || !plantillaIdParaDoc) {
      alert('Selecciona una plantilla');
      return;
    }

    setGenerandoDoc(true);

    try {
      const data = await obtenerDatosRellenados();
      if (!data) throw new Error('Sin datos');

      const blob = await generarPdfBlobDesdePlantillaData(plantillaIdParaDoc, data);
      const nombreArchivo = `${plantillaIdParaDoc}-${(contratoSeleccionado.numero_contrato || 'doc').replace(/\s+/g, '-')}.pdf`;
      const file = new File([blob], nombreArchivo, { type: 'application/pdf' });

      const tipoDoc = plantillaIdParaDoc === 'autorizacion-cobro-pacifico' ? 'autorizacion' : 'otro';

      const descripcion =
        plantillasDisponibles.find((p) => p.id === plantillaIdParaDoc)?.nombre || plantillaIdParaDoc;

      await subirPDF(
        contratoSeleccionado.id,
        file,
        `Generado desde plantilla: ${descripcion}`,
        tipoDoc
      );

      await cargarAdjuntos(contratoSeleccionado.id);
      alert('✅ PDF generado y guardado como adjunto');
    } catch (e) {
      alert('❌ Error: ' + (e.response?.data?.message || e.message));
    } finally {
      setGenerandoDoc(false);
    }
  };

  const actualizarCampo = (seccion, campo, valor) => {
    setPlantilla((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const actualizarCampoAnidado = (seccion, subseccion, campo, valor) => {
    setPlantilla((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [subseccion]: {
          ...prev[seccion][subseccion],
          [campo]: valor
        }
      }
    }));
  };

  const setNestedValue = (obj, path, value) => {
    if (!path.length) return obj;
    const key = path[0];
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };

    if (path.length === 1) {
      copy[key] = value;
      return copy;
    }

    const next = obj && obj[key] !== undefined ? obj[key] : {};
    copy[key] = setNestedValue(next, path.slice(1), value);
    return copy;
  };

  const actualizarAnexoCampo = (anexoId, path, value) => {
    setAnexosSeleccionados((prev) =>
      prev.map((anexo) => {
        if (anexo.id !== anexoId) return anexo;
        return {
          ...anexo,
          data: setNestedValue(anexo.data, path, value)
        };
      })
    );
  };

  const renderAnexoCampos = (anexoId, data, path = []) => {
    if (!data || typeof data !== 'object') return null;

    return Object.entries(data).map(([key, value]) => {
      const currentPath = [...path, key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={currentPath.join('.')} className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{formatearLabel(key)}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderAnexoCampos(anexoId, value, currentPath)}
            </div>
          </div>
        );
      }

      const inputType = typeof value === 'number' ? 'number' : 'text';
      const inputValue = value === null || value === undefined ? '' : value;

      if (typeof value === 'boolean') {
        return (
          <label key={currentPath.join('.')} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => actualizarAnexoCampo(anexoId, currentPath, e.target.checked)}
              className="h-4 w-4"
            />
            {formatearLabel(key)}
          </label>
        );
      }

      return (
        <CampoFormulario
          key={currentPath.join('.')}
          label={formatearLabel(key)}
          value={inputValue}
          onChange={(e) =>
            actualizarAnexoCampo(
              anexoId,
              currentPath,
              inputType === 'number' ? Number(e.target.value) : e.target.value
            )
          }
          type={inputType}
        />
      );
    });
  };

  const cancelarEdicionDetalle = () => {
    if (!contratoSeleccionado) return;
    setFormEdicion(mapearContratoAFormulario(contratoSeleccionado));
    setModoEdicionDetalle(false);
  };

  const guardarEdicionContrato = async () => {
    if (!contratoSeleccionado?.id) return;

    try {
      setGuardandoEdicion(true);
      const token = getAuthToken();

      const payload = {
        ...formEdicion,
        plantilla_id: plantillaIdParaDoc || contratoSeleccionado?.plantilla_id || null,
        metadata: {
          ...formEdicion.metadata,
          creado_por:
            formEdicion?.metadata?.creado_por ||
            contratoSeleccionado?.creado_por ||
            user?.email ||
            'sistema'
        }
      };

      await axios.put(`${API_URL}/contratos/${contratoSeleccionado.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('✅ Contrato actualizado correctamente');
      setModoEdicionDetalle(false);
      await cargarContratos();
      await cargarEstadisticas();
      await verDetalle(contratoSeleccionado.id, false);
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      alert(
        '❌ Error al actualizar contrato: ' +
          (error.response?.data?.message || error.response?.data?.error || error.message)
      );
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const actualizarFormEdicion = (seccion, campo, valor) => {
    setFormEdicion((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const actualizarFormEdicionAnidado = (seccion, subseccion, campo, valor) => {
    setFormEdicion((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [subseccion]: {
          ...prev[seccion][subseccion],
          [campo]: valor
        }
      }
    }));
  };

  if (vistaActual === 'lista') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Contratos</h1>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPlantilla(crearPlantillaInicial(user));
                  setPlantillaSeleccionada('');
                  setAnexosSeleccionados([]);
                  setVistaActual('crear');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Nuevo Contrato
              </button>
              <button
                onClick={() => {
                  window.location.href = '/dashboard-contratos';
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </div>

          {estadisticas && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <TarjetaEstadistica titulo="Total" valor={estadisticas.total} />
              <TarjetaEstadistica titulo="Pendientes" valor={estadisticas.pendientes} color="yellow" />
              <TarjetaEstadistica titulo="Activos" valor={estadisticas.activos} />
              <TarjetaEstadistica
                titulo="Valor Total"
                valor={`$${parseFloat(estadisticas.valor_total || 0).toFixed(2)}`}
                color="blue"
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Noches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plantilla</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      Cargando...
                    </td>
                  </tr>
                ) : contratosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No hay contratos. Crea uno nuevo.
                    </td>
                  </tr>
                ) : (
                  contratosOrdenados.map((contrato) => (
                    <tr key={contrato.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contrato.numero_contrato}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {obtenerNombreClienteContrato(contrato)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(contrato.valor_contrato || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {contrato.numero_noches || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EstadoBadge estado={contrato.estado} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {contrato.fecha_contrato
                          ? new Date(contrato.fecha_contrato).toLocaleDateString()
                          : contrato.fecha_creacion
                            ? new Date(contrato.fecha_creacion).toLocaleDateString()
                            : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {contrato.plantilla_id || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => verDetalle(contrato.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => verDetalle(contrato.id, true)}
                          className="text-amber-600 hover:text-amber-800 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => verDocumento(contrato.id, contrato.cliente_id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          📄 Documento
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (vistaActual === 'crear') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <h1 className="text-3xl font-bold">Crear Nuevo Contrato</h1>
            <button
              onClick={() => setVistaActual('lista')}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">📋 Plantilla base del contrato</h2>
            <p className="text-gray-600 mb-4">
              Selecciona una plantilla. Luego la base de datos podrá rellenar automáticamente los datos para imprimir.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plantillasDisponibles.map((plantillaItem) => (
                <button
                  key={plantillaItem.id}
                  onClick={() => usarPlantilla(plantillaItem.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    plantillaSeleccionada === plantillaItem.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{plantillaItem.nombre}</div>
                  <div className="text-sm text-gray-600">{plantillaItem.descripcion}</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {plantillaItem.id}</div>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla seleccionada</label>
              <input
                type="text"
                value={plantillaSeleccionada || ''}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50"
                placeholder="Aún no se ha seleccionado una plantilla"
              />
            </div>
          </div>

          <div className="space-y-6">
            <SeccionFormulario titulo="📋 Datos del Cliente" descripcion="Aquí se visualiza exactamente cada casilla del cliente.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoFormulario
                  label="Nombres completos"
                  value={plantilla.cliente.nombres_completos}
                  onChange={(e) => actualizarCampo('cliente', 'nombres_completos', e.target.value)}
                />
                <CampoFormulario
                  label="Cédula"
                  value={plantilla.cliente.cedula}
                  onChange={(e) => actualizarCampo('cliente', 'cedula', e.target.value)}
                />
                <CampoFormulario
                  label="Teléfono"
                  value={plantilla.cliente.telefono}
                  onChange={(e) => actualizarCampo('cliente', 'telefono', e.target.value)}
                />
                <CampoFormulario
                  label="Email"
                  value={plantilla.cliente.email || ''}
                  onChange={(e) => actualizarCampo('cliente', 'email', e.target.value)}
                  type="email"
                />
                <CampoFormulario
                  label="Ciudad"
                  value={plantilla.cliente.ciudad}
                  onChange={(e) => actualizarCampo('cliente', 'ciudad', e.target.value)}
                />
                <CampoFormulario
                  label="País"
                  value={plantilla.cliente.pais}
                  onChange={(e) => actualizarCampo('cliente', 'pais', e.target.value)}
                />
                <div className="md:col-span-2">
                  <CampoFormulario
                    label="Dirección"
                    value={plantilla.cliente.direccion || ''}
                    onChange={(e) => actualizarCampo('cliente', 'direccion', e.target.value)}
                  />
                </div>
              </div>
            </SeccionFormulario>

            <SeccionFormulario titulo="💳 Datos de Tarjeta" descripcion="Casillas visibles para identificar claramente qué dato se está llenando.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoFormulario
                  label="Nombre del tarjetahabiente"
                  value={plantilla.tarjeta.nombre_tarjetahabiente}
                  onChange={(e) => actualizarCampo('tarjeta', 'nombre_tarjetahabiente', e.target.value)}
                />
                <CampoSelect
                  label="Tipo de tarjeta"
                  value={plantilla.tarjeta.tipo_tarjeta}
                  onChange={(e) => actualizarCampo('tarjeta', 'tipo_tarjeta', e.target.value)}
                  options={['Visa', 'Mastercard', 'American Express', 'Diners']}
                />
                <CampoFormulario
                  label="Número de tarjeta"
                  value={plantilla.tarjeta.numero_tarjeta}
                  onChange={(e) => actualizarCampo('tarjeta', 'numero_tarjeta', e.target.value)}
                />
                <CampoFormulario
                  label="Fecha de caducidad"
                  value={plantilla.tarjeta.fecha_caducidad}
                  onChange={(e) => actualizarCampo('tarjeta', 'fecha_caducidad', e.target.value)}
                  placeholder="MM/YYYY"
                />
              </div>
            </SeccionFormulario>

            <SeccionFormulario titulo="📄 Detalles del Contrato" descripcion="Fecha y valor quedan digitables manualmente, tal como pediste.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoFormulario
                  label="Fecha del contrato"
                  type="date"
                  value={plantilla.contrato.fecha || ''}
                  onChange={(e) => actualizarCampo('contrato', 'fecha', e.target.value)}
                />
                <CampoFormulario
                  label="Valor del contrato"
                  type="number"
                  step="0.01"
                  value={Number.isFinite(Number(plantilla.contrato.valor_contrato)) ? plantilla.contrato.valor_contrato : ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    const num = Number.isFinite(v) ? v : 0;
                    actualizarCampo('contrato', 'valor_contrato', num);
                    actualizarCampoAnidado('autorizacion', 'valor', 'monto_numerico', num);
                  }}
                />
                <CampoFormulario
                  label="Número de noches"
                  type="number"
                  value={Number.isFinite(Number(plantilla.contrato.numero_noches)) ? plantilla.contrato.numero_noches : ''}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    actualizarCampo('contrato', 'numero_noches', Number.isFinite(v) ? v : 0);
                  }}
                />
                <CampoFormulario
                  label="Años de contrato"
                  type="number"
                  value={Number.isFinite(Number(plantilla.contrato.anos_contrato)) ? plantilla.contrato.anos_contrato : ''}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    actualizarCampo('contrato', 'anos_contrato', Number.isFinite(v) ? v : 0);
                  }}
                />
                <CampoFormulario
                  label="Tarjeta y banco"
                  value={plantilla.contrato.tarjeta_y_banco}
                  onChange={(e) => actualizarCampo('contrato', 'tarjeta_y_banco', e.target.value)}
                  placeholder="Ej: Visa - Pichincha"
                />
                <CampoFormulario
                  label="Estado del contrato"
                  value={plantilla.metadata.estado}
                  onChange={(e) => actualizarCampo('metadata', 'estado', e.target.value)}
                />
                <CampoFormulario
                  label="Número de pagaré"
                  value={plantilla.contrato.pagare.numero}
                  onChange={(e) => actualizarCampoAnidado('contrato', 'pagare', 'numero', e.target.value)}
                />
                <CampoFormulario
                  label="Fecha de vencimiento del pagaré"
                  type="date"
                  value={plantilla.contrato.pagare.fecha_vencimiento || ''}
                  onChange={(e) =>
                    actualizarCampoAnidado('contrato', 'pagare', 'fecha_vencimiento', e.target.value)
                  }
                />
              </div>
            </SeccionFormulario>

            <SeccionFormulario titulo="✅ Autorización de Pago">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoFormulario
                  label="Lote"
                  value={plantilla.autorizacion.voucher.lote}
                  onChange={(e) => actualizarCampoAnidado('autorizacion', 'voucher', 'lote', e.target.value)}
                />
                <CampoFormulario
                  label="Referencia"
                  value={plantilla.autorizacion.voucher.referencia}
                  onChange={(e) =>
                    actualizarCampoAnidado('autorizacion', 'voucher', 'referencia', e.target.value)
                  }
                />
                <CampoFormulario
                  label="Aprobación"
                  value={plantilla.autorizacion.voucher.aprobacion}
                  onChange={(e) =>
                    actualizarCampoAnidado('autorizacion', 'voucher', 'aprobacion', e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CampoFormulario
                  label="Monto numérico"
                  type="number"
                  step="0.01"
                  value={Number.isFinite(Number(plantilla.autorizacion.valor.monto_numerico))
                    ? plantilla.autorizacion.valor.monto_numerico
                    : ''}
                  onChange={(e) =>
                    actualizarCampoAnidado(
                      'autorizacion',
                      'valor',
                      'monto_numerico',
                      Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : 0
                    )
                  }
                />
                <CampoFormulario
                  label="Monto en letras"
                  value={plantilla.autorizacion.valor.monto_letras}
                  onChange={(e) =>
                    actualizarCampoAnidado('autorizacion', 'valor', 'monto_letras', e.target.value)
                  }
                />
              </div>

              <div className="mt-4">
                <CampoFormulario
                  label="Motivo"
                  value={plantilla.autorizacion.motivo}
                  onChange={(e) => actualizarCampo('autorizacion', 'motivo', e.target.value)}
                />
              </div>
            </SeccionFormulario>

            <SeccionFormulario titulo="🎁 Beneficios">
              <div className="grid grid-cols-1 gap-4">
                <CampoTextarea
                  label="Cortesías por asistencia"
                  value={plantilla.beneficios.cortesias_por_asistencia}
                  onChange={(e) => actualizarCampo('beneficios', 'cortesias_por_asistencia', e.target.value)}
                />
                <CampoTextarea
                  label="Ofrecimientos adicionales"
                  value={plantilla.beneficios.ofrecimientos_adicionales}
                  onChange={(e) => actualizarCampo('beneficios', 'ofrecimientos_adicionales', e.target.value)}
                />
              </div>
            </SeccionFormulario>

            {anexosSeleccionados.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">📎 Anexos seleccionados</h2>
                  <span className="text-sm text-gray-500">{anexosSeleccionados.length} anexos</span>
                </div>

                <div className="space-y-6">
                  {anexosSeleccionados.map((anexo) => (
                    <div key={anexo.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {anexo.id.replace(/-/g, ' ')}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setAnexosSeleccionados((prev) => prev.filter((item) => item.id !== anexo.id))
                          }
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="space-y-2">{renderAnexoCampos(anexo.id, anexo.data)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setVistaActual('lista')}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={crearContrato}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear Contrato
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (vistaActual === 'detalle' && contratoSeleccionado) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <h1 className="text-3xl font-bold">Detalle del Contrato</h1>
            <div className="flex gap-2 flex-wrap">
              {!modoEdicionDetalle ? (
                <button
                  onClick={() => setModoEdicionDetalle(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  ✏️ Editar contrato
                </button>
              ) : (
                <>
                  <button
                    onClick={guardarEdicionContrato}
                    disabled={guardandoEdicion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {guardandoEdicion ? 'Guardando...' : '💾 Guardar cambios'}
                  </button>
                  <button
                    onClick={cancelarEdicionDetalle}
                    disabled={guardandoEdicion}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar edición
                  </button>
                </>
              )}

              <button
                onClick={() => verDocumento(contratoSeleccionado.id, contratoSeleccionado.cliente_id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📄 Ver Documento
              </button>
              <button
                onClick={() => setVistaActual('lista')}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <ResumenDato label="Número de Contrato" value={contratoSeleccionado.numero_contrato} />
              <ResumenDato label="Estado" value={<EstadoBadge estado={contratoSeleccionado.estado} />} />
              <ResumenDato label="Cliente" value={obtenerNombreClienteContrato(contratoSeleccionado)} />
              <ResumenDato
                label="Valor"
                value={`$${parseFloat(contratoSeleccionado.valor_contrato || 0).toFixed(2)}`}
              />
            </div>
          </div>

          {modoEdicionDetalle ? (
            <>
              <SeccionFormulario
                titulo="✏️ Editar contrato"
                descripcion="Aquí puedes modificar manualmente fecha, valor y demás casillas del contrato ya creado."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CampoFormulario
                    label="Nombres completos"
                    value={formEdicion.cliente.nombres_completos}
                    onChange={(e) => actualizarFormEdicion('cliente', 'nombres_completos', e.target.value)}
                  />
                  <CampoFormulario
                    label="Cédula"
                    value={formEdicion.cliente.cedula}
                    onChange={(e) => actualizarFormEdicion('cliente', 'cedula', e.target.value)}
                  />
                  <CampoFormulario
                    label="Teléfono"
                    value={formEdicion.cliente.telefono}
                    onChange={(e) => actualizarFormEdicion('cliente', 'telefono', e.target.value)}
                  />
                  <CampoFormulario
                    label="Email"
                    value={formEdicion.cliente.email || ''}
                    onChange={(e) => actualizarFormEdicion('cliente', 'email', e.target.value)}
                  />
                  <CampoFormulario
                    label="Ciudad"
                    value={formEdicion.cliente.ciudad}
                    onChange={(e) => actualizarFormEdicion('cliente', 'ciudad', e.target.value)}
                  />
                  <CampoFormulario
                    label="País"
                    value={formEdicion.cliente.pais}
                    onChange={(e) => actualizarFormEdicion('cliente', 'pais', e.target.value)}
                  />
                  <CampoFormulario
                    label="Fecha del contrato"
                    type="date"
                    value={formEdicion.contrato.fecha || ''}
                    onChange={(e) => actualizarFormEdicion('contrato', 'fecha', e.target.value)}
                  />
                  <CampoFormulario
                    label="Valor del contrato"
                    type="number"
                    step="0.01"
                    value={Number.isFinite(Number(formEdicion.contrato.valor_contrato))
                      ? formEdicion.contrato.valor_contrato
                      : ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      const num = Number.isFinite(v) ? v : 0;
                      actualizarFormEdicion('contrato', 'valor_contrato', num);
                      actualizarFormEdicionAnidado('autorizacion', 'valor', 'monto_numerico', num);
                    }}
                  />
                  <CampoFormulario
                    label="Número de noches"
                    type="number"
                    value={Number.isFinite(Number(formEdicion.contrato.numero_noches))
                      ? formEdicion.contrato.numero_noches
                      : ''}
                    onChange={(e) =>
                      actualizarFormEdicion(
                        'contrato',
                        'numero_noches',
                        Number.isFinite(parseInt(e.target.value, 10)) ? parseInt(e.target.value, 10) : 0
                      )
                    }
                  />
                  <CampoFormulario
                    label="Años de contrato"
                    type="number"
                    value={Number.isFinite(Number(formEdicion.contrato.anos_contrato))
                      ? formEdicion.contrato.anos_contrato
                      : ''}
                    onChange={(e) =>
                      actualizarFormEdicion(
                        'contrato',
                        'anos_contrato',
                        Number.isFinite(parseInt(e.target.value, 10)) ? parseInt(e.target.value, 10) : 0
                      )
                    }
                  />
                  <CampoFormulario
                    label="Tarjeta y banco"
                    value={formEdicion.contrato.tarjeta_y_banco}
                    onChange={(e) => actualizarFormEdicion('contrato', 'tarjeta_y_banco', e.target.value)}
                  />
                  <CampoFormulario
                    label="Número de pagaré"
                    value={formEdicion.contrato.pagare.numero}
                    onChange={(e) =>
                      actualizarFormEdicionAnidado('contrato', 'pagare', 'numero', e.target.value)
                    }
                  />
                  <CampoFormulario
                    label="Fecha vencimiento pagaré"
                    type="date"
                    value={formEdicion.contrato.pagare.fecha_vencimiento || ''}
                    onChange={(e) =>
                      actualizarFormEdicionAnidado(
                        'contrato',
                        'pagare',
                        'fecha_vencimiento',
                        e.target.value
                      )
                    }
                  />
                  <CampoFormulario
                    label="Monto en letras"
                    value={formEdicion.autorizacion.valor.monto_letras}
                    onChange={(e) =>
                      actualizarFormEdicionAnidado('autorizacion', 'valor', 'monto_letras', e.target.value)
                    }
                  />
                  <CampoFormulario
                    label="Lote"
                    value={formEdicion.autorizacion.voucher.lote}
                    onChange={(e) =>
                      actualizarFormEdicionAnidado('autorizacion', 'voucher', 'lote', e.target.value)
                    }
                  />
                  <CampoFormulario
                    label="Referencia"
                    value={formEdicion.autorizacion.voucher.referencia}
                    onChange={(e) =>
                      actualizarFormEdicionAnidado('autorizacion', 'voucher', 'referencia', e.target.value)
                    }
                  />
                  <CampoFormulario
                    label="Aprobación"
                    value={formEdicion.autorizacion.voucher.aprobacion}
                    onChange={(e) =>
                      actualizarFormEdicionAnidado('autorizacion', 'voucher', 'aprobacion', e.target.value)
                    }
                  />
                  <CampoSelect
                    label="Estado del contrato"
                    value={formEdicion.metadata.estado}
                    onChange={(e) => actualizarFormEdicion('metadata', 'estado', e.target.value)}
                    options={['pendiente', 'activo', 'firmado', 'cancelado']}
                  />
                  <CampoSelect
                    label="Plantilla vinculada"
                    value={plantillaIdParaDoc}
                    onChange={(e) => setPlantillaIdParaDoc(e.target.value)}
                    options={['', ...plantillasDisponibles.map((p) => p.id)]}
                    optionLabels={{
                      '': '— Seleccionar —',
                      ...Object.fromEntries(plantillasDisponibles.map((p) => [p.id, `${p.nombre} (${p.id})`]))
                    }}
                  />
                  <div className="md:col-span-2">
                    <CampoTextarea
                      label="Cortesías por asistencia"
                      value={formEdicion.beneficios.cortesias_por_asistencia}
                      onChange={(e) =>
                        actualizarFormEdicion('beneficios', 'cortesias_por_asistencia', e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <CampoTextarea
                      label="Ofrecimientos adicionales"
                      value={formEdicion.beneficios.ofrecimientos_adicionales}
                      onChange={(e) =>
                        actualizarFormEdicion('beneficios', 'ofrecimientos_adicionales', e.target.value)
                      }
                    />
                  </div>
                </div>
              </SeccionFormulario>
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">📋 Detalle total del contrato</h2>
              <p className="text-sm text-gray-500 mb-4">
                Registro completo del contrato con casillas claramente identificadas.
              </p>

              <div className="space-y-6">
                <GrupoDetalle
                  titulo="Identificación del contrato"
                  items={[
                    ['Número', contratoSeleccionado.numero_contrato],
                    [
                      'Fecha contrato',
                      contratoSeleccionado.fecha_contrato
                        ? new Date(contratoSeleccionado.fecha_contrato).toLocaleDateString('es')
                        : contratoSeleccionado.datos_completos?.contrato?.fecha || '—'
                    ],
                    ['Valor', `$${parseFloat(contratoSeleccionado.valor_contrato || 0).toFixed(2)}`],
                    ['Noches', contratoSeleccionado.numero_noches ?? '—'],
                    ['Años', contratoSeleccionado.anos_contrato ?? '—'],
                    [
                      'Tarjeta / banco',
                      contratoSeleccionado.datos_completos?.contrato?.tarjeta_y_banco ||
                        contratoSeleccionado.tarjeta_y_banco ||
                        '—'
                    ],
                    ['Pagaré nº', contratoSeleccionado.pagare_numero || contratoSeleccionado.datos_completos?.contrato?.pagare?.numero || '—'],
                    [
                      'Vencimiento pagaré',
                      contratoSeleccionado.pagare_fecha_vencimiento
                        ? new Date(contratoSeleccionado.pagare_fecha_vencimiento).toLocaleDateString('es')
                        : contratoSeleccionado.datos_completos?.contrato?.pagare?.fecha_vencimiento || '—'
                    ],
                    ['Plantilla vinculada', contratoSeleccionado.plantilla_id || '—']
                  ]}
                />

                <GrupoDetalle
                  titulo="Cliente"
                  items={[
                    ['Nombre', obtenerNombreClienteContrato(contratoSeleccionado)],
                    ['Email', contratoSeleccionado.email || contratoSeleccionado.datos_completos?.cliente?.email || '—'],
                    ['Teléfono', contratoSeleccionado.phone || contratoSeleccionado.datos_completos?.cliente?.telefono || '—'],
                    [
                      'Documento',
                      contratoSeleccionado.document_number ||
                        contratoSeleccionado.datos_completos?.cliente?.cedula ||
                        '—'
                    ],
                    ['Ciudad', contratoSeleccionado.ciudad || contratoSeleccionado.datos_completos?.cliente?.ciudad || '—'],
                    ['País', contratoSeleccionado.pais || contratoSeleccionado.datos_completos?.cliente?.pais || '—'],
                    ['Dirección', contratoSeleccionado.direccion || contratoSeleccionado.datos_completos?.cliente?.direccion || '—']
                  ]}
                />

                <GrupoDetalle
                  titulo="Autorización de cobro"
                  items={[
                    ['Monto (letras)', contratoSeleccionado.datos_completos?.autorizacion?.valor?.monto_letras || '—'],
                    [
                      'Monto (numérico)',
                      `$${Number(
                        contratoSeleccionado.datos_completos?.autorizacion?.valor?.monto_numerico ||
                          contratoSeleccionado.valor_contrato ||
                          0
                      ).toFixed(2)}`
                    ],
                    [
                      'Empresa',
                      contratoSeleccionado.datos_completos?.autorizacion?.empresa
                        ? `${contratoSeleccionado.datos_completos.autorizacion.empresa.razon_social} (${contratoSeleccionado.datos_completos.autorizacion.empresa.nombre_comercial}) — RUC: ${contratoSeleccionado.datos_completos.autorizacion.empresa.ruc}`
                        : '—'
                    ],
                    ['Motivo', contratoSeleccionado.datos_completos?.autorizacion?.motivo || '—'],
                    ['Lote', contratoSeleccionado.datos_completos?.autorizacion?.voucher?.lote || '—'],
                    ['Referencia', contratoSeleccionado.datos_completos?.autorizacion?.voucher?.referencia || '—'],
                    ['Aprobación', contratoSeleccionado.datos_completos?.autorizacion?.voucher?.aprobacion || '—'],
                    ['Estado pago', contratoSeleccionado.estado_pago || contratoSeleccionado.datos_completos?.metadata?.estado || '—']
                  ]}
                />

                <GrupoDetalle
                  titulo="Beneficios acordados"
                  items={[
                    [
                      'Cortesías por asistencia',
                      contratoSeleccionado.datos_completos?.beneficios?.cortesias_por_asistencia ||
                        contratoSeleccionado.cortesias_por_asistencia ||
                        '—'
                    ],
                    [
                      'Ofrecimientos adicionales',
                      contratoSeleccionado.datos_completos?.beneficios?.ofrecimientos_adicionales ||
                        contratoSeleccionado.ofrecimientos_adicionales ||
                        '—'
                    ]
                  ]}
                />

                <GrupoDetalle
                  titulo="Registro y estado"
                  items={[
                    ['Estado contrato', contratoSeleccionado.estado || '—'],
                    [
                      'Creado por',
                      contratoSeleccionado.creado_por ||
                        contratoSeleccionado.datos_completos?.metadata?.creado_por ||
                        '—'
                    ],
                    [
                      'Fecha creación',
                      contratoSeleccionado.fecha_creacion
                        ? new Date(contratoSeleccionado.fecha_creacion).toLocaleString('es')
                        : '—'
                    ]
                  ]}
                />
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">📄 Documento del contrato</h2>
            <p className="text-gray-600 mb-3 text-sm">
              Genera el documento del contrato en PDF con los datos actuales.
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => verDocumento(contratoSeleccionado.id, contratoSeleccionado.cliente_id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                ⬇ Generar y descargar PDF
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">📋 Generar documento desde plantilla</h2>
            <p className="text-gray-600 mb-3 text-sm">
              Elige una plantilla, se rellena con la base de datos y luego solo descargas o imprimes.
            </p>

            <div className="flex flex-wrap gap-3 items-end">
              <div className="min-w-[260px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla</label>
                <select
                  value={plantillaIdParaDoc}
                  onChange={(e) => setPlantillaIdParaDoc(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">— Seleccionar —</option>
                  {plantillasDisponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={!plantillaIdParaDoc || generandoDoc}
                onClick={generarPdfDesdePlantillaHandler}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generandoDoc ? '⏳...' : '⬇ Generar y descargar PDF'}
              </button>

              <button
                type="button"
                disabled={!plantillaIdParaDoc || generandoDoc}
                onClick={guardarPdfComoAdjuntoHandler}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generandoDoc ? '⏳...' : '📎 Generar PDF y guardar como adjunto'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">📎 Adjuntos (PDFs)</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <h3 className="font-semibold mb-3">Subir nuevo PDF</h3>
              <SubidorPDF
                contratoId={contratoSeleccionado.id}
                onSubir={(archivo, descripcion, tipo) =>
                  subirPDF(contratoSeleccionado.id, archivo, descripcion, tipo)
                }
                subiendo={subiendo}
              />
            </div>

            {cargandoAdjuntos ? (
              <p className="text-gray-500">Cargando adjuntos...</p>
            ) : adjuntos.length === 0 ? (
              <p className="text-gray-500 italic">No hay adjuntos subidos para este contrato</p>
            ) : (
              <div className="space-y-2">
                {adjuntos.map((adjunto) => (
                  <div key={adjunto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{adjunto.nombre_original}</p>
                      {adjunto.descripcion && <p className="text-sm text-gray-600">{adjunto.descripcion}</p>}
                      <p className="text-xs text-gray-500">
                        Tipo: {adjunto.tipo_documento} | Tamaño: {(adjunto.tamaño / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => descargarPDF(adjunto.id, adjunto.nombre_original)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        ⬇ Descargar
                      </button>
                      <button
                        onClick={() => eliminarAdjunto(adjunto.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function mapearContratoAFormulario(contrato) {
  const datos = contrato?.datos_completos || {};
  const clienteNombre =
    datos?.cliente?.nombres_completos ||
    `${contrato?.first_name || ''} ${contrato?.last_name || ''}`.trim();

  return {
    cliente: {
      nombres_completos: clienteNombre || '',
      ciudad: datos?.cliente?.ciudad || contrato?.ciudad || '',
      pais: datos?.cliente?.pais || contrato?.pais || 'Ecuador',
      telefono: datos?.cliente?.telefono || contrato?.phone || '',
      cedula: datos?.cliente?.cedula || contrato?.document_number || '',
      email: datos?.cliente?.email || contrato?.email || '',
      direccion: datos?.cliente?.direccion || contrato?.direccion || ''
    },
    tarjeta: {
      nombre_tarjetahabiente: datos?.tarjeta?.nombre_tarjetahabiente || '',
      tipo_tarjeta: datos?.tarjeta?.tipo_tarjeta || 'Visa',
      numero_tarjeta: datos?.tarjeta?.numero_tarjeta || '',
      fecha_caducidad: datos?.tarjeta?.fecha_caducidad || ''
    },
    autorizacion: {
      empresa: {
        razon_social:
          datos?.autorizacion?.empresa?.razon_social || 'PACIFIC ADVENTURE PACITURE S.A.S',
        nombre_comercial:
          datos?.autorizacion?.empresa?.nombre_comercial || 'INNOVATION BUSSINES',
        ruc: datos?.autorizacion?.empresa?.ruc || '1793230574001'
      },
      valor: {
        monto_numerico:
          datos?.autorizacion?.valor?.monto_numerico ??
          Number(contrato?.valor_contrato || 0),
        monto_letras: datos?.autorizacion?.valor?.monto_letras || ''
      },
      motivo:
        datos?.autorizacion?.motivo || 'Prestación de servicios turísticos nacionales e internacionales',
      voucher: {
        lote: datos?.autorizacion?.voucher?.lote || '',
        referencia: datos?.autorizacion?.voucher?.referencia || '',
        aprobacion: datos?.autorizacion?.voucher?.aprobacion || '',
        modalidad: datos?.autorizacion?.voucher?.modalidad || 'venta'
      }
    },
    contrato: {
      fecha:
        normalizarFechaInput(contrato?.fecha_contrato) ||
        datos?.contrato?.fecha ||
        new Date().toISOString().split('T')[0],
      valor_contrato: Number(contrato?.valor_contrato || datos?.contrato?.valor_contrato || 0),
      anos_contrato: Number(contrato?.anos_contrato || datos?.contrato?.anos_contrato || 0),
      numero_noches: Number(contrato?.numero_noches || datos?.contrato?.numero_noches || 0),
      tarjeta_y_banco: datos?.contrato?.tarjeta_y_banco || contrato?.tarjeta_y_banco || '',
      pagare: {
        numero: contrato?.pagare_numero || datos?.contrato?.pagare?.numero || '',
        fecha_vencimiento:
          normalizarFechaInput(contrato?.pagare_fecha_vencimiento) ||
          datos?.contrato?.pagare?.fecha_vencimiento ||
          ''
      }
    },
    estadia: {
      internacional: {
        incluye: datos?.estadia?.internacional?.incluye ?? true,
        numero_pax: Number(datos?.estadia?.internacional?.numero_pax || 2)
      },
      nacional: {
        incluye: datos?.estadia?.nacional?.incluye ?? true,
        numero_pax: Number(datos?.estadia?.nacional?.numero_pax || 2)
      }
    },
    beneficios: {
      cortesias_por_asistencia:
        datos?.beneficios?.cortesias_por_asistencia || contrato?.cortesias_por_asistencia || '',
      ofrecimientos_adicionales:
        datos?.beneficios?.ofrecimientos_adicionales || contrato?.ofrecimientos_adicionales || ''
    },
    metadata: {
      creado_por: contrato?.creado_por || datos?.metadata?.creado_por || 'sistema',
      estado: contrato?.estado || datos?.metadata?.estado || 'pendiente'
    }
  };
}

function normalizarFechaInput(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return typeof valor === 'string' ? valor.slice(0, 10) : '';
  return fecha.toISOString().split('T')[0];
}

function obtenerNombreClienteContrato(contrato) {
  const desdeDatos = contrato?.datos_completos?.cliente?.nombres_completos;
  const desdeCampos = `${contrato?.first_name || ''} ${contrato?.last_name || ''}`.trim();
  return desdeDatos || desdeCampos || '—';
}

function formatearLabel(texto) {
  return texto
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function TarjetaEstadistica({ titulo, valor, color }) {
  const styles = {
    yellow: 'bg-yellow-100',
    blue: 'bg-blue-100',
    default: 'bg-white'
  };

  return (
    <div className={`${styles[color] || styles.default} p-4 rounded-lg shadow`}>
      <p className="text-sm text-gray-600">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}

function EstadoBadge({ estado }) {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
      ${estado === 'activo' ? 'bg-green-100 text-green-800' : ''}
      ${estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
      ${estado === 'firmado' ? 'bg-blue-100 text-blue-800' : ''}
      ${estado === 'cancelado' ? 'bg-red-100 text-red-800' : ''}
      ${!['activo', 'pendiente', 'firmado', 'cancelado'].includes(estado) ? 'bg-gray-100 text-gray-700' : ''}
    `}
    >
      {estado || '—'}
    </span>
  );
}

function SeccionFormulario({ titulo, descripcion, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">{titulo}</h2>
      {descripcion ? <p className="text-sm text-gray-500 mb-4">{descripcion}</p> : null}
      {children}
    </div>
  );
}

function CampoFormulario({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  step,
  readOnly = false
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder || label}
        step={step}
        readOnly={readOnly}
        className={`w-full border rounded px-3 py-2 ${readOnly ? 'bg-gray-50' : 'bg-white'}`}
      />
    </div>
  );
}

function CampoTextarea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className="w-full border rounded px-3 py-2"
        placeholder={label}
      />
    </div>
  );
}

function CampoSelect({ label, value, onChange, options = [], optionLabels = {} }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2 bg-white">
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] || option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResumenDato({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function GrupoDetalle({ titulo, items = [] }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2">{titulo}</h3>
      <div className="bg-gray-50 p-4 rounded grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
        {items.map(([label, value]) => (
          <div key={label}>
            <span className="text-gray-500">{label}:</span>{' '}
            <span className="font-medium">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubidorPDF({ onSubir, subiendo }) {
  const [archivo, setArchivo] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('otro');

  const manejarCambioArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArchivo(file);
    } else {
      alert('Por favor selecciona un archivo PDF válido');
      setArchivo(null);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!archivo) {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    await onSubir(archivo, descripcion, tipoDocumento);

    setArchivo(null);
    setDescripcion('');
    setTipoDocumento('otro');

    const fileInput = e.target.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <form onSubmit={manejarEnvio} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Seleccionar PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={manejarCambioArchivo}
          disabled={subiendo}
          className="w-full border rounded px-3 py-2"
        />
        {archivo && <p className="text-sm text-green-600 mt-1">✓ {archivo.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tipo de Documento</label>
        <select
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value)}
          disabled={subiendo}
          className="w-full border rounded px-3 py-2"
        >
          <option value="contrato">Contrato</option>
          <option value="carta_diferimiento">Carta de Diferimiento</option>
          <option value="autorizacion">Autorización</option>
          <option value="beneficios">Beneficios</option>
          <option value="terminos">Términos</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Documento de prueba, información importante, etc."
          disabled={subiendo}
          className="w-full border rounded px-3 py-2 h-20 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!archivo || subiendo}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {subiendo ? '⏳ Subiendo...' : '📤 Subir PDF'}
      </button>
    </form>
  );
}