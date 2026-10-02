"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layers, LogOut, AlertCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, isLoading, login, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        isScrolled
          ? "border-[#201d18] bg-[#0a0a0a]/80 backdrop-blur-md shadow-sm shadow-black/50"
          : "border-transparent bg-[#0a0a0a]/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-11 sm:h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="BuildScape home"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded border border-[#3a3226] bg-[#161411] shadow-xs">
            <Layers className="h-3 w-3 text-[#c9a96e]" />
          </div>
          <span className="font-serif text-sm font-bold tracking-tight text-[#e4ddd3]">
            BuildScape
          </span>
        </Link>

        {/* Right side navigation & user actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/projects"
            className="rounded px-2 py-1 text-xs text-[#a0978c] transition-colors hover:text-[#e4ddd3] hover:bg-[#161411]"
          >
            Projects
          </Link>

          {user && (
            <Link
              href="/profile"
              className="rounded px-2 py-1 text-xs text-[#a0978c] transition-colors hover:text-[#e4ddd3] hover:bg-[#161411]"
            >
              Profile
            </Link>
          )}

          {isLoading ? (
            <div className="h-5 w-14 animate-pulse rounded bg-stone-900" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-full border border-[#2a2620] bg-[#14120f] px-2.5 py-0.5 transition-colors hover:border-[#3a342c]"
                title="View your profile"
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={16}
                    height={16}
                    className="rounded-full border border-[#3a342c]"
                  />
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-amber-800/40 bg-amber-950/50 text-[0.55rem] font-bold text-amber-300">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] font-medium text-[#d4cbbd] max-w-[80px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center gap-1 rounded border border-[#2a2620] bg-[#14120f] px-2 py-0.5 text-[11px] font-medium text-[#a0978c] transition-all hover:border-[#3a342c] hover:bg-[#1c1915] hover:text-[#e4ddd3] cursor-pointer"
                title="Log out of your account"
              >
                <LogOut className="h-2.5 w-2.5 text-[#7a7168]" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <div className="scale-[0.8] origin-right">
                <GoogleLogin
                  onSuccess={(res) => {
                    setLoginError(false);
                    if (res.credential) login(res.credential);
                  }}
                  onError={() => setLoginError(true)}
                  size="medium"
                  shape="pill"
                  theme="filled_black"
                  text="signin_with"
                />
              </div>
              {loginError && (
                <span className="flex items-center gap-1 text-[10px] text-rose-400">
                  <AlertCircle className="h-2.5 w-2.5" />
                  Sign-in failed. Please try again.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
