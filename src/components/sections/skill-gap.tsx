"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Skill {
  name: string;
  status: "have" | "missing";
  priority: "high" | "medium" | "low";
}

interface SkillGapProps {
  resumeId: string;
}

const SkillGap = ({ resumeId }: SkillGapProps) => {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[] | null>(null);

  const analyzeSkillGap = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/career/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSkills(data.skills);
    } catch (error) {
      console.error("Failed to analyze skill gap:", error);
    } finally {
      setLoading(false);
    }
  };

  const haveCount = skills?.filter(s => s.status === "have").length || 0;
  const totalCount = skills?.length || 0;
  const matchPercentage = totalCount > 0 ? Math.round((haveCount / totalCount) * 100) : 0;

  return (
    <Card className="rounded-[24px] border-[#e5e7eb] shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Skill Gap Analysis
            </CardTitle>
            <CardDescription>See how you stack up against your target roles.</CardDescription>
          </div>
          {!skills && (
            <Button 
              onClick={analyzeSkillGap} 
              disabled={loading}
              className="bg-purple-600 text-white hover:opacity-90 rounded-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Skills
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading && !skills && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-purple-600" />
            <p>Analyzing your skills...</p>
          </div>
        )}

        {!loading && !skills && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Identify Skill Gaps</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Our AI will compare your current skills with industry requirements for your target role.
            </p>
          </div>
        )}

        {skills && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Skill Match Rate</p>
                <p className="text-2xl font-bold text-purple-600">{matchPercentage}%</p>
              </div>
              <div className="w-1/2">
                 <Progress value={matchPercentage} className="h-3 bg-purple-100" />
              </div>
            </div>

            <div className="grid gap-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-center gap-3">
                    {skill.status === "have" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <span className={`font-medium ${skill.status === "have" ? "text-gray-900" : "text-gray-500"}`}>
                      {skill.name}
                    </span>
                  </div>
                  {skill.status === "missing" && (
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        skill.priority === "high" ? "bg-red-50 text-red-600" :
                        skill.priority === "medium" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                     }`}>
                        {skill.priority} priority
                     </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillGap;
