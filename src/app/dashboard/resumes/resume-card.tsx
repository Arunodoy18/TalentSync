'use client'

import Link from 'next/link'
import { FileText, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ResumeCard({ resume }: { resume: any }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this resume?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete resume')
      setIsDeleting(false)
    }
  }

  return (
    <Link
      href={`/dashboard/resumes/${resume.id}`}
      className="group relative p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] transition-all hover:border-[var(--primary)] flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="h-12 w-12 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-2">
          {resume.is_base && (
            <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
              Master
            </span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="truncate text-lg font-semibold text-[var(--text)] group-hover:text-[var(--text)] pr-8">
          {resume.title || 'Untitled Resume'}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Created {new Date(resume.created_at || resume.updated_at).toLocaleDateString()}
        </p>
      </div>

      {/* Put the actions down at the bottom so it's a clear option */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-[8px] transition-colors z-10 disabled:opacity-50 border border-transparent hover:border-red-500/20"
          title="Delete resume"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Link>
  )
}
