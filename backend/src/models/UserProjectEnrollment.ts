import mongoose, { Schema } from "mongoose";

export interface IUserProjectEnrollment {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  completedAt?: Date;
  currentPhaseIndex: number; // 0-based index of active phase
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  isVerified?: boolean;
  verifiedAt?: Date;
  certificateId?: string;
  verificationDetails?: {
    commitCount?: number;
    repoOwner?: string;
    repoName?: string;
    fingerprintMatched?: string[];
    verifiedChecks?: string[];
  };
}

const EnrollmentSchema = new Schema<IUserProjectEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    completedAt: { type: Date },
    currentPhaseIndex: { type: Number, default: 0 },
    githubRepoUrl: { type: String, trim: true },
    liveDemoUrl: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    certificateId: { type: String, trim: true },
    verificationDetails: {
      commitCount: Number,
      repoOwner: String,
      repoName: String,
      fingerprintMatched: [String],
      verifiedChecks: [String],
    },
  },
  { timestamps: { createdAt: "enrolledAt", updatedAt: false } }
);

// One enrollment per user-project pair
EnrollmentSchema.index({ userId: 1, projectId: 1 }, { unique: true });
EnrollmentSchema.index({ projectId: 1 });
EnrollmentSchema.index({ certificateId: 1 }, { unique: true, sparse: true });

export const UserProjectEnrollment = mongoose.model<IUserProjectEnrollment>(
  "UserProjectEnrollment",
  EnrollmentSchema
);
