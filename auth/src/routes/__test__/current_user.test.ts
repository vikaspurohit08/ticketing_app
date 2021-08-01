import request from "supertest";
import { app } from "../../app";

it("responds with details about current user", async () => {
  const data = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const cookie = data.get("Set-Cookie");
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(response.body.currentUser.email).toEqual("test@test.com");
  //supertest doesn't handle the cookie created after signup and pass it while currentuser
  // so we manually capture the cookie and send to second request
});
