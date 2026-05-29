"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string | number;
    type: "positive" | "negative" | "neutral";
  };
  color?: "emerald" | "amber" | "rose" | "blue" | "indigo" | "pink";
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "pink"
}: StatsCardProps) {
  
  const colorStyles = {
    emerald: {
      bgGlow: "from-pink-500/10 to-pink-450/5",
      border: "border-pink-500/15 hover:border-pink-500/30",
      iconBg: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
      text: "text-pink-400"
    },
    pink: {
      bgGlow: "from-pink-500/10 to-pink-450/5",
      border: "border-pink-500/15 hover:border-pink-500/30",
      iconBg: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
      text: "text-pink-400"
    },
    amber: {
      bgGlow: "from-amber-500/10 to-amber-400/5",
      border: "border-amber-500/15 hover:border-amber-500/30",
      iconBg: "bg-amber-500/10 text-amber-450 border border-amber-500/20",
      text: "text-amber-455"
    },
    rose: {
      bgGlow: "from-rose-500/10 to-rose-400/5",
      border: "border-rose-500/15 hover:border-rose-500/30",
      iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      text: "text-rose-455"
    },
    blue: {
      bgGlow: "from-blue-500/10 to-blue-400/5",
      border: "border-blue-500/15 hover:border-blue-500/30",
      iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      text: "text-blue-400"
    },
    indigo: {
      bgGlow: "from-indigo-500/10 to-indigo-400/5",
      border: "border-indigo-500/15 hover:border-indigo-500/30",
      iconBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
      text: "text-indigo-400"
    }
  };

  const style = colorStyles[color];

  return (
    <div className={`glass-panel p-5 bg-gradient-to-br ${style.bgGlow} ${style.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-950/20 group relative overflow-hidden text-left`}>
      {/* Decorative ambient orb inside card */}
      <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-pink-500/5 filter blur-xl group-hover:bg-pink-500/10 transition-colors" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${style.iconBg} shadow-inner transition-transform group-hover:scale-110`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mb-2">
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 bg-gradient-to-r from-slate-100 to-slate-355 bg-clip-text text-transparent">
          {value}
        </h3>
      </div>

      <div className="flex items-center gap-1.5 min-h-[16px]">
        {trend && (
          <span className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md gap-0.5
            ${trend.type === "positive" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : ""}
            ${trend.type === "negative" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : ""}
            ${trend.type === "neutral" ? "bg-slate-500/10 text-slate-400 border border-slate-500/20" : ""}
          `}>
            {trend.type === "positive" && <ArrowUpRight size={12} />}
            {trend.type === "negative" && <ArrowDownRight size={12} />}
            {trend.type === "neutral" && <Minus size={12} />}
            {trend.value}
          </span>
        )}
        {description && (
          <span className="text-[11px] font-medium text-slate-400">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
