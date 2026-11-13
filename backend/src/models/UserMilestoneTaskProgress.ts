import mongoose, { Schema } from "mongoose";

export interface IUserMilestoneTaskProgress {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  phaseId: string;
  taskId: string;
  completedAt: Date;
}

const MilestoneTaskProgressSchema = new Schema<IUserMilestoneTaskProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    phaseId: { type: String, required: true },
    taskId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// One completion record per user-project-phase-task
MilestoneTaskProgressSchema.index(
  { userId: 1, projectId: 1, phaseId: 1, taskId: 1 },
  { unique: true }
);
MilestoneTaskProgressSchema.index({ userId: 1, projectId: 1 });

export const UserMilestoneTaskProgress = mongoose.model<IUserMilestoneTaskProgress>(
  "UserMilestoneTaskProgress",
  MilestoneTaskProgressSchema
);

