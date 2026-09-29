import { Request, Response } from "express";
import { Project } from "../models/Project";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";

/** GET /api/projects — list all projects (excluding heavy phase markdown content for performance) */
export async function listProjects(_req: Request, res: Response) {
  try {
    const projects = await Project.find().select("-phases.content").sort({ createdAt: -1 });
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

/** GET /api/projects/my/enrolled — get all projects the user is enrolled in with progress */
export async function getEnrolledProjects(req: Request, res: Response) {
  try {
    const enrollments = await UserProjectEnrollment.find({
      userId: req.user!.userId,
    }).populate("projectId");

    const projectsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const project = enrollment.projectId as any;
        if (!project) return null;

        const completedPhases = await UserTaskProgress.find({
          userId: req.user!.userId,
          projectId: project._id,
        }).select("phaseId completedAt");

        return {
          enrollmentId: enrollment._id,
          enrolledAt: (enrollment as any).enrolledAt,
          currentPhaseIndex: enrollment.currentPhaseIndex,
          completedCount: completedPhases.length,
          totalPhases: project.phases ? project.phases.length : 0,
          completedPhases: completedPhases.map((p) => p.phaseId),
          project: {
            _id: project._id,
            slug: project.slug,
            title: project.title,
            tagline: project.tagline,
            track: project.track,
            difficulty: project.difficulty,
            estimatedHours: project.estimatedHours,
            techStack: project.techStack,
          },
        };
      })
    );

    res.json({ enrollments: projectsWithProgress.filter(Boolean) });
  } catch {
    res.status(500).json({ error: "Failed to fetch enrolled projects" });
  }
}

/** POST /api/projects — add a project */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create project", details: err.message });
  }
}

/** PUT /api/projects/:slug — update a project */
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const project = await Project.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update project", details: err.message });
  }
}

/** DELETE /api/projects/:slug — delete a project */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const project = await Project.findOneAndDelete({ slug: req.params.slug });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete project", details: err.message });
  }
}

