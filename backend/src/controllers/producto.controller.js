const Producto = require('../models/producto.model');

// Obtener todos los productos
exports.getAll = async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria');
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un producto por ID
exports.getById = async (req, res) => {
  try {
    const prod = await Producto.findById(req.params.id).populate('categoria');
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo producto
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
    // Rellenar la categoría para que frontend pueda mostrar el nombre
    await producto.populate('categoria');
    res.status(201).json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un producto existente
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

// Eliminar un producto
exports.remove = async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
