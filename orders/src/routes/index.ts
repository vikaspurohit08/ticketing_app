import express, { Request, Response } from "express";
import { requireAuth } from "@vpticketing/common";
import { Order } from "../models/order";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate("ticket"); //to get ticket associated with order

  res.send(orders);
});

export { router as indexOrderRouter };
