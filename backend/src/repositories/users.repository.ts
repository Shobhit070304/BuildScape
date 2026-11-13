import { User } from "../models/User";

// User persistence operations.
export const userRepository = {
  findById: (id: string) => User.findById(id).select("-__v"),
  findByUsername: (username: string) =>
    User.findOne({ username: username.toLowerCase().trim() }).select("-__v"),

  updateUsername: (userId: string, username: string) =>
    User.findByIdAndUpdate(userId, { $set: { username } }, { returnDocument: "after", runValidators: true }).select("-__v"),

  updateProfile: (
    userId: string,
    profile: {
      name?: string;
      bio?: string;
      location?: string;
      githubUrl?: string;
      twitterUrl?: string;
      portfolioUrl?: string;
      linkedinUrl?: string;
      skills?: string[];
    }
  ) =>
    User.findByIdAndUpdate(
      userId,
      { $set: profile },
      { returnDocument: "after", runValidators: true }
    ).select("-__v -googleId -email"),

  upsertGoogleUser: async (values: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    role?: "user" | "admin";
  }) => {
    const existing = await User.findOne({ googleId: values.googleId });
    let username = existing?.username;

    if (!username) {
      // Derive a clean handle: e.g. "alex-rivera" or email prefix
      const slug = (values.name || values.email.split("@")[0] || "builder")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20);

      // Verify uniqueness
      const baseHandle = slug || "builder";
      let candidate = baseHandle;
      let taken = await User.findOne({ username: candidate });
      while (taken && taken.googleId !== values.googleId) {
        candidate = `${baseHandle}-${Math.floor(1000 + Math.random() * 9000)}`;
        taken = await User.findOne({ username: candidate });
      }
      username = candidate;
    }

    return User.findOneAndUpdate(
      { googleId: values.googleId },
      { $set: { ...values, username } },
      { upsert: true, returnDocument: "after" }
    );
  },
};
