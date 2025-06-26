import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerByEmail,
} from "../controllers/customerController";
const router = express.Router();

router.get("/", getCustomers);
router.get("/email/:email", getCustomerByEmail);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.patch("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
