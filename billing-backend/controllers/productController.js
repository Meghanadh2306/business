import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const data = { ...req.body, generatedBy: req.headers["x-username"] || "omkarsai" };
    const product = await Product.create(data);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const username = req.headers["x-username"] || "omkarsai";
    let query = { generatedBy: username };
    if (username === "omkarsai") {
      query = { $or: [{ generatedBy: "omkarsai" }, { generatedBy: { $exists: false } }, { generatedBy: null }] };
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};