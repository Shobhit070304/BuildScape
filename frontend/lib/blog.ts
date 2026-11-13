export interface BlogPost {
  id: string;
  slug: string;
  number: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  category: "Engineering" | "Product" | "Founder Log";
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: {
    lead: string;
    sections: {
      heading?: string;
      paragraphs: string[];
      codeSnippet?: {
        language: string;
        code: string;
      };
      callout?: {
        type: "note" | "tip" | "warning";
        title: string;
        text: string;
      };
    }[];
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-3",
    slug: "engineering-update-april-2026",
    number: "03",
    title: "Projects on BuildScape just got better: Checkpoints, CLI Test Assertions & Instant State",
    excerpt:
      "Over the past month, we completely overhauled how projects are structured. Here is the architectural post-mortem on our task persistence and automated test verifier.",
    publishedAt: "Apr 5, 2026",
    readingTime: "3 min read",
    category: "Engineering",
    author: {
      name: "Shobhit Sharma",
      role: "Lead Architect & Founder",
    },
    content: {
      lead:
        "Building production software is fundamentally different from watching syntax videos. Over the last 30 days, we re-architected our curriculum engine to make every phase strictly verifiable with automated checkpoint assertions and instant local state synchronization.",
      sections: [
        {
          heading: "The Flaw of Traditional Coding Tutorials",
          paragraphs: [
            "Most online tutorials suffer from the 'tutorial hell' trap: an instructor walks you through code in a pre-configured environment with zero edge cases. As soon as you open a blank editor, dependency drift, missing flags, and architectural confusion stall your momentum.",
            "On BuildScape, our design rule is strict: you write every single line of code in your own local editor. The curriculum provides architecture mental models, entity schemas, and task checkpoints that assert your code actually works.",
          ],
          callout: {
            type: "note",
            title: "Zero Video Paywalls",
            text: "Every project curriculum and roadmap is 100% open and free. Progress is synced automatically to PostgreSQL so you can resume anywhere.",
          },
        },
        {
          heading: "Automated Milestone Checkpoint Tests",
          paragraphs: [
            "Each of the 8 phases concludes with a deterministic test suite you run in your terminal. For example, in our Go REST API project, Phase 4 checks streak calculations against daylight savings time boundaries and race conditions:",
          ],
          codeSnippet: {
            language: "bash",
            code: `# Run race detection and unit assertions locally
go test -v -race -timeout 30s ./internal/streak/...

# Expected Output:
# === RUN   TestStreakCalculation_ConsecutiveDays
# --- PASS: TestStreakCalculation_ConsecutiveDays (0.01s)
# === RUN   TestStreakCalculation_DaylightSavingsEdgeCase
# --- PASS: TestStreakCalculation_DaylightSavingsEdgeCase (0.02s)
# PASS
# ok      github.com/buildscape/habitly/internal/streak   0.038s`,
          },
        },
        {
          heading: "What's Coming Next",
          paragraphs: [
            "We are preparing two brand new engineering tracks: a Rust Async Task Queue using Tokio and Raft, and a Distributed Event Streaming system using Kafka and pgx transactions.",
            "Keep building, and share your completed project repositories in the Community Showcase!",
          ],
        },
      ],
    },
  },
  {
    id: "post-2",
    slug: "introducing-project-showcase",
    number: "02",
    title: "Introducing Community Showcase: Share Your Deployed Systems & Real Proof of Work",
    excerpt:
      "Developers learn best by putting real software in front of the world. Connect your GitHub repository and live deployment URL to prove your engineering ability to hiring teams.",
    publishedAt: "Mar 29, 2026",
    readingTime: "2 min read",
    category: "Product",
    author: {
      name: "Shobhit Sharma",
      role: "Lead Architect & Founder",
    },
    content: {
      lead:
        "Resumes filled with toy to-do apps and generic bootcamp clones are routinely overlooked by senior hiring managers. To stand out, you need verifiable code repositories, production Docker containers, and live URLs.",
      sections: [
        {
          heading: "Why Proof of Work Matters",
          paragraphs: [
            "When engineering managers evaluate candidates, they look for three things: code organization, understanding of edge cases, and the ability to package and deploy software independently.",
            "With BuildScape Community Showcase, every time you finish an 8-phase project, you can publish your verified build. Other developers can inspect your repository structure, explore your architecture decisions, and test your live demo.",
          ],
        },
        {
          heading: "Fingerprinted Repository Verification",
          paragraphs: [
            "When you submit your GitHub repo, our verification system inspects the commit tree for essential architecture components (e.g. database migrations, connection pooling, Dockerfile scratch stages, and test suites).",
            "Once verified, your project receives an authentic Proof of Work certificate with a permanent public link you can add to your LinkedIn or resume.",
          ],
          callout: {
            type: "tip",
            title: "Pro Tip for Job Applications",
            text: "Link directly to your verified showcase in your cover letter. Engineering leads love clicking into clean repositories with passing CI workflows.",
          },
        },
      ],
    },
  },
  {
    id: "post-1",
    slug: "one-month-of-buildscape",
    number: "01",
    title: "One Month of BuildScape: 1,200+ Active Builders & Key Lessons Learned",
    excerpt:
      "A look back at our first 30 days of public beta: metrics, community feedback, and why focusing on depth over breadth proved to be the right technical bet.",
    publishedAt: "Mar 16, 2026",
    readingTime: "3 min read",
    category: "Founder Log",
    author: {
      name: "Shobhit Sharma",
      role: "Lead Architect & Founder",
    },
    content: {
      lead:
        "One month ago, we launched BuildScape with a simple conviction: developers don't need another generic syntax video—they need guided, production-grade projects that mirror real engineering teams.",
      sections: [
        {
          heading: "Key Metrics from Month 1",
          paragraphs: [
            "The response from the developer community exceeded all our expectations:",
            "• 1,240+ registered engineers actively building projects.",
            "• 14,850+ curriculum milestones checked off in local editors.",
            "• 94.2% project completion rate for developers who finish Phase 2.",
            "• Over 120 production repositories deployed to AWS, Fly.io, and Render.",
          ],
        },
        {
          heading: "Lesson Learned: Keep the Stacks Narrow and Deep",
          paragraphs: [
            "Early on, we debated adding 30 different frameworks. Instead, we focused strictly on 6 high-demand production tracks: Go REST APIs, React & TypeScript architectures, Spring Boot microservices, FastAPI AI pipelines, and Rust concurrency.",
            "By keeping the stacks focused, we were able to ensure every command, schema migration, and test assertion works 100% reliably with zero version drift.",
          ],
          codeSnippet: {
            language: "sql",
            code: `-- Example of real database schema covered in Phase 2
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_days INT NOT NULL DEFAULT 7,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_user ON habits(user_id);`,
          },
        },
        {
          heading: "Thank You to Our Early Builders",
          paragraphs: [
            "Huge thanks to everyone who submitted curriculum feedback, flagged edge cases, and shared their live deployments. We have a lot of exciting features planned for Q2!",
          ],
        },
      ],
    },
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

