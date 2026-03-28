"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Github, Monitor, Rocket } from "lucide-react";
import { toast } from "sonner";

interface PortfolioProps {
  resumeId: string;
}

export function PortfolioBuilder({ resumeId }: PortfolioProps) {
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);

  const generatePortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/career/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPortfolio(data.portfolio);
      toast.success("AI Portfolio generated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!portfolio && !loading) {
    return (
      <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
        <Rocket className="w-12 h-12 text-primary mb-4 animate-pulse" />
        <CardTitle className="text-2xl font-bold mb-2">Build Your AI Portfolio</CardTitle>
        <CardDescription className="max-w-md mb-6">
          Instantly transform your resume into a high-converting personal website structure. 
          Perfect for showcasing your skills to recruiters.
        </CardDescription>
        <Button onClick={generatePortfolio} size="lg" className="font-semibold px-8">
          Generate Now
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">AI is designing your portfolio layout...</p>
      </div>
    );
  }

  const { hero, about, projects, skills } = portfolio;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8 rounded-3xl border border-primary/20">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-4 border-primary text-primary font-bold">HERO SECTION</Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 tracking-tight">
            {hero?.title || "Personal Portfolio"}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {hero?.subtitle || "Building the future, one line of code at a time."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-primary/5 text-primary">ABOUT ME</Badge>
            </div>
            <CardTitle className="text-2xl font-bold">Core Professional Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {about?.summary || "Highly skilled professional focused on delivering value."}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
             <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-primary/5 text-primary">TECH STACK</Badge>
            </div>
            <CardTitle className="text-2xl font-bold">Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {skills?.map((skill: string, idx: number) => (
              <Badge key={idx} variant="outline" className="hover:bg-primary hover:text-white transition-colors cursor-default">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary" />
             </div>
             Showcase Projects
          </h2>
          <Button variant="outline" size="sm" onClick={generatePortfolio} disabled={loading}>
            Regenerate
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any, idx: number) => (
            <Card key={idx} className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.tech?.map((t: string, i: number) => (
                    <span key={i} className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {t}{i < project.tech.length - 1 ? " • " : ""}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {project.description}
                </p>
                <div className="flex gap-4 pt-2 border-t border-border">
                  <a href="#" className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors">
                    <Github className="w-3.5 h-3.5" /> Code
                  </a>
                  <a href="#" className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg">Ready to go live?</h3>
            <p className="text-sm text-muted-foreground">This structure can be exported to a Next.js template in one click.</p>
          </div>
          <Button className="font-bold gap-2">
             Deploy Portfolio <ExternalLink className="w-4 h-4" />
          </Button>
      </div>
    </div>
  );
}
