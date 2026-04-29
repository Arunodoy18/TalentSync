"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

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

    // Using explicitly the live production URL for the email redirect
    // to fix the "localhost refused to connect" issue when clicking from a phone
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
        window.location.href = "/dashboard"; // Automatically navigate after login
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (signUpError) throw signUpError; if (data?.session) { setMessage("Signup successful! Redirecting..."); window.location.href = "/dashboard"; } else { setMessage("Signup successful! Check your email for confirmation."); }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f7f9] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-[30px] flex justify-center w-full">
          <div className="flex items-center gap-2 rounded-full border border-[#d1d8e6] bg-white px-5 py-2 shadow-sm">
            <span className="text-[13px] font-extrabold tracking-[0.16em] text-[#003893] uppercase">TalentSync</span>
          </div>
        </div>

        {/* Card Section */}
        <div className="w-full bg-[#e5ebf5] rounded-[30px] p-[40px] shadow-none">
            <h4 className="text-[30px] font-bold text-[#212529] mb-[10px] leading-[1.2] text-center">
              {isLogin ? "Login" : "Sign Up"}
            </h4>
            <p className="text-center text-[14px] text-[#6b7280] mb-[30px]">
              Your career copilot to build resumes, discover opportunities, and apply faster.
            </p>


          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 text-sm rounded-lg">
              {message}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleAuth}>
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[50px] px-[24px] rounded-[50px] bg-white border border-transparent focus:border-[#003893] outline-none text-[14px] text-[#1a1a1a] placeholder:text-[#6b7280] transition-colors"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[50px] px-[24px] rounded-[50px] bg-white border border-transparent focus:border-[#003893] outline-none text-[14px] text-[#1a1a1a] placeholder:text-[#6b7280] transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between py-1 px-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer hidden"
                    id="remember-me"
                  />
                  <div className="w-[18px] h-[18px] bg-white border border-[#d1d5db] rounded-[4px] peer-checked:bg-[#003893] peer-checked:border-[#003893] transition-all"></div>
                  <svg
                    className="absolute w-[12px] h-[12px] text-white hidden peer-checked:block"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="ml-[10px] text-[14px] text-[#212529] font-normal leading-normal">
                  Remember Me
                </span>
              </label>

              <a
                href="/forgot"
                className="text-[14px] text-[#003893] font-medium hover:opacity-80 transition-opacity"
              >
                Forget Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-[#003893] text-white rounded-[50px] text-[15px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
            >
              <span>{loading ? "Processing..." : isLogin ? "Continue with Email" : "Sign Up with Email"}</span>
            </button>
          </form>

          <p className="mt-[24px] text-center text-[14px] text-[#6b7280]">
            {isLogin ? "Don't Have an Account? " : "Already Have an Account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#003893] font-medium hover:underline"
            >
              {isLogin ? "Create One" : "Log In"}
            </button>
          </p>

          <div className="mt-5 flex items-center justify-center gap-4 text-sm">
            <Link href="/ats-checker" className="text-[#003893] font-semibold hover:underline">
              Free ATS Checker
            </Link>
            <span className="text-[#9ca3af]">|</span>
            <Link href="/dashboard/billing" className="text-[#003893] font-semibold hover:underline">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAuth;





