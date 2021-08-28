import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: () => string[];
}
jest.mock("../nats-wrapper");
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdfghh"; //temporary solution
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  //build a JWT payload. {id,email}
  const payload = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  //create jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //build session object {jwt: my_jwt}
  const session = { jwt: token };
  //turn session into json
  const sessionJSON = JSON.stringify(session);
  //take json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  //return a string thats the cookie with encoded data
  return [`express:sess=${base64}`];
};
