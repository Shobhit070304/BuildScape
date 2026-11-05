const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProjectInput } = require("../dist/services/projectValidation");

function project(difficulty = "Beginner") {
  return {
    slug: "sample-project",
    title: "Sample project",
    tagline: "A project used to check validation.",
    track: "Backend Engineering",
    difficulty,
    estimatedHours: 10,
    techStack: ["Node.js"],
    phases: [{ id: "phase-1", orderIndex: 1, title: "Setup", content: "Create the project." }],
  };
}

test("accepts each supported difficulty", () => {
  for (const level of ["Beginner", "Intermediate", "Advanced"]) {
    assert.doesNotThrow(() => validateProjectInput(project(level)));
  }
});

test("rejects retired difficulty labels", () => {
  for (const level of ["Entry", "Basic", "Expert"]) {
    assert.throws(() => validateProjectInput(project(level)), { statusCode: 400 });
  }
});

test("rejects malformed phase ordering and duplicate phase IDs", () => {
  const outOfOrder = project();
  outOfOrder.phases[0].orderIndex = 2;
  assert.throws(() => validateProjectInput(outOfOrder), { statusCode: 400 });

  const duplicateIds = project();
  duplicateIds.phases.push({ ...duplicateIds.phases[0], orderIndex: 2 });
  assert.throws(() => validateProjectInput(duplicateIds), { statusCode: 400 });
});

test("rejects whitespace-padded slugs and phase IDs", () => {
  const paddedSlug = project();
  paddedSlug.slug = " sample-project ";
  assert.throws(() => validateProjectInput(paddedSlug), { statusCode: 400 });

  const paddedPhaseId = project();
  paddedPhaseId.phases[0].id = " phase-1 ";
  assert.throws(() => validateProjectInput(paddedPhaseId), { statusCode: 400 });
});
