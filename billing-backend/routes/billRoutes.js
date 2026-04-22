import express from "express";
import { createBill, getBills, getBillsByCustomer, deleteBill } from "../controllers/billController.js";

const router = express.Router();

router.post("/", createBill);
router.get("/", getBills);
router.get("/customer/:id", getBillsByCustomer);
router.delete("/:id", deleteBill);

export default router;