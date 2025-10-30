import React, { useState } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Save, X, Minus, PlusCircle, Calendar, User, Package as PackageIcon, DollarSign } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Ventas = ({ ventas, clientes, productos, cargarDatos }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});
  const [productosVenta, setProductosVenta] = useState([]);
  const [ventaIndex, setVentaIndex] = useState(null);

  const abrirModal = (tipo, venta = null, index = null) => {
    setModalType(tipo);
    setVentaIndex(index);

    if (venta) {
      setFormData({
        _id: venta._id,
        clienteId: venta.cliente._id,
        fecha: venta.fecha.split('T')[0],
        metodoPago: venta.metodoPago || ''
      });
      setProductosVenta(
        venta.items.map(item => ({
          productoId: item.producto._id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal
        }))
      );
    } else {
      setFormData({ 
        clienteId: '', 
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: ''
      });
      setProductosVenta([]);
    }
    setShowModal(true);
  };

  const agregarProductoVenta = () => {
    setProductosVenta([...productosVenta, {
      productoId: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    }]);
  };

  const eliminarProductoVenta = (index) => {
    setProductosVenta(productosVenta.filter((_, i) => i !== index));
  };

  const actualizarProductoVenta = (index, campo, valor) => {
    const nuevosProductos = [...productosVenta];
    nuevosProductos[index][campo] = valor;

    if (campo === 'productoId') {
      const producto = productos.find(p => p._id === valor);
      nuevosProductos[index].precioUnitario = producto ? (producto.precioUnitario || producto.precio || 0) : 0;
    }

    // Asegurar que cantidad sea un número válido
    const cantidad = parseInt(nuevosProductos[index].cantidad) || 0;
    const precioUnitario = parseFloat(nuevosProductos[index].precioUnitario) || 0;
    nuevosProductos[index].subtotal = precioUnitario * cantidad;
    
    setProductosVenta(nuevosProductos);
  };

  const calcularTotal = () => {
    return productosVenta.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clienteId) {
      alert('Selecciona un cliente');
      return;
    }

    if (productosVenta.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    // Validar que todos los productos tengan ID y cantidad válida
    const productosValidos = productosVenta.every(item => 
      item.productoId && item.cantidad > 0
    );

    if (!productosValidos) {
      alert('Todos los productos deben tener un producto seleccionado y cantidad mayor a 0');
      return;
    }

    const ventaData = {
      cliente: formData.clienteId,
      fecha: formData.fecha,
      metodoPago: formData.metodoPago || 'efectivo',
      items: productosVenta.map(item => ({
        producto: item.productoId,
        cantidad: parseInt(item.cantidad) || 1,
        precioUnitario: parseFloat(item.precioUnitario) || 0,
        subtotal: parseFloat(item.subtotal) || 0
      })),
      total: parseFloat(calcularTotal())
    };

    try {
      const url = modalType === 'add' 
        ? `${API_URL}/ventas` 
        : `${API_URL}/ventas/${formData._id}`;
      
      const response = await fetch(url, {
        method: modalType === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData)
      });

      if (response.ok) {
        await cargarDatos();
        setShowModal(false);
        alert(`Venta ${modalType === 'add' ? 'registrada' : 'actualizada'} exitosamente`);
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert(`Error al guardar venta: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error al guardar venta: ${error.message}`);
    }
  };

  const eliminarVenta = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta venta?')) return;
    try {
      const response = await fetch(`${API_URL}/ventas/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await cargarDatos();
        alert('Venta eliminada exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar venta');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <ShoppingCart className="mr-2 sm:mr-3" size={20} />
            <span className="hidden sm:inline">Historial de Ventas</span>
            <span className="sm:hidden">Ventas</span>
          </h3>
          <button
            onClick={() => abrirModal('add')}
            className="bg-white text-orange-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="mr-2" size={18} />
            Nueva Venta
          </button>
        </div>

        {/* Vista de TARJETAS para móvil */}
        <div className="md:hidden">
          {ventas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {ventas.map((venta, index) => (
                <div
                  key={venta._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">
                        Venta #{index + 1}
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${venta.total?.toFixed(2)}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completada
                    </span>
                  </div>

                  {/* Detalles con iconos */}
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span>{new Date(venta.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span>{venta.cliente?.nombre || 'N/A'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <PackageIcon size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="flex-1 text-xs">
                        {venta.items?.map(item => `${item.producto?.nombre} (${item.cantidad})`).join(', ') || 'Sin productos'}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => abrirModal('edit', venta, index)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center font-semibold text-sm"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarVenta(venta._id)}
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Venta</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Productos</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {ventas.map((venta, index) => (
                <tr key={venta._id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Venta #{index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(venta.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {venta.cliente?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {venta.items?.map(item => item.producto?.nombre).join(', ') || 'Sin productos'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600 text-lg">
                    ${venta.total?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completada
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button 
                      onClick={() => abrirModal('edit', venta, index)} 
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => eliminarVenta(venta._id)} 
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

          {ventas.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-base">No hay ventas registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL RESPONSIVE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                {modalType === 'add' 
                  ? 'Nueva Venta' 
                  : `Editar Venta #${(ventaIndex ?? 0) + 1}`
                }
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Campos principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Cliente</label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                    className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente._id} value={cliente._id}>{cliente.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha || ''}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Productos */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">Productos</label>
                  <button
                    type="button"
                    onClick={agregarProductoVenta}
                    className="bg-orange-500 text-white px-3 py-1.5 sm:py-1 rounded-lg text-xs sm:text-sm flex items-center hover:bg-orange-600 w-full sm:w-auto justify-center"
                  >
                    <PlusCircle size={16} className="mr-1" />
                    Agregar Producto
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {productosVenta.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-gray-50 p-3 rounded-lg">
                      <select
                        value={item.productoId}
                        onChange={(e) => actualizarProductoVenta(index, 'productoId', e.target.value)}
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm"
                        required
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map(prod => (
                          <option key={prod._id} value={prod._id}>
                            {prod.nombre} - ${(prod.precioUnitario || prod.precio || 0).toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Cantidad"
                          value={item.cantidad}
                          onChange={(e) => actualizarProductoVenta(index, 'cantidad', parseInt(e.target.value))}
                          className="w-full sm:w-20 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm"
                          required
                        />
                        <span className="flex items-center justify-center w-24 text-xs sm:text-sm font-semibold text-green-600 bg-white border rounded px-2">
                          ${item.subtotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => eliminarProductoVenta(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Minus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg mb-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-gray-700">Total:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">${calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-orange-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-orange-700 flex items-center justify-center font-semibold text-sm sm:text-base"
                >
                  <Save className="mr-2" size={18} />
                  Guardar Venta
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

export default Ventas;