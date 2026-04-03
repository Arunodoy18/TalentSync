'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building, MapPin, Clock, Search, ListFilter, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
  return (
    <div className="flex-1 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-[var(--text-muted)] mt-1">Track and manage your job applications.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/jobs">
            <Button className="bg-[#D4AF37] hover:bg-[#B4952F] text-black">
              Explore Jobs
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-[var(--border)] bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <CardDescription>View status updates from recruiters and auto-apply engines.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center py-10">
            <div className="h-20 w-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="h-10 w-10 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8">
                You haven't applied to any roles. Browse the job board or set up the Auto-Apply engine to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard/jobs">
                    <Button variant="outline" className="border-[var(--border)]">
                        <Search className="mr-2 h-4 w-4" />
                        Browse Jobs
                    </Button>
                </Link>
                <Link href="/dashboard/auto-apply">
                    <Button className="bg-[#D4AF37] hover:bg-[#B4952F] text-black">
                        Setup Auto-Apply
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
