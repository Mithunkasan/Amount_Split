"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Compass, 
  ArrowRight, 
  Users, 
  Calendar, 
  DollarSign, 
  Briefcase,
  AlertCircle,
  PlusCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UnifiedDashboard() {
  const router = useRouter();
  const { 
    currentUser, 
    expenses, 
    groups, 
    groupMembers,
    users,
    getTripSummary
  } = useStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Route protection
  useEffect(() => {
    if (mounted && !currentUser) {
      router.push("/login");
    }
  }, [mounted, currentUser, router]);

  if (!mounted || !currentUser) {
    return null;
  }

  // 1. Filter trips where current user is a member
  const myMemberships = groupMembers.filter((m) => m.userId === currentUser.id);
  const myGroupIdList = myMemberships.map((m) => m.groupId);
  const myGroups = groups.filter((g) => myGroupIdList.includes(g.id) || g.leaderId === currentUser.id);

  // 2. Aggregate stats across all my trips
  let aggregatedTotalSpent = 0;
  let aggregatedBudget = 0;
  let outstandingOwed = 0;
  let outstandingOwe = 0;

  myGroups.forEach((group) => {
    const summary = getTripSummary(group.id);
    aggregatedTotalSpent += summary.totalSpent;
    aggregatedBudget += group.budget || 0;
    
    const myNet = summary.memberBalances.find(m => m.userId === currentUser.id)?.net || 0;
    if (myNet > 0) {
      outstandingOwed += myNet;
    } else if (myNet < 0) {
      outstandingOwe += Math.abs(myNet);
    }
  });

  const netStanding = outstandingOwed - outstandingOwe;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left animate-fade-in">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-500/10 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2">
              Welcome, {currentUser.name}! 🚀
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Create trip itineraries, add friends via WhatsApp, and instantly settle expense balances.
            </p>
          </div>
          <Link
            href="/dashboard/create-trip"
            className="px-5 py-3.5 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-rose-500/15 transition-all duration-200 hover:scale-102 flex items-center gap-1.5 self-stretch md:self-auto text-center justify-center cursor-pointer"
          >
            <PlusCircle size={14} /> Create Trip Group
          </Link>
        </div>

        {/* Aggregated Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass-panel p-5 border-rose-500/15 bg-slate-900/15 flex flex-col justify-between h-28">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Standing</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className={`text-xl sm:text-2xl font-black
                ${netStanding > 0 ? "text-teal-400" : ""}
                ${netStanding < 0 ? "text-rose-400" : ""}
                ${netStanding === 0 ? "text-slate-400" : ""}
              `}>
                {netStanding > 0 ? "+" : ""}${netStanding.toFixed(2)}
              </p>
              <span className="text-[9px] text-slate-500 font-bold">across all trips</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-5 border-rose-500/15 bg-slate-900/15 flex flex-col justify-between h-28">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Owed to Me</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-xl sm:text-2xl font-black text-teal-450">${outstandingOwed.toFixed(2)}</p>
              <span className="text-[9px] text-slate-500 font-bold">to collect</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-5 border-rose-500/15 bg-slate-900/15 flex flex-col justify-between h-28">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total I Owe</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-xl sm:text-2xl font-black text-rose-455">${outstandingOwe.toFixed(2)}</p>
              <span className="text-[9px] text-slate-500 font-bold">to pay back</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-5 border-rose-500/15 bg-slate-900/15 flex flex-col justify-between h-28">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Aggregated Spend</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-xl sm:text-2xl font-black text-slate-200">${aggregatedTotalSpent.toFixed(2)}</p>
              <span className="text-[9px] text-slate-500 font-bold">overall pool</span>
            </div>
          </div>
        </div>

        {/* Trips List Dashboard Section */}
        <div className="glass-panel p-6 border-rose-500/10 bg-slate-900/10">
          <h3 className="font-extrabold text-sm text-slate-200 mb-6 flex items-center gap-2">
            <Briefcase className="text-rose-455" size={16} /> My Active Trip Portfolios ({myGroups.length})
          </h3>

          {myGroups.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto space-y-4">
              <Compass className="mx-auto text-slate-700/50 animate-pulse" size={48} />
              <div>
                <h4 className="font-bold text-slate-300 text-sm">No Active Trips Found</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You are not currently enrolled in any trip expense boards. Start your adventure by initializing a new trip!
                </p>
              </div>
              <Link 
                href="/dashboard/create-trip"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-450 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
              >
                Create a Trip <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroups.map((group) => {
                const summary = getTripSummary(group.id);
                const groupMembersCount = groupMembers.filter((m) => m.groupId === group.id).length;
                
                const myNet = summary.memberBalances.find(m => m.userId === currentUser.id)?.net || 0;
                const isLeader = group.leaderId === currentUser.id;

                // Color of budget progress bar
                let progressColor = "from-teal-400 to-emerald-400";
                if (summary.budgetProgress >= 100) {
                  progressColor = "from-rose-500 to-pink-500";
                } else if (summary.budgetProgress > 80) {
                  progressColor = "from-amber-400 to-orange-400";
                }

                return (
                  <div 
                    key={group.id} 
                    className="p-5 rounded-2xl border border-rose-500/10 bg-slate-950/40 hover:border-rose-500/25 transition-all duration-200 flex flex-col justify-between group hover:shadow-xl shadow-slate-950/50"
                  >
                    <div>
                      {/* Trip Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="overflow-hidden text-left">
                          <h4 className="font-extrabold text-sm text-slate-200 group-hover:text-rose-400 transition truncate">
                            {group.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{group.description || "No description provided."}</p>
                        </div>
                        <span className={`inline-flex items-center text-[9px] font-black px-2.5 py-0.5 rounded-full border flex-shrink-0 uppercase tracking-wide
                          ${myNet > 0 ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : ""}
                          ${myNet < 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : ""}
                          ${myNet === 0 ? "bg-slate-500/10 text-slate-400 border-slate-700" : ""}
                        `}>
                          {myNet > 0 ? `+ $${myNet.toFixed(2)}` : myNet < 0 ? `- $${Math.abs(myNet).toFixed(2)}` : "Settled"}
                        </span>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap gap-3 items-center text-[10px] text-slate-450 my-4">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-rose-400" />
                          {group.tripDate ? new Date(group.tripDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} className="text-teal-400" />
                          {groupMembersCount} / {group.totalMembers} members
                        </span>
                      </div>

                      {/* Budget progress bar */}
                      {group.budget > 0 && (
                        <div className="mb-6">
                          <div className="flex justify-between text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                            <span>Budget Consumed</span>
                            <span className={summary.budgetProgress > 100 ? "text-rose-400" : summary.budgetProgress > 80 ? "text-amber-400" : "text-teal-400"}>
                              {summary.budgetProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`bg-gradient-to-r ${progressColor} h-1.5 rounded-full transition-all duration-500`}
                              style={{ width: `${summary.budgetProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-semibold">
                            <span>Total Spend: ${summary.totalSpent.toFixed(2)}</span>
                            <span>Limit: ${group.budget.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-900/60 mt-4 justify-between">
                      <Link 
                        href={`/trip/${group.id}`} 
                        className="px-4 py-2.5 text-center text-[10px] font-black text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl transition flex-1 flex items-center justify-center gap-1"
                      >
                        Enter Trip Room <ArrowRight size={11} />
                      </Link>
                      {isLeader ? (
                        <span className="text-[9px] uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg select-none font-bold">
                          Trip Leader
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg select-none font-bold">
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
