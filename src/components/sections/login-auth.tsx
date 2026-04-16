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

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        setMessage("Logged in successfully!");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setMessage("Signup successful! Check your email for confirmation.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err.message || "An error occurred with Google login.");
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

          <div className="relative my-[24px] flex items-center">
            <div className="flex-grow border-t border-[#d1d5db33]"></div>
            <span className="flex-shrink mx-4 text-[13px] font-bold text-[#6b7280] uppercase tracking-wider">
              OR
            </span>
            <div className="flex-grow border-t border-[#d1d5db33]"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-[50px] bg-[#d8dee9] border border-[#d1d5db] text-[#212529] rounded-[50px] text-[15px] font-semibold flex items-center justify-center hover:bg-[#ccd4df] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <svg className="mr-3" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M21.805 10.023h-9.81v3.955h5.62c-.242 1.271-.967 2.348-2.06 3.07v2.55h3.335c1.953-1.798 3.08-4.45 3.08-7.598 0-.646-.057-1.27-.165-1.877z"
                fill="#4285F4"
              />
              <path
                d="M11.995 22c2.79 0 5.13-.924 6.84-2.502l-3.335-2.55c-.926.62-2.112.987-3.505.987-2.695 0-4.978-1.82-5.792-4.27h-3.45v2.684A10.005 10.005 0 0 0 11.995 22z"
                fill="#34A853"
              />
              <path
                d="M6.203 13.666A5.989 5.989 0 0 1 5.88 11.99c0-.581.116-1.143.323-1.676V7.63h-3.45A10.004 10.004 0 0 0 2 11.99c0 1.615.387 3.145 1.073 4.36l3.13-2.684z"
                fill="#FBBC05"
              />
              <path
                d="M11.995 6.045c1.516 0 2.878.521 3.95 1.544l2.964-2.964C17.12 2.958 14.78 2 11.995 2A10.005 10.005 0 0 0 3.073 7.63l3.45 2.684c.814-2.45 3.097-4.27 5.792-4.27z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

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




