import { ObjectId } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  return ticket;
};

const buildOrder = async (userCookie: string[], ticketId: ObjectId) => {
  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", userCookie)
    .send({ ticketId: ticketId })
    .expect(201);
  return order;
};

it("fetches orders for a user", async () => {
  //create 3 tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();
  //create 1 order as user #1
  const { body: orderOne } = await buildOrder(userOne, ticketOne.id);

  //create 2 orders as user #2
  const { body: orderTwo } = await buildOrder(userTwo, ticketTwo.id);
  const { body: orderThree } = await buildOrder(userTwo, ticketThree.id);

  //make request to get orders for user #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  //make sure we only got orders for user #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderTwo.id);
  expect(response.body[1].id).toEqual(orderThree.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
