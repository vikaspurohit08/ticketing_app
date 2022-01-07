import { Listener, OrderCreatedEvent, Subjects } from "@vpticketsapp/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue_group_name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    //we need to lock down the ticket here
    //1. Find ticket the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    //2. If no ticket, throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    //3. Mark ticket as being reserved by setting its orderId
    ticket.set({ orderId: data.id });
    //4. Save the ticket
    await ticket.save();
    //5. Ack the msg
    msg.ack();
  }
}
