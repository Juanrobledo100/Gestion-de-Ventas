const mongoose = require('mongoose');

const VentaItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const VentaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  items: [VentaItemSchema],
  fecha: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  metodoPago: { type: String }
});

module.exports = mongoose.model('Venta', VentaSchema);
