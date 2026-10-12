import express from "express";
import { createBill, getBills, getBillsByCustomer, getBillById, updateBill, deleteBill } from "../controllers/billController.js";

const router = express.Router();

router.post("/", createBill);
router.get("/", getBills);
router.get("/customer/:id", getBillsByCustomer);
router.get("/:id", getBillById);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

export default router;