# TalentSync Premium SaaS Design System

## Core Philosophy
TalentSync is not a clustered dashboard. It is a guided SaaS workflow designed to take users through a critical journey:
**Build Resume → Match Jobs → Auto Apply**

Everything secondary must be deprioritized. Dashboards are for overview, data, and decisions, not for performing raw actions everywhere at once. 

## 1. Navigation Structure
**Sidebar Order:**
- Dashboard (Overview)
- Resumes
- Jobs
- Auto Apply
- ATS Score
- AI Tools
- Analytics
- Admin
- Settings

## 2. Page Architectures

**Dashboard:**
- *Focus:* Overview only.
- *Visuals:* ATS Score, Match Rate, Applications Sent, Interviews, Resume Strength.
- *Actions:* Create Resume, Find Jobs, Auto Apply.

**Resumes Page:**
- *Layout Split:* 
  - [ Choose Template ] (Select IIT / Jake -> Pick Projects -> Pick Experience -> Generate)
  - [ Build with AI ] (Fill Form -> AI generation)

**Jobs Page:**
- *Content:* Recommendations, Match %, Missing skills, Salary, Apply button.
- *Filters:* Location, Role, Salary, Remote, Experience.

**Auto Apply Page:**
- *Tracking List:* Job, Company, Status, Date.

## 3. Visual Language

**Color Palette:**
- `--bg`: `#0F172A` (Deep Navy)
- `--card`: `#111827` (Dark Card)
- `--border`: `#1F2937`
- `--primary`: `#D4AF37` (SaaS Premium Gold)
- `--primary-light`: `#F5D97E`
- `--text`: `#F9FAFB` (Pure White)
- `--text-muted`: `#9CA3AF` (Grey for secondary details)
- `--success`: `#22C55E`
- `--danger`: `#EF4444`

*(No random purples/blues. Strict 3 color focus + neutrals)*

**Typography:**
- *Font Family:* Inter
- *Heading:* `font-weight: 600`
- *Body:* `font-weight: 400`
- *Button:* `font-weight: 500`
- *Letter Spacing:* `0.2px`

**Spacing System (Strict):**
- *Section gap:* `32px`
- *Card padding:* `24px`
- *Grid gap:* `24px`
- *Button height:* `44px`
- *Border radius:* `12px`

## 4. UX Patterns
- Use Empty States.
- Use Loading Skeletons rather than spinners where appropriate.
- Include page transitions and smooth scale animations.
- Language should be sharp:
  *Hero:* "Build a MAANG-Level Resume. Get Matched to the Right Jobs. Auto-Apply with AI."
  *Subline:* "TalentSync builds ATS-optimized resumes, finds the best matching jobs, and applies for you automatically."