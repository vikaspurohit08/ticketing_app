import { OrderCancelledEvent, Publisher, Subjects } from "@vpticketsapp/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
