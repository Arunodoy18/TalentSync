"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type ResumeBasics = {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin?: string;
  github?: string;
};

type ResumeEducation = {
  examination?: string;
  university?: string;
  institute?: string;
  year?: string;
  score?: string;
  degree?: string;
  school?: string;
  location?: string;
  grade?: string;
};

type ResumeExperience = {
  role?: string;
  position?: string;
  company?: string;
  location?: string;
  date?: string;
  duration?: string;
  bullets?: string[];
  points?: string[];
};

type ResumeProject = {
  title?: string;
  name?: string;
  course?: string;
  technologies?: string;
  duration?: string;
  date?: string;
  bullets?: string[];
  points?: string[];
};

type Props = {
  basics: ResumeBasics;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects?: ResumeProject[];
  skills: string;
};

const getBullets = (item: { bullets?: string[]; points?: string[] }): string[] => {
  if (Array.isArray(item.bullets) && item.bullets.length > 0) return item.bullets;
  if (Array.isArray(item.points) && item.points.length > 0) return item.points;
  return [];
};

const parseSkills = (skills: string): Array<{ label: string; value: string }> => {
  return skills
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf(":");
      if (idx === -1) {
        return { label: "Skills", value: part };
      }

      return {
        label: part.slice(0, idx).trim(),
        value: part.slice(idx + 1).trim(),
      };
    });
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 24,
    paddingLeft: 30,
    paddingRight: 30,
    fontFamily: "Helvetica",
    fontSize: 9.2,
    color: "#000",
  },
  header: {
    textAlign: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.35,
  },
  contactRow: {
    marginTop: 3,
    fontSize: 8,
  },
  sectionBand: {
    backgroundColor: "#d1d1d1",
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 8.6,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  table: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.7,
    borderColor: "#000",
    paddingVertical: 2,
    fontWeight: "bold",
    fontSize: 8.2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.35,
    borderColor: "#b7b7b7",
    paddingVertical: 1.8,
    fontSize: 8.2,
  },
  colExam: { width: "30%", paddingLeft: 3 },
  colUniversity: { width: "26%" },
  colInstitute: { width: "22%" },
  colYear: { width: "10%", textAlign: "right" },
  colScore: { width: "12%", textAlign: "right", paddingRight: 3 },
  subsection: {
    marginBottom: 3,
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1.5,
  },
  leftHeading: {
    width: "78%",
    fontSize: 8.8,
    fontWeight: "bold",
  },
  rightHeading: {
    width: "22%",
    textAlign: "right",
    fontSize: 8.3,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  metaLine: {
    fontSize: 8,
    fontStyle: "italic",
    marginBottom: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 0.8,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 8,
    fontSize: 8.8,
    lineHeight: 1.12,
  },
  bulletText: {
    width: "96%",
    fontSize: 8.4,
    lineHeight: 1.22,
  },
  skillLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 2,
    marginBottom: 1,
  },
  skillLabel: {
    fontWeight: "bold",
    fontSize: 8.6,
  },
  skillValue: {
    fontSize: 8.5,
    lineHeight: 1.2,
  },
  mutedText: {
    fontSize: 8.1,
    color: "#2a2a2a",
  },
  projectLinks: {
    fontSize: 8,
    marginTop: 0.5,
    textAlign: "right",
  },
});
export const IITBombayTemplate = ({ basics, experience, education, projects = [], skills }: Props) => {
  const contactParts = [
    basics.phone,
    basics.email,
    basics.linkedin,
    basics.github,
    basics.location,
  ].filter(Boolean);

  const skillLines = parseSkills(skills);
  const summaryLines = (basics.summary || "")
    .split(/\n|\./)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{(basics.name || "YOUR NAME").toUpperCase()}</Text>
          <Text style={styles.contactRow}>{contactParts.join("  |  ")}</Text>
        </View>

        <View style={styles.sectionBand}>
          <Text style={styles.sectionTitle}>Education</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colExam}>Examination</Text>
            <Text style={styles.colUniversity}>University</Text>
            <Text style={styles.colInstitute}>Institute</Text>
            <Text style={styles.colYear}>Year</Text>
            <Text style={styles.colScore}>CPI/%</Text>
          </View>

          {(education.length > 0 ? education : [{ }]).map((edu, idx) => (
            <View key={`edu-${idx}`} style={styles.tableRow}>
              <Text style={styles.colExam}>{edu.examination || edu.degree || "Bachelor of Technology"}</Text>
              <Text style={styles.colUniversity}>{edu.university || edu.school || "-"}</Text>
              <Text style={styles.colInstitute}>{edu.institute || edu.location || "-"}</Text>
              <Text style={styles.colYear}>{edu.year || "-"}</Text>
              <Text style={styles.colScore}>{edu.score || edu.grade || "-"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionBand}>
          <Text style={styles.sectionTitle}>Course Projects</Text>
        </View>
        {(projects.length > 0 ? projects : [{ }]).slice(0, 4).map((project, idx) => {
          const bullets = getBullets(project);
          return (
            <View key={`proj-${idx}`} style={styles.subsection}>
              <View style={styles.headingRow}>
                <Text style={styles.leftHeading}>
                  {(project.title || project.name || "Project Title")}
                  {(project.course || project.technologies) ? ` | ${project.course || project.technologies}` : ""}
                </Text>
                <Text style={styles.rightHeading}>{project.duration || project.date || ""}</Text>
              </View>

              {bullets.length > 0 ? (
                bullets.slice(0, 3).map((bullet, bIdx) => (
                  <View key={`proj-b-${idx}-${bIdx}`} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.mutedText}>Add project bullet points to complete IIT format details.</Text>
              )}
            </View>
          );
        })}

        <View style={styles.sectionBand}>
          <Text style={styles.sectionTitle}>Work Experience & Internships</Text>
        </View>
        {(experience.length > 0 ? experience : [{ }]).slice(0, 4).map((exp, idx) => {
          const bullets = getBullets(exp);
          return (
            <View key={`exp-${idx}`} style={styles.subsection}>
              <View style={styles.headingRow}>
                <Text style={styles.leftHeading}>{exp.position || exp.role || "Role"} | {exp.company || "Organization"}</Text>
                <Text style={styles.rightHeading}>{exp.duration || exp.date || ""}</Text>
              </View>

              {!!exp.location && <Text style={styles.metaLine}>{exp.location}</Text>}

              {bullets.length > 0 ? (
                bullets.slice(0, 3).map((bullet, bIdx) => (
                  <View key={`exp-b-${idx}-${bIdx}`} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.mutedText}>Add experience bullet points to complete IIT format details.</Text>
              )}
            </View>
          );
        })}

        <View style={styles.sectionBand}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
        </View>
        {(skillLines.length > 0 ? skillLines : [{ label: "Skills", value: "Add categorized skills" }]).map((line, idx) => (
          <View key={`skill-${idx}`} style={styles.skillLine}>
            <Text style={styles.skillLabel}>{line.label}: </Text>
            <Text style={styles.skillValue}>{line.value}</Text>
          </View>
        ))}

        <View style={styles.sectionBand}>
          <Text style={styles.sectionTitle}>POR & Extra-Curriculars</Text>
        </View>
        {(summaryLines.length > 0 ? summaryLines : ["Add summary/POR achievements for IIT format completeness."]).map((line, idx) => (
          <View key={`por-${idx}`} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};



