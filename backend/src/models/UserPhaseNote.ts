import mongoose, { Schema } from "mongoose";

export interface IUserPhaseNote {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  phaseId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserPhaseNoteSchema = new Schema<IUserPhaseNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    phaseId: { type: String, required: true },
    content: { type: String, required: true, maxlength: 10000 },
  },
  { timestamps: true }
);

UserPhaseNoteSchema.index({ userId: 1, projectId: 1, phaseId: 1 }, { unique: true });
UserPhaseNoteSchema.index({ projectId: 1 });

export const UserPhaseNote = mongoose.model<IUserPhaseNote>("UserPhaseNote", UserPhaseNoteSchema);
