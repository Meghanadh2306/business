import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, sparse: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  subtotal: Number,
  tax: Number,
  discount: Number,
  totalAmount: Number,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Bill", billSchema);