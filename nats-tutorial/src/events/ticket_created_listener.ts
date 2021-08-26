import nats from "node-nats-streaming";
import { Listener } from "./base_listener";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket_created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: any, msg: nats.Message): void {
    console.log("Event Data", data);

    msg.ack();
    //let's consider 2 instance of a listener.
    //if for any case our subscription.on has failed(like db not available)
    //then in auto ack mode we will lose the event without proper processing
    //so we can set subscription option .setManualAckMode(true) which will work like
    //we have to manually acknowledge the event in code
    //for eg if 1st instance receives event but fails to process then after few seconds wait
    //it will send event to other instance if that also fails then again to other instance
    //this process wil go on until the event is acknowledged in code with msg.ack()
  }
}
