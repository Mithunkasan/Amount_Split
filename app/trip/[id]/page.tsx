"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Compass, 
  Users, 
  Receipt, 
  FolderPlus, 
  UserPlus, 
  CreditCard, 
  Trash2, 
  AlertCircle,
  Calendar,
  DollarSign,
  MessageCircle,
  Copy,
  Check,
  CheckCircle2,
  X,
  History,
  TrendingDown,
  ArrowLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { 
    currentUser, 
    groups, 
    groupMembers, 
    users, 
    expenses, 
    settlements,
    deleteExpense,
    deleteGroup,
    addMemberAndGenerateWhatsAppInvite,
    addExpense,
    createSettlementClaim,
    verifySettlement,
    rejectSettlement
  } = useStore();

  // Route protection
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  // Modal & form states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviting, setInviting] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const [lastInviteLink, setLastInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmt, setExpenseAmt] = useState("");
  const [expenseCat, setExpenseCat] = useState("Dining");
  const [expensePayer, setExpensePayer] = useState("");
  const [loggingExpense, setLoggingExpense] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!currentUser) {
    return null;
  }

  // Find target group
  const group = groups.find((g) => g.id === id);
  if (!group) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-left max-w-md mx-auto space-y-4">
          <AlertCircle className="mx-auto text-rose-500 mb-2 animate-bounce" size={40} />
          <h4 className="font-bold text-slate-350 text-lg">Trip Not Found</h4>
          <p className="text-xs text-slate-500">This trip room does not exist or has been terminated by the leader.</p>
          <Link href="/dashboard" className="text-rose-400 hover:underline text-xs inline-block">Back to Dashboard</Link>
        </div>
      </DashboardLayout>
    );
  }

  // Memoized stats & calculations via Zustnad selector
  const { 
    totalSpent, 
    equalShare, 
    budgetProgress, 
    remainingBudget, 
    memberBalances, 
    simplifiedDebts 
  } = useStore.getState().getTripSummary(group.id);

  // Group members list
  const activeMemberships = groupMembers.filter((m) => m.groupId === group.id);
  const activeMembers = activeMemberships
    .map((m) => users.find((u) => u.id === m.userId))
    .filter(Boolean);

  // Set default payer once modal opens
  const openExpenseModal = () => {
    if (activeMembers.length > 0) {
      setExpensePayer(activeMembers[0]!.id);
    }
    setShowExpenseModal(true);
  };

  const handleCopyLink = () => {
    if (!lastInviteLink) return;
    navigator.clipboard.writeText(lastInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // WhatsApp invite handler
  const handleWhatsAppInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePhone) return;

    setSuccess("");
    setError("");
    setInviting(true);
    setCopied(false);

    try {
      const res = await addMemberAndGenerateWhatsAppInvite(group.id, invitePhone.trim());
      if (res && res.success) {
        setLastInviteUrl(res.inviteUrl);
        setLastInviteLink(res.inviteLink);
        setSuccess(`Secure invitation token successfully generated for mobile! Opening WhatsApp...`);
        setInvitePhone("");
        // Automatically open WhatsApp direct message link in a new tab
        window.open(res.inviteUrl, "_blank");
      } else {
        setError("Failed to generate WhatsApp invite. Please check the mobile number.");
      }
    } catch (err) {
      setError("An unexpected error occurred during direct invitation.");
    } finally {
      setInviting(false);
    }
  };

  // Expense submission handler
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!expenseDesc.trim()) {
      setError("Please enter a valid description.");
      return;
    }

    const amountVal = parseFloat(expenseAmt) || 0;
    if (amountVal <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!expensePayer) {
      setError("Please select who paid.");
      return;
    }

    setLoggingExpense(true);

    try {
      // Divide equally among all active members
      const activeCount = activeMembers.length;
      const share = Number((amountVal / activeCount).toFixed(2));
      
      const splitsData = activeMembers.map((m) => ({
        userId: m!.id,
        amount: m!.id === expensePayer ? share : share
      }));

      await addExpense(
        group.id,
        expensePayer,
        amountVal,
        expenseCat,
        expenseDesc.trim(),
        splitsData
      );

      setSuccess("Expense added successfully!");
      setShowExpenseModal(false);
      setExpenseDesc("");
      setExpenseAmt("");
      // Force trigger state sync
      router.refresh();
    } catch (err) {
      setError("Failed to log expense.");
    } finally {
      setLoggingExpense(false);
    }
  };

  // Settle Debt Action
  const handleSettleDebt = async (debt: typeof simplifiedDebts[0]) => {
    if (confirm(`Claim payment settlement? You will log a direct claim that you paid $${debt.amount.toFixed(2)} to ${debt.toUserName}.`)) {
      try {
        await createSettlementClaim(group.id, debt.fromUserId, debt.toUserId, debt.amount);
        setSuccess(`Payment settlement claim successfully filed! Awaiting verification from ${debt.toUserName}.`);
        setTimeout(() => setSuccess(""), 4000);
      } catch (err) {
        setError("Failed to initiate settlement claim.");
      }
    }
  };

  // Verify/Reject Settlement Actions
  const handleVerifySettlement = async (settlementId: string, verify: boolean) => {
    try {
      if (verify) {
        await verifySettlement(settlementId);
        setSuccess("Payment successfully verified and cleared from ledger!");
      } else {
        await rejectSettlement(settlementId);
        setSuccess("Payment verification rejected. Balance reverted to pending debt.");
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to verify settlement.");
    }
  };

  const handleDeleteTrip = () => {
    if (confirm("WARNING: Are you absolutely sure you want to terminate this entire Trip Room? All expense logs, splits, and settlements will be permanently deleted!")) {
      deleteGroup(group.id);
      router.push("/dashboard");
    }
  };

  // Filter local group expenses
  const tripExpenses = expenses.filter((e) => e.groupId === group.id);

  // Filter local group settlements
  const groupSettlements = settlements.filter((s) => s.groupId === group.id);
  const pendingSettlements = groupSettlements.filter((s) => s.status === "PENDING_VERIFICATION");
  const completedSettlements = groupSettlements.filter((s) => s.status === "VERIFIED");

  const isCreator = group.leaderId === currentUser.id;

  // Budget color scheme
  let progressColor = "bg-teal-400";
  if (budgetProgress >= 100) {
    progressColor = "bg-rose-500";
  } else if (budgetProgress > 80) {
    progressColor = "bg-amber-400";
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left animate-fade-in">
        
        {/* Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-500/10 pb-6">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-rose-400 font-bold hover:underline mb-1"
            >
              <ArrowLeft size={12} /> Back to Trips Board
            </Link>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
              <Compass className="text-rose-400" /> {group.name}
            </h2>
            <p className="text-xs text-slate-400 font-medium">{group.description || "No description provided."}</p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-rose-500/15 hover:border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={13} /> Add Members (WhatsApp)
            </button>
            <button
              onClick={openExpenseModal}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 text-slate-950 text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Receipt size={13} /> Add Expense
            </button>
            {isCreator && (
              <button
                onClick={handleDeleteTrip}
                className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Terminate Trip
              </button>
            )}
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-teal-500/15 border border-teal-500/20 text-teal-400 p-4 rounded-xl text-xs">
            <CheckCircle2 size={15} className="flex-shrink-0 animate-bounce" />
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs">
            <AlertCircle size={15} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* 1. METRICS & BUDGET MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spend Card */}
          <div className="glass-panel p-5 border-rose-500/15 bg-slate-900/15 flex flex-col justify-between h-28">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Trip Expenses</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-black text-slate-200">${totalSpent.toFixed(2)}</p>
              <span className="text-[9px] text-slate-500 font-bold">${equalShare.toFixed(2)} per person</span>
            </div>
          </div>

          {/* Members count */}
          <div className="glass-panel p-5 border-rose-500/15 bg-slate-900/15 flex flex-col justify-between h-28">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Room Size</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-black text-slate-200">{activeMembers.length} Joined</p>
              <span className="text-[9px] text-slate-500 font-bold">Limit: {group.totalMembers} members</span>
            </div>
          </div>

          {/* Dynamic Budget Tracker */}
          <div className="glass-panel p-5 border-rose-500/15 bg-slate-900/15 flex flex-col justify-between min-h-28">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Budget Status</span>
            {group.budget > 0 ? (
              <div className="mt-2 space-y-2">
                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`${progressColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${budgetProgress}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Pool: ${group.budget.toFixed(2)}</span>
                  <span>Left: ${remainingBudget.toFixed(2)} ({budgetProgress}%)</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic mt-2">No budget details defined for this trip.</p>
            )}
          </div>
        </div>

        {/* 2. MAIN LEDGERS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Members Balances Ledger (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Balances Board */}
            <div className="glass-panel p-6 border-rose-500/10 bg-slate-900/10">
              <h3 className="font-extrabold text-sm text-slate-200 mb-4 flex items-center gap-2">
                <Users size={16} className="text-rose-455" /> Active Members Balances
              </h3>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Total Paid</th>
                      <th>Equal Share</th>
                      <th className="text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberBalances.map((item) => (
                      <tr key={item.userId} className={item.userId === currentUser.id ? "bg-rose-500/[0.02]" : ""}>
                        <td className="font-bold text-slate-200 flex items-center gap-1.5">
                          {item.name}
                          {item.userId === currentUser.id && (
                            <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-black uppercase tracking-wider px-1.5 py-0.5 rounded">You</span>
                          )}
                        </td>
                        <td className="font-semibold text-slate-350">${item.paid.toFixed(2)}</td>
                        <td className="font-semibold text-slate-400">${equalShare.toFixed(2)}</td>
                        <td className={`font-black text-right
                          ${item.net > 0 ? "text-teal-400" : ""}
                          ${item.net < 0 ? "text-rose-455" : ""}
                          ${item.net === 0 ? "text-slate-450" : ""}
                        `}>
                          {item.net > 0 ? "+" : ""}${item.net.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chronological Expenses Log */}
            <div className="glass-panel p-6 border-rose-500/10 bg-slate-900/10">
              <h3 className="font-extrabold text-sm text-slate-200 mb-4 flex items-center gap-2">
                <Receipt size={16} className="text-rose-455" /> Chronological Expenses Log
              </h3>
              {tripExpenses.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center font-medium">No expenses logged yet. Tap "Add Expense" to start splitting!</p>
              ) : (
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Paid By</th>
                        <th>Cost</th>
                        <th>Date</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tripExpenses.map((exp) => {
                        const payer = users.find((u) => u.id === exp.paidById);
                        return (
                          <tr key={exp.id}>
                            <td className="font-bold text-slate-200">{exp.description}</td>
                            <td>
                              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                                {exp.category}
                              </span>
                            </td>
                            <td className="font-semibold text-slate-350">{payer?.name || "Member"}</td>
                            <td className="font-black text-slate-200">${exp.amount.toFixed(2)}</td>
                            <td className="text-slate-500 text-xs">{new Date(exp.date).toLocaleDateString()}</td>
                            <td className="text-right">
                              <button
                                onClick={async () => {
                                  if (confirm("Are you sure you want to delete this expense split? Outstanding settlements will automatically recalculate.")) {
                                    await deleteExpense(exp.id);
                                    setSuccess("Expense deleted successfully!");
                                    setTimeout(() => setSuccess(""), 3000);
                                  }
                                }}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-455 rounded-lg transition cursor-pointer flex items-center justify-center inline-flex"
                                title="Delete Expense"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Debts Matrix & Settlements verification (1/3 width) */}
          <div className="space-y-6">
            
            {/* Real-time Debts Simplification Matrix */}
            <div className="glass-panel p-5 border-rose-500/10 bg-slate-900/10 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <CreditCard size={16} className="text-rose-455" /> Live Split Debts Matrix
              </h3>
              
              {simplifiedDebts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 font-bold border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  🎉 Everyone is fully settled up!
                </div>
              ) : (
                <div className="space-y-3">
                  {simplifiedDebts.map((debt, index) => {
                    const isIDebt = debt.fromUserId === currentUser.id;
                    return (
                      <div 
                        key={index}
                        className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="text-xs">
                          <p className="font-semibold text-slate-400">
                            <span className="font-black text-slate-200">{debt.fromUserName}</span> owes <span className="font-black text-slate-200">{debt.toUserName}</span>
                          </p>
                          <p className="text-lg font-black text-rose-400 mt-1">${debt.amount.toFixed(2)}</p>
                        </div>
                        {isIDebt && (
                          <button
                            onClick={() => handleSettleDebt(debt)}
                            className="px-3.5 py-2 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 text-slate-955 font-black text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer self-start sm:self-auto shadow-md shadow-rose-500/5 whitespace-nowrap"
                          >
                            Settle Payment
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Settlement Clearances */}
            {pendingSettlements.length > 0 && (
              <div className="glass-panel p-5 border-amber-500/20 bg-slate-900/10 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-400 animate-pulse" /> Pending Clearances
                </h3>
                <div className="space-y-3">
                  {pendingSettlements.map((s) => {
                    const fromUser = users.find(u => u.id === s.fromUserId);
                    const toUser = users.find(u => u.id === s.toUserId);
                    const isCreditor = s.toUserId === currentUser.id;

                    return (
                      <div key={s.id} className="p-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.02] text-xs text-left space-y-3">
                        <div>
                          <p className="font-bold text-slate-200">${s.amount.toFixed(2)} Payment Claim</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {fromUser?.name || "A member"} claimed they paid {toUser?.name || "Member"}.
                          </p>
                        </div>
                        {isCreditor ? (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleVerifySettlement(s.id, true)}
                              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-450 text-slate-950 font-black text-[10px] uppercase rounded-lg transition flex-1 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifySettlement(s.id, false)}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-450 text-white font-black text-[10px] uppercase rounded-lg transition flex-1 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="inline-block text-[9px] uppercase font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/25 rounded-md animate-pulse">
                            Awaiting Payer verification
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Verified Clearances Ledger */}
            {completedSettlements.length > 0 && (
              <div className="glass-panel p-5 border-rose-500/10 bg-slate-900/10 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                  <History size={16} className="text-rose-455" /> Completed Clearances
                </h3>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {completedSettlements.map((s) => {
                    const fromUser = users.find(u => u.id === s.fromUserId);
                    const toUser = users.find(u => u.id === s.toUserId);
                    return (
                      <div key={s.id} className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 text-[11px] text-left">
                        <span className="font-black text-teal-400">${s.amount.toFixed(2)}</span> cleared:
                        <p className="text-[10px] text-slate-500 mt-0.5">{fromUser?.name} paid {toUser?.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* WHATSAPP DIRECT INVITATION MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 border-rose-500/25 bg-slate-950 text-left space-y-4 animate-slide-up relative">
            <button
              onClick={() => { setShowInviteModal(false); setLastInviteLink(""); setSuccess(""); setError(""); }}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="flex gap-2.5 items-center mb-1">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                <MessageCircle size={18} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">Add Member via WhatsApp</h3>
                <p className="text-[10px] text-slate-500 font-medium">Add members directly with their WhatsApp mobile numbers.</p>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 bg-teal-500/15 border border-teal-500/20 text-teal-400 p-3 rounded-xl text-xs">
                <CheckCircle2 size={13} className="flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
                <AlertCircle size={13} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleWhatsAppInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Colleague/Friend Mobile Number</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-rose-500/20 rounded-xl px-3.5 py-2.5 w-full">
                  <span className="text-slate-500 text-xs font-bold">+</span>
                  <input
                    type="tel"
                    required
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0"
                    placeholder="e.g. 919876543210 (Country code first)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={inviting}
                className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 text-slate-955 font-extrabold text-xs rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {inviting ? (
                  <>
                    <Loader2 className="animate-spin" size={13} /> Generating Token...
                  </>
                ) : (
                  <>
                    Send WhatsApp Invite <MessageCircle size={13} />
                  </>
                )}
              </button>
            </form>

            {/* Generated fallback display */}
            {lastInviteLink && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.02] flex flex-col gap-3">
                <div>
                  <p className="font-extrabold text-[11px] text-slate-200">Fallback Invitation URL</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">If WhatsApp didn't open automatically, copy this link to send manually:</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 pl-3">
                  <code className="text-[9px] text-rose-350 select-all overflow-x-auto whitespace-nowrap flex-1 scrollbar-none font-semibold">
                    {lastInviteLink}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-black transition flex items-center gap-1 cursor-pointer ${
                      copied 
                        ? "bg-teal-500 text-slate-950" 
                        : "bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    {copied ? <Check size={11} className="animate-bounce" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* REAL-TIME ADD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 border-rose-500/25 bg-slate-950 text-left space-y-4 animate-slide-up relative">
            <button
              onClick={() => { setShowExpenseModal(false); setSuccess(""); setError(""); }}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="flex gap-2.5 items-center mb-1">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">Add New Expense Split</h3>
                <p className="text-[10px] text-slate-500 font-medium">Log a bill. Costs will be split equally among all room members.</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-455 p-3 rounded-xl text-xs">
                <AlertCircle size={13} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleAddExpense} className="space-y-4">
              
              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Description</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="bg-slate-900 border border-rose-500/20 text-slate-150 text-xs rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                  placeholder="e.g. Train tickets to Rome, Airbnb bill..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Cost (USD)</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-rose-500/20 rounded-xl px-3 py-2 w-full">
                    <span className="text-slate-500 font-bold text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={expenseAmt}
                      onChange={(e) => setExpenseAmt(e.target.value)}
                      className="bg-transparent border-none outline-none text-slate-100 text-xs w-full focus:ring-0 p-0"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Category</label>
                  <select
                    value={expenseCat}
                    onChange={(e) => setExpenseCat(e.target.value)}
                    className="bg-slate-900 border border-rose-500/20 text-slate-400 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="Flights">Flights</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Dining">Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Who Paid */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Who Paid?</label>
                <select
                  value={expensePayer}
                  required
                  onChange={(e) => setExpensePayer(e.target.value)}
                  className="bg-slate-900 border border-rose-500/20 text-slate-400 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  {activeMembers.map((member) => (
                    <option key={member!.id} value={member!.id}>
                      {member!.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loggingExpense}
                className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 text-slate-955 font-extrabold text-xs rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loggingExpense ? (
                  <>
                    <Loader2 className="animate-spin" size={13} /> Logging Bill...
                  </>
                ) : (
                  <>
                    Log Bill & Split Equally <DollarSign size={13} />
                  </>
                )}
              </button>

            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
