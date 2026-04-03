import { FolderGit2, Plus } from "lucide-react";
import Link from "next/link";

export default function ProjectsVaultPage() {
  const hasProjects = false;

  if (!hasProjects) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[600px]">
        <div className="h-20 w-20 bg-[var(--primary)/10] rounded-full flex items-center justify-center mb-6">
          <FolderGit2 className="h-10 w-10 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-semibold mb-3 tracking-tight">No Projects Yet</h2>
        <p className="text-[var(--muted-foreground)] max-w-[420px] mb-8 text-base">
          Build your portfolio. Add projects to showcase your technical skills and practical experience to top employers.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/projects/new"
            className="btn-interaction inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)/90] h-10 px-8 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Link>
        </div>

        {/* Decorative Projects Preview */}
        <div className="mt-16 w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 opacity-40 blur-[1px] select-none pointer-events-none text-left">
           <div className="flex items-center gap-2 mb-2">
             <div className="h-5 w-5 bg-[var(--muted)] rounded"></div>
             <div className="h-5 w-32 bg-[var(--muted)] rounded"></div>
           </div>
           <div className="h-3 w-48 bg-[var(--muted)] rounded mb-6"></div>
           <div className="h-10 w-full bg-[var(--muted)]/50 rounded flex items-center px-4 mb-2">
             <div className="h-4 w-24 bg-[var(--muted)] rounded"></div>
           </div>
           <div className="h-10 w-full bg-[var(--muted)]/50 rounded flex items-center px-4">
             <div className="h-4 w-32 bg-[var(--muted)] rounded"></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full p-4 md:p-8">
      <h1 className="text-3xl font-bold">Projects Vault</h1>
    </div>
  );
}
