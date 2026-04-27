"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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

const toActionSentence = (value: string, fallback: string): string => {
  const cleaned = value.replace(/^[\-\u2022\s]+/, "").replace(/\s+/g, " ").trim();
  const base = cleaned || fallback;
  const normalized = base.charAt(0).toUpperCase() + base.slice(1);

  const startsWithVerb = ACTION_VERBS.some((verb) =>
    new RegExp(`^${verb}\\b`, "i").test(normalized)
  );

  const withVerb = startsWithVerb
    ? normalized
    : `Delivered ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;

  const noEndingPunctuation = withVerb.replace(/[.!?]+$/g, "").trim();
  return `${noEndingPunctuation}.`;
};

const normalizeBulletList = (raw: unknown, fallback: string): string[] => {
  const items = Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  if (items.length === 0) {
    return [
      toActionSentence(fallback, fallback),
      toActionSentence("Improved results with measurable execution", fallback),
    ];
  }
  return items.slice(0, 4).map((item) => toActionSentence(item, fallback));
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 16,
    fontFamily: "Times-Roman",
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
    fontSize: 18,
    marginBottom: 0,
    lineHeight: 1.3,
  },
  contactInfo: {
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    lineHeight: 1.3,
  },
  section: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 10.5,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    fontFamily: "Times-Bold",
    lineHeight: 1.3,
  },
  entryText: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  entryBlock: {
    marginTop: 0,
    marginBottom: 0,
  },
  boldText: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  italicText: {
    fontFamily: "Times-Italic",
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  metaText: {
    fontFamily: "Times-Italic",
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  bulletList: {
    marginTop: 0,
    marginBottom: 0,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 0,
    marginBottom: 0,
  },
  bulletDot: {
    width: 10,
    paddingLeft: 2,
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  skillsCategory: {
    flexDirection: "row",
    marginBottom: 0,
  },
});

type Props = {
  basics: { name: string; email: string; phone: string; location: string; linkedin?: string; github?: string; summary?: string };
  experience: Array<Record<string, unknown>>;
  education: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  skills: string;
};

// Represents the famous "Jake's Resume" LaTeX format
export const JakesTemplate = ({ basics, experience, education, projects, skills }: Props) => {
  // Build the contact string separated by |
  const contactParts = [
    basics.phone,
    basics.email,
    basics.linkedin,
    basics.github,
    basics.location
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{basics.name || "Your Name"}</Text>
            <Text style={styles.contactInfo}>{contactParts.join(" | ")}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {(education.length > 0 ? education : [{}]).map((edu, idx) => (
              <View key={`edu-${idx}`} style={styles.entryBlock}>
                <Text style={styles.boldText}>{String(edu.school || edu.university || "Institute")}</Text>
                <Text style={styles.metaText}>
                  {String(edu.degree || "Degree")} | {String(edu.location || edu.year || "Year")} {edu.grade ? `| GPA/CPI: ${String(edu.grade)}` : ""}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {(experience.length > 0 ? experience : [{}]).map((exp, idx) => {
              const bullets = normalizeBulletList(
                (exp as { bullets?: string[]; points?: string[] }).bullets ||
                  (exp as { bullets?: string[]; points?: string[] }).points ||
                  [],
                "Led execution of core responsibilities with measurable impact"
              );

              return (
                <View key={`exp-${idx}`} style={styles.entryBlock}>
                  <Text style={styles.boldText}>{String(exp.role || exp.position || "Role")}</Text>
                  <Text style={styles.metaText}>
                    {String(exp.company || "Company")} | {String(exp.location || exp.date || exp.duration || "Timeline")}
                  </Text>
                  <View style={styles.bulletList}>
                    {bullets.map((bullet, bIdx) => (
                      <View key={`exp-b-${idx}-${bIdx}`} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {(projects && projects.length > 0 ? projects : [{}]).map((proj, idx) => {
              const bullets = normalizeBulletList(
                (proj as { bullets?: string[]; points?: string[] }).bullets ||
                  (proj as { bullets?: string[]; points?: string[] }).points ||
                  [],
                "Built a project that improved reliability and delivery speed"
              );

              return (
                <View key={`proj-${idx}`} style={styles.entryBlock}>
                  <Text style={styles.boldText}>{String(proj.name || proj.title || "Project")}</Text>
                  <Text style={styles.metaText}>
                    {String(proj.technologies || "Tech Stack")} | {String(proj.date || proj.duration || "Timeline")}
                  </Text>
                  <View style={styles.bulletList}>
                    {bullets.map((bullet, bIdx) => (
                      <View key={`proj-b-${idx}-${bIdx}`} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.skillsCategory}>
              <Text style={styles.boldText}>Skills: </Text>
              <Text style={styles.entryText}>{skills || "Programming, frameworks, tooling, and systems design"}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};



