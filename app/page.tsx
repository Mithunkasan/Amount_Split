"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, ArrowRight, DollarSign, Users, Shield, MessageCircle } from "lucide-react";
import { useStore } from "@/hooks/useStore";

export default function LandingPage() {
  const { currentUser, fetchFromDb } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchFromDb();
  }, [fetchFromDb]);

  const activeUser = mounted ? currentUser : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Glow Orbs */}
      <div className="ambient-glow -left-40 top-20 opacity-60" />
      <div className="ambient-glow right-0 bottom-10 opacity-40" />

      {/* Header Navbar (for landing page) */}
      <header className="sticky top-0 z-50 w-full glass-panel !rounded-none !border-t-0 !border-x-0 border-b border-rose-500/10 bg-slate-950/80 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-rose-500 to-teal-400 p-2 rounded-xl text-slate-955 shadow-lg group-hover:scale-105 transition duration-200">
            <Compass className="animate-spin-slow" size={20} />
          </div>
          <span className="font-black text-lg tracking-tight bg-gradient-to-r from-rose-400 to-teal-400 bg-clip-text text-transparent">
            TripSplit
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {activeUser ? (
            <Link 
              href="/dashboard"
              className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 rounded-xl shadow-lg transition flex items-center gap-1"
            >
              Go to Dashboard <ArrowRight size={13} />
            </Link>
          ) : (
            <>
              <Link 
                href="/login"
                className="px-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-350 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition"
              >
                Log In
              </Link>
              <Link 
                href="/register"
                className="hidden sm:inline-block px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 rounded-xl shadow-lg transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/25 rounded-full text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <MessageCircle size={11} /> Mobile-First WhatsApp splits
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none text-slate-100">
            Share Trip Costs,<br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-500 to-teal-400 bg-clip-text text-transparent">
              Zero Headache.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The next-generation expense splitter built for adventurers and group travels. Invite friends directly via WhatsApp and let our live greedy algorithm simplify debts instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={activeUser ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 rounded-2xl shadow-xl shadow-rose-500/10 transition flex items-center justify-center gap-2 hover:scale-102"
            >
              Create Your First Trip <ArrowRight size={15} />
            </Link>
            {!activeUser && (
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl transition"
              >
                Log In to Account
              </Link>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-28 w-full text-left animate-slide-up" style={{ animationDelay: "150ms" }}>
          
          {/* Card 1 */}
          <div className="glass-panel p-6 border-rose-500/15 bg-slate-900/10 flex flex-col justify-between h-56 hover:border-rose-500/30 transition-all duration-300">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit border border-rose-500/20">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-200 text-sm mb-1.5">WhatsApp Mobile Invites</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add friends via their phone numbers. They receive a custom link directly on WhatsApp to jump right into the action.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 border-teal-500/15 bg-slate-900/10 flex flex-col justify-between h-56 hover:border-teal-500/30 transition-all duration-300">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl w-fit border border-teal-500/20">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-200 text-sm mb-1.5">1-Second Passwordless Join</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                No complex forms! Other members simply enter their name on the invitation page to join the trip instantly.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 border-rose-500/15 bg-slate-900/10 flex flex-col justify-between h-56 hover:border-rose-500/30 transition-all duration-300">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit border border-rose-500/20">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-200 text-sm mb-1.5">Smart Greedy Equal Split</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Advanced live calculations resolve all debts into the absolute minimum number of transactions. Live budgets and histories.
              </p>
            </div>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-[10px] text-slate-500 relative z-10 border-t border-slate-900 max-w-6xl mx-auto w-full">
        &copy; 2026 TripSplit Inc. • Secure group splits made simple.
      </footer>
    </div>
  );
}
