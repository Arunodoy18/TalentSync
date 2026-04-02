"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles tailored for the classic "Jake's Resume" formal LaTeX structure
const styles = StyleSheet.create({
  page: {
    padding: 36, // 0.5in margins
    fontFamily: "Times-Roman", // Jake's uses a standard serif LaTeX font
    fontSize: 10.5, // Standard 10-11pt
    color: "#000",
  },
  header: {
    textAlign: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 10,
    fontFamily: "Times-Roman",
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    marginTop: 8,
    marginBottom: 6,
    fontFamily: "Times-Roman", // Needs a bold variant look if possible, but standard caps works
  },
  entryText: {
    fontFamily: "Times-Roman",
  },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boldText: {
    fontFamily: "Times-Bold",
  },
  italicText: {
    fontFamily: "Times-Italic",
  },
  bulletList: {
    marginTop: 2,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
  },
  bulletDot: {
    width: 12,
    paddingLeft: 6,
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.2,
  },
  skillsCategory: {
    flexDirection: "row",
    marginBottom: 2,
  }
});

type Props = {
  basics: { name: string; email: string; phone: string; location: string; linkedin?: string; github?: string; summary?: string };
  experience: any[];
  education: any[];
  projects?: any[];
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
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{basics.name || "Your Name"}</Text>
          <Text style={styles.contactInfo}>{contactParts.join(" | ")}</Text>
        </View>

        {/* Education */}
        {education && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.boldText}>{edu.school}</Text>
                  <Text style={styles.entryText}>{edu.location || edu.year}</Text>
                </View>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.italicText}>{edu.degree}</Text>
                  <Text style={styles.entryText}>{edu.grade ? `GPA: ${edu.grade}` : ""}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.boldText}>{exp.role}</Text>
                  <Text style={styles.entryText}>{exp.location || exp.date || "Present"}</Text>
                </View>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.italicText}>{exp.company}</Text>
                </View>
                <View style={styles.bulletList}>
                  {exp.bullets && exp.bullets.map((bullet: string, bIdx: number) => (
                    <View key={bIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects (If any, usually mapping experience structure) */}
        {projects && projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.boldText}>{proj.name} | <Text style={styles.italicText}>{proj.technologies}</Text></Text>
                  <Text style={styles.entryText}>{proj.date}</Text>
                </View>
                <View style={styles.bulletList}>
                  {proj.bullets && proj.bullets.map((bullet: string, bIdx: number) => (
                    <View key={bIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills */}
        {skills && (
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.skillsCategory}>
              <Text style={styles.boldText}>Skills: </Text>
              <Text style={styles.entryText}>{skills}</Text>
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
};