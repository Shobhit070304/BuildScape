import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { Discussion } from "../models/Discussion";
import { DiscussionComment } from "../models/DiscussionComment";

async function seedDiscussions() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI environment variable is not defined");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB for seeding discussions");

  // Upsert community users
  const alex = await User.findOneAndUpdate(
    { email: "alex.chen.builder@example.com" },
    {
      $set: {
        googleId: "seed-user-alex-chen",
        email: "alex.chen.builder@example.com",
        name: "Alex Chen",
        username: "alex-chen",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "Senior Backend Engineer. Building distributed streaming systems, event architectures & high-throughput APIs.",
        location: "San Francisco, CA",
        githubUrl: "https://github.com",
        twitterUrl: "https://x.com",
        skills: ["TypeScript", "Node.js", "Redis", "Kafka", "Docker", "PostgreSQL"],
        role: "user",
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const elena = await User.findOneAndUpdate(
    { email: "elena.rostova@example.com" },
    {
      $set: {
        googleId: "seed-user-elena-rostova",
        email: "elena.rostova@example.com",
        name: "Elena Rostova",
        username: "elena-code",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        bio: "Full-Stack System Architect. Obsessed with state machines, WebSockets, and zero-latency UI performance.",
        location: "Berlin, Germany",
        githubUrl: "https://github.com",
        portfolioUrl: "https://example.com",
        skills: ["Next.js", "React", "TypeScript", "TailwindCSS", "PostgreSQL", "WebSockets"],
        role: "user",
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const marcus = await User.findOneAndUpdate(
    { email: "marcus.vance@example.com" },
    {
      $set: {
        googleId: "seed-user-marcus-vance",
        email: "marcus.vance@example.com",
        name: "Marcus Vance",
        username: "marcus-infra",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        bio: "Staff DevOps & Infrastructure Architect. Scaling distributed containers & high-availability databases.",
        location: "Austin, TX",
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
        skills: ["Docker", "Kubernetes", "AWS", "Go", "Terraform", "PostgreSQL"],
        role: "user",
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  // Clear existing discussions to re-seed cleanly
  await Discussion.deleteMany({});
  await DiscussionComment.deleteMany({});
  console.log("🧹 Cleared old discussions and comments");

  // Find sample project for reference
  const firstProject = await Project.findOne().select("title slug phases").lean();
  const projectSlug = firstProject?.slug;
  const projectTitle = firstProject?.title;
  const phaseId = firstProject?.phases?.[0]?.id;
  const phaseTitle = firstProject?.phases?.[0]?.title;

  // 1. Question with Accepted Solution
  const disc1 = await Discussion.create({
    author: alex._id,
    title: "How to handle JWT token refresh race conditions when 5 concurrent requests fail with 401?",
    content: `When a user has multiple components firing API requests simultaneously upon loading a dashboard, their access token might expire at that exact moment.
    
In naive implementations, each failing request attempts to hit \`/api/auth/refresh\`, resulting in 5 concurrent refresh calls:

\`\`\`typescript
// The problematic naive interceptor:
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // ⚠️ Fired 5 times concurrently! Invalidates refresh token rotation!
      await refreshToken();
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
\`\`\`

What is the cleanest architectural pattern to serialize these requests and share a single in-flight refresh promise without dropping any requests?`,
    category: "question",
    projectSlug,
    projectTitle,
    phaseId,
    phaseTitle,
    upvotes: [alex._id, elena._id, marcus._id],
    upvoteCount: 3,
    replyCount: 2,
    views: 142,
    isResolved: true,
  });

  const comment1 = await DiscussionComment.create({
    discussionId: disc1._id,
    author: elena._id,
    content: `Here is the production-grade **Singleton Refresh Promise** pattern. Instead of letting every request refresh independently, you maintain a shared \`refreshPromise\` variable and a subscriber queue:

\`\`\`typescript
let refreshPromise: Promise<string> | null = null;

async function getValidToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
      .then((res) => res.json())
      .then((data) => data.accessToken)
      .finally(() => {
        refreshPromise = null; // Reset singleton once finished
      });
  }
  return refreshPromise;
}
\`\`\`

### Why this works:
1. The **first** request initiates the network call and sets \`refreshPromise\`.
2. Requests 2 through 5 immediately await the **exact same promise** in memory.
3. Once resolved, all 5 pending requests retry with the fresh token simultaneously.
4. Your refresh token rotation security check never detects anomalous duplicate usage!`,
    upvotes: [alex._id, marcus._id],
    upvoteCount: 2,
    isAcceptedSolution: true,
  });

  await DiscussionComment.create({
    discussionId: disc1._id,
    author: marcus._id,
    content: `Used this exact pattern in our microservices gateway last month. If you are using Axios, you can also queue the failed requests in an array and replay them using \`failedQueue.forEach(prom => prom.resolve(token))\`. Great breakdown @elena-code!`,
    upvotes: [alex._id],
    upvoteCount: 1,
    isAcceptedSolution: false,
  });

  disc1.acceptedCommentId = comment1._id;
  await disc1.save();

  // 2. Showcase Discussion
  await Discussion.create({
    author: elena._id,
    title: "Showcase: Finished the Real-Time Collaboration Engine with WebSockets & Optimistic State!",
    content: `Just wrapped up all 5 phases of the Real-Time Collaboration workspace on BuildScape! 🚀

### Key Architecture Wins:
- **Zero-Latency Drawing:** Implemented client-side optimistic updates using HTML5 Canvas with cubic bezier smoothing.
- **Heartbeat & Reconnect Protocol:** Auto-reconnect with exponential backoff and connection state indicator.
- **Room State Synchronization:** Powered by Node.js WebSocket cluster with Redis Pub/Sub adapter across instances.

Here is how our room broadcast loop looks:
\`\`\`typescript
export function broadcastToRoom(roomId: string, event: CollaborationEvent, excludeSocketId?: string) {
  const clients = roomSockets.get(roomId);
  if (!clients) return;

  const payload = JSON.stringify(event);
  for (const client of clients) {
    if (client.id !== excludeSocketId && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
\`\`\`

Tested with 50 concurrent tabs open and frame rates remained locked at 60 FPS. Huge thanks to the phase-by-phase blueprints!`,
    category: "showcase",
    projectSlug,
    projectTitle,
    upvotes: [alex._id, marcus._id],
    upvoteCount: 5,
    replyCount: 1,
    views: 289,
    isResolved: false,
  });

  // 3. Architecture Discussion
  await Discussion.create({
    author: marcus._id,
    title: "Redis Pub/Sub vs Redis Streams: When should you transition for message processing?",
    content: `I often see teams use standard Redis \`PUBLISH\` / \`SUBSCRIBE\` for asynchronous tasks, only to hit reliability walls when a consumer temporarily disconnects.

### Redis Pub/Sub (Fire-and-Forget):
- **Pros:** Ultra lightweight, instantaneous delivery, zero persistence overhead.
- **Cons:** If consumer is restarting, messages are permanently lost. No acknowledgement (ACK) mechanism.

### Redis Streams (Append-Only Log):
- **Pros:** Consumer groups, Pel (Pending Entries List), automatic acknowledgment (\`XACK\`), replayability from offset.
- **Cons:** Requires explicit retention trimming (\`MAXLEN\`) to avoid memory bloat.

**Recommendation:** If losing a packet is acceptable (e.g., live cursor position updates on a canvas), use Pub/Sub. If you are processing emails, financial updates, or background jobs, always use Redis Streams or BullMQ.`,
    category: "architecture",
    upvotes: [alex._id, elena._id],
    upvoteCount: 8,
    replyCount: 0,
    views: 310,
    isResolved: false,
  });

  // 4. Practical Tip
  await Discussion.create({
    author: alex._id,
    title: "Tip: Local Docker Compose healthchecks for MongoDB Replica Sets without race conditions",
    content: `If your app depends on MongoDB transactions in local development, you need MongoDB running as a single-node replica set (\`rs0\`).

The common problem is that the app container boots up before the replica set initiates, causing transaction errors.

Here is the bulletproof \`docker-compose.yml\` healthcheck snippet:

\`\`\`yaml
services:
  mongo:
    image: mongo:7.0
    command: ["--replSet", "rs0", "--bind_ip_all"]
    healthcheck:
      test: ["CMD-SHELL", "mongosh --eval 'try { rs.status().ok } catch(e) { rs.initiate({_id:\"rs0\",members:[{_id:0,host:\"localhost:27017\"}]}).ok }' --quiet"]
      interval: 3s
      timeout: 3s
      retries: 10
      start_period: 2s
\`\`\`

Now your backend container can simply declare:
\`\`\`yaml
depends_on:
  mongo:
    condition: service_healthy
\`\`\`
No more startup race conditions!`,
    category: "tip",
    upvotes: [elena._id, marcus._id],
    upvoteCount: 6,
    replyCount: 0,
    views: 195,
    isResolved: false,
  });

  console.log("✅ Seeded initial high-quality discussions and comments successfully!");
  await mongoose.disconnect();
}

seedDiscussions().catch((err) => {
  console.error("❌ Seed discussions failed:", err);
  process.exit(1);
});

