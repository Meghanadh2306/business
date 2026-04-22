import express from "express";
import { getMonthlyReport, getCustomerReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/monthly", getMonthlyReport);
router.get("/customer/:id", getCustomerReport);

export default router;