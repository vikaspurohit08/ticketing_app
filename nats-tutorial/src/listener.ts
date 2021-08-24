import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();
//if we want to create multiple instance of listener
//we need to have different clientId for each of them
//we will generate random clientId here. Although in k8s world we will use other way
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    //when the client is closed
    console.log("NATS connection closed");
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

//for some reason if a listener is dead. Then the event should not get published to the listener
//for prohibiting this we use heartbeat system but until heartbeat interval arrivals and all retries are done
//the system behaves as if the old listener is still there. (For restart it will give two different listener of same)
//Hence to overcome that we are making sure that on restart and terminate the listener should get dead
process.on("SIGINT", () => stan.close()); //at restart
process.on("SIGTERM", () => stan.close()); //at termination

abstract class Listener {
  abstract subject: string;
  abstract queueGroupName: string;
  abstract onMessage(data: any, msg: Message): void;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return (
      this.client
        .subscriptionOptions()
        .setDeliverAllAvailable() //deliver all events delievered in past when listener starts
        //but in this way we are giving all past event
        //to solve it we can setDurableName which will
        //only those events which service missed last time
        .setManualAckMode(true)
        .setAckWait(this.ackWait)
        .setDurableName(this.queueGroupName)
      //we can chain all options we want
    );
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    //let's consider 2 instance of a listener. If an event is published we don't want
    //both the same service listener to listen it(for eg. order-service).
    //hence we provide a queue group
    //which will give events to any one instance per service randomly

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}

class TicketCreatedListener extends Listener {
  subject = "ticket:created";
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
