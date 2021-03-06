import express from "express";
import "express-async-errors"; // used since check app.all method.
//If in an async function we throw the error the request stays until
//the response is received hence this import will solve the problem
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@vpticketing/common";
import { indexOrderRouter } from "./routes";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { deleteOrderRouter } from "./routes/delete";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
