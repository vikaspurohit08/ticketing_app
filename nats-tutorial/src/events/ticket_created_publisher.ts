import { Publisher } from "./base_publisher";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket_created-event";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
