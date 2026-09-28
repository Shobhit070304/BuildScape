import mongoose, { Schema, Document } from "mongoose";

export interface IUserTaskProgress extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  phaseId: string; // matches IPhase.id
  completedAt: Date;
}

const TaskProgressSchema = new Schema<IUserTaskProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    phaseId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// One completion record per user-project-phase
TaskProgressSchema.index(
  { userId: 1, projectId: 1, phaseId: 1 },
  { unique: true }
);

export const UserTaskProgress = mongoose.model<IUserTaskProgress>(
  "UserTaskProgress",
  TaskProgressSchema
);
