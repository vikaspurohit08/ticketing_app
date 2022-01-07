import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 when provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "test",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 when user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "test",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 when user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin()) //with new different cookie
    .send({ title: "faultyTest", price: 1000 })
    .expect(401);
});

it("returns a 400 when user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie) //with same cookie
    .send({ title: "", price: 1000 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie) //with same cookie
    .send({ title: "test", price: -10 })
    .expect(400);
});

it("updates ticket when provided valid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie) //with same cookie
    .send({ title: "new title", price: 100 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual("new title");
  expect(ticketResponse.body.price).toEqual(100);
});

it("publishes an event", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie) //with same cookie
    .send({ title: "new title", price: 100 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual("new title");
  expect(ticketResponse.body.price).toEqual(100);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
