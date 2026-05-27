export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  workplaceInsights?: {
    traits: string[];
    strengths: string[];
  };
}

export interface JobRole {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  status: "Drafting" | "Applied" | "Interview Scheduled" | "Accepted" | "Rejected";
  createdDate: string;
  coverLetter?: string;
  coverLetterSpecifics?: string;
  applicationEmail?: string;
  hiringManager?: string;
  companyInfo?: string;
  keyRequirements?: string[];
  emailSubject?: string;
  emailBody?: string;
  analysisSuggestions?: any[];
  interviewPrepData?: any;
  userStarsAnswers?: Record<string, string>;
  taskInstructions?: string;
  taskDraftOutput?: any;
  workTaskDesc?: string;
  selectedDocType?: string;
  generatedDoc?: string;
  sheetInput?: string;
  generatedSheet?: any;
  customQuestions?: string;
}
