import { Types } from "mongoose";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";

const asObjectId = (value: string) => new Types.ObjectId(value);

export const progressRepository = {
  enroll: (userId: string, projectId: Types.ObjectId) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId },
      { $setOnInsert: { userId: asObjectId(userId), projectId, currentPhaseIndex: 0 } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ),

  findEnrollment: (userId: string, projectId: Types.ObjectId) =>
    UserProjectEnrollment.findOne({ userId: asObjectId(userId), projectId }),

  listEnrollments: (userId: string) =>
    UserProjectEnrollment.find({ userId: asObjectId(userId) }).populate("projectId"),

  countEnrollments: (projectId: Types.ObjectId) =>
    UserProjectEnrollment.countDocuments({ projectId }),

  markPhaseComplete: (userId: string, projectId: Types.ObjectId, phaseId: string) =>
    UserTaskProgress.findOneAndUpdate(
      { userId: asObjectId(userId), projectId, phaseId },
      { $setOnInsert: { userId: asObjectId(userId), projectId, phaseId, completedAt: new Date() } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ),

  unmarkPhaseComplete: (userId: string, projectId: Types.ObjectId, phaseId: string) =>
    UserTaskProgress.findOneAndDelete({ userId: asObjectId(userId), projectId, phaseId }),

  setCurrentPhase: (userId: string, projectId: Types.ObjectId, currentPhaseIndex: number) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId },
      { $set: { currentPhaseIndex } },
      { returnDocument: "after", runValidators: true }
    ),

  listCompletedPhases: (userId: string, projectId: Types.ObjectId) =>
    UserTaskProgress.find({ userId: asObjectId(userId), projectId }).select("phaseId completedAt"),
};
