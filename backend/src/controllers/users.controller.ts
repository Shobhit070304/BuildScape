import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getPublicProfile } from "../services/auth.service";
import { userRepository } from "../repositories/users.repository";
import { projectRepository } from "../repositories/projects.repository";
import { progressRepository } from "../repositories/progress.repository";

export const getPublicUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getPublicProfile(String(req.params.username));
  res.json(profile);
});

export const getProjectBadge = asyncHandler(async (req: Request, res: Response) => {
  const username = String(req.params.username).toLowerCase().trim();
  const slug = String(req.params.slug).toLowerCase().trim().replace(/\.svg$/, "");

  const user = await userRepository.findByUsername(username).catch(() => null);
  const project = await projectRepository.findBySlug(slug).catch(() => null);

  let isVerified = false;

  if (user && project) {
    const enrollment = await progressRepository.findEnrollment(user._id.toString(), project._id).catch(() => null);
    isVerified = Boolean(enrollment?.isVerified);
  }

  const label = "BuildScape";
  const status = isVerified ? "VERIFIED BUILD" : "IN PROGRESS";
  const statusBg = isVerified ? "#059669" : "#d97706";
  const iconColor = isVerified ? "#34d399" : "#fbbf24";

  // Render a sleek, crisp SVG badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" viewBox="0 0 220 28" fill="none" role="img" aria-label="${label}: ${status}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="220" y2="28" gradientUnits="userSpaceOnUse">
      <stop stop-color="#141416"/>
      <stop offset="1" stop-color="#0e0e10"/>
    </linearGradient>
    <clipPath id="radius">
      <rect width="220" height="28" rx="6" fill="#fff"/>
    </clipPath>
  </defs>
  <g clip-path="url(#radius)">
    <rect width="220" height="28" fill="url(#bg)"/>
    <rect x="0" y="0" width="88" height="28" fill="#1c1c1f"/>
    <rect x="88" y="0" width="132" height="28" fill="${statusBg}" fill-opacity="0.18"/>
    <rect x="88" y="0" width="132" height="28" stroke="${statusBg}" stroke-width="1" stroke-opacity="0.35"/>
    
    <!-- BuildScape Logo / Brand mark -->
    <path d="M14 8h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" fill="none" stroke="#d4b577" stroke-width="1.6"/>
    <path d="M16 12h6M16 15h4" stroke="#d4b577" stroke-width="1.4" stroke-linecap="round"/>
    
    <!-- Text: BuildScape -->
    <text x="32" y="18" fill="#e4ddd3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.4">BuildScape</text>
    
    <!-- Verification Status Icon -->
    ${
      isVerified
        ? `<circle cx="102" cy="14" r="5" fill="${iconColor}" fill-opacity="0.2"/>
           <path d="M99.5 14l1.8 1.8 3.7-3.7" fill="none" stroke="${iconColor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="102" cy="14" r="4.5" fill="none" stroke="${iconColor}" stroke-width="1.4" stroke-dasharray="2 2"/>`
    }
    
    <!-- Status text -->
    <text x="114" y="18" fill="${iconColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="700" letter-spacing="0.6">${status}</text>
  </g>
  <rect x="0.5" y="0.5" width="219" height="27" rx="5.5" stroke="#2e2e33" stroke-opacity="0.6"/>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=120, s-maxage=300");
  res.send(svg);
});
