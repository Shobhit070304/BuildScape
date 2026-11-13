import mongoose, { Schema, type Types } from "mongoose";

export type DiscussionCategory = "general" | "question" | "showcase" | "architecture" | "tip";

export interface IDiscussion {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  content: string;
  category: DiscussionCategory;
  projectSlug?: string;
  projectTitle?: string;
  phaseId?: string;
  phaseTitle?: string;
  upvotes: Types.ObjectId[];
  upvoteCount: number;
  replyCount: number;
  views: number;
  isResolved: boolean;
  acceptedCommentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 20000 },
    category: {
      type: String,
      enum: ["general", "question", "showcase", "architecture", "tip"],
      default: "general",
      index: true,
    },
    projectSlug: { type: String, trim: true, index: true },
    projectTitle: { type: String, trim: true },
    phaseId: { type: String, trim: true },
    phaseTitle: { type: String, trim: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    upvoteCount: { type: Number, default: 0, index: true },
    replyCount: { type: Number, default: 0, index: true },
    views: { type: Number, default: 0 },
    isResolved: { type: Boolean, default: false, index: true },
    acceptedCommentId: { type: Schema.Types.ObjectId, ref: "DiscussionComment" },
  },
  { timestamps: true }
);

DiscussionSchema.index({ createdAt: -1 });
DiscussionSchema.index({ upvoteCount: -1, createdAt: -1 });
DiscussionSchema.index({ title: "text", content: "text" });

export const Discussion = mongoose.model<IDiscussion>("Discussion", DiscussionSchema);

