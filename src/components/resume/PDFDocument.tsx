"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Create styles mimicking a standard FAANG single-column resume
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#000",
  },
  header: {
    marginBottom: 15,
    textAlign: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#444",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginTop: 12,
    marginBottom: 6,
    paddingBottom: 2,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  jobTitle: {
    fontWeight: "bold",
  },
  company: {
    fontStyle: "italic",
  },
  dateLocation: {
    color: "#666",
  },
  bulletPointRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 5,
  },
  bulletPointDot: {
    width: 6,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.3,
  },
});

type Props = {
  basics: { name: string; email: string; phone: string; location: string; summary: string };
  experience: any[];
  education: any[];
  skills: string;
};

// Pure React Component returning <Document> for @react-pdf/renderer
export const ResumePDF = ({ basics, experience, education, skills }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{basics.name || "Your Name"}</Text>
        <Text style={styles.contact}>
          {[basics.email, basics.phone, basics.location].filter(Boolean).join(" â€¢ ")}
        </Text>
      </View>

      {/* Summary */}
      {basics.summary && (
        <View>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summary}>{basics.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp, idx) => (
            <View key={idx} style={styles.experienceItem}>
              <View style={styles.expHeader}>
                <Text style={styles.jobTitle}>{exp.role || "Role"} <Text style={styles.company}>at {exp.company || "Company"}</Text></Text>
                <Text style={styles.dateLocation}>{exp.location || ""}</Text>
              </View>
              {exp.bullets && exp.bullets.map((bullet: string, bIdx: number) => (
                <View key={bIdx} style={styles.bulletPointRow}>
                  <Text style={styles.bulletPointDot}>â€¢</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, idx) => (
            <View key={idx} style={{ marginBottom: 4 }}>
              <Text><Text style={{ fontWeight: "bold" }}>{edu.degree || "Degree"}</Text> - {edu.school || "University"}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {skills && (
        <View>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.summary}>{skills}</Text>
        </View>
      )}
    </Page>
  </Document>
);




