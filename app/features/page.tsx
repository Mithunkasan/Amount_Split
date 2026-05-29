"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Zap, ShieldCheck, Compass, PieChart, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

export default function FeaturesPage() {
  const steps = [
    {
      num: "01",
      title: "Create a Trip Group",
      desc: "Group Leaders create trip instances (e.g. 'EuroTrip 2026') and add registered users instantly.",
      icon: Compass
    },
    {
      num: "02",
      title: "Log Expenses & Choose Split",
      desc: "Log cost, category, description, and decide: split equally, custom amounts, or percentages.",
      icon: Zap
    },
    {
      num: "03",
      title: "Settle and Verify Debts",
      desc: "Members tap 'Mark as Settled'. Leaders review payments and verify to clear outstanding balances.",
      icon: ShieldCheck
    },
    {
      num: "04",
      title: "Monitor Category Analytics",
      desc: "Admins and members access high-fidelity charts detailing top categories, spending timelines, and platform fees.",
      icon: PieChart
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <div className="ambient-glow -left-30 top-10" />
      <div className="ambient-glow right-0 bottom-10" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-1">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Engineered for <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Frictionless splitting</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-xs sm:text-sm mb-16">
          Say goodbye to complex math and awkward conversations. TripSplit is built on three cornerstones: transparent logging, leader accountability, and swift settlements.
        </p>

        {/* Dynamic Workflow Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20 text-left">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="glass-panel p-5 border-slate-800 bg-slate-900/10 hover:border-emerald-500/20 transition relative">
                <div className="absolute top-3 right-4 font-black text-2xl text-emerald-500/10 select-none">
                  {s.num}
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl w-fit mb-4">
                  <Icon size={16} />
                </div>
                <h4 className="font-bold text-sm text-slate-200 mb-2">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                
                {idx < 3 && (
                  <ChevronRight size={18} className="hidden md:block absolute top-[45%] -right-5 text-emerald-500/30" />
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Feature comparison table */}
        <div className="max-w-2xl mx-auto glass-panel p-6 border-slate-800/80 shadow-xl mb-16 text-left">
          <h3 className="font-extrabold text-sm text-slate-200 mb-6 text-center">Standard vs Pro Features</h3>
          
          <div className="space-y-4">
            {[
              { f: "Equal debt splitting", std: true, pro: true },
              { f: "Unlimited active expenses", std: true, pro: true },
              { f: "Role-based authorization dashboards", std: true, pro: true },
              { f: "Custom percent allocations", std: false, pro: true },
              { f: "PDF & printed audit summaries", std: false, pro: true },
              { f: "Admin control & global group deletion", std: false, pro: true },
              { f: "Multi-currency tracking", std: false, pro: true }
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                <span className="text-xs text-slate-300">{row.f}</span>
                <div className="flex gap-12 text-xs">
                  <span className={row.std ? "text-emerald-400 font-bold" : "text-slate-600"}>
                    {row.std ? "✓ Yes" : "— No"}
                  </span>
                  <span className="text-emerald-400 font-bold w-12 text-right">
                    ✓ Yes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link 
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
        >
          Try TripSplit Now <ArrowRight size={16} />
        </Link>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 relative z-10 bg-slate-950">
        TripSplit © 2026 | Built with Tailwind & Next.js 15
      </footer>
    </div>
  );
}
