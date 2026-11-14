"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  const handleLogout = async () => {
    setLogoutError(false);
    try {
      await logout();
    } catch {
      setLogoutError(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        isScrolled
          ? "border-white/[0.08] bg-[#050507]/90 backdrop-blur-md shadow-2xl shadow-black/80"
          : "border-transparent bg-[#050507]/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Right side navigation & user actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/projects"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:bg-white/[0.05]"
          >
            Projects
          </Link>

          <Link
            href="/roadmaps"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:bg-white/[0.05]"
          >
            Roadmaps
          </Link>

          <Link
            href="/showcases"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:bg-white/[0.05]"
          >
            Showcase
          </Link>

          <Link
            href="/blog"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:bg-white/[0.05]"
          >
            Blog
          </Link>

          <Link
            href="/discussions"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:bg-white/[0.05]"
          >
            Discussions
          </Link>

          {user && (
            <Link
              href="/profile"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:bg-white/[0.05]"
            >
              My Workspace
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-neutral-200 transition-colors hover:border-white/20 hover:text-white"
            >
              Admin Portal
            </Link>
          )}

          {isLoading ? (
            <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-800" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 transition-all hover:border-white/20 hover:bg-white/[0.08]"
                title="View your profile & dashboard"
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={18}
                    height={18}
                    className="rounded-full border border-neutral-700"
                  />
                ) : (
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[0.6rem] font-bold text-black">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-neutral-200 max-w-24 truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>

              {/* Logout button */}
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-neutral-400 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                title="Sign out"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-200 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              Sign In
            </Link>
          )}
          {logoutError && (
            <span role="alert" className="text-[10px] text-rose-400">
              Could not log out. Try again.
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
