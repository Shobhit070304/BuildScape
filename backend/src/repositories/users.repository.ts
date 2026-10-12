import { User } from "../models/User";

// User persistence operations.
export const userRepository = {
  findById: (id: string) => User.findById(id).select("-__v"),
  upsertGoogleUser: (values: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    role?: "user" | "admin";
  }) =>
    User.findOneAndUpdate(
      { googleId: values.googleId },
      { $set: values },
      { upsert: true, returnDocument: "after" }
    ),
};
