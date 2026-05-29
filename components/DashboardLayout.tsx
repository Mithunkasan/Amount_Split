"use client";

import React, { useState } from "react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { useStore } from "@/hooks/useStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser, fetchFromDb } = useStore();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    fetchFromDb();
  }, [fetchFromDb]);

  const activeUser = mounted ? currentUser : null;

  // If no user is logged in or component is not mounted, render the simple wrapper
  if (!activeUser) {
    return <div className="min-h-screen bg-theme-bg text-theme-fg transition-colors duration-200">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-fg transition-colors duration-200 flex flex-col relative overflow-x-hidden">
      {/* Background ambient orbs */}
      <div className="ambient-glow -left-40 top-20" />
      <div className="ambient-glow right-0 bottom-10" />

      {/* Unified top navigation */}
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Dynamic page container spans full width with padded bottom to clear mobile navigation */}
        <main className="flex-1 p-4 pb-20 md:p-8 transition-all duration-300 relative z-10 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-slide-up">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sticky bottom navigation bar */}
      <BottomNav />
    </div>
  );
}
