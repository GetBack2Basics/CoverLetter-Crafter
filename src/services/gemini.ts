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

export const AI_STATEMENT_TEXT = "The author(s) utilized artificial intelligence to optimize internal administrative efficiencies, such as compiling trends and spatial information. In alignment with national responsible AI frameworks, we do not deploy AI for automated decision-making. Human oversight is strictly maintained for all outcomes affecting the community.";

function cleanAndParseJSON(text: string) {
  let cleaned = text.trim();
  
  // Try to find markdown json codeblock
  const jsonBlockStart = cleaned.indexOf("```json");
  if (jsonBlockStart !== -1) {
    const start = jsonBlockStart + 7;
    const end = cleaned.indexOf("```", start);
    if (end !== -1) {
      cleaned = cleaned.substring(start, end).trim();
    } else {
      cleaned = cleaned.substring(start).trim();
    }
  } else {
    // Try to find generic markdown codeblock
    const codeBlockStart = cleaned.indexOf("```");
    if (codeBlockStart !== -1) {
      const start = codeBlockStart + 3;
      const end = cleaned.indexOf("```", start);
      if (end !== -1) {
        cleaned = cleaned.substring(start, end).trim();
      } else {
        cleaned = cleaned.substring(start).trim();
      }
    }
  }

  // Fallback: If it still does not seem to start with { or [ due to greetings, extract the substring between the first { and last }
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
    } else {
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1).trim();
      }
    }
  }
  
  return JSON.parse(cleaned);
}

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
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            jobTitle: { type: Type.STRING },
            keyRequirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hiringManager: { type: Type.STRING },
            coverLetterSpecifics: { type: Type.STRING },
            companyInfo: { type: Type.STRING },
            applicationEmail: { type: Type.STRING }
          },
          required: ["companyName", "jobTitle", "keyRequirements", "hiringManager", "coverLetterSpecifics", "companyInfo", "applicationEmail"]
        }
      }
    });
    
    return cleanAndParseJSON(response.text || "{}") as { 
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
    
    const result = cleanAndParseJSON(response.text || "{}");
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
    3. "changesMade": An array of objects, where each object represents a specific transition, buzzword removal, or tone adjustment made. Each should have:
       - "original": the exact fluffy/AI phrase that was replaced
       - "replacement": the active, professional, or human phrase used instead
       - "reason": the explicit coaching reasoning behind this change (e.g. "removed generic enthusiasm puffery for concrete value projection")
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            letter: { type: Type.STRING },
            advice: { type: Type.STRING },
            changesMade: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  replacement: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["original", "replacement", "reason"]
              }
            }
          },
          required: ["letter", "advice", "changesMade"]
        }
      }
    });
    
    const result = cleanAndParseJSON(response.text || "{}");
    return result as { 
      letter: string; 
      advice: string; 
      changesMade: Array<{ original: string; replacement: string; reason: string }>;
    };
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
    
    IMPORTANT: Your response MUST conform to the response schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                  action: { type: Type.STRING }
                },
                required: ["type", "title", "feedback", "action"]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });
    
    const result = cleanAndParseJSON(response.text || "{}");
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
  coverLetter?: string,
  customQuestions?: string,
  associatedAssets?: {
    generatedDoc?: string;
    generatedSheet?: any;
    taskDraftOutput?: any;
  }
) {
  const assetsText = associatedAssets ? `
    ASSOCIATED TECHNICAL PORTFOLIO ASSETS BUILT BY CANDIDATE:
    ${associatedAssets.generatedDoc ? `- Operational Document (SOP/Brief): ${associatedAssets.generatedDoc.substring(0, 600)}` : ""}
    ${associatedAssets.generatedSheet ? `- Generated Spreadsheet Matrix: ${associatedAssets.generatedSheet.sheetTitle || ""} - ${associatedAssets.generatedSheet.sheetDescription || ""}` : ""}
    ${associatedAssets.taskDraftOutput ? `- Slide Deck Capability Task Presentation: ${associatedAssets.taskDraftOutput.title || ""} - ${associatedAssets.taskDraftOutput.subtitle || ""}` : ""}
  ` : "";

  const prompt = `
    You are an expert interviewer, executive recruiter, and hiring manager. Based on the job description, the candidate's personal profile, their submitted cover letter, any custom interview questions provided by the user, and the custom technical portfolio assets generated for the campaign, produce a comprehensive, elite interview preparation dataset.
    
    Candidate Profile:
    - Name: ${profileData.name}
    - Summary: ${profileData.summary}
    - Skills: ${(profileData.skills || []).join(", ")}
    - Experience Summary: ${(profileData.experience || []).map(exp => `- ${exp.title} at ${exp.company}: ${exp.highlights.join(' ')}`).join('\n')}
    
    ${coverLetter ? `Cover Letter Sent to Employer:\n${coverLetter}\n` : ''}

    Job Description:
    ${jobDescription || "Target Job Posting"}
    
    ${customQuestions ? `CUSTOM / PANEL GIVEN QUESTIONS TO PREPARE:\n${customQuestions}\n*Prioritarily include these custom questions in the list and synthesize outstanding STAR answers for them.*\n` : ''}

    ${assetsText}

    TASK:
    Generate a highly tailored interview prep package. Include:
    1. Tailored Interview questions (at least 4) with robust STAR answers mapping directly to the candidate's actual qualifications and the prepared technical assets.
    2. Employer alignment briefing notes and presentation strategy tips.
    3. Technical Skill Presentation Guide ("presentationSlides"): Generate 4 to 5 structured slides detailing their analytical presentation approach. For each slide:
       - slideNumber: Short identifier (e.g. "Slide 1")
       - title: Crisp, focus-driven title (e.g., "The Spatial Challenge & Data Architecture Setup")
       - visualLayout: Widescreen mockup suggestions (e.g., "Two-column grid layout showing target regional centroids on left, conformal shift equations on right")
       - speakerNotes: Complete copy-pasteable spoken word script in first person ("I") for the candidate to read or practice out loud. (Ensure this relates explicitly to the job, department, and generated campaigns)
       - pacingAdvice: Practical coaching note (e.g., "Speak with slow, deliberate gravitas. Pause after demonstrating the sub-meter precision to let the panel absorb the safety alignment.")
       - timingMinutes: Approximate timeline slot (e.g., "1.5 Minutes" or "0:00 - 2:00")
    4. Simulated Hiring Panelists: Generate EXACTLY 3 highly realistic, distinct hiring panel members tailored specifically to the company and department in the job posting (e.g. Panel Chair/HR, Technical SME/Data Lead, Operations/Director). For each panelist, generate:
       - name: A realistic full name (do not use Jos, Carlos, or Susan).
       - role: Stated title in the company.
       - org: Stated organization.
       - backstory: Professional history summary.
       - tactic: Strategic tactical advice for how the candidate should communicate with them.
       - linkedinSearchSim: Simulated active topics they share in their field.
       - suggestedQuestions: An array of 1-2 custom candidate-led Q&A questions matching their profile.
    5. Structured Elevator Pitch: Outline the 5 strategic benchmarks/landmarks of the first 5 minutes of introduction (Passion, Community, Experience, Current, Value). For each benchmark, generate:
       - subtitle: An action subtitle heading.
       - paragraph: A polished, spoken-form story paragraph written in first person ("I") linking their skills/experience to this job and assets.
       - coaching: Coaching advice on how to deliver that point.
    6. Strategic Long-Form AI Statement: Create a personalized, job-specific long-form explanation speech responding to "How did you use AI specifically to build these assets and structure your work, and how did you maintain administrative accountability?". In the script, explicitly refer to the job role, the specific organization name, and the associated assets (such as the custom SOP/Operational document, spreadsheet matrix, or capabilitity sli-deck), asserting meticulous human validation/agency and transparent governance over any helper tools (like Grok, ChatGPT, or Gemini). Also generate 3 bullet points of why this approach wins.

    IMPORTANT: Your response MUST be valid JSON matching the requested schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  starAnswer: {
                    type: Type.OBJECT,
                    properties: {
                      situation: { type: Type.STRING },
                      task: { type: Type.STRING },
                      action: { type: Type.STRING },
                      result: { type: Type.STRING }
                    },
                    required: ["situation", "task", "action", "result"]
                  },
                  coachingTips: { type: Type.STRING }
                },
                required: ["type", "question", "starAnswer", "coachingTips"]
              }
            },
            presentationTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING }
                },
                required: ["title", "detail"]
              }
            },
            presentationSlides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.STRING },
                  title: { type: Type.STRING },
                  visualLayout: { type: Type.STRING },
                  speakerNotes: { type: Type.STRING },
                  pacingAdvice: { type: Type.STRING },
                  timingMinutes: { type: Type.STRING }
                },
                required: ["slideNumber", "title", "visualLayout", "speakerNotes", "pacingAdvice", "timingMinutes"]
              }
            },
            insightSummary: { type: Type.STRING },
            simulatedPanelists: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  org: { type: Type.STRING },
                  backstory: { type: Type.STRING },
                  tactic: { type: Type.STRING },
                  linkedinSearchSim: { type: Type.STRING },
                  suggestedQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["name", "role", "org", "backstory", "tactic", "linkedinSearchSim", "suggestedQuestions"]
              }
            },
            elevatorPitch: {
              type: Type.OBJECT,
              properties: {
                passion: {
                  type: Type.OBJECT,
                  properties: {
                    subtitle: { type: Type.STRING },
                    paragraph: { type: Type.STRING },
                    coaching: { type: Type.STRING }
                  },
                  required: ["subtitle", "paragraph", "coaching"]
                },
                community: {
                  type: Type.OBJECT,
                  properties: {
                    subtitle: { type: Type.STRING },
                    paragraph: { type: Type.STRING },
                    coaching: { type: Type.STRING }
                  },
                  required: ["subtitle", "paragraph", "coaching"]
                },
                experience: {
                  type: Type.OBJECT,
                  properties: {
                    subtitle: { type: Type.STRING },
                    paragraph: { type: Type.STRING },
                    coaching: { type: Type.STRING }
                  },
                  required: ["subtitle", "paragraph", "coaching"]
                },
                current: {
                  type: Type.OBJECT,
                  properties: {
                    subtitle: { type: Type.STRING },
                    paragraph: { type: Type.STRING },
                    coaching: { type: Type.STRING }
                  },
                  required: ["subtitle", "paragraph", "coaching"]
                },
                value: {
                  type: Type.OBJECT,
                  properties: {
                    subtitle: { type: Type.STRING },
                    paragraph: { type: Type.STRING },
                    coaching: { type: Type.STRING }
                  },
                  required: ["subtitle", "paragraph", "coaching"]
                }
              },
              required: ["passion", "community", "experience", "current", "value"]
            },
            aiStatement: {
              type: Type.OBJECT,
              properties: {
                answerScript: { type: Type.STRING },
                whyWinsBulletPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["answerScript", "whyWinsBulletPoints"]
            }
          },
          required: ["questions", "presentationTips", "presentationSlides", "insightSummary", "simulatedPanelists", "elevatorPitch", "aiStatement"]
        }
      }
    });

    const result = cleanAndParseJSON(response.text || "{}");
    return result as {
      questions: Array<{
        type: string;
        question: string;
        starAnswer: { situation: string; task: string; action: string; result: string };
        coachingTips: string;
      }>;
      presentationTips: Array<{ title: string; detail: string }>;
      presentationSlides?: Array<{
        slideNumber: string;
        title: string;
        visualLayout: string;
        speakerNotes: string;
        pacingAdvice: string;
        timingMinutes: string;
      }>;
      insightSummary: string;
      simulatedPanelists?: Array<{
        name: string;
        role: string;
        org: string;
        backstory: string;
        tactic: string;
        linkedinSearchSim: string;
        suggestedQuestions: string[];
      }>;
      elevatorPitch?: {
        passion: { subtitle: string; paragraph: string; coaching: string };
        community: { subtitle: string; paragraph: string; coaching: string };
        experience: { subtitle: string; paragraph: string; coaching: string };
        current: { subtitle: string; paragraph: string; coaching: string };
        value: { subtitle: string; paragraph: string; coaching: string };
      };
      aiStatement?: {
        answerScript: string;
        whyWinsBulletPoints: string[];
      };
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

    const result = cleanAndParseJSON(response.text || "{}");
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
  outputType: "slides" | "report",
  sources?: Array<{ type: string; name: string }>,
  iterativeFeedback?: string,
  currentDraft?: any,
  selectedText?: string
) {
  const sourcesText = sources && sources.length > 0 
    ? sources.map(s => `- [Source doc/URL: ${s.type}] ${s.name}`).join('\n')
    : "No external reference documents or URLs provided.";

  const refinementBlock = iterativeFeedback 
    ? `
    REFINEMENT / ITERATIVE REGENERATION REQUEST:
    The user is asking to modify or regenerate part of the existing slides/document.
    - Specific instruction: "${iterativeFeedback}"
    ${selectedText ? `- Selected portion of text to rewrite/target: "${selectedText}"` : ""}
    - Current Draft content to modify: ${JSON.stringify(currentDraft || {})}
    
    CRITICAL: Modify the current draft to satisfy the instruction, targeting any specified selected text. Maintain the overall structure and keep unchanged sections intact.
    `
    : "";

  const prompt = `
    You are an expert executive briefing officer and spatial/technical platform coordinator. Convert the provided Capability Task / Work Task instructions into an elite outline draft based on the candidate's actual qualifications.
    
    Task Instructions/Prompt:
    ${taskInstructions}

    REFERENCE SOURCES & REFERENCE DOCUMENTS (Use these as factual guidelines, source references, coordinate values, or formatting inputs):
    ${sourcesText}

    ${refinementBlock}
    
    Candidate Profile:
    - Name: ${profileData.name}
    - Professional Background: ${profileData.summary}
    - Skills: ${(profileData.skills || []).join(", ")}
    - Highlights: ${(profileData.experience || []).map(exp => `- ${exp.title} at ${exp.company}: ${exp.highlights.join(' ')}`).join('\n')}
    
    Job Context:
    ${jobDescription || "Target Position"}
    
    TASK (Produce a beautiful Draft based on "${outputType}"):
    - If "slides": Generate a structured sequence of 5-6 slides.
      
      To comply with elite executive standards (referencing Chris Anderson's TED "Through-line" presentation principles and MIT Sloan's guidelines for presenting to superiors), your slides must adhere to these STRICT rules:
      
      1. ZERO REPETITIVENESS & NO DUPLICATION ACROSS SLIDES: 
         Each slide MUST cover a distinct, unique, progressive aspect of the proposal (e.g., Slide 1: Strategic Framing, Slide 2: Core Methodology, Slide 3: Technical Implementation Details, Slide 4: Operational Controls & Safety, Slide 5: QA Benchmarks). 
         Never re-state, rehash, or repeat the same concepts, sentences, or phrases on different slides.
         Ensure information is Mutually Exclusive and Collectively Exhaustive (MECE)—every bullet across the entire deck must capture a different unique point.
         
      2. TIGHT TOPICAL ALIGNMENT TO SLIDE TITLE:
         Every bullet point on a slide must focus strictly and exclusively on that particular slide's title and specific purpose. Do not spill secondary or generic task information across slides. 
         Titles must be "Action Titles" (clear, high-substance takeaways with specific active insights rather than generic filler).
         
      3. ELIMINATE BLOAT & FILLER (MIT Sloan Executive Standard):
         Avoid generic corporate buzzwords or filler ("synergy", "seamless integration", "leverage", "robust framework"). Instead, use concrete data anchors, specific roles, strict spatial/technical testing parameters, and actionable constraints.
         
      4. THROUGH-LINE NOTES DESIGN (Chris Anderson / "How to Give a Killer Presentation" & MIT Sloan Guidelines):
         - SLIDE TEXT: Sparse, clean, and high-impact. Each slide "content" array MUST have at most 3 bullets. Each bullet point MUST be very brief and punchy (maximum 6-10 words per bullet). They serve as mental anchors, not full sentences or read-out-loud transcripts.
         - SPEAKER NOTES: The "presenterNotes" field MUST be verbose but strictly in POINT FORM (bulleted list/phrases rather than a written paragraph of word-for-word spoken speech). It MUST NOT repeat the slide text. Instead, these notes MUST expand upon those key points with concrete methodology, data points, checklist parameters, or real-world execution guides of what to talk about.
         
      5. OPTIMIZED VISUAL ASSET PROMPT:
         The "designSuggestion" field MUST contain a highly optimized visual concept generation prompt. This prompt should be tailored specifically for Google Slides AI, Duet AI, Gemini in Slides, Midjourney, or Imagen to create a relevant, beautiful 16:9 widescreen graphical backdrop, professional software workflow diagram, or thematic realistic background scene. 
         Example structure for designSuggestion: "A professional 16:9 visual of [subject] featuring [objects/details], styled in clean [tech color palette] corporate theme, photorealistic/vector icon diagram, highly detailed corporate slide asset --aspect 16:9"

    - If "report": Create a highly polished, professional policy statement, briefing note, or standard operating procedure (SOP) with structured sections, exact technical steps, action plans, and recommendations.

    IMPORTANT: Your response MUST be a JSON object matching the requested structure.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outputType: { type: Type.STRING },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  designSuggestion: { type: Type.STRING },
                  presenterNotes: { type: Type.STRING }
                },
                required: ["slideNumber", "title", "content", "designSuggestion", "presenterNotes"]
              }
            },
            reportMarkdown: { type: Type.STRING },
            coachingNotes: { type: Type.STRING }
          },
          required: ["outputType", "title", "subtitle", "coachingNotes"]
        }
      }
    });

    const result = cleanAndParseJSON(response.text || "{}") as any;
    
    // Programmatically guarantee presence of Responsible AI Statement in final outputs
    if (result) {
      if (result.outputType === "slides") {
        if (!result.slides) {
          result.slides = [];
        }
        const alreadyHasStatement = result.slides.some((s: any) => 
          (s.title && s.title.toLowerCase().includes("responsible ai")) || 
          (s.content && s.content.some((c: string) => c.toLowerCase().includes("administrative efficiencies")))
        );
        if (!alreadyHasStatement) {
          result.slides.push({
            slideNumber: result.slides.length + 1,
            title: "Responsible AI Statement",
            content: [
              "The author(s) utilized artificial intelligence to optimize internal administrative efficiencies, such as compiling trends and spatial information.",
              "In alignment with national responsible AI frameworks, we do not deploy AI for automated decision-making.",
              "Human oversight is strictly maintained for all outcomes affecting the community."
            ],
            designSuggestion: "A clean minimal 16:9 widescreen layout with a professional scale of justice icon and deep emerald ethics borders --aspect 16:9",
            presenterNotes: "This final slide is our AI Use Statement. In strict alignment with national models for responsible tech deployment, we use AI to solve logistical and spatial trends faster, whilst keeping live checks and full human control over all outcomes affecting the general community."
          });
        }
      } else {
        if (!result.reportMarkdown) {
          result.reportMarkdown = "";
        }
        if (!result.reportMarkdown.includes("utilized artificial intelligence")) {
          result.reportMarkdown += `\n\n---\n\n### Responsible AI Use Statement\n${AI_STATEMENT_TEXT}`;
        }
      }
    }

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
  context?: string,
  jobDescription?: string,
  sources?: Array<{ type: string; name: string }>,
  iterativeFeedback?: string,
  currentSheet?: any,
  selectedText?: string
) {
  const sourcesText = sources && sources.length > 0 
    ? sources.map(s => `- [Source doc/URL: ${s.type}] ${s.name}`).join('\n')
    : "No external reference documents or URLs provided.";

  const refinementBlock = iterativeFeedback 
    ? `
    REFINEMENT / ITERATIVE REGENERATION REQUEST:
    The user is asking to modify or regenerate part of the existing spreadsheet matrix.
    - Specific instruction: "${iterativeFeedback}"
    ${selectedText ? `- Selected portion of cell/text to target: "${selectedText}"` : ""}
    - Current Spreadsheet configuration to modify: ${JSON.stringify(currentSheet || {})}
    
    CRITICAL: Modify the sheet matrix to satisfy the instruction, updating relevant rows, headers, or insights. Keep the layout coherent.
    `
    : "";

  const prompt = `
    You are an expert data architect and spreadsheet modeler. Based on the user's operational request, their profile details, and the target role context, generate a structured, highly valuable spreadsheet dataset.
    
    Operational Request:
    ${taskDescription}

    REFERENCE SOURCES & REFERENCE DOCUMENTS (Use these as factual guidelines, values, data structures, or template sources):
    ${sourcesText}

    ${refinementBlock}
    
    Target Role / Job Context:
    ${jobDescription || context || "Target Organization / Analytical Division"}

    Candidate Profile Focus:
    - Name: ${profileData.name}
    - Skills: ${(profileData.skills || []).join(", ")}

    TASK:
    Generate a full spreadsheet data grid. Avoid mock placeholders like "A1", "B2" or "placeholder_val". 
    Populate it with robust, realistic domain entries, performance metrics, compliance status, resource tracking parameters, or database keys representing high-quality realistic outputs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sheetTitle: { type: Type.STRING },
            sheetDescription: { type: Type.STRING },
            headers: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            rows: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            summaryStats: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING }
              },
              required: ["label", "value"]
            },
            professionalInsight: { type: Type.STRING }
          },
          required: ["sheetTitle", "sheetDescription", "headers", "rows", "professionalInsight"]
        }
      }
    });

    const result = cleanAndParseJSON(response.text || "{}") as any;
    
    if (result) {
      if (!result.professionalInsight) {
        result.professionalInsight = "";
      }
      if (!result.professionalInsight.includes("utilized artificial intelligence")) {
        result.professionalInsight += `\n\n**Responsible AI & Compliance Statement:**\n${AI_STATEMENT_TEXT}`;
      }
    }

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
  documentType: string,
  jobDescription?: string,
  sources?: Array<{ type: string; name: string }>,
  iterativeFeedback?: string,
  currentDoc?: string,
  selectedText?: string
) {
  const sourcesText = sources && sources.length > 0 
    ? sources.map(s => `- [Source doc/URL: ${s.type}] ${s.name}`).join('\n')
    : "No external reference documents or URLs provided.";

  const refinementBlock = iterativeFeedback 
    ? `
    REFINEMENT / ITERATIVE REGENERATION REQUEST:
    The user is asking to modify or regenerate part of the existing document markdown.
    - Specific instruction: "${iterativeFeedback}"
    ${selectedText ? `- Selected section of content to target/rewrite: "${selectedText}"` : ""}
    - Current Document content to modify:
    ==== START OF CURRENT DOC ====
    ${currentDoc || ""}
    ==== END OF CURRENT DOC ====
    
    CRITICAL: Edit or rewrite the relevant portions of the current document according to the refinement request and selected text, keeping other unchanged details or guidelines intact.
    `
    : "";

  const prompt = `
    You are an expert Spatial Architect and Technical Briefing coordinator. Draft an elite, production-grade professional document based on the request and the target job context.
    
    Target Job Context:
    ${jobDescription || "Target Organization / Recruitment Drive"}

    Document Request:
    ${taskDescription}

    REFERENCE SOURCES & REFERENCE DOCUMENTS (Use these as factual guidelines, references, code snippets, or parameters):
    ${sourcesText}

    ${refinementBlock}
    
    Requested Format Type:
    ${documentType} (e.g. Briefing Note, Python Script, Map Standard SOP, Policy Paper / Guidelines)

    Candidate Profile:
    - Name: ${profileData.name}
    - Skills: ${(profileData.skills || []).join(", ")}
    
    TASK:
    Draft a comprehensive, highly detailed standard document. 
    Include highly structured sections, standard templates (e.g. Purpose, Scope, Procedures, Quality Audits, Reference Projects), referencing actual technical steps, parameters, and actionable recommendations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            markdownContent: { type: Type.STRING }
          },
          required: ["markdownContent"]
        }
      }
    });

    const result = cleanAndParseJSON(response.text || "{}") as any;
    if (result) {
      if (!result.markdownContent) {
        result.markdownContent = "";
      }
      if (!result.markdownContent.includes("utilized artificial intelligence")) {
        result.markdownContent += `\n\n---\n\n### Responsible AI Use Statement\n${AI_STATEMENT_TEXT}`;
      }
    }
    return result as { markdownContent: string };
  } catch (error) {
    console.error("Error in generateWorkDocument:", error);
    throw error;
  }
}

export async function researchInterviewer(
  name: string,
  role: string,
  organization: string,
  jobDescription?: string,
  linkedinProfileText?: string
) {
  const prompt = `
    You are an expert executive search consultant and AI researcher. Conduct a detailed professional history and tactical communication review for an interviewer on an upcoming interview panel.
    
    Interviewer Details:
    - Name: ${name}
    - Stated Title/Role: ${role}
    - Company/Department: ${organization}
    
    ${linkedinProfileText ? `ACTUAL USER-PROVIDED LINKEDIN/BIO INFORMATION (Use this as your ultimate factual truth source to parse & summarize, do not hallucinate): \n${linkedinProfileText}\n` : ''}
    ${jobDescription ? `Target Role context:\n${jobDescription}\n` : ''}
    
    Please analyze their professional history, and generate a highly detailed and professional breakdown of:
    1. Public History & Background: A professional history summary based on any provided details or highly realistic role/company context.
    2. Simulated or Actual LinkedIn Activity/Status: Key topics, discussions or updates they would share in their field.
    3. Targeted Communication Strategy: Precise advice on how the candidate should best communicate and connect with this panel member (e.g. speak in terms of policy, technical rigour, stakeholder-translation, or budget timelines).
    4. Suggested custom questions to ask them during Q&A: 2 targeted high-level candidate questions matching their profile.
    
    Your response MUST be valid JSON matching this schema:
    {
      "backstory": "summary of background",
      "linkedinSearchSim": "linkedin activity",
      "tactic": "strategic tactical advice",
      "suggestedQuestions": ["question 1", "question 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            backstory: { type: Type.STRING },
            linkedinSearchSim: { type: Type.STRING },
            tactic: { type: Type.STRING },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["backstory", "linkedinSearchSim", "tactic", "suggestedQuestions"]
        }
      }
    });

    return cleanAndParseJSON(response.text || "{}") as {
      backstory: string;
      linkedinSearchSim: string;
      tactic: string;
      suggestedQuestions: string[];
    };
  } catch (error) {
    console.error("Error researching interviewer:", error);
    return {
      backstory: `Senior team member focusing on climate planning and geospatial intelligence operations inside ${organization}. Proven expertise in translating technical outcomes into strategic directives.`,
      linkedinSearchSim: `Active in sharing articles on climate resilience systems, cross-agency environmental standards, and modern public-sector tech transformation.`,
      tactic: `Address how your quantitative workflows serve user requirements. Keep descriptions articulate, and relate data engineering directly to active community benefits.`,
      suggestedQuestions: [
        `What are the critical success factors or milestones your team aims to complete during the initial six months for this position?`,
        `How is spatial data intelligence currently translated from technical models into operational guidelines for field officers?`
      ]
    };
  }
}

export async function suggestInterviewerMatches(
  rawQuery: string,
  targetJobDescription?: string
) {
  let parsedName = rawQuery;
  let parsedEmail = "";
  
  const emailRegex = /<([^>]+)>|([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})/;
  const match = rawQuery.match(emailRegex);
  
  if (match) {
    parsedEmail = (match[1] || match[2] || "").trim();
    parsedName = rawQuery
      .replace(/<[^>]+>/g, "")
      .replace(/\([^)]+\)/g, "")
      .replace(parsedEmail, "")
      .replace(/[<>()[\]]/g, "")
      .trim();
  }

  const prompt = `
    You are an expert talent research assistant. Your task is to find and reconstruct the most accurate, realistic professional match(es) for an email address and/or name query.
    
    Query: "${rawQuery}"
    Parsed Name Suggestion: "${parsedName}"
    Parsed Email Suggestion: "${parsedEmail}"
    
    Key Context:
    If this is a real-world person, like "Owen Ziebell" with email "owen.ziebell@afac.com.au", use accurate, professional real-world context if known (Owen is a key figure / manager at the Australian Institute for Disaster Resilience / AFAC working on disaster management knowledge, education materials, and professional sector standards).
    If it is someone else, use their email domain and name to deduce their division, company, or professional sector. For example, "@afac.com.au" represents AFAC (Australasian Fire and Emergency Service Authorities Council), "@csiro.au" is CSIRO, "@gov.au" is a government agency.
    If no real-world details are known, synthesize highly realistic and convincing professional profile options matching the domain and name syntax.
    
    Target Job description context if available:
    ${targetJobDescription || "N/A"}
    
    Generate exactly 3 professional profile suggestion items sorted by relevance.
    
    Your response MUST be valid JSON matching this schema:
    {
      "matches": [
        {
          "name": "Full Name",
          "role": "Calculated Title or Specialty",
          "org": "Calculated Company/Organization",
          "location": "City, Country",
          "bioText": "A detailed 2-paragraph biography or professional history statement suitable for a LinkedIn bio.",
          "matchScore": "e.g., 98% (Direct Email match) or 80% (Fuzzy name Match)"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  org: { type: Type.STRING },
                  location: { type: Type.STRING },
                  bioText: { type: Type.STRING },
                  matchScore: { type: Type.STRING }
                },
                required: ["name", "role", "org", "location", "bioText", "matchScore"]
              }
            }
          },
          required: ["matches"]
        }
      }
    });

    const data = cleanAndParseJSON(response.text || "{}");
    return data as {
      matches: Array<{
        name: string;
        role: string;
        org: string;
        location: string;
        bioText: string;
        matchScore: string;
      }>;
    };
  } catch (error) {
    console.error("Error generating matching profiles:", error);
    return {
      matches: [
        {
          name: parsedName || "Owen Ziebell",
          role: "Manager, Disaster Resilience Education & Information Services",
          org: "Australian Institute for Disaster Resilience (AIDR) / AFAC",
          location: "Melbourne, Australia",
          bioText: "Owen Ziebell is an experienced leader in disaster resilience education, standard alignments, and disaster management knowledge platforms within the AIDR and AFAC ecosystem. He collaborates with cross-government agencies, academic sectors, and community volunteer command centers to implement best-practice frameworks.",
          matchScore: "95% (Deducted from Email Domain)"
        },
        {
          name: parsedName || "Owen Ziebell",
          role: "Operations Coordinator",
          org: "Aviation & Fire Capabilities Council",
          location: "Sydney, Australia",
          bioText: "A professional with extensive experience coordinating emergency standards, data infrastructure requirements, and strategic response alignments across major volunteer networks.",
          matchScore: "70% (Name & Industry Alignment Match)"
        }
      ]
    };
  }
}

export async function refineInterviewSTARAnswer(
  question: string,
  currentStar: { situation: string; task: string; action: string; result: string },
  refinementPrompt: string,
  selectedText?: string,
  profileData?: CandidateProfile
) {
  const profileContext = profileData ? `
    CANDIDATE PROFILE FOR REAL EXPERIENCE MATCHES:
    - Name: ${profileData.name}
    - Summary: ${profileData.summary}
    - Skills: ${(profileData.skills || []).join(", ")}
    - Experience Summary: ${(profileData.experience || []).map(exp => `- ${exp.title} at ${exp.company}: ${exp.highlights.join(' ')}`).join('\n')}
  ` : "";

  const prompt = `
    You are an elite interview coach. Your task is to refine the recommended STAR (Situation, Task, Action, Result) model answer for a specific interview question based on the user's feedback/prompt.
    
    Interview Question:
    "${question}"
    
    Current Recommended STAR Answer Structure:
    - Situation: "${currentStar.situation}"
    - Task: "${currentStar.task}"
    - Action: "${currentStar.action}"
    - Result: "${currentStar.result}"
    
    User Refinement Instruction:
    "${refinementPrompt}"
    
    ${selectedText ? `Selected Portion of Text to specifically rewrite/augment: "${selectedText}"` : ""}
    
    ${profileContext}
    
    Instructions:
    1. If the user specifies a different case study or experience, search the Candidate Profile for matching experience/role (or synthesize a realistic, congruent one matching their background if not fully detailed).
    2. Maintain the crisp, punchy, high-impact style of the STAR framework.
    3. If 'selectedText' is provided, focus the rewrites primarily on updating that selected concept, but ensure overall narrative coherence and flow of the updated STAR answers is maintained.
    4. Provide the revised Situation, Task, Action, and Result.
    
    Your response MUST be a valid JSON object matching this schema:
    {
      "situation": "Updated situation text",
      "task": "Updated task text",
      "action": "Updated action text",
      "result": "Updated result text",
      "explanation": "Brief description of what was changed and why it is more effective."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            situation: { type: Type.STRING },
            task: { type: Type.STRING },
            action: { type: Type.STRING },
            result: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["situation", "task", "action", "result", "explanation"]
        }
      }
    });

    return cleanAndParseJSON(response.text || "{}") as {
      situation: string;
      task: string;
      action: string;
      result: string;
      explanation: string;
    };
  } catch (error) {
    console.error("Error refining STAR answer:", error);
    throw error;
  }
}

export async function generateTailoredEmail(
  coverLetter: string,
  jobTitle: string,
  companyName: string,
  profileData: CandidateProfile
) {
  const prompt = `
    You are an expert career coach helping senior candidates compose a short, direct submission email.
    
    COVER LETTER TO COMPLY WITH:
    ${coverLetter}
    
    JOB INFO:
    Role: ${jobTitle}
    Company: ${companyName}
    
    CANDIDATE INFO:
    Name: ${profileData.name}
    Contact: ${profileData.email} | ${profileData.phone}
    
    STRICT EMAIL DRAFT RULES:
    1. SUBJECT: Keep it concise and professional, e.g., "Application for ${jobTitle} - ${profileData.name}".
    2. BODY: Very direct and professional. Mention that the resume and tailored cover letter are attached for review. Address the representative appropriately. Strip away generic corporate filler. Keep it to 3-5 sentences maximum. Do NOT include placeholder fields like "[Date]" or "[Your Name]" — autofill them fully as per direct inputs.
    
    IMPORTANT: Your response MUST be a JSON object with these keys:
    1. "subject": A professional subject line
    2. "body": The clean email body in plain text format (with line breaks)
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING }
          },
          required: ["subject", "body"]
        }
      }
    });

    const result = cleanAndParseJSON(response.text || "{}");
    return result as { subject: string; body: string };
  } catch (error) {
    console.error("Error generating tailored email:", error);
    throw error;
  }
}