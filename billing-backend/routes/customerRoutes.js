import express from "express";
import { createCustomer, getCustomers, getCustomerById, deleteCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.delete("/:id", deleteCustomer);

export default router;