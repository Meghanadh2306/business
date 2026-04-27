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

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};