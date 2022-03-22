import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@vpticketing/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration_queue";
import { queueGroupName } from "./queue_group_name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("Waiting this ms to process", delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: delay, //delay to expire the order
      }
    );
    msg.ack();
  }
}
