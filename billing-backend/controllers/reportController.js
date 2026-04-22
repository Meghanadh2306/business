import Bill from "../models/Bill.js";

export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const bills = await Bill.find({
      date: { $gte: start, $lt: end }
    });

    const total = bills.reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({ total, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerReport = async (req, res) => {
  try {
    const bills = await Bill.find({ customerId: req.params.id });

    const total = bills.reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({ total, bills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};