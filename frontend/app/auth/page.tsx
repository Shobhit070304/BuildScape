import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginContent } from "@/app/login/LoginContent";

export const metadata: Metadata = {
  title: "Authenticate — BuildScape | Build Real Production Software",
  description:
    "Sign in to BuildScape with Google to access your interactive system engineering workspaces, guided roadmaps, and verified proof-of-work portfolio.",
  alternates: {
    canonical: "/auth",
  },
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-[#050507]">
          <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-mono">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Loading BuildScape authentication...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
