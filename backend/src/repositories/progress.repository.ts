import { Types, type ClientSession } from "mongoose";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";

const asObjectId = (value: string) => new Types.ObjectId(value);

// Enrollment and phase completion persistence operations.
export const progressRepository = {
  enroll: async (userId: string, projectId: Types.ObjectId) => {
    const query = { userId: asObjectId(userId), projectId };
    try {
      return await UserProjectEnrollment.findOneAndUpdate(
        query,
        // $setOnInsert preserves currentPhaseIndex on re-enroll; only runs on first insert.
        { $setOnInsert: { ...query, currentPhaseIndex: 0 } },
        { upsert: true, returnDocument: "after" }
      );
    } catch (error) {
      // Concurrent first-time enrollments can race on the unique user/project index.
      if ((error as { code?: number }).code !== 11000) throw error;
      const existing = await UserProjectEnrollment.findOne(query);
      if (!existing) throw error;
      return existing;
    }
  },

  findEnrollment: (userId: string, projectId: Types.ObjectId, session?: ClientSession) => {
    const query = UserProjectEnrollment.findOne({ userId: asObjectId(userId), projectId });
    return session ? query.session(session) : query;
  },

  countEnrollments: (projectId: Types.ObjectId) =>
    UserProjectEnrollment.countDocuments({ projectId }),

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

  listCompletedPhases: (userId: string, projectId: Types.ObjectId, session?: ClientSession) => {
    const query = UserTaskProgress.find({ userId: asObjectId(userId), projectId }).select("phaseId completedAt");
    return session ? query.session(session) : query;
  },

  countByPhaseIds: (projectId: Types.ObjectId, phaseIds: string[]) =>
    UserTaskProgress.countDocuments({ projectId, phaseId: { $in: phaseIds } }),
};
