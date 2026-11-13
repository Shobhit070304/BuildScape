import mongoose, { Schema, type Types } from "mongoose";

export interface IDiscussionComment {
  _id: Types.ObjectId;
  discussionId: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId;
  upvotes: Types.ObjectId[];
  upvoteCount: number;
  isAcceptedSolution: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionCommentSchema = new Schema<IDiscussionComment>(
  {
    discussionId: { type: Schema.Types.ObjectId, ref: "Discussion", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    parentId: { type: Schema.Types.ObjectId, ref: "DiscussionComment", index: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    upvoteCount: { type: Number, default: 0 },
    isAcceptedSolution: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

DiscussionCommentSchema.index({ discussionId: 1, createdAt: 1 });

export const DiscussionComment = mongoose.model<IDiscussionComment>(
  "DiscussionComment",
  DiscussionCommentSchema
);

