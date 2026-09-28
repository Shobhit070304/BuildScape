import mongoose, { Schema, Document } from "mongoose";

export interface IUserProjectEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  completedAt?: Date;
  currentPhaseIndex: number; // 0-based index of active phase
}

const EnrollmentSchema = new Schema<IUserProjectEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    completedAt: { type: Date },
    currentPhaseIndex: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "enrolledAt", updatedAt: false } }
);

// One enrollment per user-project pair
EnrollmentSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export const UserProjectEnrollment = mongoose.model<IUserProjectEnrollment>(
  "UserProjectEnrollment",
  EnrollmentSchema
);
