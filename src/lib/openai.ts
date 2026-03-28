import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHAT_MODEL = 'gpt-4o';
const EMBEDDING_MODEL = 'text-embedding-3-small';

function safeParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export interface ParsedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
  };
  experience: {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    name: string;
    description: string;
    highlights: string[];
  }[];
}

export async function parseResumeWithAI(text: string): Promise<ParsedResume> {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert ATS (Applicant Tracking System) parser. 
        Extract structured information from the provided resume text. 
        Return the result in strict JSON format matching the ParsedResume interface.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return safeParseJson<ParsedResume>(response.choices[0].message.content, {} as ParsedResume);
}

export async function generateTailoredResume(
  resumeData: any,
  jobDescription: string
): Promise<any> {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert resume writer. 
        Tailor the provided resume data to match the job description. 
        Optimize for ATS keywords and highlight relevant experiences.
        Maintain the same JSON structure.`,
      },
      {
        role: 'user',
        content: `Resume Data: ${JSON.stringify(resumeData)}\n\nJob Description: ${jobDescription}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return safeParseJson<Record<string, unknown>>(response.choices[0].message.content, {});
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

export async function calculateATSScore(
  resumeData: any,
  jobDescription: string
): Promise<{
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  breakdown: {
    keywordMatch: number;
    experienceMatch: number;
    skillsMatch: number;
    educationMatch: number;
    formatting: number;
    metricsImpact: number;
  };
}> {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an ATS optimization engine.
Analyze the resume against the job description and return strict JSON.

Use this weighted formula for final score:
- 30% keywordMatch
- 25% experienceMatch
- 15% skillsMatch
- 10% educationMatch
- 10% formatting
- 10% metricsImpact

Each component must be 0-100.
Return EXACT fields:
{
  "score": number,
  "matchingSkills": string[],
  "missingSkills": string[],
  "suggestions": string[],
  "breakdown": {
    "keywordMatch": number,
    "experienceMatch": number,
    "skillsMatch": number,
    "educationMatch": number,
    "formatting": number,
    "metricsImpact": number
  }
}`,
      },
      {
        role: 'user',
        content: `Resume Data: ${JSON.stringify(resumeData)}\n\nJob Description: ${jobDescription}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return safeParseJson<{
    score: number;
    matchingSkills: string[];
    missingSkills: string[];
    suggestions: string[];
    breakdown: {
      keywordMatch: number;
      experienceMatch: number;
      skillsMatch: number;
      educationMatch: number;
      formatting: number;
      metricsImpact: number;
    };
  }>(response.choices[0].message.content, {
    score: 0,
    matchingSkills: [],
    missingSkills: [],
    suggestions: [],
    breakdown: {
      keywordMatch: 0,
      experienceMatch: 0,
      skillsMatch: 0,
      educationMatch: 0,
      formatting: 0,
      metricsImpact: 0,
    },
  });
}
