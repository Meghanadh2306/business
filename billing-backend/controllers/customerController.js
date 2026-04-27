import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
  try {
    const data = { ...req.body, generatedBy: req.headers["x-username"] || "omkarsai" };
    const customer = await Customer.create(data);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const username = req.headers["x-username"] || "omkarsai";
    let query = { generatedBy: username };
    if (username === "omkarsai") {
      query = { $or: [{ generatedBy: "omkarsai" }, { generatedBy: { $exists: false } }, { generatedBy: null }] };
    }
    const customers = await Customer.find(query);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};