import mongoose, { Schema } from "mongoose";
import { IPhase, PhaseSchema } from "./Phase";

export { IPhase, PhaseSchema };

export interface IProject {
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  category: "Frontend" | "Backend" | "Full-Stack" | "AI" | "Systems";
  whatYouWillLearn?: string[];
  prerequisites?: string[];
  deliverable?: string;
  track: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  techStack: string[];
  isPublished: boolean;
  phases: IPhase[];
  createdAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["Frontend", "Backend", "Full-Stack", "AI", "Systems"],
      required: true,
    },
    whatYouWillLearn: [{ type: String }],
    prerequisites: [{ type: String }],
    deliverable: { type: String },
    track: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    estimatedHours: { type: Number, required: true },
    techStack: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    phases: [PhaseSchema],
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
