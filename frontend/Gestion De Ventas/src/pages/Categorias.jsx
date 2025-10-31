import React, { useState } from 'react';
import { Tag, Plus, Edit, Trash2, Save, X, Search, SlidersHorizontal, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Categorias = ({ categorias, productos, cargarDatos }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    nombre: ''
  });

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

  const limpiarFiltros = () => {
    setFiltros({ nombre: '' });
  };

  const hayFiltrosActivos = filtros.nombre !== '';

  // Aplicar filtros
  const categoriasFiltradas = categorias.filter(cat => {
    const cumpleNombre = !filtros.nombre || 
      cat.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    
    return cumpleNombre;
  });

  return (
    <>
      {/* BARRA DE FILTROS PROFESIONAL */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-md border border-purple-200 p-4 sm:p-6">
          {/* Header de filtros */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <SlidersHorizontal className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Filtros de Búsqueda</h3>
                <p className="text-sm text-gray-600">Encuentra categorías rápidamente</p>
              </div>
            </div>
            
            <button
              onClick={() => abrirModal('add')}
              className="w-full lg:w-auto bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2" size={20} />
              Nueva Categoría
            </button>
          </div>

          {/* Campos de filtro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar por nombre
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Ej: Electrónica, Ropa, Alimentos..."
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
                {filtros.nombre && (
                  <button
                    onClick={() => setFiltros({...filtros, nombre: ''})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-end">
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center transition-all"
                >
                  <XCircle className="mr-2" size={20} />
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div className="mt-4 pt-4 border-t border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Resultados:</span>
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {categoriasFiltradas.length}
              </span>
              <span className="text-sm text-gray-600">de {categorias.length} categorías</span>
            </div>
            
            {hayFiltrosActivos && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Filtros activos:</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                  {Object.values(filtros).filter(v => v !== '').length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriasFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-md">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron categorías</h3>
            <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold inline-flex items-center"
              >
                <XCircle className="mr-2" size={18} />
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          categoriasFiltradas.map((categoria) => {
            const productosCat = productos.filter(p => p.categoria?._id === categoria._id);
            const totalProductos = productosCat.length;

            return (
              <div key={categoria._id} className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
                    <Tag className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => abrirModal('edit', categoria)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => eliminarCategoria(categoria._id)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-gray-900">{categoria.nombre}</h4>
                  <div className="bg-purple-100 px-3 py-1 rounded-full">
                    <span className="text-2xl font-bold text-purple-600">{totalProductos}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {categoria.descripcion || 'Sin descripción'}
                </p>
                
                {totalProductos > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Productos en esta categoría
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {productosCat.slice(0, 5).map(prod => (
                        <div key={prod._id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                          <span className="font-medium text-gray-700 truncate flex-1">{prod.nombre}</span>
                          <span className="font-bold text-green-600 ml-2">${prod.precioUnitario?.toFixed(2)}</span>
                        </div>
                      ))}
                      {totalProductos > 5 && (
                        <p className="text-xs text-gray-500 italic text-center pt-1">
                          + {totalProductos - 5} productos más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Tag size={28} />
                {modalType === 'add' ? 'Agregar' : 'Editar'} Categoría
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
                  Nombre de la categoría *
                </label>
                <input
                  placeholder="Ej: Electrónica, Ropa, Alimentos..."
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  placeholder="Describe esta categoría para facilitar su identificación..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  rows="4"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSubmit}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all"
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

export default Categorias;