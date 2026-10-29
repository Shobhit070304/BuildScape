import mongoose, { Schema } from "mongoose";

export type CurriculumIssueCategory = "outdated" | "broken" | "unclear" | "other";
export type CurriculumIssueStatus = "open" | "in_review" | "resolved";

export interface ICurriculumIssue {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  phaseId: string;
  phaseTitle: string;
  category: CurriculumIssueCategory;
  message: string;
  status: CurriculumIssueStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const CurriculumIssueSchema = new Schema<ICurriculumIssue>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    phaseId: { type: String, required: true },
    phaseTitle: { type: String, required: true, maxlength: 160 },
    category: { type: String, enum: ["outdated", "broken", "unclear", "other"], required: true },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ["open", "in_review", "resolved"], default: "open", required: true },
  },
  { timestamps: true }
);

CurriculumIssueSchema.index({ status: 1, createdAt: -1 });
CurriculumIssueSchema.index({ projectId: 1 });

export const CurriculumIssue = mongoose.model<ICurriculumIssue>("CurriculumIssue", CurriculumIssueSchema);
