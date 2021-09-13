import { OrderCreatedEvent, Publisher, Subjects } from "@vpticketsapp/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
