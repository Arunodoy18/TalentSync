'use client';

import React from 'react';

export interface JakesResumeData {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  education: Array<{
    institution: string;
    location: string;
    degree: string;
    dates: string;
  }>;
  experience: Array<{
    company: string;
    dates: string;
    position: string;
    location: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    techStack: string;
    dates: string;
    bullets: string[];
    liveUrl: string;
    codeUrl: string;
  }>;
  skills: {
    languages: string;
    aiMl: string;
    frameworks: string;
    databases: string;
    tools: string;
  };
  achievements: string[];
}

export const sampleData: JakesResumeData = {
  name: "Arunodoy Banerjee",
  phone: "+91-9864446805",
  email: "arunodoy630@gmail.com",
  linkedin: "linkedin.com/in/arunodoy-banerjee",
  github: "github.com/Arunodoy18",
  education: [{
    institution: "Sikkim Manipal Institute of Technology",
    location: "Rangpo, Sikkim",
    degree: "B.Tech in Computer Science (AI and ML)",
    dates: "Aug. 2024 -- May 2028"
  }],
  experience: [
    {
      company: "AOSSIE (Resonate) -- Open Source",
      dates: "2025 -- Present",
      position: "Open Source Contributor, Backend & API",
      location: "Remote",
      bullets: [
        "Merged 5+ pull requests improving backend logic, API stability, and feature reliability in a distributed open-source environment with international maintainers.",
        "Debugged production-level issues by analyzing logs, tracing API responses, and refactoring backend components following Git-based code review workflows."
      ]
    },
    {
      company: "OWASP -- Open Source",
      dates: "2025 -- Present",
      position: "Open Source Contributor, Security & Documentation",
      location: "Remote",
      bullets: [
        "Contributed to security-focused repositories applying secure coding principles and resolving issues through structured pull requests.",
        "Enhanced code quality and documentation by reviewing community feedback and refining implementations aligned with industry security standards."
      ]
    }
  ],
  projects: [
    {
      name: "TalentSync -- AI-Powered Career Platform",
      techStack: "Next.js, OpenAI, Groq, PostgreSQL, Redis, Supabase, Razorpay",
      dates: "Aug 2025 -- Present",
      bullets: [
        "Architected a full-stack AI career platform leveraging LLMs for resume parsing, ATS scoring, and semantic job matching serving real users with end-to-end automation.",
        "Engineered ATS scoring engine using OpenAI GPT evaluating keyword density, formatting, and skills coverage returning structured category-wise scores via prompt engineering.",
        "Designed semantic job matching pipeline extracting skills from resumes and scoring relevance against scraped listings via embeddings, reducing irrelevant matches by 60%.",
        "Built auto-apply engine with cron scheduling and AI-generated tailored cover letters; integrated Redis caching cutting database load by 45% under peak traffic.",
        "Implemented Razorpay subscription billing with webhook verification and Pro tier access gating across 8 premium features."
      ],
      liveUrl: "https://talentsync.buildc3.tech",
      codeUrl: ""
    },
    {
      name: "AI Code Review Assistant",
      techStack: "Python, LLMs, FastAPI, React, Azure, CI/CD",
      dates: "Jan 2026",
      bullets: [
        "Developed a GenAI-powered assistant analyzing pull requests to detect logic flaws, code smells, and maintainability issues, reducing manual review time by 40%.",
        "Engineered structured prompt pipelines with chain-of-thought reasoning over LLMs to improve output consistency and reduce hallucinations across diverse codebases.",
        "Deployed scalable inference endpoints on Microsoft Azure with automated CI/CD pipelines via GitHub Actions."
      ],
      liveUrl: "https://reviewer.buildc3.tech",
      codeUrl: ""
    },
    {
      name: "Nakung AI -- Browser-Integrated AI Assistant",
      techStack: "JavaScript, Chrome APIs, LLM Integration",
      dates: "Jan 2026",
      bullets: [
        "Built a Chrome extension integrating LLM-powered assistance for real-time contextual task automation across web pages.",
        "Implemented background scripts, content scripts, and Chrome Extension APIs with modular architecture for low-latency performance."
      ],
      liveUrl: "",
      codeUrl: ""
    }
  ],
  skills: {
    languages: "Python, Java, C++, JavaScript, SQL",
    aiMl: "LLMs, Prompt Engineering, RAG, Vector Embeddings, NumPy, Pandas, Generative AI",
    frameworks: "FastAPI, Spring Boot, React, Next.js, Node.js, REST APIs",
    databases: "PostgreSQL, Supabase, Redis, Microsoft Azure, Vercel",
    tools: "Git, GitHub Actions, CI/CD, VS Code, IntelliJ, Postman, Agile, System Design"
  },
  achievements: [
    "Hackathon Winner: 1st place in university-level hackathon building AI-driven solution under 24-hour constraints.",
    "Startup Incubation (AIC): Selected for Atal Incubation Centre program after pitching original startup idea.",
    "LeetCode: Active problem solver in Data Structures, Algorithms, and competitive programming.",
    "Open Source: Active contributor to AOSSIE and OWASP with merged PRs in production codebases."
  ]
};

export default function JakesTemplate({ data = sampleData }: { data?: JakesResumeData }) {
  if (!data) return null;

  const sectionHeaderStyle: React.CSSProperties = {
    textTransform: 'uppercase',
    borderBottom: '1px solid black',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    marginTop: '16px',
    paddingBottom: '2px',
  };

  const listStyle: React.CSSProperties = {
    margin: '0',
    padding: '0 0 0 20px',
    listStyleType: 'disc',
  };

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        background: 'white',
        color: 'black',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '12px',
        padding: '36px 36px 20px 36px',
        boxSizing: 'border-box',
        lineHeight: '1.2',
      }}
    >
      {/* HEADER INFO */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 4px 0', textTransform: 'capitalize' }}>
          {data.name || 'Jake Doe'}
        </h1>
        <div style={{ fontSize: '12px' }}>
          {data.phone && <span>{data.phone} | </span>}
          {data.email && <a href={`mailto:${data.email}`} style={{ color: 'black', textDecoration: 'none' }}>{data.email}</a>}
          {data.linkedin && <span> | <a href={`https://${data.linkedin}`} style={{ color: 'black', textDecoration: 'none' }}>{data.linkedin}</a></span>}
          {data.github && <span> | <a href={`https://${data.github}`} style={{ color: 'black', textDecoration: 'none' }}>{data.github}</a></span>}
        </div>
      </div>

      {/* EDUCATION */}
      {data.education && data.education.length > 0 && (
        <section>
          <div style={sectionHeaderStyle}>Education</div>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{edu.institution}</span>
                <span>{edu.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic' }}>
                <span>{edu.degree}</span>
                <span>{edu.dates}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* EXPERIENCE */}
      {data.experience && data.experience.length > 0 && (
        <section>
          <div style={sectionHeaderStyle}>Experience</div>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{exp.position}</span>
                <span>{exp.dates}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', marginBottom: '4px' }}>
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <ul style={listStyle}>
                {exp.bullets && exp.bullets.map((desc, dIdx) => (
                  <li key={dIdx} style={{ marginBottom: '2px' }}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* PROJECTS */}
      {data.projects && data.projects.length > 0 && (
        <section>
          <div style={sectionHeaderStyle}>Projects</div>
          {data.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{proj.name} <span style={{ fontWeight: 'normal', fontStyle: 'italic', marginLeft: '4px' }}>| {proj.techStack}</span></span>
                <span>{proj.dates}</span>
              </div>
              <ul style={{ ...listStyle, marginTop: '4px' }}>
                {proj.bullets && proj.bullets.map((desc, dIdx) => (
                  <li key={dIdx} style={{ marginBottom: '2px' }}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* TECHNICAL SKILLS */}
      {data.skills && (Object.keys(data.skills).length > 0) && (
        <section>
          <div style={sectionHeaderStyle}>Technical Skills</div>
          <ul style={{ ...listStyle, listStyleType: 'none', paddingLeft: 0, marginBottom: '8px' }}>
            {data.skills.languages && (
              <li style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Languages: </span>
                {data.skills.languages}
              </li>
            )}
            {data.skills.frameworks && (
              <li style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Frameworks: </span>
                {data.skills.frameworks}
              </li>
            )}
            {data.skills.aiMl && (
              <li style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>AI & ML: </span>
                {data.skills.aiMl}
              </li>
            )}
            {data.skills.tools && (
              <li style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Developer Tools: </span>
                {data.skills.tools}
              </li>
            )}
            {data.skills.databases && (
              <li style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Databases & Cloud: </span>
                {data.skills.databases}
              </li>
            )}
          </ul>
        </section>
      )}

      {/* ACHIEVEMENTS & ACTIVITIES */}
      {data.achievements && data.achievements.length > 0 && (
        <section>
          <div style={sectionHeaderStyle}>Achievements & Activities</div>
          <ul style={{ ...listStyle, marginTop: '4px' }}>
            {data.achievements.map((act, idx) => {
              const colonIndex = act.indexOf(':');
              if (colonIndex !== -1) {
                const boldPart = act.substring(0, colonIndex + 1);
                const restPart = act.substring(colonIndex + 1);
                return (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>{boldPart}</span>{restPart}
                  </li>
                );
              }
              return (
                <li key={idx} style={{ marginBottom: '4px' }}>{act}</li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
