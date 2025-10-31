import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, Save, X, Search, SlidersHorizontal, XCircle, DollarSign, Hash, Tag } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Productos = ({ productos, categorias, cargarDatos }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    nombre: '',
    categoriaId: '',
    precioMin: '',
    precioMax: '',
    stockMin: '',
    stockMax: ''
  });

  const abrirModal = (tipo, producto = null) => {
    setModalType(tipo);
    setFormData(
      producto
        ? { ...producto, precio: producto.precioUnitario, categoriaId: producto.categoria?._id }
        : { nombre: '', precio: '', stock: '', categoriaId: '', descripcion: '' }
    );
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoriaId: formData.categoriaId,
        descripcion: formData.descripcion || ''
      };

      const url = modalType === 'add'
          ? `${API_URL}/productos`
          : `${API_URL}/productos/${formData._id}`;

      const response = await fetch(url, {
        method: modalType === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await cargarDatos();
        setShowModal(false);
        alert(`Producto ${modalType === 'add' ? 'agregado' : 'actualizado'} exitosamente`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar producto');
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await cargarDatos();
        alert('Producto eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar producto');
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      nombre: '',
      categoriaId: '',
      precioMin: '',
      precioMax: '',
      stockMin: '',
      stockMax: ''
    });
  };

  const hayFiltrosActivos = Object.values(filtros).some(v => v !== '');

  // Aplicar filtros
  const productosFiltrados = productos.filter(prod => {
    const cumpleNombre = !filtros.nombre || 
      prod.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    
    const cumpleCategoria = !filtros.categoriaId || 
      prod.categoria?._id === filtros.categoriaId;
    
    const cumplePrecioMin = !filtros.precioMin || 
      prod.precioUnitario >= parseFloat(filtros.precioMin);
    
    const cumplePrecioMax = !filtros.precioMax || 
      prod.precioUnitario <= parseFloat(filtros.precioMax);
    
    const cumpleStockMin = !filtros.stockMin || 
      prod.stock >= parseInt(filtros.stockMin);
    
    const cumpleStockMax = !filtros.stockMax || 
      prod.stock <= parseInt(filtros.stockMax);
    
    return cumpleNombre && cumpleCategoria && cumplePrecioMin && 
           cumplePrecioMax && cumpleStockMin && cumpleStockMax;
  });

  return (
    <>
      {/* BARRA DE FILTROS PROFESIONAL */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow-md border border-green-200 p-4 sm:p-6">
          {/* Header de filtros */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg shadow-lg">
                <SlidersHorizontal className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Filtros Avanzados</h3>
                <p className="text-sm text-gray-600">Filtra por nombre, categoría, precio o stock</p>
              </div>
            </div>
            
            <button
              onClick={() => abrirModal('add')}
              className="w-full lg:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2" size={20} />
              Nuevo Producto
            </button>
          </div>

          {/* Campos de filtro - Fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="inline mr-1" size={16} />
                Buscar producto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Nombre del producto..."
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
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

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Tag className="inline mr-1" size={16} />
                Categoría
              </label>
              <select
                value={filtros.categoriaId}
                onChange={(e) => setFiltros({...filtros, categoriaId: e.target.value})}
                className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos de filtro - Fila 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="inline mr-1" size={16} />
                Rango de precio
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Mínimo"
                    value={filtros.precioMin}
                    onChange={(e) => setFiltros({...filtros, precioMin: e.target.value})}
                    className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Máximo"
                    value={filtros.precioMax}
                    onChange={(e) => setFiltros({...filtros, precioMax: e.target.value})}
                    className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Hash className="inline mr-1" size={16} />
                Rango de stock
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={filtros.stockMin}
                  onChange={(e) => setFiltros({...filtros, stockMin: e.target.value})}
                  className="w-1/2 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={filtros.stockMax}
                  onChange={(e) => setFiltros({...filtros, stockMax: e.target.value})}
                  className="w-1/2 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
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
                Limpiar Todos los Filtros
              </button>
            </div>
          )}

          {/* Resultados */}
          <div className="mt-4 pt-4 border-t border-green-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Resultados:</span>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {productosFiltrados.length}
              </span>
              <span className="text-sm text-gray-600">de {productos.length} productos</span>
            </div>
            
            {hayFiltrosActivos && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Filtros activos:</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  {Object.values(filtros).filter(v => v !== '').length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <Package className="mr-2 sm:mr-3" size={24} />
            <span>Inventario de Productos</span>
          </h3>
        </div>

        {/* Vista de TARJETAS para móvil */}
        <div className="md:hidden">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron productos</h3>
              <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold inline-flex items-center"
                >
                  <XCircle className="mr-2" size={18} />
                  Limpiar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto._id}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-green-200 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base mb-1">
                        {producto.nombre}
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${producto.precioUnitario?.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        producto.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {producto.stock > 10 ? 'En Stock' : 'Bajo Stock'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500">Stock:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {producto.stock}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500">Categoría:</span>
                      <span className="ml-2 font-semibold text-gray-900 text-xs">
                        {producto.categoria?.nombre || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => abrirModal('edit', producto)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-lg hover:bg-blue-100 flex items-center justify-center font-semibold text-sm transition-all"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto._id)}
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {productosFiltrados.map((producto) => (
                <tr key={producto._id} className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{producto.nombre}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">${producto.precioUnitario?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.stock}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria?.nombre || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        producto.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {producto.stock > 10 ? 'En Stock' : 'Bajo Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => abrirModal('edit', producto)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto._id)}
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

          {productosFiltrados.length === 0 && (
            <div className="text-center py-16 bg-gray-50">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron productos</h3>
              <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold inline-flex items-center"
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
              <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <Package size={28} />
                {modalType === 'add' ? 'Agregar' : 'Editar'} Producto
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
                  <Package className="inline mr-2" size={16} />
                  Nombre del producto *
                </label>
                <input
                  placeholder="Ej: Notebook HP Pavilion"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <DollarSign className="inline mr-2" size={16} />
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Hash className="inline mr-2" size={16} />
                    Stock *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Tag className="inline mr-2" size={16} />
                  Categoría *
                </label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  placeholder="Describe las características del producto..."
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all"
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

export default Productos;