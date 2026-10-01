import { User } from "../models/User";

// User persistence operations.
export const userRepository = {
  findById: (id: string) => User.findById(id).select("-__v"),
  upsertGoogleUser: (values: { googleId: string; email: string; name: string; avatar?: string }) =>
    User.findOneAndUpdate({ googleId: values.googleId }, values, { upsert: true, new: true }),
};
