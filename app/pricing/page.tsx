"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  const faqs = [
    { q: "Is there a limit on how many friends I can add?", a: "No! Even on our Free Plan, you can invite as many registered users into your trip groups as you like." },
    { q: "How do I mark payments as verified?", a: "When a member claims they paid by clicking 'Mark as Settled', the Group Leader receives an alert. The leader can verify the settlement after reviewing their bank account or cash receipt." },
    { q: "Can I use multiple currencies?", a: "Yes, our Pro and Enterprise tiers support automatic currency conversions and multi-currency tracking." },
    { q: "Is my payment information safe?", a: "Absolutely. We do not store or process bank credentials directly. TripSplit is an ledger-auditing SaaS for logging and math verification." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <div className="ambient-glow -left-30 top-10" />
      <div className="ambient-glow right-0 bottom-10" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-1">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Flexible Pricing for <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Every Journey</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-xs sm:text-sm mb-8">
          Whether you are backpacking across Europe, sharing a house, or organizing an corporate retreat, choose a plan that matches your needs.
        </p>

        {/* Toggle selector */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-emerald-400" : "text-slate-400"}`}>Monthly billing</span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
            className="w-12 h-6 bg-slate-900 border border-slate-700/50 rounded-full p-1 relative transition duration-300"
          >
            <div className={`w-4 h-4 bg-emerald-400 rounded-full transition-all duration-300 ${billingPeriod === "annually" ? "translate-x-6" : ""}`} />
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 ${billingPeriod === "annually" ? "text-emerald-400" : "text-slate-400"}`}>
            Annually <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full">Save 20%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20 text-left">
          {/* Free */}
          <div className="glass-panel p-6 border-slate-800 bg-slate-900/10">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">Free Plan</h3>
            <p className="text-3xl font-extrabold text-slate-100 mb-2">$0</p>
            <p className="text-[10px] text-slate-500 mb-6">Perfect for small occasional outings.</p>
            <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Up to 3 active groups</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Unlimited expenses entry</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Equal split calculations</li>
              <li className="flex items-center gap-2 opacity-35"><CheckCircle2 size={13} className="text-slate-500" /> Custom splitting percentages</li>
              <li className="flex items-center gap-2 opacity-35"><CheckCircle2 size={13} className="text-slate-500" /> Printed PDF expense summaries</li>
            </ul>
            <Link href="/register" className="block w-full py-2.5 text-center text-xs font-bold text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl hover:bg-emerald-500/5 transition">
              Start Free
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-panel p-6 border-emerald-500/30 bg-gradient-to-tr from-emerald-950/10 to-teal-900/10 relative shadow-2xl shadow-emerald-500/5">
            <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Best Deal
            </div>
            <h3 className="font-bold text-xs uppercase text-emerald-400 tracking-wider mb-2">Pro Splitting</h3>
            <p className="text-3xl font-extrabold text-slate-100 mb-2">
              {billingPeriod === "monthly" ? "$4.99" : "$3.99"}
              <span className="text-xs text-slate-500"> / user / mo</span>
            </p>
            <p className="text-[10px] text-slate-500 mb-6">For global nomads and flatshares.</p>
            <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Unlimited active group spaces</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Custom percentage splits</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Exportable audit summaries</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Live settlement notifications</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Ad-free experience</li>
            </ul>
            <Link href="/register" className="block w-full py-2.5 text-center text-xs font-black text-slate-955 bg-gradient-to-r from-emerald-400 to-teal-350 hover:from-emerald-350 hover:to-teal-250 rounded-xl shadow-lg transition">
              Upgrade to Pro
            </Link>
          </div>

          {/* Corporate */}
          <div className="glass-panel p-6 border-slate-800 bg-slate-900/10">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">Enterprise</h3>
            <p className="text-3xl font-extrabold text-slate-100 mb-2">Custom</p>
            <p className="text-[10px] text-slate-500 mb-6">For large events and organizations.</p>
            <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Single Sign-On (SSO) integration</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Custom category parameters</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Unlimited nested admins accounts</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Dedicated account support</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Custom Service-Level Agreement (SLA)</li>
            </ul>
            <Link href="/register" className="block w-full py-2.5 text-center text-xs font-bold text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl hover:bg-emerald-500/5 transition">
              Get in Touch
            </Link>
          </div>
        </div>

        {/* FAQs Accordion Grid */}
        <div className="max-w-3xl mx-auto text-left">
          <h2 className="text-2xl font-extrabold text-center mb-10">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-panel p-5 border-slate-800/80 bg-slate-900/10">
                <h4 className="font-bold text-xs text-slate-200 mb-2">{faq.q}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950 relative z-10">
        TripSplit © 2026 | Built with Tailwind & Next.js 15
      </footer>
    </div>
  );
}
