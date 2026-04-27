import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
  generatedBy: { type: String, default: "omkarsai" }
});

export default mongoose.model("Customer", customerSchema);