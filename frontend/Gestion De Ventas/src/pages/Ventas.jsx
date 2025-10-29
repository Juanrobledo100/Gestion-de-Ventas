import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Save, X, Mail, Phone, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Clientes = ({ clientes, cargarDatos }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});

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

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <Users className="mr-2 sm:mr-3" size={20} />
            <span className="hidden sm:inline">Listado de Clientes</span>
            <span className="sm:hidden">Clientes</span>
          </h3>
          <button
            onClick={() => abrirModal('add')}
            className="bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="mr-2" size={18} />
            Agregar Cliente
          </button>
        </div>

        {/* Vista de TARJETAS para móvil */}
        <div className="md:hidden">
          {clientes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm">No hay clientes registrados</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {clientes.map((cliente) => (
                <div
                  key={cliente._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Nombre */}
                  <div className="mb-3">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                      {cliente.nombre}
                    </h4>
                  </div>

                  {/* Detalles con iconos */}
                  <div className="space-y-2 mb-3 text-sm">
                    {cliente.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                    {cliente.telefono && (
                      <div className="flex items-center text-gray-600">
                        <Phone size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.direccion && (
                      <div className="flex items-start text-gray-600">
                        <MapPin size={16} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{cliente.direccion}</span>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => abrirModal('edit', cliente)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center font-semibold text-sm"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCliente(cliente._id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center font-semibold text-sm"
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Teléfono</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Dirección</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{cliente.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.direccion}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button 
                      onClick={() => abrirModal('edit', cliente)} 
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => eliminarCliente(cliente._id)} 
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clientes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-base">No hay clientes registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                {modalType === 'add' ? 'Agregar' : 'Editar'} Cliente
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
              <input
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <input
                placeholder="Dirección"
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                className="w-full mb-4 sm:mb-6 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold text-sm sm:text-base"
                >
                  <Save className="mr-2" size={18} />
                  Guardar
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-400 font-semibold text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Clientes;