import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Productos = ({ productos, categorias, cargarDatos }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});

  const abrirModal = (tipo, producto = null) => {
    setModalType(tipo);
    setFormData(
      producto
        ? { ...producto, precio: producto.precioUnitario }
        : { nombre: '', precio: '', stock: '', categoriaId: '' }
    );
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        precioUnitario: parseFloat(formData.precio),
        categoria: formData.categoriaId,
      };

      const url =
        modalType === 'add'
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
        alert(
          `Producto ${
            modalType === 'add' ? 'agregado' : 'actualizado'
          } exitosamente`
        );
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar producto');
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await cargarDatos();
        alert('Producto eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar producto');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <Package className="mr-2 sm:mr-3" size={20} />
            <span className="hidden sm:inline">Inventario de Productos</span>
            <span className="sm:hidden">Productos</span>
          </h3>
          <button
            onClick={() => abrirModal('add')}
            className="bg-white text-green-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-green-50 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="mr-2" size={18} />
            Agregar Producto
          </button>
        </div>

        {/* Vista de TARJETAS para móvil */}
        <div className="md:hidden">
          {productos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm">No hay productos registrados</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {productos.map((producto) => (
                <div
                  key={producto._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Nombre y precio */}
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

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {producto.stock}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Categoría:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {producto.categoria?.nombre || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => abrirModal('edit', producto)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center font-semibold text-sm"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto._id)}
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Precio
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map((producto) => (
                <tr
                  key={producto._id}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {producto.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    ${producto.precioUnitario?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {producto.stock}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {producto.categoria?.nombre || 'N/A'}
                  </td>
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
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto._id)}
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

          {productos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-base">No hay productos registrados</p>
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
                {modalType === 'add' ? 'Agregar' : 'Editar'} Producto
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
                placeholder="Nombre del producto"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Precio"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
                }
                className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              />
              <select
                value={formData.categoriaId}
                onChange={(e) =>
                  setFormData({ ...formData, categoriaId: e.target.value })
                }
                className="w-full mb-4 sm:mb-6 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-green-700 flex items-center justify-center font-semibold text-sm sm:text-base"
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

export default Productos;