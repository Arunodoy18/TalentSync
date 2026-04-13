'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { StaggerContainer, FadeIn, StaggerItem } from '@/components/ui/fade-in'

export default function UploadResumePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    // To be implemented: actual upload logic to Supabase Storage / API
    setTimeout(() => {
      setIsUploading(false)
      alert('Resume upload functionality will be connected to your parser soon!')
      router.push('/dashboard/resumes')
    }, 1500)
  }

  return (
    <StaggerContainer className="flex-1 space-y-[32px] max-w-[800px] mx-auto w-full">
      <FadeIn className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/resumes" className="flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vault
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Upload Resume</h1>
          <p className="text-[var(--text-muted)] mt-2">Upload your existing PDF or Word file to add to your vault.</p>
        </div>
      </FadeIn>

      <StaggerItem>
        <div className="p-[48px] mt-8 rounded-[12px] bg-[var(--card)] border border-[var(--border)] flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent opacity-50" />
          
          <div className="relative z-10 w-full max-w-md mx-auto">
            {!file ? (
              <label 
                htmlFor="resume-upload"
                className="group cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[var(--border)] rounded-[12px] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
              >
                <div className="h-16 w-16 mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:scale-110 transition-all duration-300">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="text-lg font-semibold text-[var(--text)] mb-1">Click to select a file</div>
                <div className="text-sm text-[var(--text-muted)]">PDF, DOCX, or TXT up to 5MB</div>
                <input 
                  id="resume-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-64 border border-[var(--border)] rounded-[12px] bg-white/5">
                <div className="h-16 w-16 mb-4 rounded-[12px] bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)]">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="text-lg font-semibold text-[var(--text)] truncate max-w-[280px]">{file.name}</div>
                <div className="text-sm text-[var(--text-muted)] mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex items-center px-6 py-2 rounded-lg bg-[var(--primary)] text-black text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload & Parse'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}