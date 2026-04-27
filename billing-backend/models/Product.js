import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  generatedBy: { type: String, default: "omkarsai" }
});

export default mongoose.model("Product", productSchema);