import { Listener, Subjects, TicketUpdatedEvent } from "@vpticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue_group_name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const { title, price } = data; //If we don't want to couple the versioning with `mongoose-update-if-current` module
    //then we can extract version from here and set it directly. Bcz we cannot be sure if upcoming version is in number format or time format or etc.
    //but for that we need to add multiple criterias to find the ticket refer ticket.ts change
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
