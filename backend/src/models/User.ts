import mongoose, { Schema } from "mongoose";

export interface IUser {
  googleId: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  githubUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
  role: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    avatar: { type: String },
    bio: { type: String, default: "", maxlength: 300 },
    location: { type: String, default: "", maxlength: 100 },
    githubUrl: { type: String, default: "" },
    twitterUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    skills: { type: [String], default: [] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
