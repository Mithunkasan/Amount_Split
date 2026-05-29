"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStore";
import { Compass, ShieldAlert, UserPlus, ArrowRight, Loader2, Calendar, Users, Briefcase } from "lucide-react";
import Link from "next/link";

function JoinGroupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { 
    currentUser, 
    users, 
    invitations, 
    groups, 
    groupMembers,
    joinTripViaToken, 
    fetchFromDb 
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [invitation, setInvitation] = useState<any>(null);

  useEffect(() => {
    fetchFromDb().then(() => {
      setLoading(false);
    });
  }, [fetchFromDb]);

  useEffect(() => {
    if (!loading && token) {
      const foundInvite = invitations.find((i) => i.token === token);
      if (foundInvite) {
        const inviteGroup = groups.find((g) => g.id === foundInvite.groupId);
        setInvitation({
          ...foundInvite,
          groupName: inviteGroup?.name || "Shared Trip Group",
          groupLeaderId: inviteGroup?.leaderId
        });
      } else {
        setError("Invalid or expired WhatsApp invitation token. Please ask the Trip Leader to generate a new invite link!");
      }
    }
  }, [loading, token, invitations, groups]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to join.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await joinTripViaToken(token!, name.trim());
      if (res && res.success) {
        router.push(`/trip/${res.groupId}`);
      } else {
        setError("Failed to accept invitation. This token might have already been used.");
        setProcessing(false);
      }
    } catch (err) {
      setError("An unexpected error occurred while joining the trip.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-rose-500 animate-spin" size={40} />
      </div>
    );
  }

  // Error State
  if (error || !token) {
    return (
      <div className="min-h-screen bg-slate-955 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 border-rose-500/20 bg-slate-900/10 text-center space-y-4 animate-slide-up">
          <ShieldAlert className="mx-auto text-rose-500 mb-2 animate-bounce" size={40} />
          <h4 className="font-extrabold text-slate-200 text-lg">Invitation Link Error</h4>
          <p className="text-xs text-slate-400">{error || "No invitation token provided in URL."}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-rose-400 to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

  // Processing Automatic Join
  if (processing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 border-rose-500/20 bg-slate-900/10 text-center space-y-4">
          <Loader2 className="mx-auto text-teal-500 animate-spin" size={38} />
          <h4 className="font-black text-slate-100 text-lg">Joining Trip Room...</h4>
          <p className="text-xs text-slate-400">Registering account and secure credentials, synchronizing expenses...</p>
        </div>
      </div>
    );
  }

  const group = groups.find((g) => g.id === invitation?.groupId);
  const groupLeader = group ? users.find((u) => u.id === group.leaderId) : null;
  const currentMembersCount = group ? groupMembers.filter((m) => m.groupId === group.id).length : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden items-center justify-center p-4">
      {/* Glow Orbs */}
      <div className="ambient-glow -left-30 top-10 opacity-60" />
      <div className="ambient-glow right-0 bottom-10 opacity-40" />

      {/* Main invitation panel */}
      <div className="w-full max-w-md glass-panel p-8 border-rose-500/20 bg-slate-900/10 text-center space-y-6 relative z-10 animate-slide-up">
        
        {/* Header Icon */}
        <div className="inline-flex items-center justify-center bg-gradient-to-tr from-rose-500 to-teal-400 p-3 rounded-2xl text-slate-950 shadow-lg shadow-rose-500/25">
          <Compass size={24} className="animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">You're Invited! 🎒</h2>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            <span className="text-rose-400 font-bold">{groupLeader?.name || "Trip Leader"}</span> has invited you to join their trip splitting group:
          </p>
        </div>

        {/* Trip Summary Card */}
        {group && (
          <div className="p-4 rounded-xl border border-rose-500/15 bg-slate-950/60 text-left space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase size={13} className="text-rose-400" />
              <p className="font-extrabold text-xs text-slate-200">{group.name}</p>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{group.description || "No description provided."}</p>
            <div className="flex justify-between items-center text-[9px] text-slate-500 pt-2 border-t border-slate-900 font-bold uppercase">
              <span className="flex items-center gap-1"><Calendar size={10} /> {group.tripDate ? new Date(group.tripDate).toLocaleDateString() : "TBD"}</span>
              <span className="flex items-center gap-1"><Users size={10} /> {currentMembersCount} / {group.totalMembers} members</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Your Name</label>
            <div className="flex items-center gap-2 bg-slate-955 border border-rose-500/20 rounded-xl px-3.5 py-2.5 w-full">
              <UserPlus size={14} className="text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0"
                placeholder="Enter your name to join..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 text-slate-955 font-extrabold text-xs rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            Join Trip Group <ArrowRight size={13} />
          </button>
        </form>

        <p className="text-[9px] text-slate-500 font-medium">
          TripSplit Group Invites • Splits and settlements made simple.
        </p>

      </div>
    </div>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-rose-500 animate-spin" size={40} />
      </div>
    }>
      <JoinGroupContent />
    </Suspense>
  );
}
