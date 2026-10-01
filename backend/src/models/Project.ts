import mongoose, { Schema } from "mongoose";
import { IPhase, PhaseSchema } from "./Phase";

export { IPhase, PhaseSchema };

export interface IProject {
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  whatYouWillLearn?: string[];
  track: string;
  difficulty: "Entry" | "Basic" | "Intermediate" | "Advanced" | "Expert" | "Beginner";
  estimatedHours: number;
  techStack: string[];
  phases: IPhase[];
  createdAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String },
    whatYouWillLearn: [{ type: String }],
    track: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Entry", "Basic", "Intermediate", "Advanced", "Expert", "Beginner"],
      required: true,
    },
    estimatedHours: { type: Number, required: true },
    techStack: [{ type: String }],
    phases: [PhaseSchema],
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
