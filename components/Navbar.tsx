"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  Compass, 
  Users,
  CheckCircle2,
  X,
  LayoutDashboard,
  PlusCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    currentUser, 
    logoutUser,
    notifications,
    markNotificationRead,
    clearNotifications
  } = useStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeUser = mounted ? currentUser : null;

  const unreadCount = notifications.filter(n => !n.read && (activeUser ? n.userId === activeUser.id : false)).length;
  const userNotifications = notifications.filter(n => activeUser ? n.userId === activeUser.id : false);

  const handleLogout = () => {
    setShowMobileMenu(false);
    logoutUser();
    router.push("/");
  };

  // Simplified and clean unified navigation links
  const navLinks = activeUser ? [
    { name: "My Trips", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create Trip", href: "/dashboard/create-trip", icon: PlusCircle }
  ] : [];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-panel !rounded-none !border-t-0 !border-x-0 border-b border-rose-500/10 bg-slate-950/80 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Left side: Logo + Mobile Hamburger + Desktop Links */}
        <div className="flex items-center gap-6">
          {activeUser && (
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-900 text-rose-400 transition cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-rose-500 to-teal-400 p-2 rounded-xl text-slate-950 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="animate-spin-slow" size={20} />
            </div>
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-rose-400 to-teal-400 bg-clip-text text-transparent">
              TripSplit
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {activeUser && (
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition duration-150 relative cursor-pointer flex items-center gap-1.5
                      ${active 
                        ? "text-rose-400 bg-rose-500/10 font-extrabold" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }
                    `}
                  >
                    <link.icon size={13} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeUser ? (
            <>
              {/* NOTIFICATIONS DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 rounded-xl hover:bg-slate-900 text-rose-400 transition duration-200 relative cursor-pointer flex items-center justify-center border border-rose-500/10"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 glass-panel border border-rose-500/20 shadow-2xl p-4 z-50 animate-fade-in text-left bg-slate-950">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="font-extrabold text-xs text-rose-400">Notifications</span>
                      {userNotifications.length > 0 && (
                        <button 
                          onClick={() => clearNotifications(activeUser.id)}
                          className="text-[10px] text-slate-400 hover:text-rose-400 underline font-bold cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {userNotifications.length === 0 ? (
                        <p className="text-[11px] text-slate-500 text-center py-6 font-medium">No notifications yet.</p>
                      ) : (
                        userNotifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-2.5 rounded-xl text-[11px] cursor-pointer transition flex gap-2 border ${notif.read ? 'bg-slate-900/40 border-slate-900 text-slate-500' : 'bg-rose-500/5 border-rose-500/20 text-slate-200 font-semibold'}`}
                          >
                            <div className="mt-0.5 text-rose-500 flex-shrink-0">
                              <CheckCircle2 size={12} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-extrabold text-slate-200">{notif.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed truncate">{notif.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PROFILE MENU */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 transition cursor-pointer border border-rose-500/10"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xs">
                    {activeUser.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-slate-200">
                    {activeUser.name.split(" ")[0]}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-60 glass-panel border border-rose-500/20 shadow-2xl p-4 z-50 animate-fade-in text-left bg-slate-950">
                    <div className="flex items-center gap-2.5 border-b border-slate-850 pb-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xs">
                        {activeUser.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-xs text-slate-200 truncate">{activeUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{activeUser.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-[11px] rounded-lg hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition font-bold"
                      >
                        <LayoutDashboard size={13} /> My Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] rounded-lg hover:bg-rose-500/10 text-slate-300 hover:text-rose-455 transition text-left cursor-pointer font-bold"
                      >
                        <LogOut size={13} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login"
                className="px-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-350 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition cursor-pointer"
              >
                Log In
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 rounded-xl shadow-lg transition cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {activeUser && showMobileMenu && (
        <>
          <div 
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 top-[56px] bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          />

          <nav className="fixed left-0 right-0 top-[56px] bg-slate-950/95 border-b border-rose-500/20 glass-panel !rounded-none z-45 md:hidden animate-slide-up p-5 space-y-4 shadow-xl">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-rose-500/5 to-teal-400/5 border border-rose-500/15 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-black text-sm border border-rose-500/20 shadow-inner">
                {activeUser.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="overflow-hidden">
                <p className="font-extrabold text-xs text-slate-200 truncate">{activeUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeUser.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-2">Main Navigation</p>
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer
                      ${active 
                        ? "bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black shadow-sm" 
                        : "text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent"
                      }
                    `}
                  >
                    <Icon size={15} className={active ? "text-rose-400" : "text-slate-550"} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut size={13} /> Log Out
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
