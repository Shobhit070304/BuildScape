import { Types, type ClientSession } from "mongoose";
import { CurriculumIssue, type CurriculumIssueStatus } from "../models/CurriculumIssue";
import { UserPhaseNote } from "../models/UserPhaseNote";

const objectId = (id: string) => new Types.ObjectId(id);

export const feedbackRepository = {
  getNote: (userId: string, projectId: Types.ObjectId, phaseId: string) =>
    UserPhaseNote.findOne({ userId: objectId(userId), projectId, phaseId }).select("content"),
  saveNote: (userId: string, projectId: Types.ObjectId, phaseId: string, content: string) =>
    UserPhaseNote.findOneAndUpdate(
      { userId: objectId(userId), projectId, phaseId },
      { $set: { content }, $setOnInsert: { userId: objectId(userId), projectId, phaseId } },
      { upsert: true, returnDocument: "after", runValidators: true }
    ),
  deleteNote: (userId: string, projectId: Types.ObjectId, phaseId: string) =>
    UserPhaseNote.deleteOne({ userId: objectId(userId), projectId, phaseId }),
  countNotesByPhaseIds: (projectId: Types.ObjectId, phaseIds: string[]) =>
    UserPhaseNote.countDocuments({ projectId, phaseId: { $in: phaseIds } }),
  createIssue: (data: {
    userId: string; projectId: Types.ObjectId; phaseId: string;
    phaseTitle: string;
    category: "outdated" | "broken" | "unclear" | "other"; message: string;
  }) => CurriculumIssue.create({ ...data, userId: objectId(data.userId) }),
  listIssues: (status?: CurriculumIssueStatus) => {
    const query = status ? { status } : {};
    return CurriculumIssue.find(query)
      .sort({ createdAt: -1 })
      .populate("projectId", "slug title")
      .populate("userId", "name username");
  },
  updateIssueStatus: (id: Types.ObjectId, status: CurriculumIssueStatus) =>
    CurriculumIssue.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: "after", runValidators: true })
      .populate("projectId", "slug title")
      .populate("userId", "name username"),
  deleteProjectFeedback: async (projectId: Types.ObjectId, session: ClientSession) => {
    await UserPhaseNote.deleteMany({ projectId }, { session });
    await CurriculumIssue.deleteMany({ projectId }, { session });
  },
};
