import React, { useState, useEffect } from 'react';
import './DashboardGold.css';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';
import { postventaVitacoraService } from '../services/api';
import { BookOpen, Plus, MessageSquare, FileText, Copy, X, User } from 'lucide-react';

const SECCIONES = {
  clientes: 'clientes',
  bitacora: 'bitacora',
  contactos: 'contactos',
  cancelaciones: 'cancelaciones'
};

const ESTADOS_VITACORA = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_analisis', label: 'En análisis' },
  { value: 'resuelto', label: 'Resolvió' },
  { value: 'no_quiso_solucionar', label: 'No quiso solucionar' }
];

export default function DashboardPostventa() {
  const { user, logout } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES.clientes);
  const [clientes, setClientes] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(false);

  // Bitácora
  const [vitacora, setVitacora] = useState([]);
  const [loadingVitacora, setLoadingVitacora] = useState(false);
  const [showNuevaEntrada, setShowNuevaEntrada] = useState(false);
  const [nuevaEntrada, setNuevaEntrada] = useState({
    cliente_id: '',
    cliente_nombre: '',
    cliente_email: '',
    numero_contrato: '',
    anotacion: ''
  });
  const [guardandoEntrada, setGuardandoEntrada] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaAnotacion, setNuevaAnotacion] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  // Plantilla 72h
  const [plantilla72h, setPlantilla72h] = useState(null);
  const [mostrarPlantilla, setMostrarPlantilla] = useState(false);
  const [plantillaAsignado, setPlantillaAsignado] = useState('');

  const userName = user?.nombre || user?.email || 'Postventa';

  useEffect(() => {
    const load = async () => {
      try {
        const apiMod = await import('../services/api');
        const resp = await apiMod.clientService.getClients({ limit: 1000 });
        const users = await apiMod.userService.getUsers();
        const postUser = (users.users || users).find(u => u.email === 'postventa@crm.com' || u.email === 'postventa');
        const filtered = (resp.clients || []).filter(c => postUser ? c.usuario_asignado_id === postUser.id : (c.usuario_asignado_nombre || '').toLowerCase().includes('postven'));
        setClientes(filtered);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (seccionActiva !== SECCIONES.contactos) return;
    let cancelled = false;
    setLoadingContactos(true);
    api.get('/contactos')
      .then(res => {
        if (!cancelled) setContactos(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
      })
      .catch(() => {
        if (!cancelled) setContactos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingContactos(false);
      });
    return () => { cancelled = true; };
  }, [seccionActiva]);

  useEffect(() => {
    if (seccionActiva !== SECCIONES.bitacora) return;
    loadVitacora();
  }, [seccionActiva]);

  const loadVitacora = async () => {
    setLoadingVitacora(true);
    try {
      const res = await postventaVitacoraService.list();
      setVitacora(res?.data || []);
    } catch (e) {
      console.error(e);
      setVitacora([]);
    } finally {
      setLoadingVitacora(false);
    }
  };

  const agregarEntrada = async () => {
    const { cliente_nombre, cliente_email, numero_contrato, anotacion } = nuevaEntrada;
    if (!cliente_nombre && !cliente_email && !numero_contrato) {
      alert('Indica al menos nombre del cliente, email o número de contrato.');
      return;
    }
    setGuardandoEntrada(true);
    try {
      await postventaVitacoraService.create({
        cliente_nombre: cliente_nombre || undefined,
        cliente_email: cliente_email || undefined,
        numero_contrato: numero_contrato || undefined,
        anotacion: anotacion || undefined,
        asignado_a: userName
      });
      setNuevaEntrada({ cliente_id: '', cliente_nombre: '', cliente_email: '', numero_contrato: '', anotacion: '' });
      setShowNuevaEntrada(false);
      loadVitacora();
    } catch (e) {
      console.error(e);
      alert('Error al registrar en la bitácora.');
    } finally {
      setGuardandoEntrada(false);
    }
  };

  const agregarAnotacion = async (id) => {
    if (!nuevaAnotacion.trim()) return;
    setCambiandoEstado(id);
    try {
      await postventaVitacoraService.update(id, { anotacion: nuevaAnotacion.trim() });
      setNuevaAnotacion('');
      setEditandoId(null);
      loadVitacora();
    } catch (e) {
      console.error(e);
      alert('Error al añadir anotación.');
    } finally {
      setCambiandoEstado(null);
    }
  };

  const cambiarEstado = async (id, estado) => {
    setCambiandoEstado(id);
    try {
      await postventaVitacoraService.update(id, { estado });
      loadVitacora();
    } catch (e) {
      console.error(e);
      alert('Error al actualizar estado.');
    } finally {
      setCambiandoEstado(null);
    }
  };

  const cargarPlantilla72h = async () => {
    setMostrarPlantilla(true);
    try {
      const res = await postventaVitacoraService.getPlantilla72h(userName);
      const texto = res?.plantilla || '';
      const asignado = res?.asignado_a || userName;
      setPlantilla72h(texto);
      setPlantillaAsignado(asignado);
    } catch (e) {
      console.error(e);
      const texto = 'Le informamos que su caso ha sido recibido. Se le contestará en un plazo de 72 horas hábiles.\n\nLa persona que analizará su caso es: ' + userName + '.\n\nQuedamos atentos.';
      setPlantilla72h(texto);
      setPlantillaAsignado(userName);
    }
  };

  const actualizarPersonaEnPlantilla = (nuevoNombre) => {
    setPlantillaAsignado(nuevoNombre);
    setPlantilla72h(prev => {
      if (!prev) return prev;
      return prev.replace(/La persona que analizará su caso es: [^\n]+/g, `La persona que analizará su caso es: ${nuevoNombre.trim() || '—'}.`);
    });
  };

  const copiarPlantilla = () => {
    const texto = plantilla72h || '';
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    alert('Plantilla copiada al portapapeles.');
  };

  const menuItem = (key, label, icon) => (
    <li
      key={key}
      onClick={() => setSeccionActiva(key)}
      className={`py-2 px-3 rounded cursor-pointer flex items-center gap-2 ${seccionActiva === key ? 'bg-yellow-200 font-medium' : 'hover:bg-yellow-200'}`}
    >
      {icon}
      {label}
    </li>
  );

  return (
    <div className="min-h-screen bg-yellow-50 text-black">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-yellow-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Menú - Postventa</h2>
          <ul className="space-y-2">
            {menuItem(SECCIONES.clientes, 'Clientes', <User size={18} />)}
            {menuItem(SECCIONES.bitacora, 'Bitácora', <BookOpen size={18} />)}
            {menuItem(SECCIONES.contactos, 'Contactos', <MessageSquare size={18} />)}
            {menuItem(SECCIONES.cancelaciones, 'Cancelaciones', <FileText size={18} />)}
          </ul>
        </aside>

        <main className="col-span-9">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Panel de Postventa</h1>
            <div className="flex gap-2 items-center">
              <NotificationBell />
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 rounded text-black" onClick={() => window.location.reload()}>
                Actualizar
              </button>
              <button className="px-4 py-2 border rounded text-red-700 hover:bg-red-50" onClick={logout}>
                Salir
              </button>
            </div>
          </div>

          {seccionActiva === SECCIONES.clientes && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Clientes enviados a Postventa</h2>
              <ul>
                {clientes.map((c, i) => (
                  <li key={i} className="border-b py-1">
                    {c.first_name} {c.last_name} — {c.email} — Contrato: {c.contract_number}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {seccionActiva === SECCIONES.bitacora && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Bitácora — Clientes reclamando por fecha</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cargarPlantilla72h}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Cargar plantilla 72h
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNuevaEntrada(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Nueva entrada
                  </button>
                </div>
              </div>

              {mostrarPlantilla && (
                <div className="bg-white rounded-lg shadow p-4 border-2 border-amber-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-amber-800">Plantilla: respuesta en 72 horas hábiles</h3>
                    <div className="flex gap-2">
                      <button type="button" onClick={copiarPlantilla} className="px-3 py-1 bg-amber-100 rounded flex items-center gap-1 text-sm">
                        <Copy size={14} />
                        Copiar
                      </button>
                      <button type="button" onClick={() => setMostrarPlantilla(false)} className="p-1 text-gray-500 hover:text-black">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Persona que va a atender al cliente</strong> (editable):
                  </p>
                  <input
                    type="text"
                    value={plantillaAsignado}
                    onChange={e => actualizarPersonaEnPlantilla(e.target.value)}
                    placeholder="Nombre o email de quien analiza el caso"
                    className="w-full px-3 py-2 border border-amber-300 rounded mb-3 bg-amber-50/50 text-gray-900"
                  />
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Mensaje</strong> (editable hasta que tengamos plantilla definitiva):
                  </p>
                  <textarea
                    value={plantilla72h || ''}
                    onChange={e => setPlantilla72h(e.target.value)}
                    rows={6}
                    className="w-full text-sm bg-gray-50 p-3 rounded border border-gray-300 text-gray-900 whitespace-pre-wrap"
                  />
                </div>
              )}

              {showNuevaEntrada && (
                <div className="bg-white rounded-lg shadow p-4 border border-green-200">
                  <h3 className="font-bold mb-3">Registrar cliente reclamando</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={nuevaEntrada.cliente_nombre}
                      onChange={e => setNuevaEntrada(prev => ({ ...prev, cliente_nombre: e.target.value }))}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Email"
                      value={nuevaEntrada.cliente_email}
                      onChange={e => setNuevaEntrada(prev => ({ ...prev, cliente_email: e.target.value }))}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Nº contrato"
                      value={nuevaEntrada.numero_contrato}
                      onChange={e => setNuevaEntrada(prev => ({ ...prev, numero_contrato: e.target.value }))}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                  <textarea
                    placeholder="Anotación inicial (opcional)"
                    value={nuevaEntrada.anotacion}
                    onChange={e => setNuevaEntrada(prev => ({ ...prev, anotacion: e.target.value }))}
                    className="w-full border rounded px-3 py-2 mb-3"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={agregarEntrada} disabled={guardandoEntrada} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                      {guardandoEntrada ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setShowNuevaEntrada(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow overflow-hidden">
                {loadingVitacora ? (
                  <p className="p-4 text-gray-600">Cargando bitácora...</p>
                ) : vitacora.length === 0 ? (
                  <p className="p-4 text-gray-600">No hay entradas. Añade clientes reclamando con «Nueva entrada» y ve alimentando anotaciones hasta resolver.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Fecha</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Cliente</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Contrato</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Estado</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Asignado</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Anotaciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vitacora.map(entrada => (
                          <tr key={entrada.id} className="hover:bg-yellow-100/80">
                            <td className="px-4 py-2 text-sm text-gray-900">{entrada.fecha_registro || entrada.created_at?.split('T')[0]}</td>
                            <td className="px-4 py-2 text-sm text-gray-900" title={[entrada.cliente_nombre, entrada.cliente_email].filter(Boolean).join(' — ') || 'Cliente'}>
                              {entrada.cliente_nombre || '—'}
                              {entrada.cliente_email && <span className="block text-gray-700 text-xs">{entrada.cliente_email}</span>}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900" title={entrada.numero_contrato || ''}>{entrada.numero_contrato || '—'}</td>
                            <td className="px-4 py-2">
                              <select
                                value={entrada.estado}
                                onChange={e => cambiarEstado(entrada.id, e.target.value)}
                                disabled={cambiandoEstado === entrada.id}
                                className="text-sm border rounded px-2 py-1 bg-white text-gray-900"
                              >
                                {ESTADOS_VITACORA.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium" title={entrada.asignado_a || 'Persona asignada'}>
                              {entrada.asignado_a || '—'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 max-w-xs">
                              {(entrada.anotaciones || []).length > 0 ? (
                                <ul className="list-disc list-inside text-xs space-y-0.5">
                                  {entrada.anotaciones.slice(-3).map((a, i) => (
                                    <li key={i} className="text-gray-800">{a.texto}</li>
                                  ))}
                                  {(entrada.anotaciones || []).length > 3 && (
                                    <li className="text-gray-600">+{entrada.anotaciones.length - 3} más</li>
                                  )}
                                </ul>
                              ) : (
                                '—'
                              )}
                              {editandoId === entrada.id ? (
                                <div className="mt-1 flex gap-1">
                                  <input
                                    type="text"
                                    value={nuevaAnotacion}
                                    onChange={e => setNuevaAnotacion(e.target.value)}
                                    placeholder="Nueva anotación"
                                    className="flex-1 border rounded px-2 py-1 text-xs"
                                  />
                                  <button type="button" onClick={() => agregarAnotacion(entrada.id)} disabled={cambiandoEstado === entrada.id} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                                    Añadir
                                  </button>
                                  <button type="button" onClick={() => { setEditandoId(null); setNuevaAnotacion(''); }} className="px-2 py-1 bg-gray-200 rounded text-xs">
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button type="button" onClick={() => setEditandoId(entrada.id)} className="text-amber-600 text-xs hover:underline mt-1">
                                  + Añadir anotación
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {seccionActiva === SECCIONES.contactos && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Contactos</h2>
              {loadingContactos ? (
                <p className="text-gray-600">Cargando contactos...</p>
              ) : contactos.length === 0 ? (
                <p className="text-gray-600">No hay contactos registrados.</p>
              ) : (
                <ul className="space-y-2">
                  {contactos.map((c, i) => (
                    <li key={c.id ?? i} className="border-b py-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="font-medium">{c.nombre ?? '—'}</span>
                      {c.cargo && <span className="text-gray-600">{c.cargo}</span>}
                      {c.email && <span>{c.email}</span>}
                      {c.telefono && <span>{c.telefono}</span>}
                      {c.es_principal && <span className="text-amber-600 text-sm">Principal</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {seccionActiva === SECCIONES.cancelaciones && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Cancelaciones</h2>
              <p className="text-gray-600">
                Solicitudes y gestiones de cancelación. Aquí podrás ver las solicitudes de cancelación de contratos cuando estén disponibles.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-500">No hay solicitudes de cancelación pendientes.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
