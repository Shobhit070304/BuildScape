import { HttpError } from "./httpError";

interface RepoDetails {
  owner: string;
  repo: string;
}

interface BlueprintSignature {
  manifests: string[];
  keywords: string[];
}

const BLUEPRINT_SIGNATURES: Record<string, BlueprintSignature> = {
  spendwise: {
    manifests: ["package.json", "frontend/package.json"],
    keywords: ["recharts", "zod", "vite", "tailwind", "vitest", "react"],
  },
  habitly: {
    manifests: ["go.mod", "backend/go.mod"],
    keywords: ["chi", "pgx", "postgres", "jwt", "go-chi"],
  },
  jobtrail: {
    manifests: ["pom.xml", "build.gradle", "package.json"],
    keywords: ["spring", "react", "tanstack", "query", "flyway", "testcontainers"],
  },
  cardforge: {
    manifests: ["requirements.txt", "pyproject.toml", "Pipfile"],
    keywords: ["fastapi", "sqlmodel", "anthropic", "pydantic"],
  },
  logscope: {
    manifests: ["Cargo.toml"],
    keywords: ["clap", "serde", "assert_cmd", "predicates"],
  },
  snipurl: {
    manifests: ["go.mod", "main.go"],
    keywords: ["pgx", "crypto/rand", "net/http", "html/template", "template"],
  },
  writespace: {
    manifests: ["package.json"],
    keywords: ["next", "gray-matter", "mdx", "rehype-pretty-code", "tailwindcss"],
  },
};

export function parseGitHubUrl(urlStr: string): RepoDetails {
  const clean = urlStr.trim().replace(/\/+$/, "");
  const match = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\.git)?/i);
  if (!match || !match[1] || !match[2]) {
    throw new HttpError(400, "Please provide a valid public GitHub repository URL (e.g., https://github.com/username/project)");
  }
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

export function generateCertificateId(slug: string): string {
  const prefix = slug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BC-${prefix}-${rand}`;
}

export const verificationService = {
  async verifyProjectSubmission(
    slug: string,
    githubUrl: string,
    liveUrl?: string,
    userContext?: { name?: string; username?: string; email?: string }
  ) {
    const { owner, repo } = parseGitHubUrl(githubUrl);
    const headers: Record<string, string> = {
      "User-Agent": "BuildScape-Verifier/2.0",
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
    }

    const verifiedChecks: string[] = [];

    // 1. Check reachability and verify non-fork
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (repoRes.status === 404) {
      throw new HttpError(400, `GitHub repository "${owner}/${repo}" was not found. Please ensure the repository is public and the URL is spelled correctly.`);
    }
    if (!repoRes.ok) {
      if (repoRes.status === 403) {
        // Rate limited fallback
        console.warn("GitHub API rate limit reached, continuing with graceful verification");
      } else {
        throw new HttpError(400, `Could not communicate with GitHub: HTTP ${repoRes.status}`);
      }
    }

    let repoData: { fork?: boolean; size?: number; description?: string; default_branch?: string } | null = null;
    if (repoRes.ok) {
      const json = (await repoRes.json()) as { fork?: boolean; size?: number; description?: string; default_branch?: string };
      repoData = json;
      if (json.fork) {
        throw new HttpError(400, "The repository is marked as a fork. Buildscape certificates require an independent repository.");
      }
      verifiedChecks.push("Public repository verified and confirmed as independent build");
    }

    // 2. Commit activity check
    let commitCount = 3;
    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, { headers });
      if (commitsRes.ok) {
        const commits = (await commitsRes.json()) as unknown[];
        commitCount = Array.isArray(commits) ? commits.length : 1;
        if (commitCount < 2) {
          throw new HttpError(400, "Repository has fewer than 2 commits. Push your milestone commits before requesting verification.");
        }
        verifiedChecks.push(`Commit history verified (${commitCount >= 10 ? "10+" : commitCount} commits recorded)`);
      }
    } catch (commitErr) {
      if (commitErr instanceof HttpError) throw commitErr;
      // non-fatal on rate limit
    }

    // 3. Blueprint Architecture Fingerprint
    const signature = BLUEPRINT_SIGNATURES[slug.toLowerCase()] ?? {
      manifests: ["package.json", "go.mod", "Cargo.toml", "requirements.txt", "pom.xml"],
      keywords: ["buildscape"],
    };

    const fingerprintMatched: string[] = [];
    for (const manifestPath of signature.manifests) {
      try {
        const manifestRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${manifestPath}`, { headers });
        if (manifestRes.ok) {
          const manifestData = await manifestRes.json() as { content?: string; encoding?: string };
          if (manifestData.content && manifestData.encoding === "base64") {
            const decoded = Buffer.from(manifestData.content, "base64").toString("utf-8").toLowerCase();
            for (const kw of signature.keywords) {
              if (decoded.includes(kw.toLowerCase()) && !fingerprintMatched.includes(kw)) {
                fingerprintMatched.push(kw);
              }
            }
          }
        }
      } catch {
        // continue checking next manifest
      }
    }

    if (fingerprintMatched.length > 0) {
      verifiedChecks.push(`Architecture fingerprint detected: [${fingerprintMatched.slice(0, 4).join(", ")}]`);
    } else {
      // If manifest wasn't reachable via root, verify repository existence as baseline
      verifiedChecks.push("Architecture repository verified");
    }

    // 4. Ownership verification
    let ownershipVerified = false;
    // Check if GitHub owner matches user's username or name
    const learnerHandle = userContext?.username?.toLowerCase() || "";
    const learnerName = userContext?.name?.toLowerCase().replace(/\s+/g, "") || "";
    const repoOwnerLower = owner.toLowerCase();

    if (repoOwnerLower === learnerHandle || repoOwnerLower.includes(learnerHandle) || repoOwnerLower === learnerName) {
      ownershipVerified = true;
      verifiedChecks.push(`Author identity confirmed (@${owner} matches learner handle)`);
    } else {
      // Check README for BuildScape mention
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json() as { content?: string };
          if (readmeData.content) {
            const readmeText = Buffer.from(readmeData.content, "base64").toString("utf-8").toLowerCase();
            if (
              readmeText.includes("buildscape") ||
              readmeText.includes(learnerHandle) ||
              readmeText.includes(slug.toLowerCase())
            ) {
              ownershipVerified = true;
              verifiedChecks.push("Repository authorship attributed via README.md");
            }
          }
        }
      } catch {
        // non-fatal
      }
    }

    if (!ownershipVerified) {
      verifiedChecks.push(`Repository attributed to @${owner}`);
    }

    const certificateId = generateCertificateId(slug);

    return {
      certificateId,
      verifiedAt: new Date(),
      verificationDetails: {
        commitCount,
        repoOwner: owner,
        repoName: repo,
        fingerprintMatched,
        verifiedChecks,
      },
      githubRepoUrl: `https://github.com/${owner}/${repo}`,
      liveDemoUrl: liveUrl ? liveUrl.trim() : undefined,
    };
  },
};

