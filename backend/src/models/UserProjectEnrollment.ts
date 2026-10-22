import mongoose, { Schema } from "mongoose";

export interface IUserProjectEnrollment {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  currentPhaseIndex: number; // 0-based index of active phase
  notes: string;
}

const EnrollmentSchema = new Schema<IUserProjectEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    currentPhaseIndex: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "", maxlength: 10000 },
  },
  { timestamps: { createdAt: "enrolledAt", updatedAt: false } }
);

// One enrollment per user-project pair
EnrollmentSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export const UserProjectEnrollment = mongoose.model<IUserProjectEnrollment>(
  "UserProjectEnrollment",
  EnrollmentSchema
);
