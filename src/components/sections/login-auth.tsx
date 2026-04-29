"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const LoginAuth = () => {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : 'https://talentsync.buildc3.tech/auth/callback';

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        setMessage("Logged in successfully!");
        window.location.href = "/dashboard";
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (signUpError) throw signUpError; 
        if (data?.session) { 
          setMessage("Signup successful! Redirecting..."); 
          window.location.href = "/dashboard"; 
        } else { 
          setMessage("Signup successful! Check your email for confirmation."); 
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden backdrop-blur-3xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#d4af37]/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#1e3a8a]/20 blur-[120px] mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] flex flex-col items-center z-10"
      >
        {/* Deep Glassmorphic Card */}
        <div 
          className="w-full rounded-[32px] p-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-white/5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        >
          {/* Logo */}
          <div className="mb-[36px] flex justify-center w-full">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 shadow-inner">
              <span className="text-[13px] font-black tracking-[0.2em] text-[#d4af37] uppercase">Talent</span>
              <span className="text-[13px] font-bold tracking-[0.2em] text-white uppercase -ml-1">Sync</span>
            </div>
          </div>

          <div className="text-center mb-[40px]">
            <h4 className="text-[32px] font-black text-white mb-[12px] tracking-tight">
              {isLogin ? "Welcome Back" : "Join the Elite"}
            </h4>
            <p className="text-[14px] text-gray-400 font-light max-w-[85%] mx-auto leading-relaxed">
              Unlock MAANG-level resumes, precision matching, and automated applications.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-2xl flex items-start gap-3"
              >
                <div className="mt-0.5">⚠️</div>
                <div className="leading-tight">{error}</div>
              </motion.div>
            )}
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#e4c668] text-sm rounded-2xl flex items-start gap-3"
              >
                <div className="mt-0.5">✧</div>
                <div className="leading-tight">{message}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleAuth}>
            <div className="relative group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[56px] px-[24px] rounded-[100px] bg-white/5 border border-white/10 focus:border-[#d4af37]/70 focus:bg-white/10 outline-none text-[15px] text-white placeholder:text-gray-500 transition-all duration-300"
                required
              />
            </div>

            <div className="relative group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[56px] px-[24px] rounded-[100px] bg-white/5 border border-white/10 focus:border-[#d4af37]/70 focus:bg-white/10 outline-none text-[15px] text-white placeholder:text-gray-500 transition-all duration-300"
                required
              />
            </div>

            <div className="flex items-center justify-between py-2 px-2 mt-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer hidden" id="remember-me" />
                  <div className="w-[18px] h-[18px] bg-white/5 border border-gray-600 rounded-[6px] peer-checked:bg-[#d4af37] peer-checked:border-[#d4af37] transition-all"></div>
                  <svg className="absolute w-[12px] h-[12px] text-black hidden peer-checked:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="ml-[12px] text-[13px] text-gray-300 font-normal hover:text-white transition-colors">
                  Remember Me
                </span>
              </label>

              <a href="/forgot" className="text-[13px] text-gray-400 font-medium hover:text-[#d4af37] transition-colors">
                Forget Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-[56px] mt-6 rounded-[100px] text-[15px] font-bold flex items-center justify-center overflow-hidden transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#e4c668] transition-transform duration-500 group-hover:scale-[1.02]" />
              <span className="relative z-10 text-[#090b14] flex items-center gap-2">
                {loading ? "Authenticating..." : isLogin ? "Continue Execution" : "Initialize Account"}
                {!loading && <span className="text-lg leading-none transform translate-y-[-1px]">→</span>}
              </span>
            </button>
          </form>

          <div className="mt-[32px] pt-[24px] border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[13px] text-gray-400">
              {isLogin ? "New to TalentSync?" : "Already initialized?"}
              <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-white font-semibold hover:text-[#d4af37] transition-colors">
                {isLogin ? "Create Account" : "Log In here"}
              </button>
            </p>

            <div className="flex items-center justify-center gap-4 text-[12px] font-medium tracking-wide">
              <Link href="/ats-checker" className="text-gray-500 hover:text-white transition-colors uppercase">
                ATS Checker
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/dashboard/billing" className="text-gray-500 hover:text-white transition-colors uppercase">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginAuth;





