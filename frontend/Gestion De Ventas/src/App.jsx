import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Package, ShoppingCart, DollarSign, Tag, LayoutDashboard, Menu, X } from 'lucide-react';
import './index.css';
import '../src/App.css';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resClientes, resProductos, resVentas, resCategorias] = await Promise.all([
        fetch(`${API_URL}/clientes`).then(r => r.json()),
        fetch(`${API_URL}/productos`).then(r => r.json()),
        fetch(`${API_URL}/ventas`).then(r => r.json()),
        fetch(`${API_URL}/categorias`).then(r => r.json())
      ]);
      
      setClientes(resClientes);
      setProductos(resProductos);
      setVentas(resVentas);
      setCategorias(resCategorias);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVentas = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const ventasHoy = ventas.filter(v => {
    const fecha = new Date(v.fecha);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }).length;

  const ventasPorMes = ventas.reduce((acc, venta) => {
    const mes = new Date(venta.fecha).toLocaleString('es', { month: 'short' });
    acc[mes] = (acc[mes] || 0) + (venta.total || 0);
    return acc;
  }, {});

  const datosVentasMensuales = Object.entries(ventasPorMes).map(([mes, total]) => ({
    mes,
    total: Math.round(total)
  }));

  const productosMasVendidos = productos.slice(0, 5).map(p => ({
    nombre: p.nombre,
    stock: p.stock || 0
  }));

  const ventasPorCategoria = categorias.map(cat => {
    const productosCategoria = productos.filter(p => p.categoriaId === cat._id);
    return {
      nombre: cat.nombre,
      cantidad: productosCategoria.length
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'categorias', label: 'Categorías', icon: Tag }
  ];

  const renderDashboardView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Clientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{clientes.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Productos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{productos.length}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ventas Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{ventasHoy}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <ShoppingCart className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ingresos Totales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosVentasMensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Stock de Productos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productosMasVendidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="stock" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Productos por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ventasPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => entry.nombre}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {ventasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Últimas Ventas</h3>
          <div className="space-y-3">
            {ventas.slice(0, 5).map((venta, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-semibold text-gray-900">Venta #{venta._id?.slice(-6)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(venta.fecha).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-green-600 text-lg">${venta.total?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderClientesView = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <Users className="mr-3" />
          Listado de Clientes
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Dirección</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((cliente, idx) => (
              <tr key={idx} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {cliente.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {cliente.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {cliente.telefono}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {cliente.direccion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProductosView = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <Package className="mr-3" />
          Inventario de Productos
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto, idx) => (
              <tr key={idx} className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {producto.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  ${producto.precio?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {producto.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {producto.categoria || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    producto.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.stock > 10 ? 'En Stock' : 'Bajo Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVentasView = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <ShoppingCart className="mr-3" />
          Historial de Ventas
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ventas.map((venta, idx) => (
              <tr key={idx} className="hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-900">
                  #{venta._id?.slice(-6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(venta.fecha).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {venta.clienteId || 'Cliente N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-lg">
                  ${venta.total?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completada
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategoriasView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categorias.map((categoria, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-full p-4">
              <Tag className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-4xl font-bold text-purple-600">
              {productos.filter(p => p.categoriaId === categoria._id).length}
            </span>
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">{categoria.nombre}</h4>
          <p className="text-sm text-gray-600">{categoria.descripcion || 'Sin descripción'}</p>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-semibold">Cargando datos...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard': return renderDashboardView();
      case 'clientes': return renderClientesView();
      case 'productos': return renderProductosView();
      case 'ventas': return renderVentasView();
      case 'categorias': return renderCategoriasView();
      default: return renderDashboardView();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h2 className="text-xl font-bold">Mi Dashboard</h2>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center px-6 py-4 transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-blue-600 border-l-4 border-blue-400'
                    : 'hover:bg-gray-700 border-l-4 border-transparent'
                }`}
              >
                <Icon size={24} />
                {sidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
            <button 
              onClick={cargarDatos}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Actualizar Datos
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-md">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeView)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>
        
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;