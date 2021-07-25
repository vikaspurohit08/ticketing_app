import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that will describe properties to create a user
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttrs): UserDocument;
}

// An interface that describes the properties that user Document has
interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String, // type for mongoose and not for ts
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// to specify this and work without error
// hence we need to add interface UserModel
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDocument, UserModel>("User", userSchema);

// new User({
//   email: "abc@gmail.com",
//   pass: 1234,
//   asaw: "awdaw"
// });  ---> it won't give any error
// since typescript doesnt know about this schema
// to solve this we will create interface like here UserAttr
// also add buildUser function which will involve typescript

// const buildUser = (attrs: UserAttrs) => {
//   return new User(attrs);
// };
// this approach works but not feasible since we need to export two things
// from this file i.e. model and buildUser

// const user = User.build({
//   email: "anc",
//   password: "asa",
//   awaw: "adaw",
// });  --> testing build

export { User };
