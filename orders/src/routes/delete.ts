import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from "@vpticketsapp/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";

const router = express.Router();

router.delete("/api/orders/:orderId", async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate("ticket");
  if (!order) {
    throw new NotFoundError();
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }
  order.status = OrderStatus.Cancelled;
  await order.save();

  //publish event that order was cancelled

  res.status(204).send(order);
});

export { router as deleteOrderRouter };
