// App.jsx - CÓDIGO ACTUALIZADO CON RESPONSIVE
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Package, ShoppingCart, Tag, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Categorias from './pages/Categorias';
import './index.css';
import './App.css';

const API_URL = 'http://localhost:5000/api';

const App = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'categorias', label: 'Categorías', icon: Tag }
  ];

  const handleMenuClick = (viewId) => {
    setActiveView(viewId);
    // Cerrar sidebar en móvil después de seleccionar
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

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
      case 'dashboard':
        return <Dashboard clientes={clientes} productos={productos} ventas={ventas} categorias={categorias} />;
      case 'clientes':
        return <Clientes clientes={clientes} cargarDatos={cargarDatos} />;
      case 'productos':
        return <Productos productos={productos} categorias={categorias} cargarDatos={cargarDatos} />;
      case 'ventas':
        return <Ventas ventas={ventas} clientes={clientes} productos={productos} cargarDatos={cargarDatos} />;
      case 'categorias':
        return <Categorias categorias={categorias} productos={productos} cargarDatos={cargarDatos} />;
      default:
        return <Dashboard clientes={clientes} productos={productos} ventas={ventas} categorias={categorias} />;
    }
  };

  return (
    <div className=" flex h-screen bg-gray-100 overflow-hidden">
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300 z-30
        ${isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'relative'}
        ${sidebarOpen ? 'w-64' : isMobile ? '-translate-x-full w-64' : 'w-20'}
        ${isMobile && sidebarOpen ? 'translate-x-0' : ''}
      `}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h2 className="text-lg sm:text-xl font-bold">Gestion De Ventas</h2>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        <nav className="mt-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-6 py-4 transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-blue-600 border-l-4 border-blue-400'
                    : 'hover:bg-gray-700 border-l-4 border-transparent'
                }`}
              >
                <Icon size={24} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700 bg-gray-900">
            <button 
              onClick={cargarDatos}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Actualizar Datos
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-md">
          <div className="px-4 sm:px-8 py-4 sm:py-6 flex items-center">
            {/* Botón hamburguesa solo visible en móvil cuando sidebar está cerrado */}
            {isMobile && !sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-3 sm:mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeView)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>
        
        <div className="p-4 sm:p-6 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;