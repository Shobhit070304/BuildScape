"use client";

import Link from "next/link";
import Image from "next/image";
import { Layers, LogOut } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, isLoading, login, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90" aria-label="BuildScape home">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-700/50 bg-amber-950/40 shadow-sm">
            <Layers className="h-4 w-4 text-[#c9a96e]" />
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-[#e4ddd3]">
            BuildScape
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="rounded-md px-3.5 py-1.5 text-xs text-[#8a8178] transition-colors hover:text-[#e4ddd3]"
          >
            Projects
          </Link>

          {isLoading ? (
            <div className="h-7 w-20 animate-pulse rounded-md bg-[#1a1a1a]" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={28}
                  height={28}
                  className="rounded-full border border-[#2a2a2a]"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-950/50 border border-amber-800/40 text-[0.65rem] font-bold text-[#c9a96e]">
                  {user.name[0].toUpperCase()}
                </div>
              )}
              <span className="hidden text-xs text-[#8a8178] sm:block">
                {user.name.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                title="Sign out"
                className="flex items-center rounded-md p-1.5 text-[#4a4540] transition-colors hover:text-[#e4ddd3]"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="scale-[0.85] origin-right">
              <GoogleLogin
                onSuccess={(res) => {
                  if (res.credential) login(res.credential);
                }}
                onError={() => console.error("Google login failed")}
                size="medium"
                shape="rectangular"
                theme="filled_black"
                text="signin_with"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

