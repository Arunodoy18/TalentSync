'use client'

import Link from 'next/link'
import { ExternalLink, FileText, PencilLine, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import IITTemplate from '@/components/resume/templates/IITTemplate'
import JakesTemplate from '@/components/resume/templates/JakesTemplate'
const PREVIEW_SCALE = 0.3
const PREVIEW_WIDTH = 794
const PREVIEW_HEIGHT = 1123

export function ResumeCard({ resume }: { resume: any }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const templateType = resume?.template_type === 'iit' ? 'iit' : 'jakes'
  const templateLabel = templateType === 'iit' ? 'IIT' : "Jake's"
  const atsScore = typeof resume?.ats_score === 'number' ? resume.ats_score : null

  const templateNode = useMemo(() => {
    const templateData = resume?.data ?? resume?.content ?? {}
    if (templateType === 'iit') {
      return <IITTemplate data={templateData} />
    }
    return <JakesTemplate data={templateData} />
  }, [resume?.content, resume?.data, templateType])

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()

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
    <div className="group relative flex flex-col gap-4 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-[20px] transition-all hover:border-[var(--primary)]">
      <div className="rounded-[10px] border border-[var(--border)] bg-[#f5f5f5] p-3">
        <div
          className="relative overflow-hidden rounded-[8px] bg-white shadow-sm"
          style={{
            width: `${PREVIEW_WIDTH * PREVIEW_SCALE}px`,
            height: `${PREVIEW_HEIGHT * PREVIEW_SCALE}px`,
          }}
        >
          <div
            style={{
              width: `${PREVIEW_WIDTH}px`,
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: 'top left',
            }}
          >
            {templateNode}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="truncate text-lg font-semibold text-[var(--text)]">
              {resume.title || 'Untitled Resume'}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Created {new Date(resume.created_at || resume.updated_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full border border-[var(--border)] bg-white/5 px-3 py-1 text-xs font-semibold text-[var(--text)]">
              {templateLabel}
            </span>
            {atsScore !== null && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                ATS {Number(atsScore).toFixed(0)}
              </span>
            )}
          </div>
        </div>

        {resume.is_base && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
            <FileText className="h-3.5 w-3.5" />
            Master
          </span>
        )}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <Link
          href={`/dashboard/resumes/${resume.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--primary)]"
        >
          <ExternalLink className="h-4 w-4" />
          Open
        </Link>
        <Link
          href={`/dashboard/resumes/builder?id=${resume.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--primary)]"
        >
          <PencilLine className="h-4 w-4" />
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition-colors hover:border-red-500/30 disabled:opacity-50"
          title="Delete resume"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
