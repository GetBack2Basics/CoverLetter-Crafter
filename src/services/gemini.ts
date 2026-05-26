import { GoogleGenAI, Type } from "@google/genai";
import { CandidateProfile } from "../types";

// Initialize the Google GenAI SDK with recommended telemetry headers
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Use the standard high-performance text model
const TEXT_MODEL = "gemini-3.5-flash";

export async function extractJobDetails(jobDescription: string) {
  const prompt = `
    Extract the following details from this job description:
    1. Company Name (The actual employer, not the job board or website name. Look for "About the Employer", "Join our team at...", or the organization logo/header description).
    2. Job Title
    3. Key Requirements (list of 3-5 most important technical skills or experiences)
    4. Hiring Manager Name (if available, otherwise "Hiring Manager")
    5. Cover Letter Specifics (Any specific instructions mentioned, e.g., "address selection criteria", "limit to 2 pages", "mention job reference number X").
    6. Company Info (A brief 1-2 sentence summary of what the company does, their mission, or values found in the description).
    7. Application Email (The email address mentioned in the job description to send the application to, if available).

    Job Description/URL:
    ${jobDescription}

    IMPORTANT: Your response MUST be a JSON object with these keys: "companyName", "jobTitle", "keyRequirements", "hiringManager", "coverLetterSpecifics", "companyInfo", "applicationEmail".
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text || "{}") as { 
      companyName: string; 
      jobTitle: string; 
      keyRequirements: string[]; 
      hiringManager: string;
      coverLetterSpecifics: string;
      companyInfo: string;
      applicationEmail: string;
    };
  } catch (error) {
    console.error("Error extracting job details:", error);
    throw error;
  }
}

export async function generateCoverLetter(
  jobDescription: string, 
  companyName: string, 
  jobTitle: string,
  hiringManager: string,
  coverLetterSpecifics: string,
  companyInfo: string,
  keyRequirements: string[],
  profileData: CandidateProfile,
  tone: string = "professional", 
  iterativeFeedback?: string, 
  currentLetter?: string,
  selectedText?: string
) {
  const currentDate = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });

  let prompt = "";
  
  const expBullets = (profileData.experience || []).map(exp => 
    `- ${exp.title} at ${exp.company} (${exp.period}):\n  ${(exp.highlights || []).map(h => `* ${h}`).join('\n  ')}`
  ).join('\n');

  const eduBullets = (profileData.education || []).map(edu => 
    `- ${edu.degree} from ${edu.institution} (${edu.year})`
  ).join('\n');

  const goldenRules = `
    CANDIDATE INFORMATION (Write purely based on this active candidate description):
    - Candidate Name: ${profileData.name}
    - Professional Summary: ${profileData.summary}
    - Contact Details: Email: ${profileData.email} | Phone: ${profileData.phone} | Location: ${profileData.location} | LinkedIn: ${profileData.linkedin}
    
    DETAILED EXPERIENCE STORYBOARD:
    ${expBullets}
    
    EDUCATION SUMMARY:
    ${eduBullets}

    SKILLS PRESETS:
    ${(profileData.skills || []).join(', ')}

    GOLDEN RULES FOR THE COVER LETTER:
    1. TAILORING OVER PRAISE: Research the company mission/values. ${companyInfo ? `Company Context: ${companyInfo}` : 'Research the company mission/values from the job ad.'} Highlight real alignment. Avoid vague "resonates deeply with me" puffery.
    2. SPECIFIC ACHIEVEMENTS (NO HOLES): Connect requirements directly to the candidate's actual projects, highlights, and technical outputs from their profile. No generic filler. Explicitly show how past achievements transfer directly.
    3. NO VAGUE/MOCK CLAIMS: Do not use generic placeholders or vague "a decade of experience" or "producing stats". Use specific, professional terms, actual deliverables, and technical parameters present in the candidate's experience.
    4. STRUCTURE: 
       - Header: Start with the following centered contact info block using <center> tags:
         <center>${profileData.name} | ${profileData.location} | ${profileData.phone} | ${profileData.email} | ${profileData.linkedin} </center>
         Followed immediately by the Current Date (${currentDate}) on the next line, also centered using <center> tags.
       - Salutation: Address ${hiringManager || "Hiring Manager"} at ${companyName}.
       - First Paragraph (THE INTEGRATED HOOK): Avoid cookie-cutter statements. Use this flow customized to the candidate's actual summary:
         "To support ${companyName}'s current focus on [Requirement] as a ${jobTitle}, I bring deep professional expertise in ${profileData.skills?.[0] || 'domain competencies'}. For example, during my tenure as ${profileData.experience?.[0]?.title || 'my recent role'}, I successfully [concrete major highlight from the candidate's first experience]. I am highly eager to leverage this capability to support ${companyName}'s active goals."
       - Body: 2-3 paragraphs of direct, concrete achievements linked specifically to the key requirements. Bold key phrases and technical skills to make the letter scannable.
       - Close: Forward-looking, confident, and professional.
    5. AVOID WEAK PHRASES: Eliminate "I am excited", "I am writing to express my interest", "hope we can connect soon".
    6. SENIORITY: Emphasize standard operating procedures, leadership in execution, and rigorous quality assurance.
    7. LENGTH: 300-400 words maximum.
    8. SIGN-OFF: Always end the letter with a professional sign-off ("Sincerely," or "Best regards,") followed by the candidate's name: ${profileData.name}.
    9. MANDATORY MENTIONS: You MUST explicitly mention ${companyName} and the details of ${jobTitle}.
    10. SPECIFIC INSTRUCTIONS: ${coverLetterSpecifics ? `Follow these specific instructions: ${coverLetterSpecifics}` : 'Follow standard professional cover letter conventions.'}
    11. KEY REQUIREMENTS TO FOCUS ON:
        ${(keyRequirements || []).map(req => `- ${req}`).join('\n')}
    12. EMAIL DRAFT RULES:
        - Subject: Must be clear and professional, e.g., "Application for ${jobTitle} - ${profileData.name}".
        - Body: Extremely concise (3-4 sentences). Mention the attached cover letter and resume. Express enthusiasm briefly. Use natural, direct language.
  `;

  const outputFormat = `
    IMPORTANT: Your response MUST be a JSON object with these keys:
    1. "letter": The updated/generated cover letter in Markdown format.
    2. "advice": Any career coaching advice, explanations, or answers to questions.
    3. "emailSubject": A professional email subject line.
    4. "emailBody": A short, direct email body for submission.
  `;

  if (iterativeFeedback && currentLetter) {
    const sectionContext = selectedText 
      ? `The user has SELECTED this specific text to change: "${selectedText}"`
      : "The user wants to modify the whole letter.";

    prompt = `
      You are an expert career coach. 
      ${sectionContext}
      
      Current Cover Letter:
      ${currentLetter}
      
      User Input (Feedback or Question):
      ${iterativeFeedback}
      
      ${goldenRules}
      
      STRICT INSTRUCTIONS:
      1. If the user selected text, ONLY modify that specific section while keeping the rest of the letter consistent.
      2. Apply the GOLDEN RULES to any new text generated.
      3. Use ONLY provided profile data.
      
      ${outputFormat}
    `;
  } else {
    prompt = `
      You are an expert career coach. Generate a personalized cover letter for the candidate.
      
      ${goldenRules}
      
      STRICT DATA SOURCE:
      - Use ONLY information from the User Profile and Job Description.
      - DO NOT hallucinate experience outside the profile context.
      
      ${outputFormat}
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result as { 
      letter: string; 
      advice: string;
      emailSubject?: string;
      emailBody?: string;
    };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
}

export async function removeAiVoice(
  currentLetter: string,
  profileData: CandidateProfile,
  companyName: string,
  jobTitle: string
) {
  const prompt = `
    You are an expert career coach who helps senior professional candidates write authentic, human-sounding cover letters. Your goal is to make the letter sound like a real experienced professional wrote it — not like AI or generic HR writing.
    
    TASK:
    Rewrite the original cover letter so it sounds natural, confident, and human while remaining professional.
    
    ORIGINAL DRAFT:
    ${currentLetter}
    
    CORE LEVEL RULES (Follow these strictly):
    1. PRIORITISE SIMPLICITY & AUTHENTICITY:
       - Use plain, direct language. Write like an experienced expert speaking, not a corporate marketing writer.
       - Prefer concrete details over abstract phrases.
       - Avoid buzzwords like "trusted insights", "high-impact decision making", "technical credibility", "foster deep relationships", "collaborative ecosystem".
    
    2. TONE & STYLE:
       - Conversational but professional, reflecting confidence.
       - Vary sentence length. Include some short, punchy sentences.
       - Sound experienced and matter-of-fact, not salesy or aspirational.
    
    3. STRUCTURE:
       - Maximum 5 paragraphs.
       - First paragraph: State the role and briefly mention the most relevant experience or core skill of ${profileData.name}.
       - Middle paragraphs: Focus on 2–3 strongest achievements with specific tools/projects present in the candidate's profile.
       - Final paragraph: Short, genuine interest in the role + call to talk.
    
    4. WHAT TO AVOID:
       - Abstract or generic competency language ("provide reliable insights", "guide stakeholders", "delivery of reliable services", etc.).
       - Smooth, perfect transitions between every paragraph.
       - Mission-statement style endings.
       - Repeating "This experience allows me to..." or "My approach uses...".
       - Phrases that feel AI-polished.
    
    5. STRENGTHEN:
       - Keep all specific technical details or tools of the candidate.
       - Make the connection to ${companyName} operational and practical.
       - Bold key words to make it extremely scan-friendly.
    
    STRICT DATA SOURCE:
    - Use candidate name: ${profileData.name}
    - Role: ${jobTitle} at ${companyName}

    IMPORTANT: Your response MUST be a JSON object with these keys:
    1. "letter": The rewritten cover letter in Markdown format (including the centred contact header).
    2. "advice": A brief explanation of what changes were made to humanize the voice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result as { letter: string; advice: string };
  } catch (error) {
    console.error("Error humanizing cover letter:", error);
    throw error;
  }
}

export async function analyzeCoverLetter(
  currentLetter: string,
  jobDescription: string,
  profileData: CandidateProfile
) {
  const prompt = `
    You are an expert career coach and hiring manager. Your task is to analyze the current cover letter against the job description and the candidate's profile.
    
    Current Cover Letter:
    ${currentLetter}
    
    Job Description:
    ${jobDescription}
    
    Candidate Profile:
    - Name: ${profileData.name}
    - Summary: ${profileData.summary}
    - Skills: ${(profileData.skills || []).join(", ")}
    - Experience: ${(profileData.experience || []).map(e => `${e.title} at ${e.company}`).join(", ")}
    
    TASK:
    Identify 3-5 specific, actionable areas for improvement. Focus on:
    1. Missing Keywords: What critical skills or keywords from the job description are missing?
    2. Over-Generalization: Where is the letter too generic or "AI-sounding"?
    3. Achievement Gaps: What specific achievement from the candidate's profile would have more impact if included/expanded?
    4. Structural Weakness: Is the opening or closing weak?
    
    IMPORTANT: Your response MUST be a JSON object with this key:
    "suggestions": [
      {
        "type": "Missing Detail" | "Tone & Voice" | "Achievement Gap" | "Technical Keyword",
        "title": "Short descriptive title",
        "feedback": "Detailed explanation of the issue",
        "action": "Specific suggestion on what to add or change"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result as { 
      suggestions: Array<{
        type: string;
        title: string;
        feedback: string;
        action: string;
      }>
    };
  } catch (error) {
    console.error("Error analyzing cover letter:", error);
    throw error;
  }
}

export async function generateInterviewPrep(
  jobDescription: string,
  profileData: CandidateProfile,
  coverLetter?: string
) {
  const prompt = `
    You are an expert interviewer and hiring manager. Based on the job description, the candidate's personal profile and their submitted cover letter, generate a highly tailored interview prep dataset.
    
    Candidate Profile:
    - Name: ${profileData.name}
    - Summary: ${profileData.summary}
    - Skills: ${(profileData.skills || []).join(", ")}
    - Experience Summary: ${(profileData.experience || []).map(exp => `- ${exp.title} at ${exp.company}: ${exp.highlights.join(' ')}`).join('\n')}
    
    ${coverLetter ? `Cover Letter Sent to Employer:\n${coverLetter}\n` : ''}

    Job Description:
    ${jobDescription || "Target Job Posting"}
    
    TASK:
    Generate a series of interview questions with brilliant STAR answers reflecting the candidate's real-world history and portfolio wins.
    
    Include:
    1. 2 Behavioral questions (focused on scenarios the candidate would have faced in their actual roles like technical leadership, handling tight timelines, resolving bugs, or working across departments).
    2. 2 Technical/Domain questions (specific to the candidate's domain skills e.g., spatial databases, software architecture, specific business domains, or key tools mentioned in the job role).
    3. Presentation strategy tips for any capability task presentations or panel slide layouts under a strict timeline.
    4. Employer alignment briefing notes (discussing how the candidate's strengths match with the hiring organization).

    IMPORTANT: Your response MUST be a JSON object exactly matching this structure, with valid JSON escaping:
    {
      "questions": [
        {
          "type": "Behavioral" | "Technical",
          "question": "The question text here",
          "starAnswer": {
            "situation": "Detailed behavioral or technical situation adapted directly from the candidate's actual projects",
            "task": "The specific task to be tackled in that scenario",
            "action": "The exact actions, tools, scripting, or professional leadership shown by the candidate",
            "result": "The quantified, validated achievements or output accomplishments from the candidate's resume highlights"
          },
          "coachingTips": "Key elements to emphasize when answering this live to a selection panel"
        }
      ],
      "presentationTips": [
        {
          "title": "Tips on slide layouts or briefing delivery",
          "detail": "Actionable detail customized for this candidate"
        }
      ],
      "insightSummary": "Brief alignment summary showing how candidate's profile fits the company"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as {
      questions: Array<{
        type: string;
        question: string;
        starAnswer: { situation: string; task: string; action: string; result: string };
        coachingTips: string;
      }>;
      presentationTips: Array<{ title: string; detail: string }>;
      insightSummary: string;
    };
  } catch (error) {
    console.error("Error in generateInterviewPrep:", error);
    throw error;
  }
}

export async function evaluateInterviewResponse(
  question: string,
  userResponse: string,
  starAnswer: any,
  profileData: CandidateProfile
) {
  const prompt = `
    You are an expert interview coach evaluating a candidate's practice response.
    
    Interview Question:
    "${question}"
    
    Recommended STAR Guide/Answer:
    - Situation: ${starAnswer?.situation || "N/A"}
    - Task: ${starAnswer?.task || "N/A"}
    - Action: ${starAnswer?.action || "N/A"}
    - Result: ${starAnswer?.result || "N/A"}
    
    User's Transcribed Response:
    "${userResponse}"
    
    Candidate Profile Context:
    - Candidate Name: ${profileData.name}
    - Summary: ${profileData.summary}
    - Skills: ${(profileData.skills || []).join(", ")}

    Evaluate the user's response objectively and constructively. 
    1. Score the answer from 1 to 10 (where 10 is perfect alignment, STAR compliance, and strong impact).
    2. Provide a constructive critique outlining what they did well and where the answer fell short (such as missing a quantified result, vague details, or weak actions).
    3. Suggest actionable Tips to Improve.
    4. Provide a "Polished Answer version" showing how they can merge their response with the recommended STAR details to sound extremely senior, authentic, and professional.

    IMPORTANT: Your response MUST be a JSON object exactly matching this structure, with proper JSON escaping:
    {
      "score": 8,
      "critique": "Draft your evaluation critique here",
      "tips": "Provide 2-3 specific tips to improve the STAR response delivery",
      "revisedAnswer": "Draft a polished, professional revised response here incorporating their notes"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as {
      score: number;
      critique: string;
      tips: string;
      revisedAnswer: string;
    };
  } catch (error) {
    console.error("Error in evaluateInterviewResponse:", error);
    throw error;
  }
}

export async function generateCapabilityTaskDraft(
  taskInstructions: string,
  profileData: CandidateProfile,
  jobDescription: string,
  outputType: "slides" | "report"
) {
  const prompt = `
    You are an expert executive briefing officer and spatial/technical platform coordinator. Convert the provided Capability Task / Work Task instructions into an elite outline draft based on the candidate's actual qualifications.
    
    Task Instructions/Prompt:
    ${taskInstructions}

    Candidate Profile:
    - Name: ${profileData.name}
    - Professional Background: ${profileData.summary}
    - Skills: ${(profileData.skills || []).join(", ")}
    - Highlights: ${(profileData.experience || []).map(exp => `- ${exp.title} at ${exp.company}: ${exp.highlights.join(' ')}`).join('\n')}
    
    Job Context:
    ${jobDescription || "Target Position"}
    
    TASK (Produce a beautiful Draft based on "${outputType}"):
    - If "slides": Generate a structured sequence of 5-6 slides detailing:
      1. Strategic response to the prompt
      2. Methodology & planning
      3. Key technical parameters, checks and quality assurance
      Each slide must include a title, beautiful bullet points, detailed layout visual suggestion instructions, and slide presenter spoken notes.
    - If "report": Create a highly polished, professional policy statement, briefing note, or standard operating procedure (SOP) with structured sections, exact technical steps, action plans, and recommendations.

    IMPORTANT: Your response MUST be a JSON object exactly matching this structure:
    {
      "outputType": "${outputType}",
      "title": "Brief/Presentation Title",
      "subtitle": "Subtitle or context description",
      "slides": [
        {
          "slideNumber": 1,
          "title": "Slide Title",
          "content": ["Key bullet point 1", "Key bullet point 2", "Key bullet point 3"],
          "designSuggestion": "How to style this slide visually (e.g. Grid layout, high contrast graphic focus)",
          "presenterNotes": "Spoken script or points to expand upon during presentation"
        }
      ],
      "reportMarkdown": "The full polished report in Markdown format (applicable if outputType is report)",
      "coachingNotes": "Suggestions for handling questions on this task from the panel"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as {
      outputType: string;
      title: string;
      subtitle: string;
      slides?: Array<{
        slideNumber: number;
        title: string;
        content: string[];
        designSuggestion: string;
        presenterNotes: string;
      }>;
      reportMarkdown?: string;
      coachingNotes: string;
    };
  } catch (error) {
    console.error("Error in generateCapabilityTaskDraft:", error);
    throw error;
  }
}

export async function generateWorkDataSheet(
  taskDescription: string,
  profileData: CandidateProfile,
  context?: string
) {
  const prompt = `
    You are an expert data architect and spreadsheet modeler. Based on the user's operational request and their profile details, generate a structured, highly valuable spreadsheet dataset.
    
    Operational Request:
    ${taskDescription}
    
    Job Context:
    ${context || "Target Organization / Analytical Division"}

    Candidate Profile Focus:
    - Name: ${profileData.name}
    - Skills: ${(profileData.skills || []).join(", ")}

    TASK:
    Generate a full spreadsheet data grid. Avoid mock placeholders like "A1", "B2" or "placeholder_val". 
    Populate it with robust, realistic domain entries, performance metrics, compliance status, resource tracking parameters, or database keys representing high-quality realistic outputs.
    
    IMPORTANT: Your response MUST be a JSON object exactly matching this structure, with proper JSON escaping:
    {
      "sheetTitle": "Spreadsheet Table Name",
      "sheetDescription": "Detailed overview of spatial/structural metrics",
      "headers": ["Column 1", "Column 2", "Column 3", "Column 4", "Column 5"],
      "rows": [
        ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3", "Row 1 Col 4", "Row 1 Col 5"],
        ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3", "Row 2 Col 4", "Row 2 Col 5"]
      ],
      "summaryStats": {
        "label": "Brief Label of summary",
        "value": "Total value representation"
      },
      "professionalInsight": "How this structural data sheet ensures robust compliance or operations."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as {
      sheetTitle: string;
      sheetDescription: string;
      headers: string[];
      rows: string[][];
      summaryStats?: { label: string; value: string };
      professionalInsight: string;
    };
  } catch (error) {
    console.error("Error in generateWorkDataSheet:", error);
    throw error;
  }
}

export async function generateWorkDocument(
  taskDescription: string,
  profileData: CandidateProfile,
  documentType: string
) {
  const prompt = `
    You are an expert Spatial Architect and Technical Briefing coordinator. Draft an elite, production-grade professional document based on the request.
    
    Document Request:
    ${taskDescription}
    
    Requested Format Type:
    ${documentType} (e.g. Briefing Note, Python Script, Map Standard SOP, Policy Paper / Guidelines)

    Candidate Profile:
    - Name: ${profileData.name}
    - Skills: ${(profileData.skills || []).join(", ")}
    
    TASK:
    Draft a comprehensive, highly detailed standard document. 
    Include highly structured sections, standard templates (e.g. Purpose, Scope, Procedures, Quality Audits, Reference Projects), referencing actual technical steps, parameters, and actionable recommendations.
    
    IMPORTANT: Your response MUST be a JSON object with this key:
    "markdownContent": "The drafted document in beautiful Markdown format"
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as { markdownContent: string };
  } catch (error) {
    console.error("Error in generateWorkDocument:", error);
    throw error;
  }
}
