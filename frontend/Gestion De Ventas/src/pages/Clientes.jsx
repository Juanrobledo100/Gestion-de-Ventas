import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Save, X, Mail, Phone, MapPin, Search, SlidersHorizontal, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Clientes = ({ clientes, cargarDatos }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  const abrirModal = (tipo, cliente = null) => {
    setModalType(tipo);
    setFormData(cliente || { nombre: '', email: '', telefono: '', direccion: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalType === 'add' 
        ? `${API_URL}/clientes` 
        : `${API_URL}/clientes/${formData._id}`;
      
      const response = await fetch(url, {
        method: modalType === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await cargarDatos();
        setShowModal(false);
        alert(`Cliente ${modalType === 'add' ? 'agregado' : 'actualizado'} exitosamente`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar cliente');
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await cargarDatos();
        alert('Cliente eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar cliente');
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', email: '', telefono: '' });
  };

  const hayFiltrosActivos = filtros.nombre !== '' || filtros.email !== '' || filtros.telefono !== '';

  // Aplicar filtros
  const clientesFiltrados = clientes.filter(cliente => {
    const cumpleNombre = !filtros.nombre || 
      cliente.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const cumpleEmail = !filtros.email || 
      cliente.email.toLowerCase().includes(filtros.email.toLowerCase());
    const cumpleTelefono = !filtros.telefono || 
      cliente.telefono.includes(filtros.telefono);
    
    return cumpleNombre && cumpleEmail && cumpleTelefono;
  });

  return (
    <>
      {/* BARRA DE FILTROS PROFESIONAL */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md border border-blue-200 p-4 sm:p-6">
          {/* Header de filtros */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <SlidersHorizontal className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Filtros de Búsqueda</h3>
                <p className="text-sm text-gray-600">Busca clientes por nombre, email o teléfono</p>
              </div>
            </div>
            
            <button
              onClick={() => abrirModal('add')}
              className="w-full lg:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2" size={20} />
              Nuevo Cliente
            </button>
          </div>

          {/* Campos de filtro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Users className="inline mr-1" size={16} />
                Nombre
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                {filtros.nombre && (
                  <button
                    onClick={() => setFiltros({...filtros, nombre: ''})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline mr-1" size={16} />
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={filtros.email}
                  onChange={(e) => setFiltros({...filtros, email: e.target.value})}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                {filtros.email && (
                  <button
                    onClick={() => setFiltros({...filtros, email: ''})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline mr-1" size={16} />
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por teléfono..."
                  value={filtros.telefono}
                  onChange={(e) => setFiltros({...filtros, telefono: e.target.value})}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                {filtros.telefono && (
                  <button
                    onClick={() => setFiltros({...filtros, telefono: ''})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {hayFiltrosActivos && (
            <div className="mt-4">
              <button
                onClick={limpiarFiltros}
                className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-semibold flex items-center transition-all"
              >
                <XCircle className="mr-2" size={18} />
                Limpiar Filtros
              </button>
            </div>
          )}

          {/* Resultados */}
          <div className="mt-4 pt-4 border-t border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Resultados:</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {clientesFiltrados.length}
              </span>
              <span className="text-sm text-gray-600">de {clientes.length} clientes</span>
            </div>
            
            {hayFiltrosActivos && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Filtros activos:</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                  {Object.values(filtros).filter(v => v !== '').length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-blue-500 to-blue-600">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <Users className="mr-2 sm:mr-3" size={24} />
            <span>Listado de Clientes</span>
          </h3>
        </div>

        {/* Vista de TARJETAS para móvil */}
        <div className="md:hidden">
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold inline-flex items-center"
                >
                  <XCircle className="mr-2" size={18} />
                  Limpiar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente._id}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className="mb-3">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                      {cliente.nombre}
                    </h4>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    {cliente.email && (
                      <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Mail size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                    {cliente.telefono && (
                      <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Phone size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.direccion && (
                      <div className="flex items-start text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <MapPin size={16} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{cliente.direccion}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => abrirModal('edit', cliente)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-lg hover:bg-blue-100 flex items-center justify-center font-semibold text-sm transition-all"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCliente(cliente._id)}
                      className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg hover:bg-red-100 flex items-center justify-center font-semibold text-sm transition-all"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vista de TABLA para desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{cliente.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.direccion}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button 
                      onClick={() => abrirModal('edit', cliente)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => eliminarCliente(cliente._id)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clientesFiltrados.length === 0 && (
            <div className="text-center py-16 bg-gray-50">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold inline-flex items-center"
                >
                  <XCircle className="mr-2" size={18} />
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal MEJORADO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <Users size={28} />
                {modalType === 'add' ? 'Agregar' : 'Editar'} Cliente
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Users className="inline mr-2" size={16} />
                  Nombre completo *
                </label>
                <input
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="juan@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Teléfono
                </label>
                <input
                  placeholder="351-123-4567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <MapPin className="inline mr-2" size={16} />
                  Dirección
                </label>
                <input
                  placeholder="Calle 123, Tucumán"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="mr-2" size={18} />
                  Guardar
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Clientes;