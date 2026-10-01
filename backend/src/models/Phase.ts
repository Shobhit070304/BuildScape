import mongoose, { Schema, Document } from "mongoose";

export interface IPhase {
  id: string;
  orderIndex: number;
  title: string;
  content: string; // Markdown
  tasksCount?: number;
}

export const PhaseSchema = new Schema<IPhase>(
  {
    id: { type: String, required: true },
    orderIndex: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tasksCount: { type: Number, default: 8 },
  },
  { _id: false }
);

export const Phase = mongoose.model<IPhase>("Phase", PhaseSchema);
