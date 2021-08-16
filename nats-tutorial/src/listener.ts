import nats, { Message } from "node-nats-streaming";
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

  const options = stan.subscriptionOptions().setManualAckMode(true);
  //.setDeliverAllAvailable();
  //we can chain all options we want

  const subscription = stan.subscribe(
    "ticket:created",
    "listenerQueueGroup",
    options
  );
  //let's consider 2 instance of a listener. If an event is published we don't want
  //both the same service listener to listen it(for eg. order-service).
  //hence we provide a queue group
  //which will give events to any one instance per service randomly

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event ${msg.getSequence()}, with data: ${data}`);
    }

    msg.ack();
    //let's consider 2 instance of a listener.
    //if for any case our subscription.on has failed(like db not available)
    //then in auto ack mode we will lose the event without proper processing
    //so we can set subscription option .setManualAckMode(true) which will work like
    //we have to manually acknowledge the event in code
    //for eg if 1st instance receives event but fails to process then after few seconds wait
    //it will send event to other instance if that also fails then again to other instance
    //this process wil go on until the event is acknowledged in code with msg.ack()
  });
});
