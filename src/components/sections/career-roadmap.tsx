"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Rocket, Map, Target, Calendar } from "lucide-react";

interface RoadmapStep {
  title: string;
  description: string;
  skills: string[];
  timeline: string;
}

interface CareerRoadmapProps {
  resumeId: string;
}

const CareerRoadmap = ({ resumeId }: CareerRoadmapProps) => {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/career/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRoadmap(data.roadmap);
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-[24px] border-[#e5e7eb] shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-[#003893]" />
              AI Career Roadmap
            </CardTitle>
            <CardDescription>Get a personalized plan to reach your career goals.</CardDescription>
          </div>
          {!roadmap && (
            <Button 
              onClick={generateRoadmap} 
              disabled={loading}
              className="bg-[#003893] text-white hover:opacity-90 rounded-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Roadmap
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading && !roadmap && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#003893]" />
            <p>Analyzing your profile and generating your path...</p>
          </div>
        )}

        {!loading && !roadmap && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Map className="h-8 w-8 text-[#003893]" />
            </div>
            <h3 className="text-lg font-bold mb-2">Start your journey</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Our AI will analyze your resume and tell you which path is best and what you need to learn.
            </p>
          </div>
        )}

        {roadmap && (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:via-blue-100 before:to-transparent">
            {roadmap.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-6 pl-12">
                <div className="absolute left-0 mt-1 h-10 w-10 rounded-full bg-white border-4 border-blue-500 shadow-sm flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                </div>
                <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#212529]">{step.title}</h4>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {step.timeline}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.skills.map((skill) => (
                      <span key={skill} className="text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CareerRoadmap;
