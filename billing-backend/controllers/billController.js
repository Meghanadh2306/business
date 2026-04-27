import Bill from "../models/Bill.js";
import Customer from "../models/Customer.js";

export const createBill = async (req, res) => {
  try {
    // Find the most recent bill with an invoice number
    const lastBill = await Bill.findOne({ invoiceNumber: { $exists: true, $ne: null } }).sort({ _id: -1 });

    let nextNum = 1;
    if (lastBill && lastBill.invoiceNumber) {
      const match = lastBill.invoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      } else {
        const count = await Bill.countDocuments();
        nextNum = count + 1;
      }
    } else {
      const count = await Bill.countDocuments();
      nextNum = count + 1;
    }

    let invoiceNumber;
    let isUnique = false;

    // Loop to ensure uniqueness just in case of a race condition
    while (!isUnique) {
      invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
      const existing = await Bill.findOne({ invoiceNumber });
      if (existing) {
        nextNum++;
      } else {
        isUnique = true;
      }
    }

    const newBillData = { ...req.body, invoiceNumber, generatedBy: req.headers["x-username"] || "omkarsai" };
    const bill = await Bill.create(newBillData);
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBills = async (req, res) => {
  try {
    const username = req.headers["x-username"];
    const query = {};
    if (username === "vijaya") {
      query.generatedBy = "vijaya";
    }

    const bills = await Bill.find(query).populate("customerId");
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBillsByCustomer = async (req, res) => {
  try {
    const username = req.headers["x-username"];
    const currentCustomer = await Customer.findById(req.params.id);
    
    if (!currentCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Match customers with same name, or same phone
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
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (!deletedBill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};