import { Types, type ClientSession } from "mongoose";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";
import { UserMilestoneTaskProgress } from "../models/UserMilestoneTaskProgress";

const asObjectId = (value: string) => new Types.ObjectId(value);

// Enrollment, phase completion, and task checklist persistence operations.
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

  findEnrollmentByCertificateId: (certificateId: string) =>
    UserProjectEnrollment.findOne({ certificateId, isVerified: true })
      .populate("userId", "name avatar username email")
      .populate("projectId"),

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

  setVerification: (
    userId: string,
    projectId: Types.ObjectId,
    data: {
      githubRepoUrl: string;
      liveDemoUrl?: string;
      certificateId: string;
      verificationDetails: {
        commitCount?: number;
        repoOwner?: string;
        repoName?: string;
        fingerprintMatched?: string[];
        verifiedChecks?: string[];
      };
    },
    session?: ClientSession
  ) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date(),
          githubRepoUrl: data.githubRepoUrl,
          liveDemoUrl: data.liveDemoUrl,
          certificateId: data.certificateId,
          verificationDetails: data.verificationDetails,
          completedAt: new Date(),
        },
      },
      { returnDocument: "after", session }
    ),

  toggleMilestoneTask: async (
    userId: string,
    projectId: Types.ObjectId,
    phaseId: string,
    taskId: string,
    completed: boolean,
    session?: ClientSession
  ) => {
    const filter = { userId: asObjectId(userId), projectId, phaseId, taskId };
    if (completed) {
      await UserMilestoneTaskProgress.findOneAndUpdate(
        filter,
        { ...filter, completedAt: new Date() },
        { upsert: true, returnDocument: "after", session }
      );
    } else {
      await UserMilestoneTaskProgress.findOneAndDelete(filter, { session });
    }
  },

  markAllPhaseTasksComplete: async (
    userId: string,
    projectId: Types.ObjectId,
    phaseId: string,
    taskIds: string[],
    session?: ClientSession
  ) => {
    if (!taskIds.length) return;
    const now = new Date();
    const ops = taskIds.map((taskId) => ({
      updateOne: {
        filter: { userId: asObjectId(userId), projectId, phaseId, taskId },
        update: { $set: { userId: asObjectId(userId), projectId, phaseId, taskId, completedAt: now } },
        upsert: true,
      },
    }));
    await UserMilestoneTaskProgress.bulkWrite(ops, { session });
  },

  listCompletedTasks: async (userId: string, projectId: Types.ObjectId, session?: ClientSession) => {
    const query = UserMilestoneTaskProgress.find({ userId: asObjectId(userId), projectId }).select("phaseId taskId");
    const records = await (session ? query.session(session) : query);
    const map: Record<string, string[]> = {};
    for (const record of records) {
      if (!map[record.phaseId]) map[record.phaseId] = [];
      map[record.phaseId].push(record.taskId);
    }
    return map;
  },

  clearPhaseProgress: async (userId: string, projectId: Types.ObjectId, session?: ClientSession) => {
    await UserTaskProgress.deleteMany({ userId: asObjectId(userId), projectId }, { session });
    await UserMilestoneTaskProgress.deleteMany({ userId: asObjectId(userId), projectId }, { session });
  },

  deleteProjectData: async (projectId: Types.ObjectId, session: ClientSession) => {
    await UserProjectEnrollment.deleteMany({ projectId }, { session });
    await UserTaskProgress.deleteMany({ projectId }, { session });
    await UserMilestoneTaskProgress.deleteMany({ projectId }, { session });
  },

  listCompletedPhases: (userId: string, projectId: Types.ObjectId, session?: ClientSession) => {
    const query = UserTaskProgress.find({ userId: asObjectId(userId), projectId }).select("phaseId completedAt");
    return session ? query.session(session) : query;
  },

  countByPhaseIds: (projectId: Types.ObjectId, phaseIds: string[]) =>
    UserTaskProgress.countDocuments({ projectId, phaseId: { $in: phaseIds } }),
};
