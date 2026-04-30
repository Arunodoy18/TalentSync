'use client';

import React from 'react';
import { IITResumeData } from './IITTemplate'; 

export default function JakesTemplate({ data }: { data?: IITResumeData }) {
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
          {data.fullName || 'Jake Doe'}
        </h1>
        <div style={{ fontSize: '12px' }}>
          {data.gender ? `${data.gender} | ` : ''} 
          <a href="#" style={{ color: 'black', textDecoration: 'none' }}>
            {data.department || ''}
          </a>
        </div>
      </div>

      {/* EDUCATION */}
      {data.education && data.education.length > 0 && (
        <section>
          <div style={sectionHeaderStyle}>Education</div>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{edu.university}</span>
                <span>{edu.year}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic' }}>
                <span>{edu.examination} - {edu.institute}</span>
                <span>CPI/Percentage: {edu.cpi}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* TECHNICAL SKILLS */}
      {data.skills && (Object.keys(data.skills).length > 0) && (
        <section>
          <div style={sectionHeaderStyle}>Technical Skills</div>
          <ul style={{ ...listStyle, listStyleType: 'none', paddingLeft: 0, marginBottom: '8px' }}>
            {data.skills.programmingLanguages && (
              <li style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Languages: </span>
                {data.skills.programmingLanguages}
              </li>
            )}
            {data.skills.toolsAndLibraries && (
              <li style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Frameworks & Tools: </span>
                {data.skills.toolsAndLibraries}
              </li>
            )}
          </ul>
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
                <span>{exp.date}</span>
              </div>
              <div style={{ fontStyle: 'italic', marginBottom: '4px' }}>
                {exp.company}
              </div>
              <ul style={listStyle}>
                {exp.descriptions && exp.descriptions.map((desc, dIdx) => (
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
                <span>{proj.title} <span style={{ fontWeight: 'normal', fontStyle: 'italic', marginLeft: '4px' }}>{proj.courseCode ? `(${proj.courseCode})` : ''}</span></span>
                <span>{proj.date}</span>
              </div>
              <ul style={{ ...listStyle, marginTop: '4px' }}>
                {proj.descriptions && proj.descriptions.map((desc, dIdx) => (
                  <li key={dIdx} style={{ marginBottom: '2px' }}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* EXTRA-CURRICULAR & ACTIVITIES */}
      {data.activities && data.activities.length > 0 && (
        <section>
          <div style={sectionHeaderStyle}>Leadership & Activities</div>
          <ul style={{ ...listStyle, listStyleType: 'none', paddingLeft: 0, marginTop: '4px' }}>
            {data.activities.map((act, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <span style={{ fontWeight: 'bold' }}>{act.role}</span>
                    {act.organization ? `, ${act.organization}` : ''} 
                    {act.description ? ` — ${act.description}` : ''}
                  </span>
                  <span style={{ fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{act.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
