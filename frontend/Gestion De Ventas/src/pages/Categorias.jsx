import React, { useState } from 'react';
import { Tag, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Categorias = ({ categorias, productos, cargarDatos }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});

  const abrirModal = (tipo, categoria = null) => {
    setModalType(tipo);
    setFormData(categoria || { nombre: '', descripcion: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalType === 'add' 
        ? `${API_URL}/categorias` 
        : `${API_URL}/categorias/${formData._id}`;
      
      const response = await fetch(url, {
        method: modalType === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await cargarDatos();
        setShowModal(false);
        alert(`Categoría ${modalType === 'add' ? 'agregada' : 'actualizada'} exitosamente`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar categoría');
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      const response = await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await cargarDatos();
        alert('Categoría eliminada exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar categoría');
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => abrirModal('add')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center shadow-lg"
        >
          <Plus className="mr-2" size={20} />
          Agregar Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((categoria) => {
          // 🔹 Filtrar productos correctamente
          const productosCat = productos.filter(p => p.categoria?._id === categoria._id);
          const totalProductos = productosCat.length;

          return (
            <div key={categoria._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 rounded-full p-4">
                  <Tag className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirModal('edit', categoria)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => eliminarCategoria(categoria._id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-bold text-gray-900">{categoria.nombre}</h4>
                <span className="text-4xl font-bold text-purple-600">{totalProductos}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{categoria.descripcion || 'Sin descripción'}</p>
              
              {totalProductos > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Productos:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {productosCat.slice(0, 5).map(prod => (
                      <div key={prod._id} className="text-xs text-gray-700 flex justify-between">
                        <span>{prod.nombre}</span>
                        <span className="font-semibold text-green-600">${prod.precioUnitario?.toFixed(2)}</span>
                      </div>
                    ))}
                    {totalProductos > 5 && (
                      <p className="text-xs text-gray-500 italic">...y {totalProductos - 5} más</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{modalType === 'add' ? 'Agregar' : 'Editar'} Categoría</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Nombre de la categoría"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center font-semibold">
                  <Save className="mr-2" size={18} />
                  Guardar
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold">
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

export default Categorias;
