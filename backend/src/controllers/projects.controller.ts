import { Request, Response } from "express";
import { Project } from "../models/Project";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";

/** GET /api/projects — list all projects (without phase content for perf) */
export async function listProjects(_req: Request, res: Response) {
  try {
    const projects = await Project.find().select("-phases");
    res.json({ projects });
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}

/** GET /api/projects/:slug — full project with all phases */
export async function getProject(req: Request, res: Response) {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json({ project });
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
}

/** POST /api/projects/:slug/enroll — enroll authenticated user */
export async function enrollProject(req: Request, res: Response) {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const enrollment = await UserProjectEnrollment.findOneAndUpdate(
      { userId: req.user!.userId, projectId: project._id },
      { userId: req.user!.userId, projectId: project._id },
      { upsert: true, new: true }
    );

    res.json({ enrollment });
  } catch {
    res.status(500).json({ error: "Failed to enroll" });
  }
}

/** POST /api/projects/:slug/phases/:phaseId/complete — mark a phase done */
export async function completePhase(req: Request, res: Response) {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const phaseExists = project.phases.some(
      (p) => p.id === req.params.phaseId
    );
    if (!phaseExists) {
      res.status(404).json({ error: "Phase not found" });
      return;
    }

    // Upsert completion record
    await UserTaskProgress.findOneAndUpdate(
      {
        userId: req.user!.userId,
        projectId: project._id,
        phaseId: req.params.phaseId,
      },
      {
        userId: req.user!.userId,
        projectId: project._id,
        phaseId: req.params.phaseId,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update current phase index on enrollment
    const completedPhaseOrder =
      project.phases.find((p) => p.id === req.params.phaseId)?.orderIndex ?? 0;

    await UserProjectEnrollment.findOneAndUpdate(
      { userId: req.user!.userId, projectId: project._id },
      { currentPhaseIndex: completedPhaseOrder } // advance to next phase
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to mark phase complete" });
  }
}

/** GET /api/projects/:slug/progress — get user's progress on a project */
export async function getProgress(req: Request, res: Response) {
  try {
    const project = await Project.findOne({ slug: req.params.slug }, { phases: 1 });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const enrollment = await UserProjectEnrollment.findOne({
      userId: req.user!.userId,
      projectId: project._id,
    });

    const completedPhases = await UserTaskProgress.find({
      userId: req.user!.userId,
      projectId: project._id,
    }).select("phaseId completedAt");

    res.json({
      enrolled: !!enrollment,
      currentPhaseIndex: enrollment?.currentPhaseIndex ?? 0,
      completedPhases: completedPhases.map((p) => ({
        phaseId: p.phaseId,
        completedAt: p.completedAt,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
}
