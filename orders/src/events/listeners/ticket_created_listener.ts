import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@vpticketing/common";
import { queueGroupName } from "./queue_group_name";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    msg.ack();
  }
}
