const Producto = require('../models/producto.model');

exports.getAll = async (req, res) => {
  try {
    const { 
      nombre, 
      categoriaId, 
      precioMin, 
      precioMax, 
      stockMin, 
      stockMax,
      sort = 'nombre' 
    } = req.query;
    
    const filter = {};
    
    // Filtro por nombre (búsqueda parcial)
    if (nombre) {
      filter.nombre = { $regex: nombre, $options: 'i' };
    }
    
    // Filtro por categoría
    if (categoriaId) {
      filter.categoria = categoriaId;
    }
    
    // Filtros por rango de precio
    if (precioMin || precioMax) {
      filter.precioUnitario = {};
      if (precioMin) filter.precioUnitario.$gte = parseFloat(precioMin);
      if (precioMax) filter.precioUnitario.$lte = parseFloat(precioMax);
    }
    
    // Filtros por rango de stock
    if (stockMin || stockMax) {
      filter.stock = {};
      if (stockMin) filter.stock.$gte = parseInt(stockMin);
      if (stockMax) filter.stock.$lte = parseInt(stockMax);
    }

    const productos = await Producto.find(filter).populate('categoria').sort(sort);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const prod = await Producto.findById(req.params.id).populate('categoria');
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, precio, stock, categoriaId, descripcion } = req.body;

    const producto = new Producto({
      nombre,
      precioUnitario: parseFloat(precio),
      stock: parseInt(stock),
      categoria: categoriaId,
      descripcion: descripcion || ''
    });

    await producto.save();
    await producto.populate('categoria');
    res.status(201).json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, precio, stock, categoriaId, descripcion } = req.body;

    const prod = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        precioUnitario: parseFloat(precio),
        stock: parseInt(stock),
        categoria: categoriaId,
        descripcion: descripcion || ''
      },
      { new: true }
    ).populate('categoria');

    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(prod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};