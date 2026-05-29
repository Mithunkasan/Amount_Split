"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useStore } from "@/hooks/useStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, User, Mail, Lock, ShieldAlert, Loader2, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const { registerUser } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Direct signups are registered as LEADERs so they can initialize and manage trips!
      const newUser = await registerUser(name.trim(), email.trim(), password, "LEADER");
      if (newUser) {
        router.push("/dashboard");
      } else {
        setError("Email already registered. Try logging in or use another email!");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-panel p-8 border-rose-500/20 bg-slate-900/10 text-left shadow-2xl relative animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center bg-gradient-to-tr from-rose-500 to-teal-400 p-2.5 rounded-2xl text-slate-950 mb-3 shadow-lg shadow-rose-500/25">
          <Compass size={22} className="animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100">Create Leader Account</h2>
        <p className="text-xs text-slate-400 mt-1">Register to start creating trips and inviting friends.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs mb-4">
          <ShieldAlert size={14} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Full Name</label>
          <div className="flex items-center gap-2 bg-slate-955 border border-rose-500/20 rounded-xl px-3.5 py-2.5 w-full">
            <User size={14} className="text-slate-500" />
            <input
              type="text"
              value={name}
              required
              onChange={(e) => { setName(e.target.value); setError(""); }}
              className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0"
              placeholder="e.g. John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Email Address</label>
          <div className="flex items-center gap-2 bg-slate-955 border border-rose-500/20 rounded-xl px-3.5 py-2.5 w-full">
            <Mail size={14} className="text-slate-500" />
            <input
              type="email"
              value={email}
              required
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Password</label>
          <div className="flex items-center gap-2 bg-slate-955 border border-rose-500/20 rounded-xl px-3.5 py-2.5 w-full relative">
            <Lock size={14} className="text-slate-500 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-150 text-xs w-full focus:ring-0 p-0 pr-8"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-500 hover:text-slate-350 cursor-pointer transition focus:outline-none flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-teal-400 hover:from-rose-450 hover:to-teal-350 text-slate-955 font-extrabold text-xs rounded-xl shadow-lg transition duration-200 mt-2 cursor-pointer text-center flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={13} /> Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-[11px] text-slate-400">Already have an account? </span>
        <Link 
          href="/login" 
          className="text-[11px] text-rose-400 font-bold hover:underline"
        >
          Log in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      <div className="ambient-glow -left-30 top-10 opacity-60" />
      <div className="ambient-glow right-0 bottom-10 opacity-40" />

      <Navbar />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={
          <div className="w-full max-w-md glass-panel p-8 border-rose-500/20 bg-slate-900/10 text-center">
            <Loader2 className="mx-auto text-rose-500 animate-spin" size={32} />
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
