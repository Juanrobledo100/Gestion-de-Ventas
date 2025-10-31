const Venta = require('../models/venta.model');
const Producto = require('../models/producto.model');

exports.getAll = async (req, res) => {
  try {
    const { 
      start, 
      end, 
      clienteId, 
      metodoPago, 
      montoMin, 
      montoMax,
      sort = '-fecha' 
    } = req.query;
    
    const filter = {};
    
    // Filtro por cliente
    if (clienteId) {
      filter.cliente = clienteId;
    }
    
    // Filtro por rango de fechas
    if (start || end) {
      filter.fecha = {};
      if (start) filter.fecha.$gte = new Date(start);
      if (end) filter.fecha.$lte = new Date(end);
    }
    
    // Filtro por método de pago
    if (metodoPago) {
      filter.metodoPago = metodoPago;
    }
    
    // Filtro por rango de monto total
    if (montoMin || montoMax) {
      filter.total = {};
      if (montoMin) filter.total.$gte = parseFloat(montoMin);
      if (montoMax) filter.total.$lte = parseFloat(montoMax);
    }

    const ventas = await Venta.find(filter)
      .populate('cliente')
      .populate('items.producto')
      .sort(sort);
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente')
      .populate('items.producto');
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { cliente, items, metodoPago } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener items' });
    }

    let total = 0;
    const itemsProcesados = await Promise.all(items.map(async it => {
      const prod = await Producto.findById(it.producto);
      if (!prod) throw new Error('Producto no encontrado: ' + it.producto);
      const precio = prod.precioUnitario || it.precioUnitario || 0;
      const subtotal = precio * it.cantidad;
      total += subtotal;
      prod.stock = Math.max(0, prod.stock - it.cantidad);
      await prod.save();
      return {
        producto: prod._id,
        cantidad: it.cantidad,
        precioUnitario: precio,
        subtotal
      };
    }));

    const venta = new Venta({ cliente, items: itemsProcesados, total, metodoPago });
    await venta.save();
    res.status(201).json(venta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    // Restaurar stock de la venta anterior
    for (const it of venta.items) {
      const prod = await Producto.findById(it.producto);
      if (prod) {
        prod.stock = (prod.stock || 0) + it.cantidad;
        await prod.save();
      }
    }

    // Procesar nuevos items
    const { cliente, items, metodoPago, fecha } = req.body;
    let total = 0;
    const itemsProcesados = await Promise.all(items.map(async it => {
      const prod = await Producto.findById(it.producto);
      if (!prod) throw new Error('Producto no encontrado: ' + it.producto);
      const precio = prod.precioUnitario || it.precioUnitario || 0;
      const subtotal = precio * it.cantidad;
      total += subtotal;
      prod.stock = Math.max(0, prod.stock - it.cantidad);
      await prod.save();
      return { producto: prod._id, cantidad: it.cantidad, precioUnitario: precio, subtotal };
    }));

    venta.cliente = cliente;
    venta.items = itemsProcesados;
    venta.metodoPago = metodoPago;
    venta.total = total;
    if (fecha) venta.fecha = fecha;

    await venta.save();
    res.json(venta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    
    // Restaurar stock
    for (const it of venta.items) {
      const prod = await Producto.findById(it.producto);
      if (prod) {
        prod.stock = (prod.stock || 0) + it.cantidad;
        await prod.save();
      }
    }

    await Venta.findByIdAndDelete(req.params.id);
    res.json({ message: 'Venta eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoints de agregación para gráficos
exports.ventasPorMes = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const inicio = new Date(year, 0, 1);
    const fin = new Date(year + 1, 0, 1);

    const agg = await Venta.aggregate([
      { $match: { fecha: { $gte: inicio, $lt: fin } } },
      { $project: { mes: { $month: '$fecha' }, total: 1 } },
      { $group: { _id: '$mes', suma: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]);

    const meses = Array.from({ length: 12 }, (_, i) => i + 1);
    const totalesPorMes = meses.map(m => {
      const found = agg.find(a => a._id === m);
      return found ? found.suma : 0;
    });

    res.json({ year, meses, totales: totalesPorMes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ventasPorCategoria = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start || end) match.fecha = {};
    if (start) match.fecha.$gte = new Date(start);
    if (end) match.fecha.$lte = new Date(end);

    const agg = await Venta.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $lookup: {
        from: 'productos',
        localField: 'items.producto',
        foreignField: '_id',
        as: 'producto'
      }},
      { $unwind: '$producto' },
      { $lookup: {
        from: 'categorias',
        localField: 'producto.categoria',
        foreignField: '_id',
        as: 'categoria'
      }},
      { $unwind: { path: '$categoria', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$categoria.nombre', suma: { $sum: '$items.subtotal' } } },
      { $sort: { suma: -1 } }
    ]);

    const categorias = agg.map(a => a._id || 'Sin categoría');
    const totales = agg.map(a => a.suma);
    res.json({ categorias, totales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.topProductos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const agg = await Venta.aggregate([
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.producto', 
        cantidad: { $sum: '$items.cantidad' }, 
        ventas: { $sum: '$items.subtotal' } 
      }},
      { $sort: { cantidad: -1 } },
      { $limit: limit },
      { $lookup: { 
        from: 'productos', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'producto' 
      }},
      { $unwind: '$producto' },
      { $project: { 
        _id: 0, 
        productoId: '$_id', 
        nombre: '$producto.nombre', 
        cantidad: 1, 
        ventas: 1 
      }}
    ]);

    res.json(agg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};