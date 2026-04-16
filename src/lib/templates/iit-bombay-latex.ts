export interface ResumeData {
  personalInfo: {
    fullName: string;
    rollNumber: string;
    department: string;
    degree: string;
    institute: string;
    gender: string;
  };
  education: {
    examination: string;
    university: string;
    institute: string;
    year: string;
    score: string;
  }[];
  thesis?: {
    title: string;
    guide: string;
    duration: string;
    currentWork: string[];
    futureWork: string[];
  };
  projects: {
    title: string;
    course: string;
    duration: string;
    points: string[];
  }[];
  skills: {
    programming: string;
    tools: string;
  };
  experience: {
    position: string;
    company: string;
    duration: string;
    points: string[];
  }[];
  por: {
    title: string;
    duration: string;
  }[];
}

const escapeLatex = (str: string) => {
  if (!str) return "";
  return str.replace(/[&%$#_{}~^\\]/g, (match) => {
    if (match === '\\') return '\\textbackslash{}';
    if (match === '~') return '\\textasciitilde{}';
    if (match === '^') return '\\textasciicircum{}';
    return `\\${match}`;
  });
};

export const generateIITBombayLatex = (data: ResumeData): string => {
  const educationRows = data.education.map(edu => 
    `${escapeLatex(edu.examination)} & ${escapeLatex(edu.university)} & ${escapeLatex(edu.institute)} & ${escapeLatex(edu.year)} & ${escapeLatex(edu.score)}\\\\`
  ).join('\n');

  const projectsLatex = data.projects.map(proj => `
\\item \\textbf{${escapeLatex(proj.title)}}, \\emph{(${escapeLatex(proj.course)})}\\hfill \\emph{(${escapeLatex(proj.duration)})} 
\\begin{itemize}[noitemsep,nolistsep]
${proj.points.map(p => `    \\item ${escapeLatex(p)}`).join('\n')}
\\end{itemize}
  `).join('\n');

  const experienceLatex = data.experience.map(exp => `
    \\item \\textbf{${escapeLatex(exp.position)}} | \\textbf{\\emph{${escapeLatex(exp.company)}}}\\hfill \\emph{(${escapeLatex(exp.duration)})}\\\\[-0.6cm]
    \\begin{itemize}[noitemsep]
${exp.points.map(p => `        \\item ${escapeLatex(p)}`).join('\n')}
    \\end{itemize}
  `).join('\n');

  const porLatex = data.por.map(p => `\\item ${escapeLatex(p.title)} \\hfill \\emph{(${escapeLatex(p.duration)})}`).join('\n\n');

  return `\\documentclass[a4paper,10pt]{article}

\\usepackage[top=0.75in, bottom=0.2in, left=0.35in, right=0.35in]{geometry}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{url}
\\usepackage{enumitem}
\\usepackage{palatino}
\\usepackage{tabularx}
\\fontfamily{SansSerif}
\\selectfont

\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}

\\usepackage{color}
\\definecolor{mygrey}{gray}{0.82}
\\textheight=9.75in
\\raggedbottom

\\setlength{\\tabcolsep}{0in}
\\newcommand{\\isep}{-2 pt}
\\newcommand{\\lsep}{-0.5cm}
\\newcommand{\\psep}{-0.6cm}
\\renewcommand{\\labelitemii}{$\\circ$}

\\pagestyle{empty}
%-----------------------------------------------------------
%Custom commands
\\newcommand{\\resitem}[1]{\\item #1 \\vspace{-2pt}}
\\newcommand{\\resheading}[1]{{\\small \\colorbox{mygrey}{\\begin{minipage}{0.99\\textwidth}{\\textbf{#1 \\vphantom{p\\^{E}}}}\\end{minipage}}}}
\\newcommand{\\ressubheading}[3]{
\\begin{tabular*}{6.62in}{l @{\\extracolsep{\\fill}} r}
	\\textsc{{\\textbf{#1}}} & \\textsc{\\textit{[#2]}} \\\\
\\end{tabular*}\\vspace{-8pt}}
%-----------------------------------------------------------

\\begin{document}
\\begin{table}
    \\begin{minipage}{0.15\\linewidth}
        \\centering
        % \\includegraphics[height =0.8in]{iit_logo.eps}
    \\end{minipage}
    \\begin{minipage}{0.65\\linewidth}
        \\setlength{\\tabcolsep}{70pt}
        \\def\\arraystretch{1.15}
        \\begin{tabular}{ll}
            \\textbf{\\Large{${escapeLatex(data.personalInfo.fullName)}}}  &  {${escapeLatex(data.personalInfo.rollNumber)}} \\\\
            \\textbf{${escapeLatex(data.personalInfo.department)}} & \\textbf{${escapeLatex(data.personalInfo.degree)}} \\\\
            ${escapeLatex(data.personalInfo.institute)} &  {${escapeLatex(data.personalInfo.gender)}}\\\\
        \\end{tabular}
    \\end{minipage}\\hfill
\\end{table}    

\\setlength{\\tabcolsep}{25pt}
\\begin{table}
\\centering
\\begin{tabular}{lllll}
\\toprule
\\textbf{Examination}    & \\textbf{University}   & \\textbf{Institute}    & \\textbf{Year}     & \\textbf{CPI/\\%} \\\\ 
\\toprule
${educationRows}
\\bottomrule \\\\[-0.75cm]
\\end{tabular}
\\end{table}

\\noindent \\resheading{\\textbf{B.TECH THESIS \\& SEMINAR}}\\\\[-0.3cm]
\\begin{itemize}[noitemsep,nolistsep]
\\item \\textbf{Thesis title: ${escapeLatex(data.thesis?.title || '')}} \\\\
\\emph{(Guide: \\textbf{${escapeLatex(data.thesis?.guide || '')}})} \\hfill \\emph{(${escapeLatex(data.thesis?.duration || '')})}\\\\
 \\textbf{Current work:}\\\\[-0.5cm]
    \\begin{itemize}[noitemsep,nolistsep]
${data.thesis?.currentWork.map(p => `        \\item ${escapeLatex(p)}`).join('\n') || ''}
    \\end{itemize}
\\textbf{Future work:}\\\\[-0.5cm]
    \\begin{itemize}[noitemsep,nolistsep]
${data.thesis?.futureWork.map(p => `        \\item ${escapeLatex(p)}`).join('\n') || ''}
    \\end{itemize} 
\\end{itemize}

\\noindent
\\resheading{\\textbf{COURSE PROJECTS} }\\\\[-0.3cm]
\\begin{itemize}[noitemsep,nolistsep]
${projectsLatex}
\\end{itemize}

\\noindent
\\resheading{\\textbf{TECHNICAL SKILLS}}\\\\[-0.4cm]
 \\begin{itemize}
  \\item \\textbf{Programming \\& Scripting Languages}: ${escapeLatex(data.skills.programming)}\\\\[-0.6cm]
  \\item \\textbf{Tools \\& Libraries}: ${escapeLatex(data.skills.tools)} \\\\[-0.5cm]
  \\end{itemize}

\\noindent
\\resheading{\\textbf{WORK EXPERIENCE \\& INTERNSHIPS}}\\\\[-0.3cm]
\\begin{itemize}[noitemsep,nolistsep]
${experienceLatex}
\\end{itemize}

\\noindent
\\resheading{\\textbf{POR \\& EXTRA-CURRICULARS}}\\\\[-0.4cm]
\\begin{itemize}
\\setlength\\itemsep{-0.4em}
${porLatex}
\\end{itemize}

\\end{document}`;
};
