import { User } from "../models/User";

export const userRepository = {
  findById: (id: string) => User.findById(id).select("-__v"),

  getBookmarkedProjectSlugs: async (id: string) => {
    const user = await User.findById(id).select("bookmarkedProjectSlugs").lean();
    return user?.bookmarkedProjectSlugs ?? [];
  },

  addBookmarkedProject: (id: string, slug: string) =>
    User.findByIdAndUpdate(id, { $addToSet: { bookmarkedProjectSlugs: slug } }, { new: true }).select("_id"),

  removeBookmarkedProject: (id: string, slug: string) =>
    User.findByIdAndUpdate(id, { $pull: { bookmarkedProjectSlugs: slug } }, { new: true }).select("_id"),

  upsertGoogleUser: (values: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) => User.findOneAndUpdate(
    { googleId: values.googleId },
    { $set: { ...values, email: values.email.toLowerCase() } },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
  ),
};
