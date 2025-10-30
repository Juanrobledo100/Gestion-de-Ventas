import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

const Dashboard = ({ clientes, productos, ventas, categorias }) => {
  const totalVentas = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const ventasHoy = ventas.filter(v => {
    const fecha = new Date(v.fecha);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }).length;

  // Inicializar todos los meses del año
  const mesesDelAno = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const ventasPorMes = ventas.reduce((acc, venta) => {
    const fecha = new Date(venta.fecha);
    const mesIndex = fecha.getMonth(); // 0-11
    acc[mesIndex] = (acc[mesIndex] || 0) + (venta.total || 0);
    return acc;
  }, {});

  const datosVentasMensuales = mesesDelAno.map((mes, index) => ({
    mes,
    total: Math.round(ventasPorMes[index] || 0)
  }));

  const productosMasVendidos = productos.slice(0, 5).map(p => ({
    nombre: p.nombre,
    stock: p.stock || 0
  }));

  const ventasPorCategoria = categorias.map(cat => {
    const productosCategoria = productos.filter(p => p.categoria?._id === cat._id || p.categoriaId === cat._id);
    return {
      nombre: cat.nombre,
      cantidad: productosCategoria.length
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Componente personalizado para el Tooltip del PieChart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Productos: <span className="font-bold text-blue-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Etiquetas personalizadas para el PieChart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // No mostrar etiquetas muy pequeñas

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      {/* Tarjetas de estadísticas - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Clientes</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{clientes.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2 sm:p-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Productos</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{productos.length}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2 sm:p-3">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Ventas Hoy</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{ventasHoy}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-2 sm:p-3">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Ingresos Totales</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">${totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-2 sm:p-3">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas de barras y líneas - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={datosVentasMensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Stock de Productos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={productosMasVendidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line type="monotone" dataKey="stock" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica de pastel y últimas ventas - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Productos por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ventasPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={window.innerWidth < 640 ? 70 : 90}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {ventasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value, entry) => `${entry.payload.nombre} (${entry.payload.cantidad})`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Últimas Ventas</h3>
          <div className="space-y-3">
            {ventas.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay ventas registradas</p>
            ) : (
              ventas.slice(0, 5).map((venta, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 p-2 rounded transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      Venta #{venta._id?.slice(-6)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(venta.fecha).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-green-600 text-base sm:text-lg">${venta.total?.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;