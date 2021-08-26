import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket_created_publisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(stan);
  publisher.publish({
    id: "123",
    title: "concert",
    price: 20,
  });
  // const data = JSON.stringify({
  //   id: "123",
  //   title: "concert",
  //   price: 20,
  // });

  // stan.publish("ticket:created", data, () => {
  //   console.log("Event Published");
  // });
});
//using port-forwarding for test purpose
