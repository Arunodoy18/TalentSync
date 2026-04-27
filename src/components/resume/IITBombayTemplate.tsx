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

const ACTION_VERBS = [
  "Built",
  "Created",
  "Designed",
  "Developed",
  "Drove",
  "Enhanced",
  "Executed",
  "Improved",
  "Implemented",
  "Increased",
  "Led",
  "Managed",
  "Optimized",
  "Reduced",
  "Scaled",
  "Streamlined",
];

const getBullets = (item: { bullets?: string[]; points?: string[] }): string[] => {
  if (Array.isArray(item.bullets) && item.bullets.length > 0) return item.bullets;
  if (Array.isArray(item.points) && item.points.length > 0) return item.points;
  return [];
};

const toActionSentence = (value: string, fallback: string): string => {
  const cleaned = value.replace(/^[\-\u2022\s]+/, "").replace(/\s+/g, " ").trim();
  const base = cleaned || fallback;
  const sentenceStart = base.charAt(0).toUpperCase() + base.slice(1);

  const startsWithVerb = ACTION_VERBS.some((verb) =>
    new RegExp(`^${verb}\\b`, "i").test(sentenceStart)
  );

  const withVerb = startsWithVerb
    ? sentenceStart
    : `Delivered ${sentenceStart.charAt(0).toLowerCase()}${sentenceStart.slice(1)}`;

  const noEndingPunctuation = withVerb.replace(/[.!?]+$/g, "").trim();
  return `${noEndingPunctuation}.`;
};

const normalizeBulletList = (raw: string[], fallback: string): string[] => {
  const source = raw.filter(Boolean);
  if (source.length === 0) {
    return [
      toActionSentence(fallback, fallback),
      toActionSentence("Improved outcomes with measurable impact", fallback),
    ];
  }

  return source.slice(0, 4).map((item) => toActionSentence(item, fallback));
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
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 18,
    paddingRight: 18,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.3,
    color: "#000",
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
    marginBottom: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  contactRow: {
    marginTop: 1,
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  section: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sectionBand: {
    backgroundColor: "#d1d1d1",
    paddingVertical: 0,
    paddingHorizontal: 3,
    marginTop: 0,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    lineHeight: 1.3,
  },
  table: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.7,
    borderColor: "#000",
    paddingVertical: 0,
    fontWeight: "bold",
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.35,
    borderColor: "#b7b7b7",
    paddingVertical: 0,
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  colExam: { width: "30%", paddingLeft: 2 },
  colUniversity: { width: "26%" },
  colInstitute: { width: "22%" },
  colYear: { width: "10%", textAlign: "right" },
  colScore: { width: "12%", textAlign: "right", paddingRight: 2 },
  subsection: {
    marginBottom: 0,
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  leftHeading: {
    width: "78%",
    fontSize: 10.5,
    fontWeight: "bold",
    lineHeight: 1.3,
  },
  rightHeading: {
    width: "22%",
    textAlign: "right",
    fontSize: 10.5,
    fontWeight: "bold",
    fontStyle: "italic",
    lineHeight: 1.3,
  },
  metaLine: {
    fontSize: 10.5,
    fontStyle: "italic",
    marginBottom: 0,
    lineHeight: 1.3,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 0,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  bulletText: {
    width: "96%",
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  skillLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 1,
    marginBottom: 0,
  },
  skillLabel: {
    fontWeight: "bold",
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  skillValue: {
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  mutedText: {
    fontSize: 10.5,
    color: "#2a2a2a",
    lineHeight: 1.3,
  },
});
export const IITTemplate = ({ basics, experience, education, projects = [], skills }: Props) => {
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{(basics.name || "YOUR NAME").toUpperCase()}</Text>
            <Text style={styles.contactRow}>{contactParts.join("  |  ")}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionBand}>
              <Text style={styles.sectionTitle}>Education</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colExam}>Examination</Text>
                <Text style={styles.colUniversity}>University</Text>
                <Text style={styles.colInstitute}>Institute</Text>
                <Text style={styles.colYear}>Year</Text>
                <Text style={styles.colScore}>CPI%</Text>
              </View>

              {(education.length > 0 ? education : [{}]).map((edu, idx) => (
                <View key={`edu-${idx}`} style={styles.tableRow}>
                  <Text style={styles.colExam}>{edu.examination || edu.degree || "Bachelor of Technology"}</Text>
                  <Text style={styles.colUniversity}>{edu.university || edu.school || "-"}</Text>
                  <Text style={styles.colInstitute}>{edu.institute || edu.location || "-"}</Text>
                  <Text style={styles.colYear}>{edu.year || "-"}</Text>
                  <Text style={styles.colScore}>{edu.score || edu.grade || "-"}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionBand}>
              <Text style={styles.sectionTitle}>Course Projects</Text>
            </View>
            {(projects.length > 0 ? projects : [{}]).slice(0, 4).map((project, idx) => {
              const bullets = normalizeBulletList(
                getBullets(project),
                "Built a project that delivered measurable user impact"
              );

              return (
                <View key={`proj-${idx}`} style={styles.subsection}>
                  <View style={styles.headingRow}>
                    <Text style={styles.leftHeading}>
                      {project.title || project.name || "Project Title"}
                      {project.course || project.technologies
                        ? ` | ${project.course || project.technologies}`
                        : ""}
                    </Text>
                    <Text style={styles.rightHeading}>{project.duration || project.date || ""}</Text>
                  </View>

                  {bullets.map((bullet, bIdx) => (
                    <View key={`proj-b-${idx}-${bIdx}`} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionBand}>
              <Text style={styles.sectionTitle}>Work Experience & Internships</Text>
            </View>
            {(experience.length > 0 ? experience : [{}]).slice(0, 4).map((exp, idx) => {
              const bullets = normalizeBulletList(
                getBullets(exp),
                "Led execution on key deliverables for business-critical goals"
              );

              return (
                <View key={`exp-${idx}`} style={styles.subsection}>
                  <View style={styles.headingRow}>
                    <Text style={styles.leftHeading}>
                      {exp.position || exp.role || "Role"} | {exp.company || "Organization"}
                    </Text>
                    <Text style={styles.rightHeading}>{exp.duration || exp.date || ""}</Text>
                  </View>

                  {!!exp.location && <Text style={styles.metaLine}>{exp.location}</Text>}

                  {bullets.map((bullet, bIdx) => (
                    <View key={`exp-b-${idx}-${bIdx}`} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionBand}>
              <Text style={styles.sectionTitle}>Technical Skills</Text>
            </View>
            {(skillLines.length > 0
              ? skillLines
              : [{ label: "Skills", value: "Programming, frameworks, tools, and coursework" }]
            ).map((line, idx) => (
              <View key={`skill-${idx}`} style={styles.skillLine}>
                <Text style={styles.skillLabel}>{line.label}: </Text>
                <Text style={styles.skillValue}>{line.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionBand}>
              <Text style={styles.sectionTitle}>POR & Extra-Curriculars</Text>
            </View>
            {(summaryLines.length > 0
              ? summaryLines.map((line) => toActionSentence(line, "Led an initiative with visible outcomes"))
              : [
                  "Led an initiative with visible outcomes.",
                  "Organized activities that improved collaboration and delivery.",
                ]
            ).map((line, idx) => (
              <View key={`por-${idx}`} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const IITBombayTemplate = IITTemplate;
export const IITGuwahatiTemplate = IITTemplate;



