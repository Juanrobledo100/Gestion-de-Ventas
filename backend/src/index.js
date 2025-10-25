const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connect } = require('./config/db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// importacion de rutas 
const rutasClientes = require('./routes/clientes.routes');
const rutasProductos = require('./routes/productos.routes');
const rutasVentas = require('./routes/ventas.routes');
const rutasCategorias = require('./routes/categorias.routes');

// registrar rutas
app.use('/api/clientes', rutasClientes);
app.use('/api/productos', rutasProductos);
app.use('/api/ventas', rutasVentas);
app.use('/api/categorias', rutasCategorias);

const PORT = process.env.PORT || 5000;

connect().then(() => {
  app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));
});
