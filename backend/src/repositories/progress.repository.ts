import { Types } from "mongoose";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";

const asObjectId = (value: string) => new Types.ObjectId(value);

// Enrollment and phase completion persistence operations.
export const progressRepository = {
  enroll: (userId: string, projectId: Types.ObjectId) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId },
      { userId: asObjectId(userId), projectId },
      { upsert: true, new: true }
    ),
  findEnrollment: (userId: string, projectId: Types.ObjectId) =>
    UserProjectEnrollment.findOne({ userId: asObjectId(userId), projectId }),
  listEnrollments: (userId: string) =>
    UserProjectEnrollment.find({ userId: asObjectId(userId) }).populate("projectId"),
  markPhaseComplete: (userId: string, projectId: Types.ObjectId, phaseId: string) =>
    UserTaskProgress.findOneAndUpdate(
      { userId: asObjectId(userId), projectId, phaseId },
      { userId: asObjectId(userId), projectId, phaseId, completedAt: new Date() },
      { upsert: true, new: true }
    ),
  setCurrentPhase: (userId: string, projectId: Types.ObjectId, currentPhaseIndex: number) =>
    UserProjectEnrollment.findOneAndUpdate(
      { userId: asObjectId(userId), projectId }, { currentPhaseIndex }, { upsert: true, new: true }
    ),
  listCompletedPhases: (userId: string, projectId: Types.ObjectId) =>
    UserTaskProgress.find({ userId: asObjectId(userId), projectId }).select("phaseId completedAt"),
};
