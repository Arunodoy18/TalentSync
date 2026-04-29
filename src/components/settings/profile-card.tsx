"use client";

import { useState } from "react";
import { UserRound, Check, X, PencilLine, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface ProfileCardProps {
  initialName: string | null;
  email: string | undefined;
  userId: string;
}

export function ProfileCard({ initialName, email, userId }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName || "Not set");
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(initialName || "");
  const router = useRouter();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        data: { full_name: inputValue }
      });

      if (error) throw error;
      
      setName(inputValue || "Not set");
      setIsEditing(false);
      router.refresh();
      
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-surface p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]">
          <UserRound className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Account</h2>
      </div>
      
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
        <div>
          <div className="flex justify-between items-start">
            <p className="text-sm text-[var(--text-muted)] mb-1">Name</p>
            {!isEditing && (
              <button 
                onClick={() => {
                  setInputValue(name === "Not set" ? "" : name);
                  setIsEditing(true);
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
              >
                <PencilLine className="h-3 w-3" /> Edit
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
                disabled={isLoading}
                placeholder="Enter your full name"
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
              />
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="text-[var(--text)] font-medium">{name}</p>
          )}
        </div>
        
        <div className="pt-2 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Email</p>
          <p className="text-[var(--text)] font-medium break-all">{email}</p>
        </div>
        
        <div className="pt-2 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">User ID</p>
          <p className="text-[var(--text)] text-sm break-all font-mono">{userId}</p>
        </div>
      </div>
      
      <button
        onClick={() => {
          setInputValue(name === "Not set" ? "" : name);
          setIsEditing(true);
        }}
        className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)]"
      >
        Manage Profile
      </button>
    </div>
  );
}
