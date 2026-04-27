import Bill from "../models/Bill.js";
import Customer from "../models/Customer.js";

export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const username = req.headers["x-username"];
    const query = {
      date: { $gte: start, $lt: end }
    };
    if (username === "vijaya") {
      query.generatedBy = "vijaya";
    }

    const bills = await Bill.find(query);

    const total = bills.reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({ total, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerReport = async (req, res) => {
  try {
    const username = req.headers["x-username"];
    const currentCustomer = await Customer.findById(req.params.id);
    
    if (!currentCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    let matchConditions = [{ name: currentCustomer.name }];
    if (currentCustomer.phone && currentCustomer.phone.trim() !== '') {
      matchConditions.push({ phone: currentCustomer.phone });
    }
    
    const similarCustomers = await Customer.find({ $or: matchConditions });
    const customerIds = similarCustomers.map(c => c._id);

    const query = { customerId: { $in: customerIds } };
    if (username === "vijaya") {
      query.generatedBy = "vijaya";
    }

    const bills = await Bill.find(query);

    const total = bills.reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({ total, bills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};