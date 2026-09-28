import mongoose, { Schema, Document } from "mongoose";
import { IPhase, PhaseSchema } from "./Phase";

export { IPhase, PhaseSchema };

export interface IProject extends Document {
  slug: string;
  title: string;
  tagline: string;
  track: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  techStack: string[];
  phases: IPhase[];
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    track: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    estimatedHours: { type: Number, required: true },
    techStack: [{ type: String }],
    phases: [PhaseSchema],
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
