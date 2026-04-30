'use client';

import React from 'react';

export interface IITResumeData {
  fullName: string;
  rollNumber: string;
  department: string;
  degree: string;
  institute: string;
  gender: string;
  education: Array<{
    examination: string;
    university: string;
    institute: string;
    year: string;
    cpi: string;
  }>;
  thesis: Array<{
    title: string;
    guide: string;
    type: string;
    date: string;
    currentWork: string[];
    futureWork: string[];
  }>;
  projects: Array<{
    title: string;
    courseCode: string;
    date: string;
    descriptions: string[];
  }>;
  skills: {
    programmingLanguages: string;
    toolsAndLibraries: string;
  };
  experience: Array<{
    position: string;
    company: string;
    date: string;
    descriptions: string[];
  }>;
  activities: Array<{
    role: string;
    organization: string;
    description: string;
    date: string;
  }>;
}

export const sampleData: IITResumeData = {
  fullName: 'Arunodoy Banerjee',
  rollNumber: '202400493',
  department: 'Computer Science & Engineering',
  degree: 'B.Tech',
  institute: 'Sikkim Manipal Institute of Technology',
  gender: 'Male',
  education: [
    {
      examination: 'Graduation',
      university: 'SMIT',
      institute: 'SMIT',
      year: '2024-2028',
      cpi: '-',
    },
    {
      examination: 'Class XII',
      university: 'CBSE',
      institute: 'Sample School',
      year: '2024',
      cpi: '95%',
    },
    {
      examination: 'Class X',
      university: 'CBSE',
      institute: 'Sample School',
      year: '2022',
      cpi: '98%',
    },
  ],
  thesis: [
    {
      title: 'Optimizing Large Language Models',
      guide: 'Prof. John Doe',
      type: 'B.Tech Thesis',
      date: 'Aug 2025 - Present',
      currentWork: [
        'Researching efficiency techniques for LLMs.',
        'Implementing quantization methods.',
      ],
      futureWork: [
        'Deploying on edge devices.',
        'Integrating with real-time systems.',
      ],
    },
  ],
  projects: [
    {
      title: 'TalentSync Platform',
      courseCode: 'CS401',
      date: 'Jan 2025 - Apr 2025',
      descriptions: [
        'Developed an AI-driven recruitment platform.',
        'Implemented resume parsing and matching algorithms.',
      ],
    },
  ],
  skills: {
    programmingLanguages: 'Python, TypeScript, C++, Java',
    toolsAndLibraries: 'React, Next.js, Node.js, PyTorch, Docker',
  },
  experience: [
    {
      position: 'Software Engineering Intern',
      company: 'Tech Solutions Inc.',
      date: 'May 2025 - Jul 2025',
      descriptions: [
        'Built a microservice architecture for scalable data processing.',
        'Reduced latency by 40% through query optimization.',
      ],
    },
  ],
  activities: [
    {
      role: 'Core Committee Member',
      organization: 'Tech Club SMIT',
      description: 'Organized annual hackathon with 500+ participants.',
      date: 'Sep 2024 - Present',
    },
  ],
};

const ResHeading = ({ title }: { title: string }) => (
  <div
    style={{
      backgroundColor: 'rgb(209,209,209)',
      padding: '2px 4px',
      width: '99%',
      marginBottom: '8px',
      marginTop: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    }}
  >
    {title}
  </div>
);

export default function IITTemplate({ data = sampleData }: { data?: IITResumeData }) {
  const listStyle: React.CSSProperties = {
    margin: '0',
    padding: '0 0 0 20px',
    listStyleType: 'disc',
  };

  const itemStyle: React.CSSProperties = {
    margin: '0',
    padding: '0',
  };

  const subListStyle: React.CSSProperties = {
    margin: '0',
    padding: '0 0 0 20px',
    listStyleType: 'circle',
  };

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        background: 'white',
        color: 'black',
        fontFamily: "'Palatino Linotype', Palatino, 'Book Antiqua', serif",
        fontSize: '13.3px',
        padding: '54px 25px 14px 25px',
        boxSizing: 'border-box',
        lineHeight: '1.2',
      }}
    >
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', marginBottom: '16px' }}>
        <div style={{ width: '15%', display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/iit_logo.png"
            alt="IIT Logo"
            style={{ height: '58px', objectFit: 'contain' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div style="height: 58px; width: 58px; background: #eee;"></div>';
            }}
          />
        </div>
        <div style={{ width: '85%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              lineHeight: '1.38',
            }}
          >
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', fontSize: '1.2em', paddingRight: '70pt' }}>
                  {data.fullName}
                </td>
                <td style={{ textAlign: 'right' }}>Roll No: {data.rollNumber}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>{data.department}</td>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>{data.degree}</td>
              </tr>
              <tr>
                <td>{data.institute}</td>
                <td style={{ textAlign: 'right' }}>{data.gender}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* EDUCATION */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
            }}
          >
            <thead>
              <tr style={{ borderTop: '2px solid black', borderBottom: '1px solid black' }}>
                <th style={{ padding: '4px', fontWeight: 'bold' }}>Examination</th>
                <th style={{ padding: '4px', fontWeight: 'bold' }}>University</th>
                <th style={{ padding: '4px', fontWeight: 'bold' }}>Institute</th>
                <th style={{ padding: '4px', fontWeight: 'bold' }}>Year</th>
                <th style={{ padding: '4px', fontWeight: 'bold' }}>CPI/%</th>
              </tr>
            </thead>
            <tbody>
              {data.education.map((edu, idx) => (
                <tr key={idx} style={{ borderBottom: idx === data.education.length - 1 ? '1px solid black' : 'none' }}>
                  <td style={{ padding: '4px' }}>{edu.examination}</td>
                  <td style={{ padding: '4px' }}>{edu.university}</td>
                  <td style={{ padding: '4px' }}>{edu.institute}</td>
                  <td style={{ padding: '4px' }}>{edu.year}</td>
                  <td style={{ padding: '4px' }}>{edu.cpi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* THESIS & SEMINAR */}
      {data.thesis && data.thesis.length > 0 && (
        <div>
          <ResHeading title="B.Tech Thesis & Seminar" />
          <ul style={{ ...listStyle, listStyleType: 'none', paddingLeft: '0' }}>
            {data.thesis.map((th, idx) => (
              <li key={idx} style={{ ...itemStyle, marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>{th.title}</strong>
                  </span>
                  <span style={{ fontStyle: 'italic' }}>{th.date}</span>
                </div>
                <div style={{ fontStyle: 'italic' }}>
                  ({th.type}, Guide: {th.guide})
                </div>
                <div style={{ marginTop: '4px' }}>
                  <strong>Current work:</strong>
                  <ul style={subListStyle}>
                    {th.currentWork.map((cw, cwIdx) => (
                      <li key={cwIdx} style={itemStyle}>
                        {cw}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <strong>Future work:</strong>
                  <ul style={subListStyle}>
                    {th.futureWork.map((fw, fwIdx) => (
                      <li key={fwIdx} style={itemStyle}>
                        {fw}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* COURSE PROJECTS */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <ResHeading title="Course Projects" />
          <ul style={{ ...listStyle, listStyleType: 'none', paddingLeft: '0' }}>
            {data.projects.map((proj, idx) => (
              <li key={idx} style={{ ...itemStyle, marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>{proj.title}</strong> <span style={{ fontStyle: 'italic' }}>({proj.courseCode})</span>
                  </span>
                  <span style={{ fontStyle: 'italic' }}>{proj.date}</span>
                </div>
                <ul style={{ ...listStyle, marginTop: '2px' }}>
                  {proj.descriptions.map((desc, dIdx) => (
                    <li key={dIdx} style={itemStyle}>
                      {desc}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TECHNICAL SKILLS */}
      {data.skills && (Object.keys(data.skills).length > 0) && (
        <div>
          <ResHeading title="Technical Skills" />
          <div style={{ marginTop: '4px' }}>
            {data.skills.programmingLanguages && (
              <div style={{ marginBottom: '2px' }}>
                <strong>Programming Languages:</strong> {data.skills.programmingLanguages}
              </div>
            )}
            {data.skills.toolsAndLibraries && (
              <div style={{ marginBottom: '2px' }}>
                <strong>Tools and Libraries:</strong> {data.skills.toolsAndLibraries}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORK EXPERIENCE & INTERNSHIPS */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <ResHeading title="Work Experience & Internships" />
          <ul style={{ ...listStyle, listStyleType: 'none', paddingLeft: '0' }}>
            {data.experience.map((exp, idx) => (
              <li key={idx} style={{ ...itemStyle, marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>{exp.position}</strong> | <strong><span style={{ fontStyle: 'italic' }}>{exp.company}</span></strong>
                  </span>
                  <span style={{ fontStyle: 'italic' }}>{exp.date}</span>
                </div>
                <ul style={{ ...listStyle, marginTop: '2px' }}>
                  {exp.descriptions.map((desc, dIdx) => (
                    <li key={dIdx} style={itemStyle}>
                      {desc}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* POR & EXTRA-CURRICULARS */}
      {data.activities && data.activities.length > 0 && (
        <div>
          <ResHeading title="Positions of Responsibility & Extra-Curriculars" />
          <ul style={{ ...listStyle, marginTop: '4px' }}>
            {data.activities.map((act, idx) => (
              <li key={idx} style={{ ...itemStyle, marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>{act.role}</strong>, {act.organization} — {act.description}
                  </span>
                  <span style={{ fontStyle: 'italic' }}>{act.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
