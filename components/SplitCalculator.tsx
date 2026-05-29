"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/hooks/useStore";
import { Calculator, AlertCircle, Percent, Equal, Landmark } from "lucide-react";

interface SplitCalculatorProps {
  members: User[];
  totalAmount: number;
  onSplitsChanged: (splits: { userId: string; amount: number }[]) => void;
}

type SplitMethod = "EQUAL" | "EXACT" | "PERCENT";

export default function SplitCalculator({
  members,
  totalAmount,
  onSplitsChanged
}: SplitCalculatorProps) {
  const [method, setMethod] = useState<SplitMethod>("EQUAL");
  
  // Track which members are active in this split
  const [activeMemberIds, setActiveMemberIds] = useState<string[]>(
    members.map((m) => m.id)
  );

  // Exact amounts or percentages per user
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});

  // Reset values when members change
  useEffect(() => {
    setActiveMemberIds(members.map((m) => m.id));
    
    const initialAmt: Record<string, string> = {};
    const initialPct: Record<string, string> = {};
    
    const count = members.length;
    members.forEach((m) => {
      initialAmt[m.id] = (totalAmount / (count || 1)).toFixed(2);
      initialPct[m.id] = (100 / (count || 1)).toFixed(1);
    });
    
    setExactAmounts(initialAmt);
    setPercentages(initialPct);
  }, [members, totalAmount]);

  // Recalculate splits on state changes
  useEffect(() => {
    let computedSplits: { userId: string; amount: number }[] = [];

    if (method === "EQUAL") {
      const activeCount = activeMemberIds.length;
      const equalShare = activeCount > 0 ? totalAmount / activeCount : 0;
      
      computedSplits = members.map((m) => ({
        userId: m.id,
        amount: activeMemberIds.includes(m.id) ? Number(equalShare.toFixed(2)) : 0
      }));
    } else if (method === "EXACT") {
      computedSplits = members.map((m) => ({
        userId: m.id,
        amount: activeMemberIds.includes(m.id) ? Number(parseFloat(exactAmounts[m.id] || "0") || 0) : 0
      }));
    } else if (method === "PERCENT") {
      computedSplits = members.map((m) => {
        const pct = activeMemberIds.includes(m.id) ? (parseFloat(percentages[m.id] || "0") || 0) : 0;
        const amt = (totalAmount * pct) / 100;
        return {
          userId: m.id,
          amount: Number(amt.toFixed(2))
        };
      });
    }

    onSplitsChanged(computedSplits);
  }, [method, activeMemberIds, exactAmounts, percentages, totalAmount, members, onSplitsChanged]);

  const toggleMember = (id: string) => {
    if (activeMemberIds.includes(id)) {
      setActiveMemberIds(activeMemberIds.filter((mId) => mId !== id));
    } else {
      setActiveMemberIds([...activeMemberIds, id]);
    }
  };

  const handleExactAmountChange = (id: string, val: string) => {
    setExactAmounts({
      ...exactAmounts,
      [id]: val
    });
  };

  const handlePercentageChange = (id: string, val: string) => {
    setPercentages({
      ...percentages,
      [id]: val
    });
  };

  // Compute stats for exact/percent split verification
  const totalExactEntered = members
    .filter((m) => activeMemberIds.includes(m.id))
    .reduce((sum, m) => sum + (parseFloat(exactAmounts[m.id]) || 0), 0);

  const totalPercentEntered = members
    .filter((m) => activeMemberIds.includes(m.id))
    .reduce((sum, m) => sum + (parseFloat(percentages[m.id]) || 0), 0);

  const isExactSumValid = Math.abs(totalExactEntered - totalAmount) < 0.05;
  const isPercentSumValid = Math.abs(totalPercentEntered - 100) < 0.05;

  return (
    <div className="glass-panel p-5 bg-gradient-to-br from-pink-500/5 to-rose-500/5 border border-pink-500/20 shadow-xl text-left">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-pink-400" size={18} />
        <h4 className="font-bold text-sm text-slate-200">Splitting Options</h4>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button
          type="button"
          onClick={() => setMethod("EQUAL")}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold rounded-lg border transition cursor-pointer
            ${method === "EQUAL" 
              ? "bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-md shadow-pink-500/5" 
              : "border-slate-700/50 text-slate-400 hover:text-pink-400 hover:bg-pink-500/5"
            }
          `}
        >
          <Equal size={13} /> Equally
        </button>
        <button
          type="button"
          onClick={() => setMethod("EXACT")}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold rounded-lg border transition cursor-pointer
            ${method === "EXACT" 
              ? "bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-md shadow-pink-500/5" 
              : "border-slate-700/50 text-slate-400 hover:text-pink-400 hover:bg-pink-500/5"
            }
          `}
        >
          <Landmark size={13} /> Exact Shares
        </button>
        <button
          type="button"
          onClick={() => setMethod("PERCENT")}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold rounded-lg border transition cursor-pointer
            ${method === "PERCENT" 
              ? "bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-md shadow-pink-500/5" 
              : "border-slate-700/50 text-slate-400 hover:text-pink-400 hover:bg-pink-500/5"
            }
          `}
        >
          <Percent size={13} /> By Percent
        </button>
      </div>

      {/* Warnings */}
      {method === "EXACT" && !isExactSumValid && activeMemberIds.length > 0 && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-455 p-2.5 rounded-lg text-xs mb-4">
          <AlertCircle size={14} className="flex-shrink-0" />
          <p>
            Split sum (₹{totalExactEntered.toFixed(2)}) must equal total expense amount (₹{totalAmount.toFixed(2)}). Difference: ₹{(totalAmount - totalExactEntered).toFixed(2)}
          </p>
        </div>
      )}

      {method === "PERCENT" && !isPercentSumValid && activeMemberIds.length > 0 && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-455 p-2.5 rounded-lg text-xs mb-4">
          <AlertCircle size={14} className="flex-shrink-0" />
          <p>
            Percentages sum ({totalPercentEntered.toFixed(1)}%) must equal exactly 100%. Difference: {(100 - totalPercentEntered).toFixed(1)}%
          </p>
        </div>
      )}

      {/* Member checklist and detail entries */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {members.map((member) => {
          const isActive = activeMemberIds.includes(member.id);
          return (
            <div 
              key={member.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition
                ${isActive 
                  ? "bg-slate-800/30 border-slate-700/50" 
                  : "bg-slate-900/10 border-slate-800/40 opacity-60"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleMember(member.id)}
                  className="rounded border-slate-700 text-pink-550 focus:ring-pink-500/50 w-4 h-4 bg-slate-950 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-xs text-slate-200">{member.name}</p>
                  <p className="text-[10px] text-slate-400">{member.email}</p>
                </div>
              </div>

              {isActive && (
                <div className="flex items-center">
                  {method === "EQUAL" && (
                    <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                      ₹{(activeMemberIds.length > 0 ? totalAmount / activeMemberIds.length : 0).toFixed(2)}
                    </span>
                  )}

                  {method === "EXACT" && (
                    <div className="flex items-center gap-1 bg-slate-900 border border-pink-500/25 rounded-lg px-2 py-1 w-28">
                      <span className="text-[10px] text-slate-500 font-bold">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={exactAmounts[member.id] || ""}
                        onChange={(e) => handleExactAmountChange(member.id, e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-200 w-full text-right focus:ring-0 p-0"
                      />
                    </div>
                  )}

                  {method === "PERCENT" && (
                    <div className="flex items-center gap-1 bg-slate-900 border border-pink-500/25 rounded-lg px-2 py-1 w-28">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={percentages[member.id] || ""}
                        onChange={(e) => handlePercentageChange(member.id, e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-200 w-full text-right focus:ring-0 p-0"
                      />
                      <span className="text-[10px] text-slate-500 font-bold">%</span>
                      <span className="text-[10px] text-pink-400 font-bold ml-1.5">
                        (₹{(totalAmount * (parseFloat(percentages[member.id]) || 0) / 100).toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
