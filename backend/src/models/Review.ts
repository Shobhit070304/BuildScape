import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  headline?: string;
  comment: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    headline: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    isFeatured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ isFeatured: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
