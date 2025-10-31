import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Save, X, Minus, PlusCircle, Calendar, User, Package as PackageIcon, DollarSign, Search, SlidersHorizontal, XCircle, Tag } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({});
  const [productosVenta, setProductosVenta] = useState([]);
  const [ventaIndex, setVentaIndex] = useState(null);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    clienteId: '',
    fechaDesde: '',
    fechaHasta: '',
    montoMin: '',
    montoMax: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resVentas, resClientes, resProductos] = await Promise.all([
        fetch(`${API_URL}/ventas`).then(r => r.json()),
        fetch(`${API_URL}/clientes`).then(r => r.json()),
        fetch(`${API_URL}/productos`).then(r => r.json())
      ]);
      
      setVentas(resVentas || []);
      setClientes(resClientes || []);
      setProductos(resProductos || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (tipo, venta = null, index = null) => {
    setModalType(tipo);
    setVentaIndex(index);

    // SIEMPRE usar fecha actual
    const fechaActual = new Date().toISOString().split('T')[0];

    if (venta) {
      setFormData({
        _id: venta._id,
        clienteId: venta.cliente._id,
        fecha: fechaActual, // Fecha actual bloqueada
        metodoPago: venta.metodoPago || 'Efectivo'
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
        fecha: fechaActual, // Fecha actual por defecto
        metodoPago: 'Efectivo'
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

    const productosValidos = productosVenta.every(item => 
      item.productoId && item.cantidad > 0
    );

    if (!productosValidos) {
      alert('Todos los productos deben tener un producto seleccionado y cantidad mayor a 0');
      return;
    }

    const ventaData = {
      cliente: formData.clienteId,
      fecha: formData.fecha, // Fecha actual del sistema
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

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      clienteId: '',
      fechaDesde: '',
      fechaHasta: '',
      montoMin: '',
      montoMax: ''
    });
  };

  const hayFiltrosActivos = Object.values(filtros).some(v => v !== '');

  // Aplicar filtros
  const ventasFiltradas = ventas.filter(venta => {
    const cumpleBusqueda = !filtros.busqueda || 
      venta.cliente?.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      venta.items?.some(item => item.producto?.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()));
    
    const cumpleCliente = !filtros.clienteId || 
      venta.cliente?._id === filtros.clienteId;
    
    const cumpleFechaDesde = !filtros.fechaDesde || 
      new Date(venta.fecha).setHours(0, 0, 0, 0) >= new Date(filtros.fechaDesde).setHours(0, 0, 0, 0);
    
    const cumpleFechaHasta = !filtros.fechaHasta || 
      new Date(venta.fecha).setHours(0, 0, 0, 0) <= new Date(filtros.fechaHasta).setHours(0, 0, 0, 0);
    
    const cumpleMontoMin = !filtros.montoMin || 
      venta.total >= parseFloat(filtros.montoMin);
    
    const cumpleMontoMax = !filtros.montoMax || 
      venta.total <= parseFloat(filtros.montoMax);
    
    return cumpleBusqueda && cumpleCliente && cumpleFechaDesde && 
           cumpleFechaHasta && cumpleMontoMin && cumpleMontoMax;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* BARRA DE FILTROS PROFESIONAL */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-orange-50 to-amber-100 rounded-xl shadow-md border border-orange-200 p-4 sm:p-6">
          {/* Header de filtros */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-lg shadow-lg">
                <SlidersHorizontal className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Filtros Avanzados</h3>
                <p className="text-sm text-gray-600">Filtra por cliente, fecha o monto</p>
              </div>
            </div>
            
            <button
              onClick={() => abrirModal('add')}
              className="w-full lg:w-auto bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2" size={20} />
              Nueva Venta
            </button>
          </div>

          {/* Campos de filtro - Fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="inline mr-1" size={16} />
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cliente o producto..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                {filtros.busqueda && (
                  <button
                    onClick={() => setFiltros({...filtros, busqueda: ''})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline mr-1" size={16} />
                Cliente
              </label>
              <select
                value={filtros.clienteId}
                onChange={(e) => setFiltros({...filtros, clienteId: e.target.value})}
                className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white"
              >
                <option value="">Todos los clientes</option>
                {clientes.map(cli => (
                  <option key={cli._id} value={cli._id}>{cli.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos de filtro - Fila 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline mr-1" size={16} />
                Rango de fechas
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                  className="w-1/2 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                  className="w-1/2 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  placeholder="Hasta"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="inline mr-1" size={16} />
                Rango de monto
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Mínimo"
                    value={filtros.montoMin}
                    onChange={(e) => setFiltros({...filtros, montoMin: e.target.value})}
                    className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Máximo"
                    value={filtros.montoMax}
                    onChange={(e) => setFiltros({...filtros, montoMax: e.target.value})}
                    className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
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
          <div className="mt-4 pt-4 border-t border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Resultados:</span>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {ventasFiltradas.length}
              </span>
              <span className="text-sm text-gray-600">de {ventas.length} ventas</span>
            </div>
            
            {hayFiltrosActivos && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Filtros activos:</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                  {Object.values(filtros).filter(v => v !== '').length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <ShoppingCart className="mr-2 sm:mr-3" size={24} />
            <span>Historial de Ventas</span>
          </h3>
        </div>

        {/* Vista de TARJETAS para móvil */}
        <div className="md:hidden">
          {ventasFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron ventas</h3>
              <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-semibold inline-flex items-center"
                >
                  <XCircle className="mr-2" size={18} />
                  Limpiar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {ventasFiltradas.map((venta, index) => (
                <div
                  key={venta._id}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base mb-1">
                        Venta #{ventas.indexOf(venta) + 1}
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
                  <div className="grid grid-cols-1 gap-2 mb-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded-lg flex items-center">
                      <Calendar size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-600">{new Date(venta.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg flex items-center">
                      <User size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-600">{venta.cliente?.nombre || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg flex items-start">
                      <PackageIcon size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="flex-1 text-xs text-gray-600">
                        {venta.items?.map(item => `${item.producto?.nombre} (${item.cantidad})`).join(', ') || 'Sin productos'}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => abrirModal('edit', venta, ventas.indexOf(venta))}
                      className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-lg hover:bg-blue-100 flex items-center justify-center font-semibold text-sm transition-all"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarVenta(venta._id)}
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Venta</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {ventasFiltradas.map((venta, index) => (
                <tr key={venta._id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Venta #{ventas.indexOf(venta) + 1}
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
                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    ${venta.total?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completada
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => abrirModal('edit', venta, ventas.indexOf(venta))}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => eliminarVenta(venta._id)}
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

          {ventasFiltradas.length === 0 && (
            <div className="text-center py-16 bg-gray-50">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron ventas</h3>
              <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-semibold inline-flex items-center"
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
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                <ShoppingCart size={28} />
                {modalType === 'add' ? 'Nueva' : 'Editar'} Venta
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Campos principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <User className="inline mr-2" size={16} />
                    Cliente *
                  </label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente._id} value={cliente._id}>{cliente.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Fecha (Automática)
                  </label>
                  <input
                    type="date"
                    value={formData.fecha || ''}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    disabled
                    title="La fecha se establece automáticamente al día actual"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    📅 {new Date(formData.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                  <label className="block text-sm font-bold text-gray-700">
                    <PackageIcon className="inline mr-2" size={16} />
                    Productos
                  </label>
                  <button
                    type="button"
                    onClick={agregarProductoVenta}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-orange-600 w-full sm:w-auto justify-center shadow-md transition-all"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Agregar Producto
                  </button>
                </div>

                <div className="space-y-3">
                  {productosVenta.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border-2 border-gray-200">
                      <select
                        value={item.productoId}
                        onChange={(e) => actualizarProductoVenta(index, 'productoId', e.target.value)}
                        className="flex-1 p-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm transition-all bg-white"
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
                          className="w-full sm:w-24 p-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm transition-all"
                          required
                        />
                        <div className="flex items-center justify-center min-w-[100px] text-sm font-bold text-green-600 bg-white border-2 border-green-200 rounded-lg px-3">
                          ${item.subtotal.toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarProductoVenta(index)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all border-2 border-transparent hover:border-red-200"
                        >
                          <Minus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-5 rounded-xl mb-5 border-2 border-green-200 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Total:
                  </span>
                  <span className="text-3xl font-bold text-green-600">${calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="mr-2" size={18} />
                  Guardar Venta
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
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