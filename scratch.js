import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://bulasarameghanadh_db_user:TReIYTxSqxCqrRWt@cluster0.zicicla.mongodb.net/billingDB?retryWrites=true&w=majority&appName=Cluster0";

const checkDB = async () => {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const customers = await db.collection("customers").find().sort({_id: -1}).limit(5).toArray();
  console.log("Latest customers:", customers);
  const products = await db.collection("products").find().sort({_id: -1}).limit(5).toArray();
  console.log("Latest products:", products);
  process.exit(0);
};

checkDB();
