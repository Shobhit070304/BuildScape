import { Schema } from "mongoose";

export interface ITask {
  id: string;
  title: string;
}

export interface IPhase {
  id: string;
  orderIndex: number;
  title: string;
  summary: string;
  tasks: ITask[];
  estimatedMinutes?: number;
  content: string;
}

const TaskSchema = new Schema<ITask>(
  { id: String, title: String },
  { _id: false }
);

export const PhaseSchema = new Schema<IPhase>(
  {
    id: { type: String, required: true },
    orderIndex: { type: Number, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    tasks: [TaskSchema],
    estimatedMinutes: { type: Number },
    content: { type: String, required: true },
  },
  { _id: false }
);
