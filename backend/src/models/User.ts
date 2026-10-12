import mongoose, { Schema } from "mongoose";

export interface IUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
