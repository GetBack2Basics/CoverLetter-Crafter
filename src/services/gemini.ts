import { GoogleGenAI } from "@google/genai";
import { profile } from "../data/profile";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function extractJobDetails(jobDescription: string) {
  const prompt = `
    Extract the following details from this job description:
    1. Company Name (The actual employer, not the job board or website name. Look for "About the Employer", "Join our team at...", or the organization logo/header description).
    2. Job Title
    3. Key Requirements (list of 3-5 most important technical skills or experiences)
    4. Hiring Manager Name (if available, otherwise "Hiring Manager")
    5. Cover Letter Specifics (Any specific instructions mentioned, e.g., "address selection criteria", "limit to 2 pages", "mention job reference number X").
    6. Company Info (A brief 1-2 sentence summary of what the company does, their mission, or values found in the description).

    Job Description/URL:
    ${jobDescription}

    IMPORTANT: Your response MUST be a JSON object with these keys: "companyName", "jobTitle", "keyRequirements", "hiringManager", "coverLetterSpecifics", "companyInfo".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    
    return JSON.parse(response.text || "{}") as { 
      companyName: string; 
      jobTitle: string; 
      keyRequirements: string[]; 
      hiringManager: string;
      coverLetterSpecifics: string;
      companyInfo: string;
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
  tone: string = "professional", 
  iterativeFeedback?: string, 
  currentLetter?: string,
  selectedText?: string
) {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let prompt = "";
  
  const goldenRules = `
    GOLDEN RULES FOR WRITING:
    1. TAILORING OVER PRAISE: Research the company mission/values. ${companyInfo ? `Company Context: ${companyInfo}` : 'Research the company mission/values from the job ad.'} Reference specific projects or values. Avoid "resonates deeply" or "aligns perfectly".
    2. SPECIFIC ACHIEVEMENTS: Replace generic claims with concrete, quantified examples. Use specific tools (ArcPy, PyQGIS, ArcGIS Pro, Python toolkits, LiDAR).
    3. NO VAGUE CLAIMS: Never use "a decade of experience" or "producing maps". Use specific project names and technical challenges solved.
    4. STRUCTURE: 
       - Header: Start with the following centered contact info block:
         <center>${profile.name} | ${profile.location} | ${profile.phone} | ${profile.email} | ${profile.linkedin} </center>
         Followed immediately by the Current Date (${currentDate}) on the next line, also centered using <center> tags.
       - Salutation: Address ${hiringManager} at ${companyName}.
       - First Paragraph (THE INTEGRATED HOOK): Do not use "in your face" value propositions. Instead, blend ${companyName}'s specific needs with your relevant achievements. Use this flow: "To meet ${companyName}'s need for [Requirement] as a ${jobTitle}, I offer a background in [Core Skill/Achievement]. At [Previous Company], I [Specific Action]. My approach uses [Tools/Methods] to [Outcome], a skillset I will use to enhance your team's [Specific Goal]."
       - Body: 2-3 paragraphs of relevant achievements linked to requirements. BOLD key phrases and technical skills that directly match job requirements.
       - Values fit: One short paragraph on cultural/mission alignment.
       - Close: Forward-looking and confident.
    5. AVOID WEAK PHRASES: Eliminate "I am excited", "I am writing to express my interest", "hope we can connect soon".
    6. SENIORITY: For Senior roles, emphasize leadership, mentoring, budget management, and strategic thinking.
    7. LENGTH: 300-400 words maximum.
    8. SIGN-OFF: Always end the letter with a professional sign-off (e.g., "Sincerely," or "Best regards,") followed by the candidate's name: ${profile.name}.
    9. MANDATORY MENTIONS: You MUST explicitly mention ${companyName}.
    10. SPECIFIC INSTRUCTIONS: ${coverLetterSpecifics ? `Follow these specific instructions: ${coverLetterSpecifics}` : 'Follow standard professional cover letter conventions.'}
    11. KEY REQUIREMENTS TO FOCUS ON:
        ${(keyRequirements || []).map(req => `- ${req}`).join('\n')}
    12. REDUCE AI STYLE (ANTI-AI GUARDRAILS):
        - FORBIDDEN WORDS: Do not use "architecting", "spearheading", "synergy", "dynamic", "highly motivated", "passionate professional", "leverage", "proven track record", "cutting-edge", "seamlessly", "tapestry", "testament", "delve", "embark", "comprehensive", "innovative", "utilize", "passionate", "vibrant".
        - NATURAL TONE: Write like a human. Use active voice. Avoid flowery adjectives and perfectly balanced sentences.
        - VALUE-FIRST: Focus on "I can do X for you" rather than "I have done X".
        - HIGHLIGHTING: BOLD key technical skills and experience keywords that match the job description.
  `;

  const outputFormat = `
    IMPORTANT: Your response MUST be a JSON object with two keys:
    1. "letter": The updated/generated cover letter in Markdown format.
    2. "advice": Any career coaching advice, explanations, or answers to questions.
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
      You are an expert career coach. Generate a personalized cover letter for ${profile.name}.
      
      ${goldenRules}
      
      STRICT DATA SOURCE:
      - Use ONLY information from the User Profile and Job Description.
      - DO NOT hallucinate experience.
      
      User Profile:
      Name: ${profile.name}
      Contact: ${profile.email} | ${profile.phone} | ${profile.location}
      LinkedIn: ${profile.linkedin}
      Summary: ${profile.summary}
      Experience: ${profile.experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.period}): ${exp.highlights.join(' ')}`).join('\n')}
      Education: ${profile.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}
      Skills: ${profile.skills.join(', ')}
      
      Job Description:
      ${jobDescription}
      
      ${outputFormat}
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result as { letter: string; advice: string };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
}
