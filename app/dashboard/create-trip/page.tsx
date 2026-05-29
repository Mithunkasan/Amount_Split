"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import { FolderPlus, Compass, Calendar, Users, DollarSign, ArrowLeft, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTripPage() {
  const router = useRouter();
  const { currentUser, createGroup } = useStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [totalMembers, setTotalMembers] = useState("10");
  const [tripDate, setTripDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!name.trim()) {
      setError("Please enter a valid Trip Name.");
      return;
    }

    const budgetVal = parseFloat(budget) || 0;
    if (budgetVal < 0) {
      setError("Please enter a valid trip budget.");
      return;
    }

    const membersCount = parseInt(totalMembers, 10) || 10;
    if (membersCount <= 1) {
      setError("Max Members must be greater than 1.");
      return;
    }

    setLoading(true);

    try {
      const newTrip = await createGroup(
        name.trim(),
        currentUser.id,
        description.trim(),
        membersCount,
        tripDate,
        budgetVal
      );

      if (newTrip) {
        setSuccess("Trip Room successfully initialized!");
        setTimeout(() => {
          router.push(`/trip/${newTrip.id}`);
        }, 1000);
      } else {
        setError("Failed to initialize Trip Room. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred during trip setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 text-left max-w-lg mx-auto py-4 animate-slide-up">
        
        {/* Back link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-rose-455 font-bold hover:underline mb-2"
          >
            <ArrowLeft size={13} /> Back to Dashboard
          </Link>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <FolderPlus className="text-rose-400" /> Create Trip Group
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Initialize a new travel event, roommate ledger, or corporate sharing pool.</p>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-6 border-rose-500/15 bg-slate-900/10 space-y-6">
          
          {success && (
            <div className="flex items-center gap-2 bg-teal-500/15 border border-teal-500/20 text-teal-400 p-3.5 rounded-xl text-xs">
              <Compass className="animate-spin" size={14} />
              <p>{success}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs">
              <AlertCircle size={14} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Trip Name */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Trip Name</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-rose-500/20 rounded-xl px-3 py-2.5 w-full">
                <Compass size={14} className="text-slate-500" />
                <input
                  type="text"
                  value={name}
                  required
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0"
                  placeholder="e.g. EuroTrip Summer 2026 🇪🇺"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="bg-slate-950 border border-rose-500/20 text-slate-150 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                placeholder="e.g. Split lodging, train bookings, and common dining bills..."
              />
            </div>

            {/* Grid for Budget, Date, Max Members */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Trip Budget */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Budget (USD)</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-rose-500/20 rounded-xl px-3 py-2.5 w-full">
                  <DollarSign size={14} className="text-slate-500" />
                  <input
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0"
                    placeholder="0.00 (Optional)"
                  />
                </div>
              </div>

              {/* Trip Date */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Trip Date</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-rose-500/20 rounded-xl px-3 py-2.5 w-full">
                  <Calendar size={14} className="text-slate-500" />
                  <input
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-450 text-xs w-full focus:ring-0 p-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Total Members Limit */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Max Members Limit</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-rose-500/20 rounded-xl px-3 py-2.5 w-full">
                  <Users size={14} className="text-slate-500" />
                  <input
                    type="number"
                    value={totalMembers}
                    required
                    onChange={(e) => setTotalMembers(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0"
                    placeholder="10"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 disabled:from-slate-900 disabled:to-slate-900 text-slate-950 font-black text-xs rounded-xl shadow-lg transition duration-200 mt-4 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Initializing Trip Room...
                </>
              ) : (
                <>
                  Initialize Trip Room <ArrowRight size={14} />
                </>
              )}
            </button>

          </form>

        </div>
      </div>
    </DashboardLayout>
  );
}
