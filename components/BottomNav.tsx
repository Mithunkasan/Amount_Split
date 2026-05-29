"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutDashboard, PlusCircle } from "lucide-react";
import { useStore } from "@/hooks/useStore";

export default function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeUser = mounted ? currentUser : null;

  // Render bottom nav only if user is logged in
  if (!activeUser) {
    return null;
  }

  const tabs = [
    {
      name: "Explore",
      href: "/",
      icon: Compass,
    },
    {
      name: "My Trips",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Create Trip",
      href: "/dashboard/create-trip",
      icon: PlusCircle,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    if (href === "/dashboard") {
      return pathname === href || (pathname.startsWith("/trip") && !pathname.includes("create-trip"));
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-lg border-t border-rose-500/10 px-6 py-2 flex items-center justify-between shadow-2xl safe-bottom">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center py-1 gap-1 relative group cursor-pointer"
          >
            {/* Glowing Active Ring background */}
            {active && (
              <span className="absolute -top-2 w-10 h-1 bg-gradient-to-r from-rose-500 to-teal-400 rounded-full shadow-lg shadow-rose-500/50 animate-fade-in" />
            )}
            
            <div
              className={`p-1 rounded-xl transition duration-150 flex items-center justify-center
                ${active 
                  ? "text-rose-400 scale-105" 
                  : "text-slate-500 group-hover:text-slate-350"
                }
              `}
            >
              <Icon size={18} />
            </div>
            
            <span
              className={`text-[9px] font-extrabold uppercase tracking-widest transition duration-150
                ${active 
                  ? "text-slate-200" 
                  : "text-slate-500 group-hover:text-slate-450"
                }
              `}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
