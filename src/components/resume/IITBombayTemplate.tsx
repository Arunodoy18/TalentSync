"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles tailored for the ultra-dense, 10pt Sans-Serif IIT Bombay format
const styles = StyleSheet.create({
  page: {
    paddingTop: 36, // ~0.5in
    paddingBottom: 24, // ~0.33in
    paddingLeft: 36, // ~0.5in
    paddingRight: 36, // ~0.5in
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#000",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerLeft: {
    width: "25%",
  }, 
  headerCenter: {
    width: "50%",
    textAlign: "center",
  },
  headerRight: {
    width: "25%",
    textAlign: "right",
    fontSize: 9,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "bold",
  },
  subSubtitle: {
    fontSize: 9,
  },
  sectionTitleBox: {
    backgroundColor: "#d9d9d9", // Typical gray box
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#000",
    marginTop: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#a0a0a0",
    paddingVertical: 3,
  },
  tableHeader: {
    fontWeight: "bold",
  },
  tableCol1: { width: "25%", textAlign: "left", paddingLeft: 4 },
  tableCol2: { width: "35%", textAlign: "center" },
  tableCol3: { width: "25%", textAlign: "center" },
  tableCol4: { width: "15%", textAlign: "right", paddingRight: 4 },
  
  entryItem: {
    marginBottom: 4,
  },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTitle: {
    fontWeight: "bold",
    fontSize: 9.5,
  },
  entryDate: {
    fontStyle: "italic",
    fontSize: 9,
    textAlign: "right",
  },
  bulletList: {
    paddingLeft: 8,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  bulletDot: {
    width: 8,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.2,
  }
});

type Props = {
  basics: { name: string; email: string; phone: string; location: string; summary: string; linkedin?: string };
  experience: any[];
  education: any[];
  skills: string;
};

// Represents the Ultra-Dense IIT Bombay LaTeX Template Structure
export const IITBombayTemplate = ({ basics, experience, education, skills }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header replicating the IITB centered logo/name layout */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {/* Typically where the seal goes, omitting for textual density */}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.name}>{basics.name || "Your Name"}</Text>
          <Text style={styles.subtitle}>Software Engineer</Text>
          <Text style={styles.subSubtitle}>{basics.location || "City, State"}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text>{basics.email}</Text>
          <Text>{basics.phone}</Text>
          {basics.linkedin && <Text>{basics.linkedin}</Text>}
        </View>
      </View>

      {/* Education - Rendered as a formal tabular format */}
      {education && education.length > 0 && (
        <View>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Education</Text>
          </View>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol1}>Degree</Text>
              <Text style={styles.tableCol2}>University / Institute</Text>
              <Text style={styles.tableCol3}>Year</Text>
              <Text style={styles.tableCol4}>CPI/%</Text>
            </View>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{edu.degree || "Degree"}</Text>
                <Text style={styles.tableCol2}>{edu.school || "University Name"}</Text>
                <Text style={styles.tableCol3}>{edu.year || "20xx"}</Text>
                <Text style={styles.tableCol4}>{edu.grade || "N/A"}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Experience - Work & Internships */}
      {experience && experience.length > 0 && (
        <View>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Work Experience & Internships</Text>
          </View>
          <View style={styles.bulletList}>
            {experience.map((exp, idx) => (
              <View key={idx} style={styles.entryItem}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>
                    â€¢ {exp.role || "Role"} | <Text style={{ fontWeight: "normal" }}>{exp.company || "Company"}</Text>
                  </Text>
                  <Text style={styles.entryDate}>{exp.location || "Duration/Location"}</Text>
                </View>
                {exp.bullets && exp.bullets.map((bullet: string, bIdx: number) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={[styles.bulletDot, { paddingLeft: 8 }]}>â—¦</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills Component (Dense Category based) */}
      {skills && (
        <View>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>â€¢</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Core Competencies: </Text>
                {skills}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Summary / Extracurriculars mapping */}
      {basics.summary && (
        <View>
           <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Positions of Responsibility & Profile</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>â€¢</Text>
              <Text style={styles.bulletText}>{basics.summary}</Text>
            </View>
          </View>
        </View>
      )}
    </Page>
  </Document>
);



