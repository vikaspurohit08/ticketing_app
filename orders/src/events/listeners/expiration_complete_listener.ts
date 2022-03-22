import {
  ExpirationCompletedEvent,
  Listener,
  OrderStatus,
  Subjects,
} from "@vpticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publishers/order_cancelled_publisher";
import { queueGroupName } from "./queue_group_name";

export class ExpirationCompleteListener extends Listener<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ExpirationCompletedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");
    if (!order) {
      throw new Error("Order Not Found");
    }

    order.set({
      status: OrderStatus.Cancelled,
      //ticket:null
      //we can clear the ticket but we in models/ticket.ts we are checking
      // if ticket is reserved by checking the status. Hence we don't need to null the ticket
      // Also by not resetting ticket we can allow user to see which ticket he/she cancelled
    });

    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
