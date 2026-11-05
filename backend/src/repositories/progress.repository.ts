import { Types, type ClientSession } from "mongoose";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";

const asObjectId = (value: string) => new Types.ObjectId(value);

// Enrollment and phase completion persistence operations.
export const progressRepository = {
  enroll: (userId: string, projectId: Types.ObjectId) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId },
      // $setOnInsert preserves currentPhaseIndex on re-enroll; only runs on first insert.
      { $setOnInsert: { userId: asObjectId(userId), projectId, currentPhaseIndex: 0 } },
      { upsert: true, returnDocument: "after" }
    ),

  findEnrollment: (userId: string, projectId: Types.ObjectId, session?: ClientSession) => {
    const query = UserProjectEnrollment.findOne({ userId: asObjectId(userId), projectId });
    return session ? query.session(session) : query;
  },

  listEnrollments: (userId: string) =>
    UserProjectEnrollment.find({ userId: asObjectId(userId) }).populate("projectId"),

  markPhaseComplete: (userId: string, projectId: Types.ObjectId, phaseId: string, session?: ClientSession) =>
    UserTaskProgress.findOneAndUpdate(
      { userId: asObjectId(userId), projectId, phaseId },
      { userId: asObjectId(userId), projectId, phaseId, completedAt: new Date() },
      { upsert: true, returnDocument: "after", session }
    ),

  unmarkPhaseComplete: (userId: string, projectId: Types.ObjectId, phaseId: string, session?: ClientSession) =>
    UserTaskProgress.findOneAndDelete({ userId: asObjectId(userId), projectId, phaseId }, { session }),

  setCurrentPhase: (userId: string, projectId: Types.ObjectId, currentPhaseIndex: number, session?: ClientSession) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId },
      { currentPhaseIndex },
      { returnDocument: "after", session }
    ),

  setProjectCompletedIfMissing: (userId: string, projectId: Types.ObjectId, completedAt: Date, session?: ClientSession) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId, completedAt: null },
      { $set: { completedAt } },
      { returnDocument: "after", session }
    ),

  clearPhaseProgress: (userId: string, projectId: Types.ObjectId, session?: ClientSession) =>
    UserTaskProgress.deleteMany({ userId: asObjectId(userId), projectId }, { session }),

  deleteProjectData: async (projectId: Types.ObjectId, session: ClientSession) => {
    await UserProjectEnrollment.deleteMany({ projectId }, { session });
    await UserTaskProgress.deleteMany({ projectId }, { session });
  },

  updateVerification: (
    userId: string,
    projectId: Types.ObjectId,
    data: { githubRepoUrl: string; liveDemoUrl?: string; isVerified: boolean; verifiedAt: Date },
    session?: ClientSession
  ) => {
    const { liveDemoUrl, ...verification } = data;
    return UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId },
      liveDemoUrl
        ? { $set: { ...verification, liveDemoUrl } }
        : { $set: verification, $unset: { liveDemoUrl: 1 } },
      { returnDocument: "after", session }
    );
  },

  listCompletedPhases: (userId: string, projectId: Types.ObjectId, session?: ClientSession) => {
    const query = UserTaskProgress.find({ userId: asObjectId(userId), projectId }).select("phaseId completedAt");
    return session ? query.session(session) : query;
  },

  countByPhaseIds: (projectId: Types.ObjectId, phaseIds: string[]) =>
    UserTaskProgress.countDocuments({ projectId, phaseId: { $in: phaseIds } }),
};
