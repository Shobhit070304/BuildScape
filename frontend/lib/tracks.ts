export interface TrackMetadata {
  slug: string;
  name: string;
  shortDescription: string; // 20-30 words
  helpfulInfo: {
    recommendedTooling: string[];
    coreLibraries: string[];
    keyPatterns: string[];
    quickTip: string;
  };
}

export const TRACKS_DATA: Record<string, TrackMetadata> = {
  golang: {
    slug: "golang",
    name: "Golang",
    shortDescription:
      "Build high-throughput distributed systems, low-latency concurrent services, and memory-safe networking tools using Go's lightweight goroutines, standard library primitives, and minimal framework overhead.",
    helpfulInfo: {
      recommendedTooling: ["Go 1.23+", "Air (Hot Reload)", "Delve Debugger", "Docker Engine"],
      coreLibraries: ["Chi / Gin Router", "pgx / GORM", "go-redis", "Testify"],
      keyPatterns: ["Clean Architecture", "Repository Pattern", "Worker Pool Concurrency", "Graceful Shutdown"],
      quickTip: "Keep interfaces small and define them on the consumer side, not the provider side.",
    },
  },
  typescript: {
    slug: "typescript",
    name: "TypeScript",
    shortDescription:
      "Architect end-to-end type-safe web applications, scalable client architectures, and distributed backend services leveraging modern TypeScript compiler features, runtime schemas, and reactive state engines.",
    helpfulInfo: {
      recommendedTooling: ["Node.js 22+ / Bun", "pnpm", "ESLint + Prettier", "PostgreSQL"],
      coreLibraries: ["Zod", "Prisma / Drizzle", "Express / Fastify", "TanStack Query"],
      keyPatterns: ["Discriminated Unions", "Domain-Driven Design", "Repository Pattern", "Schema Validation"],
      quickTip: "Avoid using 'any'; prefer 'unknown' combined with Zod schema parsing at system boundaries.",
    },
  },
  python: {
    slug: "python",
    name: "Python",
    shortDescription:
      "Develop asynchronous REST and streaming microservices, intelligent backend agents, and scalable data pipelines utilizing modern async/await runtimes, Pydantic data validation, and FastAPI architectures.",
    helpfulInfo: {
      recommendedTooling: ["Python 3.12+", "Uvicorn", "Poetry / uv", "Redis CLI"],
      coreLibraries: ["FastAPI", "Pydantic v2", "SQLAlchemy 2.0 (Async)", "Celery"],
      keyPatterns: ["Dependency Injection", "Asynchronous Event Loops", "DTO Pattern", "Background Task Queues"],
      quickTip: "Leverage Pydantic v2 model validation for automatic deserialization and OpenAPI docs.",
    },
  },
  "spring-boot": {
    slug: "spring-boot",
    name: "Spring Boot",
    shortDescription:
      "Engineer enterprise-grade Java backends, event-driven microservices, and secure transaction systems utilizing the robust Spring ecosystem, Hibernate ORM, and resilient cloud integration patterns.",
    helpfulInfo: {
      recommendedTooling: ["JDK 21 LTS", "Maven / Gradle", "Spring Boot CLI", "Docker Compose"],
      coreLibraries: ["Spring Data JPA", "Spring Security", "Lombok", "Flyway"],
      keyPatterns: ["Layered Service Architecture", "Inversion of Control", "CQRS", "Transactional Outbox"],
      quickTip: "Use constructor-based dependency injection and prefer Records for immutable DTOs.",
    },
  },
  rust: {
    slug: "rust",
    name: "Rust",
    shortDescription:
      "Craft blazingly fast systems with zero-cost abstractions, fearless concurrency, and guaranteed memory safety without garbage collection for high-performance network utilities and engines.",
    helpfulInfo: {
      recommendedTooling: ["Rust 1.80+", "Cargo", "Rust Analyzer", "Clippy"],
      coreLibraries: ["Tokio Async Runtime", "Axum / Actix-web", "Serde", "SQLx"],
      keyPatterns: ["RAII & Ownership", "Type-State Pattern", "Error Propagation with Result<T, E>", "Async Channels"],
      quickTip: "Embrace the compiler's borrow checker; let ownership flow naturally without cloning unnecessarily.",
    },
  },
  react: {
    slug: "react",
    name: "React",
    shortDescription:
      "Construct high-performance reactive web interfaces, modular UI component design systems, and client-side state architectures with modern React primitives, hooks, and seamless TypeScript integration.",
    helpfulInfo: {
      recommendedTooling: ["Next.js / Vite", "Tailwind CSS v4", "React DevTools", "Chrome DevTools"],
      coreLibraries: ["Lucide Icons", "Tailwind Merge", "Zustand", "Radix UI Primitives"],
      keyPatterns: ["Compound Components", "Custom Hook Encapsulation", "State Lifting", "Server vs Client Split"],
      quickTip: "Derive state during render whenever possible instead of synchronizing duplicate state in effects.",
    },
  },
};

export function normalizeTrackSlug(trackName: string): string {
  const clean = trackName.toLowerCase().trim();
  if (clean === "spring boot" || clean === "springboot") return "spring-boot";
  if (clean === "go" || clean === "golang") return "golang";
  return clean;
}

export function getTrackBySlug(slug: string): TrackMetadata | undefined {
  const norm = normalizeTrackSlug(slug);
  return TRACKS_DATA[norm];
}
