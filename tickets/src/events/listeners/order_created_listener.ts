import { Listener, OrderCreatedEvent, Subjects } from "@vpticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue_group_name";
import { TicketUpdatedPublisher } from "../publishers/ticket_updated_publisher";

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

    //since we are updating the ticket here (no matter about orderId)
    //we must publish event to update ticket in order db as well
    //if we don't then the next update will not be able to update
    //due to version mismatch
    //5. publish an event
    //new TicketUpdatedPublisher(natsWrapper.client); //not a good way since it adds dependency between files
    //our listener already has nats client but it is private
    //hence we will make it protected
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });
    //6. Ack the msg
    msg.ack();
  }
}
