import mongoose, { Schema } from "mongoose";

export interface IUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
