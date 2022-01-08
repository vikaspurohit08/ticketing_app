import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order_created_listener";
import { OrderCreatedEvent, OrderStatus } from "@vpticketsapp/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  //create instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  //create and save a ticket
  const ticket = await Ticket.build({
    title: "concert",
    price: 99,
    userId: "asfg",
  });
  await ticket.save();

  //create fake data event
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: "asfg",
    version: 0,
    expiresAt: "fakeDate",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //fake msg obj
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the userId of ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the msg", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
