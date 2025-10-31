const Categoria = require('../models/categoria.model');

exports.getAll = async (req, res) => {
  try {
    const { nombre, sort = 'nombre' } = req.query;
    const filter = {};
    
    // Filtro por nombre (búsqueda parcial)
    if (nombre) {
      filter.nombre = { $regex: nombre, $options: 'i' };
    }

    const categorias = await Categoria.find(filter).sort(sort);
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const cat = await Categoria.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const cat = new Categoria(req.body);
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const cat = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
