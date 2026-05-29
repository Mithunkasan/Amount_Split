"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Compass, Users, Heart, Award, ArrowRight, Code } from "lucide-react";

export default function AboutPage() {
  const stack = [
    { title: "Next.js 15", desc: "App Router, Server Actions, Client-side caching models." },
    { title: "PostgreSQL", desc: "Production-ready, highly relational database schemas." },
    { title: "Zustand & Context", desc: "Dual offline-in-memory storage + local sync modules." },
    { title: "Tailwind CSS v4", desc: "Modern CSS `@theme` variables and high-performance styles." },
    { title: "Prisma ORM", desc: "Robust data queries, type-safety schemas, migrations." },
    { title: "Recharts", desc: "Adaptive SVG visual data cards, pie structures, and trend lines." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <div className="ambient-glow -left-30 top-10" />
      <div className="ambient-glow right-0 bottom-10" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-1">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Empowering Travel with <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Complete Trust</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-xs sm:text-sm mb-16">
          TripSplit was created to eliminate spreadsheet headaches after travels. We believe sharing memories shouldn't involve debating decimals.
        </p>

        {/* Narrative columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20 text-left">
          <div className="glass-panel p-5 border-slate-800 bg-slate-900/10">
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl w-fit mb-4">
              <Users size={16} />
            </div>
            <h4 className="font-bold text-sm text-slate-200 mb-2">Our Mission</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              To provide a beautiful, seamless, and transparent platform that makes logging, splitting, and settling bills a stress-free experience for groups worldwide.
            </p>
          </div>

          <div className="glass-panel p-5 border-slate-800 bg-slate-900/10">
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl w-fit mb-4">
              <Award size={16} />
            </div>
            <h4 className="font-bold text-sm text-slate-200 mb-2">Accountability</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              With custom roles, Group Leaders take charge of audit verifications, making sure claims match bank checks, while Admin safeguards overall data.
            </p>
          </div>

          <div className="glass-panel p-5 border-slate-800 bg-slate-900/10">
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl w-fit mb-4">
              <Code size={16} />
            </div>
            <h4 className="font-bold text-sm text-slate-200 mb-2">Premium Tech Stack</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Utilizing Next.js 15, PostgreSQL, and Zustand to deliver high-performance visual state management, instant routes, and beautiful dark-mode styles.
            </p>
          </div>
        </div>

        {/* Tech Stack List */}
        <div className="max-w-3xl mx-auto text-left mb-16">
          <h2 className="text-2xl font-extrabold text-center mb-8">Platform Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stack.map((item, index) => (
              <div key={index} className="glass-panel p-4 border-slate-800/80 bg-slate-900/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-200">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold px-2.5 py-1 rounded-lg">
                  Standard
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link 
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition"
        >
          Begin Splitting Today <ArrowRight size={16} />
        </Link>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950 relative z-10">
        TripSplit © 2026 | Built with Tailwind & Next.js 15
      </footer>
    </div>
  );
}
