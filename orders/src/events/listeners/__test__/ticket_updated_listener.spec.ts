import { TicketUpdatedListener } from "../ticket_updated_listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedEvent } from "@vpticketing/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  //create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  //create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  //create fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: "new concert",
    version: ticket.version + 1,
    price: 30,
    userId: mongoose.Types.ObjectId().toHexString(),
  };
  //create fake msg obj
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  //return all stuff
  return { msg, data, ticket, listener };
};

it("finds,updates and saves ticket", async () => {
  const { msg, data, ticket, listener } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { msg, data, listener } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if event has skipped version number", async () => {
  const { msg, data, listener } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
