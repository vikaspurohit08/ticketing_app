import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@vpticketsapp/common";
import { TicketCreatedListener } from "../ticket_created_listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //create listener instance
  const listener = new TicketCreatedListener(natsWrapper.client);
  //create fake data event
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "test",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };

  //create fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();
  //call onMessage fn with data and msg obj
  await listener.onMessage(data, msg);
  //write assertions to make sure ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  //call onMessage fn with data and msg obj
  await listener.onMessage(data, msg);
  //writer assertions to make sure ack fn is called
  expect(msg.ack).toHaveBeenCalled();
});
