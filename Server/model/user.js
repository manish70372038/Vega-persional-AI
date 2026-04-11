import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    history: {
      type: String,
    },
    ImageData: {
      type: String,
    },
    assistantName: {
      type: String,
    },
  },
  { timestamps: true } 
);

const User = mongoose.model("User", UserSchema);

export default User;