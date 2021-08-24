import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket_created_listener";

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
