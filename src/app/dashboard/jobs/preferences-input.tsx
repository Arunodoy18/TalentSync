'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export function PreferencesInput() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setSuccess(false)
    
    try {
      const res = await fetch('/api/jobs/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) throw new Error('Failed to save preferences')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setPrompt('')
    } catch (err) {
      console.error(err)
      alert("Failed to sync with AI service.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center w-full p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-colors focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]/50">
        <div className="pl-3 pr-2 text-[var(--primary)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-10 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
          placeholder="Tell our AI your ideal match (e.g., Remote Frontend Developer in London, $100k+, startup)..."
        />
        <button 
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="flex items-center justify-center h-10 min-w-[140px] px-6 ml-2 rounded-lg bg-[var(--primary)] text-black text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(142,182,155,0.2)]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
           success ? 'Sent to Scraper!' : 'Set Preferences'}
        </button>
      </div>
    </form>
  )
}
