/* Script de seed para generar datos iniciales: clientes, categorias, productos y ventas (>=50)
   Uso: node src/seed/seed.js
*/
const mongoose = require('mongoose');
const faker = require('faker');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_ventas';

const Cliente = require('../models/cliente.model');
const Producto = require('../models/producto.model');
const Categoria = require('../models/categoria.model');
const Venta = require('../models/venta.model');

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Conectado para seed');

  // limpiar
  await Cliente.deleteMany({});
  await Categoria.deleteMany({});
  await Producto.deleteMany({});
  await Venta.deleteMany({});

  // categorias
  const nombresCat = ['Bebidas', 'Alimentos', 'Higiene', 'Electronica', 'Ropa'];
  const categorias = await Categoria.insertMany(nombresCat.map(n => ({ nombre: n, descripcion: n + ' varios' })));

  // productos
  const productos = [];
  for (let i = 0; i < 15; i++) {
    productos.push({
      nombre: faker.commerce.productName(),
      descripcion: faker.commerce.productDescription(),
      precioUnitario: parseFloat(faker.commerce.price(10, 200, 2)),
      stock: faker.datatype.number({ min: 10, max: 200 }),
      categoria: categorias[faker.datatype.number({ min: 0, max: categorias.length - 1 })]._id
    });
  }
  const productosDocs = await Producto.insertMany(productos);

  // clientes
  const clientes = [];
  for (let i = 0; i < 20; i++) {
    clientes.push({
      nombre: faker.name.findName(),
      email: faker.internet.email(),
      telefono: faker.phone.phoneNumber(),
      direccion: faker.address.streetAddress()
    });
  }
  const clientesDocs = await Cliente.insertMany(clientes);

  // ventas >=50
  const ventas = [];
  for (let i = 0; i < 60; i++) {
    const cantItems = faker.datatype.number({ min: 1, max: 4 });
    const items = [];
    let total = 0;
    for (let j = 0; j < cantItems; j++) {
      const prod = productosDocs[faker.datatype.number({ min: 0, max: productosDocs.length - 1 })];
      const cantidad = faker.datatype.number({ min: 1, max: 5 });
      const precio = prod.precioUnitario;
      const subtotal = precio * cantidad;
      items.push({ producto: prod._id, cantidad, precioUnitario: precio, subtotal });
      total += subtotal;
      // descontar stock
      prod.stock = Math.max(0, prod.stock - cantidad);
      await prod.save();
    }

    ventas.push({
      cliente: clientesDocs[faker.datatype.number({ min: 0, max: clientesDocs.length - 1 })]._id,
      items,
      fecha: faker.date.between('2024-01-01', '2025-10-20'),
      total,
      metodoPago: faker.helpers.randomize(['Efectivo', 'Tarjeta', 'Transferencia'])
    });
  }

  await Venta.insertMany(ventas);
  console.log('Seed completado');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
