import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@vpticketsapp/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmail()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("Ticket Id must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    //find the ticket from db the user is trying to order
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    //make sure ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    //Calculate an expiration date for order
    //for now keeping it as 15 seconds
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    //Build the order and save it to db
    const order = Order.build({
      userId: req.currentUser!.id!,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    //Publish event saying that order was created
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
