import { asyncHandler } from "../middleware/asyncHandler";
import { feedbackService } from "../services/feedback.service";

export const listCurriculumIssues = asyncHandler(async (req, res) => {
  res.json({ issues: await feedbackService.listIssues(req.query.status) });
});

export const updateCurriculumIssue = asyncHandler(async (req, res) => {
  const issue = await feedbackService.updateIssueStatus(String(req.params.issueId), req.body?.status);
  res.json({ success: true, issue });
});
