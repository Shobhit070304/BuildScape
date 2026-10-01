import { Schema } from "mongoose";

export interface IPhase {
  id: string;
  orderIndex: number;
  title: string;
  content: string; // Markdown
}

export const PhaseSchema = new Schema<IPhase>(
  {
    id: { type: String, required: true },
    orderIndex: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);
