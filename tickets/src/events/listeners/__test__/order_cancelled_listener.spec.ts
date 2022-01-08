import mongoose from "mongoose";
import { OrderCancelledEvent } from "@vpticketsapp/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCanncelledListener } from "../order_cancelled_listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCanncelledListener(natsWrapper.client);
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "asdf",
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

it("updates the ticket, publishes event and acks the msg", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
