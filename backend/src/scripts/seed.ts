import "dotenv/config";
import mongoose from "mongoose";
import { Project } from "../models/Project";
import fs from "fs";
import path from "path";

function normalizeDifficulty(d: string): "Beginner" | "Intermediate" | "Advanced" {
  if (d === "Entry" || d === "Basic") return "Beginner";
  if (d === "Expert") return "Advanced";
  if (d === "Beginner" || d === "Intermediate" || d === "Advanced") return d;
  return "Beginner";
}

function normalizeCategory(c: string): "Frontend" | "Backend" | "Full-Stack" | "AI" | "Systems" {
  if (c === "Tooling" || c === "Systems/CLI" || c === "Systems") return "Systems";
  if (c === "Frontend" || c === "Backend" || c === "Full-Stack" || c === "AI") return c;
  return "Backend";
}

function extractSummary(phaseContent: string): string {
  // Look for ### Phase overview section
  const match = phaseContent.match(/###\s+Phase overview\s*\n+([\s\S]*?)(?=\n+###|\n+---|\n+# Phase|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  // Fallback: first non-empty non-heading paragraph
  const lines = phaseContent.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith("#") && !t.startsWith(">") && !t.startsWith("```") && !t.startsWith("---")) {
      return t;
    }
  }
  return "";
}

function extractTasks(phaseContent: string): { id: string; title: string }[] {
  const tasks: { id: string; title: string }[] = [];
  // Match ### Task N.M: Title or #### Task N.M: Title
  const taskRegex = /#{3,4}\s+Task\s+(\d+)\.(\d+):\s*(.+)/g;
  let m: RegExpExecArray | null;
  while ((m = taskRegex.exec(phaseContent)) !== null) {
    tasks.push({
      id: `task-${m[1]}-${m[2]}`,
      title: m[3].trim(),
    });
  }
  return tasks;
}

function extractEstimatedMinutes(phaseContent: string): number | undefined {
  // Match "> **Time:** about X hours" or "X minutes"
  const hoursMatch = phaseContent.match(/\*\*Time:\*\*\s+about\s+([\d.]+)\s+hour/i);
  if (hoursMatch) return Math.round(parseFloat(hoursMatch[1]) * 60);
  const minsMatch = phaseContent.match(/\*\*Time:\*\*\s+about\s+([\d.]+)\s+minute/i);
  if (minsMatch) return Math.round(parseFloat(minsMatch[1]));
  return undefined;
}

function parseReadme(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");

  // 1. Extract metadata JSON block
  const jsonStart = raw.indexOf("```json\n");
  if (jsonStart === -1) throw new Error(`No JSON block found in ${filePath}`);
  const jsonContentStart = jsonStart + "```json\n".length;
  const jsonEnd = raw.indexOf("\n```", jsonContentStart);
  if (jsonEnd === -1) throw new Error(`Unclosed JSON block in ${filePath}`);
  const meta = JSON.parse(raw.slice(jsonContentStart, jsonEnd).trim());

  // Normalize difficulty and category
  meta.difficulty = normalizeDifficulty(meta.difficulty);
  meta.category = normalizeCategory(meta.category);

  // 2. Find where JSON block ends and phases start
  const jsonBlockEnd = jsonEnd + "\n```".length;
  const firstPhaseMatch = raw.match(/^# Phase \d+:/m);
  const firstPhaseIndex = firstPhaseMatch ? raw.indexOf(firstPhaseMatch[0]) : raw.length;

  // 3. Description: text between JSON block end and first phase
  const descriptionRaw = raw.slice(jsonBlockEnd, firstPhaseIndex).trim();
  // Remove leading --- and ## About this project header
  const description = descriptionRaw
    .replace(/^---\s*\n/m, "")
    .replace(/^##\s+About this project\s*\n/m, "")
    .trim();

  // 4. Split into phases by "# Phase N: Title"
  const phaseSplitRegex = /^(# Phase \d+:.*)$/gm;
  const phaseHeaders: { title: string; index: number }[] = [];
  let pm: RegExpExecArray | null;
  while ((pm = phaseSplitRegex.exec(raw)) !== null) {
    phaseHeaders.push({ title: pm[1], index: pm.index });
  }

  const phases = phaseHeaders.map((header, i) => {
    const start = header.index;
    const end = i + 1 < phaseHeaders.length ? phaseHeaders[i + 1].index : raw.length;
    const content = raw.slice(start, end).trim();

    // Extract phase number and title from "# Phase N: Title"
    const headerMatch = header.title.match(/# Phase (\d+):\s*(.+)/);
    const orderIndex = headerMatch ? parseInt(headerMatch[1], 10) : i + 1;
    const title = headerMatch ? headerMatch[2].trim() : header.title;

    return {
      id: `phase-${orderIndex}`,
      orderIndex,
      title,
      summary: extractSummary(content),
      tasks: extractTasks(content),
      estimatedMinutes: extractEstimatedMinutes(content),
      content,
    };
  });

  return {
    slug: meta.slug,
    title: meta.title,
    tagline: meta.tagline,
    category: meta.category,
    track: meta.track,
    difficulty: meta.difficulty,
    estimatedHours: meta.estimatedHours,
    techStack: meta.techStack ?? [],
    prerequisites: meta.prerequisites ?? [],
    whatYouWillLearn: meta.whatYouWillLearn ?? [],
    deliverable: meta.deliverable ?? "",
    isPublished: true,
    description,
    phases,
  };
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Clear all existing projects
  const deleted = await Project.deleteMany({});
  console.log(`🗑  Deleted ${deleted.deletedCount} existing projects\n`);

  const dataDir = path.resolve(__dirname, "../../data");
  const readmeFiles = Array.from({ length: 7 }, (_, i) =>
    path.join(dataDir, `README_${i + 1}.md`)
  );

  let seeded = 0;
  for (const filePath of readmeFiles) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found, skipping: ${filePath}`);
      continue;
    }
    try {
      const projectData = parseReadme(filePath);
      await Project.create(projectData);
      console.log(`  ✔ [${projectData.category}] ${projectData.title} — ${projectData.phases.length} phases, ${projectData.phases.reduce((s, p) => s + p.tasks.length, 0)} tasks`);
      seeded++;
    } catch (err) {
      console.error(`  ❌ Failed to seed ${path.basename(filePath)}:`, err);
    }
  }

  console.log(`\n✅ Seeded ${seeded}/7 projects successfully`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
