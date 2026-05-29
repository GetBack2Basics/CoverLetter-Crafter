import React, { useState, useEffect } from "react";
import { 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Plus, 
  Trash2, 
  X, 
  ChevronRight,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Award,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Linkedin,
  Clock,
  Compass,
  Cpu,
  Bookmark,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { evaluateInterviewResponse, researchInterviewer, suggestInterviewerMatches, refineInterviewSTARAnswer } from "../services/gemini";

export const BASELINE_ELEVATOR_PITCH_FALLBACK = {
  passion: {
    subtitle: "Hook with Core Problem-Solving and Innovation Focus",
    paragraph: "I've always been driven by a passion for solving complex, cross-functional problems—bridging technical innovation with practical domain operations to create lasting organizational impact.",
    coaching: "Keep it natural, warm, and highly engaging. Do not sound like a robot reading a resume -- speak from the heart about why you entered your domain of expertise."
  },
  community: {
    subtitle: "Pioneering collaborative programs WITH active stakeholders",
    paragraph: "My core philosophy is that solutions only truly work when built with empathy and deep understanding of stakeholders. I focus on active collaboration and user feedback to ensure systems are trusted and sustainable.",
    coaching: "This proves longevity and emotional intelligence (EQ). Highlight that user involvement is what guarantees decades-long project success."
  },
  experience: {
    subtitle: "Automating operational workflows & driving efficient ecosystems",
    paragraph: "Throughout my career, I've specialized in automating workflows and digitizing administrative pipelines. I have a track record of identifying operational inefficiencies and deploying custom scripts or models that save hundreds of hours of manual labor.",
    coaching: "Demonstrates high initiative, leadership capacity, and deep technical capabilities inside your past roles."
  },
  current: {
    subtitle: "Transforming process friction into streamlined solutions",
    paragraph: "In my recent roles, I have focused on translating business requirements into robust, automated digital solutions, working with team members to eliminate process friction, and scale high-value templates.",
    coaching: "Grounds you directly as a current, performing professional who understands exactly how to build successful workflows."
  },
  value: {
    subtitle: "Domain expertise + technology + user-centered design",
    paragraph: "That is the core value proposition I bring: a unique synthesis of engineering logic, problem-solving rigour, and stakeholder translation. I'm excited about this opportunity because your team's mission aligns with my drive to build scalable software assets that empower end users.",
    coaching: "Emphasize that you don't just write scripts; you build solutions that align science/engineering with end-user deployment."
  }
};

export const BASELINE_AI_STATEMENT_FALLBACK = {
  answerScript: `Certainly. I view generative AI as a specialized suite of productivity assistants, and I navigated its use strategically while maintaining absolute human agency, logical oversight, and personal accountability.\n\nFirst, for discovery and context gathering, I utilized AI to parse raw baseline definitions, outline best-practice schemas, and map complex documentation. This allowed me to rapidly synthesize domain knowledge far more efficiently than standard Web searches.\n\nSecond, for the core planning and execution, that remained purely my human domain. I drafted the operational logic, built out individual database fields, and designed the fundamental structure of the solution. AI cannot replace the creative leap or professional responsibility required to tailor assets to specific problems.\n\nThird, for refinement and formatting, I used AI as an editor. I fed it my raw analytical drafts and prompted it to optimize the language for non-technical stakeholders, format markdown tables, and polish visual labels for maximum readability.\n\nAt every step, I verified and audited every single output. I took ultimate administrative and technical responsibility for the results, ensuring transparent governance and full alignment with corporate compliance standards.`,
  whyWinsBulletPoints: [
    "Demonstrated Human Control: Clearly shows that AI was used strictly for brainstorming and visual formatting, while you maintained complete control and logical agency.",
    "Transparent Tool Governance: Establishes a professional standard of acknowledging helpful tools openly, showing high digital maturity and ethics.",
    "Methodical Separation of Tasks: Proves you can segment a workflow effectively—knowing when to execute yourself (the core analysis) and when to delegate (draft polishing)."
  ]
};

export const BASELINE_PREP_FALLBACK = {
  insightSummary: "A comprehensive baseline of behavioral and technical competency questions mapped to systems engineering, stakeholder coordination, and process automation.",
  questions: [
    {
      type: "Technical",
      question: "How do you design, execute, and validate a highly critical technical transition or migration under tight timelines?",
      starAnswer: {
        situation: "A legacy information system or database was suffering from data fragmentation, creating minor compliance and indexing discrepancies with modern standards.",
        task: "Perform a complete audit and clean state migration for thousands of client assets without disrupting real-time services.",
        action: "Created a modular automation script with customized validation triggers. Established error-logging rules to flag any out-of-bounds fields immediately.",
        result: "Converted 100% of data points safely ahead of schedule with zero operational downtime and absolute format compliance."
      },
      coachingTips: "Focus on migration steps, error check gates, and how you ensured complete transparency."
    },
    {
      type: "Behavioral",
      question: "Describe a time when you had to coordinate with diverse, non-technical stakeholders to get critical feedback and ensure your solution met their exact everyday needs.",
      starAnswer: {
        situation: "Primary software outputs were highly technical, resulting in workflow friction and team frustration.",
        task: "Audit user workflows, isolate key process pains, and co-design a cleaner dashboard that teams could leverage instantly.",
        action: "Hosted structured user discovery sessions and cooperative testing loops. Translated their verbal requests into visual indicators and single-page forms.",
        result: "Reduced task completion latency by 45% and received unanimous positive user adoption feedback."
      },
      coachingTips: "Show empathy, detail your collaborative training or testing sessions, and emphasize making complex concepts accessible."
    },
    {
      type: "Behavioral",
      question: "Can you share an instance where you identified an operational failure risk or system bottleneck and solved it through creative automation?",
      starAnswer: {
        situation: "During intense batch data processing, server instability was risking data corruption with no active disaster recovery scripts.",
        task: "Secure the ingestion pipeline to eliminate manual recovery tasks and maintain database integrity.",
        action: "Designed a custom backup and redundancy script that automatically saved localized checkpoints before committing updates.",
        result: "Achieved 100% data replication safety, eliminating data loss fears and reducing overall manual troubleshooting by 80%."
      },
      coachingTips: "Highlight your proactive threat modeling, script safeguards, and how you automated a tedious manual check."
    },
    {
      type: "Technical",
      question: "How do you present complex technological or operational structures to selection panels or executive boards who do not have a technical background?",
      starAnswer: {
        situation: "Presenting a major systems optimization plan to board members who control funding and high-level policy of the program.",
        task: "Demystify the structural changes and win clear executive support within a brief briefing slot.",
        action: "Avoided heavy technical jargon. Engineered simple, side-by-side visual flow models representing 'legacy friction vs. automated flow', and mapped business impacts explicitly.",
        result: "Secured immediate, unanimous budget approval for deployment within a single session."
      },
      coachingTips: "Emphasize standard terms over raw technical jargon. Relate the tech architecture directly to final organizational benefits."
    }
  ],
  presentationTips: [
    { title: "Acknowledge the Current System", detail: "Start by showing respect for the existing processes while demonstrating clear opportunities for optimization." },
    { title: "Focus heavily on error mitigation", detail: "State your validation logic and risk management criteria simply to capture technical interest." }
  ],
  presentationSlides: [
    {
      slideNumber: "Slide 1",
      title: "Context, Background, & The Operational Gaps",
      visualLayout: "A clean, high-contrast slide with legacy process flow bottlenecks of the status quo on the left, and key target operational metrics highlighted in bold on the right.",
      speakerNotes: "Good morning, members of the selection board. Today, I am excited to present my operational strategy for modernizing our core project assets and streamlining workflows. In our current landscape, manually addressing data fragmentation and legacy system friction poses a real risk to overall team efficiency and service delivery. To solve this, my plan introduces clear, scalable automation to eliminate active bottlenecks with high precision.",
      pacingAdvice: "Begin with a firm, professional greeting. Establish good pacing immediately. Pause after highlighting the key operational risk to let the board fully engage.",
      timingMinutes: "0:00 - 2:00 mins"
    },
    {
      slideNumber: "Slide 2",
      title: "The Three-Pillar Framework for Migration & Scale",
      visualLayout: "A three-part horizontal flow-timeline detailing: Phase 1 (Discovery & Schema Audit), Phase 2 (Validation & QA Core Setup), and Phase 3 (Bespoke Automation & Script Deployment).",
      speakerNotes: "To ensure a highly stable transition, my methodology centers on three distinct pillars. First, Discovery: we programmatically audit all existing folders and sources to document active parameters. Second, Validation: we craft strict validation filters, checking outputs or data fields to keep error rates near zero. Third, Automation: we build secure background scripts that execute updates automatically, eliminating human error.",
      pacingAdvice: "Maintain a steady, enthusiastic pace. Use hand gestures to reference the horizontal progression of the three phases.",
      timingMinutes: "2:00 - 4:00 mins"
    },
    {
      slideNumber: "Slide 3",
      title: "Under the Hood: Automation Logic & Quality Safeguards",
      visualLayout: "On the left: a clean block diagram showing automated error checking and validation loops. On the right: list of trigger gates that activate and lock down files when anomalies are detected.",
      speakerNotes: "Let me explain our primary technological guardrail. As incoming files or requests are ingested, our custom automation script processes the data, matches it against historical criteria, and executes validation checks. If any entry exceeds our error parameters, it is dynamically quarantined, and an alert is logged. This ensures raw errors can never corrupt the master system, maintaining absolute database integrity.",
      pacingAdvice: "Lean forward slightly. Speak with confident authority as you walk through the system's quality assurance safeguards.",
      timingMinutes: "4:00 - 6:30 mins"
    },
    {
      slideNumber: "Slide 4",
      title: "Measurable Impact, Governance, & Strategic Outcomes",
      visualLayout: "A clear, compelling summary slide with green checkmarks highlighting: 100% database integrity, 45% reduction in processing friction, and a transparent data audit trail.",
      speakerNotes: "Ultimately, the success of this strategy is measured by tangible results for our users and partners. By reducing process latency by 45% and securing complete system compliance, we ensure high stability. Furthermore, in accordance with best-practice data governance, every step is fully auditable, establishing absolute administrative transparency. Thank you, and I look forward to your questions.",
      pacingAdvice: "Deliver this slide with deep conviction. Focus on the ultimate business value and user confidence. End with a warm, professional invitation for questions.",
      timingMinutes: "6:30 - 10:00 mins"
    }
  ]
};

export function InterviewView({
  userProfile,
  jobDescription,
  setJobDescription,
  customQuestions,
  setCustomQuestions,
  coverLetter,
  interviewPrepData,
  isPrepGenerating,
  handleGeneratePrep,
  selectedQuestionIndex,
  setSelectedQuestionIndex,
  userStarsAnswers,
  setUserStarsAnswers,
  setInterviewPrepData,
}: {
  userProfile: any;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  customQuestions: string;
  setCustomQuestions: (val: string) => void;
  coverLetter?: string;
  interviewPrepData: any;
  isPrepGenerating: boolean;
  handleGeneratePrep: () => void;
  selectedQuestionIndex: number;
  setSelectedQuestionIndex: (idx: number) => void;
  userStarsAnswers: Record<string, string>;
  setUserStarsAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setInterviewPrepData: (val: any) => void;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Active Navigation Tab for the interview workspace
  const [activeInterviewTab, setActiveInterviewTab] = useState<"questions" | "panel" | "elevator" | "written_task">("questions");
  const [activePrepSlideIndex, setActivePrepSlideIndex] = useState<number>(0);

  // Interviewers State
  const [isSearchingLinkedIn, setIsSearchingLinkedIn] = useState(false);
  const [newInterviewerName, setNewInterviewerName] = useState("");
  const [newInterviewerRole, setNewInterviewerRole] = useState("");
  const [newInterviewerOrg, setNewInterviewerOrg] = useState("");
  const [newInterviewerLinkedin, setNewInterviewerLinkedin] = useState("");
  const [newInterviewerBackstory, setNewInterviewerBackstory] = useState("");
  const [newInterviewerTactic, setNewInterviewerTactic] = useState("");
  const [newInterviewerQuestions, setNewInterviewerQuestions] = useState("");

  // Match Profiles Suggestions States
  const [isSearchingMatches, setIsSearchingMatches] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<Array<{
    name: string;
    role: string;
    org: string;
    location: string;
    bioText: string;
    matchScore: string;
  }>>([]);
  const [showMatchesSuggestion, setShowMatchesSuggestion] = useState(false);

  // New Interview Answer Refinement & Text Selection states
  const [interviewSelectedText, setInterviewSelectedText] = useState("");
  const [interviewRefinementText, setInterviewRefinementText] = useState("");
  const [isRefiningAnswer, setIsRefiningAnswer] = useState(false);

  const [interviewers, setInterviewers] = useState<Array<{
    id: string;
    name: string;
    role: string;
    org: string;
    backstory: string;
    tactic: string;
    linkedinSearchSim: string;
    suggestedQuestions: string[];
    isSearchingSim?: boolean;
  }>>([]);

  // Sync interviewers dynamically when prep data changes
  useEffect(() => {
    if (interviewPrepData && interviewPrepData.simulatedPanelists && interviewPrepData.simulatedPanelists.length > 0) {
      const mapped = interviewPrepData.simulatedPanelists.map((p: any, idx: number) => ({
        id: p.id || `panel-gen-${idx}-${p.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: p.name,
        role: p.role,
        org: p.org || "",
        backstory: p.backstory,
        tactic: p.tactic,
        linkedinSearchSim: p.linkedinSearchSim,
        suggestedQuestions: p.suggestedQuestions || []
      }));
      setInterviewers(mapped);
    } else {
      // Fallback baseline defaults when no specific simulated panelists exist
      setInterviewers([
        {
          id: "int-1",
          name: "Sarah Jenkins",
          role: "Hiring Manager & Department Lead",
          org: "Selection Committee",
          backstory: "Lead administrator and department chair. Focused on long-term strategy, candidate team fit, strategic resources, and cross-departmental success metrics.",
          tactic: "Address strategic coordination, project timelines, and team integration. Show proactive interest in structural risk mitigation, client engagement, and scaling operational assets.",
          linkedinSearchSim: "Expert in business transformation and modern organizational design. Dedicated to building high-performing, collaborative teams.",
          suggestedQuestions: [
            "What is the single biggest operational milestone the selection committee hopes to achieve with this role in the first six months?"
          ]
        },
        {
          id: "int-2",
          name: "David Chen",
          role: "Technical Lead & Principal Consultant",
          org: "Technical Operations Board",
          backstory: "Technical evaluator and subject matter expert with extensive experience handling system migrations, process automation, code standards, and database validation loops.",
          tactic: "Focus on technical integrity, accuracy validation, and robust error handling. Detail your workflow scripting, automation logic, and QA compliance checks.",
          linkedinSearchSim: "Pragmatic advocate for software clean-architecture, open-source automation, and scalable systems.",
          suggestedQuestions: [
            "What is the team's current approach to automation and platform migration? Do you favor established proprietary frameworks or modular, custom codebases?"
          ]
        },
        {
          id: "int-3",
          name: "Elena Rostova",
          role: "Senior Operations & Stakeholder Liaison",
          org: "Strategic Delivery Unit",
          backstory: "Cross-functional specialist who ensures scientific or technical outputs are designed collaboratively and translated effectively for non-technical users and regional partners.",
          tactic: "Demonstrate domain empathy, user feedback integration, and standard training documentation. Refer to writing user manuals, README files, or hosting cooperative testing webinars.",
          linkedinSearchSim: "Shares regular articles on human-centered design, stakeholder co-design methodologies, and corporate knowledge-sharing platforms.",
          suggestedQuestions: [
            "How does the operations team coordinate feedback loops between end-users and the core technical engineers to ensure tools are continually refined?"
          ]
        }
      ]);
    }
  }, [interviewPrepData]);

  // Elevator Pitch Checklist persistence
  const [elevatorChecks, setElevatorChecks] = useState<Record<string, boolean>>({
    passion: false,
    community: false,
    experience: false,
    current: false,
    value: false
  });

  const toggleElevatorCheck = (id: string) => {
    setElevatorChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddInterviewerWithSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterviewerName.trim() || !newInterviewerRole.trim()) {
      toast.error("Please provide both name and title of the interviewer.");
      return;
    }

    const org = newInterviewerOrg.trim() || "Selection Committee";

    // If manual override fields are specified, add manually right away - no AI call required!
    if (newInterviewerBackstory.trim() || newInterviewerTactic.trim()) {
      const manualQuestionsArray = newInterviewerQuestions.trim()
        ? newInterviewerQuestions.split("\n").map(q => q.trim()).filter(Boolean)
        : ["What is the primary operational objective for this role over the next year?"];

      const newMember = {
        id: Math.random().toString(36).substring(2, 9),
        name: newInterviewerName.trim(),
        role: newInterviewerRole.trim(),
        org,
        backstory: newInterviewerBackstory.trim() || "Professional committee member with specialized division background.",
        tactic: newInterviewerTactic.trim() || "Address their focal operational standards clearly, showing high digital capability and team player values.",
        linkedinSearchSim: newInterviewerLinkedin.trim() || "No public LinkedIn activity copy-pasted.",
        suggestedQuestions: manualQuestionsArray
      };

      setInterviewers(prev => [...prev, newMember]);
      setNewInterviewerName("");
      setNewInterviewerRole("");
      setNewInterviewerOrg("");
      setNewInterviewerLinkedin("");
      setNewInterviewerBackstory("");
      setNewInterviewerTactic("");
      setNewInterviewerQuestions("");
      toast.success(`Successfully added ${newInterviewerName} manually! 👥`);
      return;
    }

    // Default: Simulate/research using Gemini
    setIsSearchingLinkedIn(true);
    toast.info(`Querying professional databases for ${newInterviewerName}... 🔍`, {
      description: "Analyzing company context, role, and bio description..."
    });

    try {
      const data = await researchInterviewer(
        newInterviewerName.trim(),
        newInterviewerRole.trim(),
        org,
        jobDescription,
        newInterviewerLinkedin.trim() || undefined
      );

      const newMember = {
        id: Math.random().toString(36).substring(2, 9),
        name: newInterviewerName.trim(),
        role: newInterviewerRole.trim(),
        org,
        backstory: data.backstory,
        tactic: data.tactic,
        linkedinSearchSim: data.linkedinSearchSim,
        suggestedQuestions: data.suggestedQuestions || ["What are the critical success factors or milestones your team aims to complete during the initial six months for this position?"]
      };

      setInterviewers(prev => [...prev, newMember]);
      setNewInterviewerName("");
      setNewInterviewerRole("");
      setNewInterviewerOrg("");
      setNewInterviewerLinkedin("");
      setNewInterviewerBackstory("");
      setNewInterviewerTactic("");
      setNewInterviewerQuestions("");
      toast.success(`Successfully researched & added ${newInterviewerName}! 👥`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile research summary. Added with standard fallback.");

      // Add with high-quality generic fallback
      const newMember = {
        id: Math.random().toString(36).substring(2, 9),
        name: newInterviewerName.trim(),
        role: newInterviewerRole.trim(),
        org,
        backstory: `Experienced operations professional specializing in ${newInterviewerRole.trim()} objectives.`,
        tactic: "Address their strategic guidelines directly with proof of execution and digital maturity.",
        linkedinSearchSim: "Active practitioner in the field.",
        suggestedQuestions: ["How does this division evaluate role performance and project success metrics?"]
      };
      setInterviewers(prev => [...prev, newMember]);
    } finally {
      setIsSearchingLinkedIn(false);
    }
  };

  const handleSearchInterviewerProfiles = async () => {
    if (!newInterviewerName.trim()) {
      toast.error("Please enter a name or email address in the query field first.");
      return;
    }

    setIsSearchingMatches(true);
    setShowMatchesSuggestion(true);
    toast.info(`Querying professional databases for "${newInterviewerName}"... 🔎`);

    try {
      const results = await suggestInterviewerMatches(newInterviewerName.trim(), jobDescription);
      setSuggestedMatches(results.matches || []);

      // Check if name has an email embedded to parse it out
      const emailRegex = /<([^>]+)>|([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})/;
      const match = newInterviewerName.match(emailRegex);
      if (match) {
        const parsedEmail = (match[1] || match[2] || "").trim();
        const parsedName = newInterviewerName
          .replace(/<[^>]+>/g, "")
          .replace(/\([^)]+\)/g, "")
          .replace(parsedEmail, "")
          .replace(/[<>()[\]]/g, "")
          .trim();

        setNewInterviewerName(parsedName);
        toast.info(`Successfully parsed: Name "${parsedName}" & Email "${parsedEmail}"`);
      }

      if (results.matches && results.matches.length > 0) {
        // Auto-populate with the first result
        const firstMatch = results.matches[0];
        setNewInterviewerRole(firstMatch.role);
        setNewInterviewerOrg(firstMatch.org);
        setNewInterviewerLinkedin(firstMatch.bioText);
        toast.success(`Populated with top matching profile: ${firstMatch.role} @ ${firstMatch.org}!`);
      } else {
        toast.warning("No matches returned, please adjust query.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to execute profile lookup coordinates.");
    } finally {
      setIsSearchingMatches(false);
    }
  };

  const handleInterviewTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
      if (text) {
        setInterviewSelectedText(text);
        toast.info("Target text selected!", {
          description: `"${text.substring(0, 40)}..." marked for AI refinement instructions. Type a prompt down in the Refinement section.`
        });
      }
    }
  };

  const handleRefineInterviewAnswerSelectionAndPrompt = async () => {
    if (!interviewRefinementText.trim()) {
      toast.error("Please provide prompt instructions for what needs to be changed.");
      return;
    }

    const currentQ = interviewPrepData?.questions?.[selectedQuestionIndex];
    if (!currentQ) {
      toast.error("No selected question to refine.");
      return;
    }

    setIsRefiningAnswer(true);
    const toastId = toast.loading("Refining answer via expert AI coach...");

    try {
      const currentStar = {
        situation: currentQ?.starAnswer?.situation || "",
        task: currentQ?.starAnswer?.task || "",
        action: currentQ?.starAnswer?.action || "",
        result: currentQ?.starAnswer?.result || ""
      };

      const result = await refineInterviewSTARAnswer(
        currentQ.question,
        currentStar,
        interviewRefinementText,
        interviewSelectedText || undefined,
        userProfile
      );

      // Now update state
      const questions = [...(interviewPrepData.questions || [])];
      questions[selectedQuestionIndex] = {
        ...questions[selectedQuestionIndex],
        starAnswer: {
          situation: result.situation,
          task: result.task,
          action: result.action,
          result: result.result
        }
      };

      setInterviewPrepData({
        ...interviewPrepData,
        questions
      });

      toast.success("Successfully refined recommended STAR model answer! 🎉", { id: toastId });
      setInterviewRefinementText("");
      setInterviewSelectedText("");
    } catch (error) {
      console.error(error);
      toast.error("Unable to execute answer refinement.", { id: toastId });
    } finally {
      setIsRefiningAnswer(false);
    }
  };

  const handleAddInterviewerLocal = (name: string, role: string, org: string, backstory: string, tactic: string, linkedinSearchSim: string, suggestedQuestions: string[]) => {
    const newMember = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      role,
      org,
      backstory,
      tactic,
      linkedinSearchSim,
      suggestedQuestions
    };
    setInterviewers(prev => [...prev, newMember]);
    toast.success(`Interviewer ${name} added.`);
  };

  const handleRemoveInterviewer = (id: string) => {
    setInterviewers(prev => prev.filter(i => i.id !== id));
    toast.success("Interviewer removed from panel list.");
  };

  // Voice practicing state
  const [practiceText, setPracticeText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    critique: string;
    tips: string;
    revisedAnswer: string;
  } | null>(null);

  // States to toggle edit mode in Interview prep checklist
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);

  const handleUpdateQuestionText = (val: string) => {
    if (!interviewPrepData || !setInterviewPrepData) return;
    const questions = [...(interviewPrepData.questions || [])];
    if (questions[selectedQuestionIndex]) {
      questions[selectedQuestionIndex] = {
        ...questions[selectedQuestionIndex],
        question: val
      };
      setInterviewPrepData({
        ...interviewPrepData,
        questions
      });
    }
  };

  const handleUpdateQuestionType = (val: string) => {
    if (!interviewPrepData || !setInterviewPrepData) return;
    const questions = [...(interviewPrepData.questions || [])];
    if (questions[selectedQuestionIndex]) {
      questions[selectedQuestionIndex] = {
        ...questions[selectedQuestionIndex],
        type: val
      };
      setInterviewPrepData({
        ...interviewPrepData,
        questions
      });
    }
  };

  const handleUpdateQuestionTips = (val: string) => {
    if (!interviewPrepData || !setInterviewPrepData) return;
    const questions = [...(interviewPrepData.questions || [])];
    if (questions[selectedQuestionIndex]) {
      questions[selectedQuestionIndex] = {
        ...questions[selectedQuestionIndex],
        coachingTips: val
      };
      setInterviewPrepData({
        ...interviewPrepData,
        questions
      });
    }
  };

  const handleUpdateQuestionStar = (field: "situation" | "task" | "action" | "result", val: string) => {
    if (!interviewPrepData || !setInterviewPrepData) return;
    const questions = [...(interviewPrepData.questions || [])];
    if (questions[selectedQuestionIndex]) {
      const starAnswer = {
        ...(questions[selectedQuestionIndex].starAnswer || {}),
        [field]: val
      };
      questions[selectedQuestionIndex] = {
        ...questions[selectedQuestionIndex],
        starAnswer
      };
      setInterviewPrepData({
        ...interviewPrepData,
        questions
      });
    }
  };

  // Manual local question builder states
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<"Behavioral" | "Technical">("Behavioral");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionCoaching, setNewQuestionCoaching] = useState("");
  const [newSituation, setNewSituation] = useState("");
  const [newTestingTask, setNewTestingTask] = useState("");
  const [newExecutionAction, setNewExecutionAction] = useState("");
  const [newResolvedResult, setNewResolvedResult] = useState("");

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      toast.error("Please provide the question prompt text.");
      return;
    }

    const newQuestionObj = {
      type: newQuestionType,
      question: newQuestionText,
      coachingTips: newQuestionCoaching || "Focus on demonstrating structured accountability and quantitative metrics.",
      starAnswer: {
        situation: newSituation || "Not specified. Frame the initial spatial hazard scenario.",
        task: newTestingTask || "Not specified. Highlight operational rules and timelines.",
        action: newExecutionAction || "Not specified. Detail specific scripting execution steps.",
        result: newResolvedResult || "Not specified. Present exact conversion margins or coordinate precision results."
      }
    };

    const currentQuestions = interviewPrepData?.questions || [];
    const updatedQuestions = [...currentQuestions, newQuestionObj];

    const updatedPrepData = {
      insightSummary: interviewPrepData?.insightSummary || "Tailored database of campaign study sheets and custom checklist questions.",
      questions: updatedQuestions,
      presentationTips: interviewPrepData?.presentationTips || [
        { title: "Review coordinates transformation logic", detail: "Assess Python compliance structures and spatial data rules." }
      ]
    };

    setInterviewPrepData(updatedPrepData);
    setSelectedQuestionIndex(updatedQuestions.length - 1);
    
    setNewQuestionText("");
    setNewQuestionCoaching("");
    setNewSituation("");
    setNewTestingTask("");
    setNewExecutionAction("");
    setNewResolvedResult("");
    setShowAddQuestionForm(false);

    toast.success("Successfully appended custom study question! 🎉");
  };

  const handleRemoveQuestion = (idxToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interviewPrepData || !interviewPrepData.questions) return;
    
    const updatedQuestions = interviewPrepData.questions.filter((_: any, idx: number) => idx !== idxToRemove);
    const updatedPrepData = {
      ...interviewPrepData,
      questions: updatedQuestions
    };
    
    setInterviewPrepData(updatedPrepData);
    if (selectedQuestionIndex === idxToRemove) {
      setSelectedQuestionIndex(0);
    } else if (selectedQuestionIndex > idxToRemove) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
    toast.success("Question deleted from practice checklist.");
  };

  const handleLoadBaselineQuestions = () => {
    setInterviewPrepData(BASELINE_PREP_FALLBACK);
    setSelectedQuestionIndex(0);
    toast.success("Loaded 4 RFS Benchmark Interview questions map!");
  };

  // Keep track of questions marked as "practiced enough"
  const [practicedIndices, setPracticedIndices] = useState<Record<number, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`jobcrafter_practiced_${userProfile.name}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Keep track of Speech Synthesis Active talking state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    return localStorage.getItem("jobcrafter_selected_voice") || "";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        setVoices(allVoices);
        
        // If no selected voice in localStorage, pick a default (AU/GB/US or first)
        const saved = localStorage.getItem("jobcrafter_selected_voice");
        if (!saved && allVoices.length > 0) {
          const defaultVoice = allVoices.find(
            (v) => v.lang.includes("AU") || v.lang.includes("GB") || v.lang.includes("US")
          ) || allVoices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem("jobcrafter_selected_voice", uri);
    toast.success("AI voice updated successfully!");
  };

  // Speak question out loud using Synthesis
  const speakQuestion = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick selected voice if available
    if (selectedVoiceURI) {
      const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) utterance.voice = chosenVoice;
    } else {
      const cleanVoice = voices.find(
        (v) => v.lang.includes("AU") || v.lang.includes("GB") || v.lang.includes("US")
      );
      if (cleanVoice) utterance.voice = cleanVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    toast.info("AI interviewer is speaking question out loud... 🔊");
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Toggle Speech Recognition STT
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech transcription is not supported in this browser. Please type your answer instead.");
      return;
    }

    if (isListening) {
      if ((window as any).rInstance) {
        (window as any).rInstance.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-AU";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Mic is live! Start speaking your STAR response now.");
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        const errorType = e.error || "";
        if (errorType === "not-allowed") {
          toast.error("Microphone permission denied! Please click the icon in your browser's address bar to allow access, or click 'Open in a new tab' at the top right of the preview to bypass iframe security.", {
            duration: 10000
          });
        } else if (errorType === "service-not-allowed") {
          toast.error("Speech input is not allowed by your browser or operating system inside this environment.", {
            duration: 7000
          });
        } else {
          toast.error(`Microphone error (${errorType || "unknown"}). Try opening this application in a new tab to bypass iframe security policies.`, {
            duration: 8000
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let resultPhrase = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            resultPhrase += event.results[i][0].transcript;
          }
        }
        if (resultPhrase) {
          setPracticeText((prev) => (prev ? prev + " " + resultPhrase.trim() : resultPhrase.trim()));
        }
      };

      (window as any).rInstance = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Call Gemini to evaluate response
  const handleEvaluateResponse = async () => {
    if (!practiceText.trim()) {
      toast.error("Please say or type your response before requesting an evaluation.");
      return;
    }

    const currentQ = interviewPrepData?.questions?.[selectedQuestionIndex];
    if (!currentQ) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateInterviewResponse(
        currentQ.question,
        practiceText,
        currentQ.starAnswer,
        userProfile
      );
      setEvaluation(result);
      toast.success("STAR analysis feedback computed!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to compile evaluation. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Mark current question practiced enough and go to next
  const markAsPracticed = () => {
    const updated = { ...practicedIndices, [selectedQuestionIndex]: true };
    setPracticedIndices(updated);
    localStorage.setItem(`jobcrafter_practiced_${userProfile.name}`, JSON.stringify(updated));

    // Save in user profile / active role stars
    setUserStarsAnswers((prev) => ({
      ...prev,
      [`q_${selectedQuestionIndex}`]: practiceText,
    }));

    toast.success("Successfully marked as Practiced Enough! 🎉");

    // Advance to next question automatically if exists
    if (interviewPrepData?.questions && selectedQuestionIndex < interviewPrepData.questions.length - 1) {
      setTimeout(() => {
        setSelectedQuestionIndex(selectedQuestionIndex + 1);
        setPracticeText("");
        setEvaluation(null);
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }, 800);
    } else {
      toast.info("Hooray! You've run through all compiled prep questions successfully!");
    }
  };

  const currentQuestion = interviewPrepData?.questions?.[selectedQuestionIndex];

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-[#FAF9F6] relative">
      {/* Sidebar Toggle when collapsed */}
      {isSidebarCollapsed && (
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute left-4 top-4 z-20 h-8 px-3 rounded-md bg-card shadow-sm border border-border shrink-0 text-xs font-bold gap-2 text-primary hover:bg-primary/5 transition-all"
          onClick={() => setIsSidebarCollapsed(false)}
        >
          <PanelLeftOpen className="w-3.5 h-3.5" />
          Show Voice Trainer Panel
        </Button>
      )}

      {/* Left Input/Portfolio Setup Panel */}
      {!isSidebarCollapsed && (
        <aside className="w-full md:w-[350px] lg:w-[380px] border-b md:border-b-0 md:border-r border-border bg-white flex flex-col gap-6 p-6 overflow-y-auto shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 text-muted-foreground hover:text-primary p-0 h-auto w-auto"
                  title="Hide Panel"
                  onClick={() => setIsSidebarCollapsed(true)}
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#9c1c1c]">Active Interview Prep</p>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-sans">Voice Trainer & Planner</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Construct tailored panel questions and practice your answers out loud.
          </p>
        </div>

        <Separator />

        {/* Portfolio Inputs Context - Lets users view/edit prompt details directly */}
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-bold text-gray-600">Active Job Description</Label>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold font-sans">Editable</span>
              </div>
              <Textarea
                placeholder="Paste or edit the original job description / requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[120px] max-h-[180px] text-xs resize-y text-slate-800 font-medium bg-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-bold text-gray-600">Custom/Provided Interview Questions</Label>
                <span className="text-[9px] font-mono text-muted-foreground font-medium">Add panel questions</span>
              </div>
              <Textarea
                placeholder="Paste any specific, custom questions provided by the hiring manager or panel here (e.g., 'What is your experience with emergency GIS coordinates?')."
                value={customQuestions}
                onChange={(e) => setCustomQuestions(e.target.value)}
                className="min-h-[110px] text-xs resize-none text-slate-800 font-medium"
              />
            </div>

            {coverLetter ? (
              <div className="bg-[#f0f9ff] border border-blue-100 rounded-xl p-3 space-y-1.5 text-left">
                <span className="text-[9px] uppercase font-bold text-[#1e5480] flex items-center gap-1.5">
                  <FileText className="w-3" /> Job Portfolio cover letter loaded
                </span>
                <p className="text-[11px] text-slate-800 line-clamp-3 leading-snug">
                  "{coverLetter.replace(/<[^>]*>/g, "")}"
                </p>
              </div>
            ) : (
              <div className="bg-[#fcf8e3] border border-amber-100 rounded-xl p-3 text-left text-[11px] text-amber-800">
                ⚠️ No cover letter drafted for this role. Defaulting purely to candidate profile.
              </div>
            )}

            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/40 text-left text-[11px] text-[#9c1c1c] leading-relaxed">
              <strong className="block mb-1">Tailored Selection Targeting</strong>
              The compiler generates situational technical testing matching key selection specifications exactly.
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4 space-y-2">
            <Button
              onClick={handleGeneratePrep}
              disabled={isPrepGenerating}
              className="w-full h-11 text-xs font-bold uppercase tracking-wider text-white"
            >
              {isPrepGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  Compiling Simulator Dataset...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Compile STAR Q&A Partner
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
      )}

      {/* Main Interactive Stage */}
      <section className={`flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6 bg-[#FAF9F6] ${isSidebarCollapsed ? 'pt-16 md:pt-8' : ''}`}>
        
        {/* Navigation Selector Bar */}
        <div className="w-full max-w-4xl mx-auto text-left">
          <div className="flex flex-wrap bg-[#EFEFE9] p-1.5 rounded-2xl border border-slate-300/40 w-full md:w-max gap-1">
            <button
              type="button"
              onClick={() => setActiveInterviewTab("questions")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all h-9 ${
                activeInterviewTab === "questions"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-[#9c1c1c]" />
              🎙️ Mock STAR Arena
            </button>
            <button
              type="button"
              onClick={() => setActiveInterviewTab("panel")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all h-9 ${
                activeInterviewTab === "panel"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              👥 Panel Study
            </button>
            <button
              type="button"
              onClick={() => setActiveInterviewTab("elevator")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all h-9 ${
                activeInterviewTab === "elevator"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-orange-500" />
              🚀 Elevator Intro
            </button>
            <button
              type="button"
              onClick={() => setActiveInterviewTab("written_task")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all h-9 ${
                activeInterviewTab === "written_task"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              🛠️ Task & AI Key
            </button>
          </div>
        </div>

        {activeInterviewTab === "questions" && (
          <>
            {interviewPrepData && Array.isArray(interviewPrepData.questions) && interviewPrepData.questions.length > 0 ? (
          <div className="space-y-6 w-full max-w-4xl mx-auto">
            {/* Header Insight */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-2">
              <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest block w-max">
                ALIGNMENT STRATEGY
              </span>
              <h3 className="text-xl font-bold text-gray-905 text-left">Custom Selection Alignment</h3>
              <p className="text-xs text-muted-foreground leading-relaxed text-left">
                {interviewPrepData.insightSummary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div className="text-left">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Target Practice Worksheet
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  Select any question below to inspect recommended baseline responses, practice answering via voice, or use AI targeted refinements on specific paragraphs or text snippets.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddQuestionForm(!showAddQuestionForm)} 
                className="h-8 px-3 text-[11px] font-bold text-[#9c1c1c] border-[#9c1c1c]/25 hover:bg-[#9c1c1c]/5 uppercase tracking-wider shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Prompt
              </Button>
            </div>

            {/* Optional Inline ADD Form */}
            {showAddQuestionForm && (
              <form onSubmit={handleAddCustomQuestion} className="bg-white border border-primary/20 p-5 rounded-xl space-y-4 shadow-md border-2 text-left">
                <div className="flex justify-between items-center text-xs pb-2 border-b">
                  <span className="font-extrabold uppercase text-[#9c1c1c]">New Practice Question</span>
                  <button type="button" onClick={() => setShowAddQuestionForm(false)} className="text-gray-400 hover:text-gray-650">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] uppercase font-bold text-slate-600">Classification</Label>
                    <select 
                      value={newQuestionType} 
                      onChange={(e) => setNewQuestionType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-semibold focus:ring-1 focus:ring-primary h-10 text-black appearance-none"
                    >
                      <option value="Behavioral">Behavioral / Situation</option>
                      <option value="Technical">Technical / Competency</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] uppercase font-bold text-slate-600">Question Prompt</Label>
                    <Input 
                      placeholder="e.g. Can you describe a datum conversion project you implemented?" 
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="text-xs h-10 text-black font-semibold bg-white border border-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] uppercase font-bold text-slate-600">Strategic Coach Guidelines</Label>
                  <Input 
                    placeholder="Emphasize sub-meter validation checks..." 
                    value={newQuestionCoaching}
                    onChange={(e) => setNewQuestionCoaching(e.target.value)}
                    className="text-xs h-10 text-black font-semibold bg-white border border-slate-300"
                  />
                </div>

                <div className="border-t pt-3 space-y-2 text-left">
                  <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider font-mono">STAR Outline Guides (Optional)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <Label className="text-[9px] font-bold text-slate-600">Situation</Label>
                      <Input 
                        placeholder="Situation" 
                        value={newSituation} 
                        onChange={(e) => setNewSituation(e.target.value)}
                        className="text-xs h-9 text-black font-semibold bg-white border border-slate-300"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <Label className="text-[9px] font-bold text-slate-600">Task</Label>
                      <Input 
                        placeholder="Task" 
                        value={newTestingTask} 
                        onChange={(e) => setNewTestingTask(e.target.value)}
                        className="text-xs h-9 text-black font-semibold bg-white border border-slate-300"
                      />
                    </div>
                    <div className="space-y-1 col-span-1 md:col-span-2 text-left">
                      <Label className="text-[9px] font-bold text-slate-600">Action</Label>
                      <Input 
                        placeholder="Action" 
                        value={newExecutionAction} 
                        onChange={(e) => setNewExecutionAction(e.target.value)}
                        className="text-xs h-9 text-black font-semibold bg-white border border-slate-300 w-full"
                      />
                    </div>
                    <div className="space-y-1 col-span-1 md:col-span-2 text-left">
                      <Label className="text-[9px] font-bold text-slate-600">Result</Label>
                      <Input 
                        placeholder="Result" 
                        value={newResolvedResult} 
                        onChange={(e) => setNewResolvedResult(e.target.value)}
                        className="text-xs h-9 text-black font-semibold bg-white border border-slate-300 w-full"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="sm" className="w-full h-9 text-xs font-sans font-bold uppercase tracking-wider text-white">
                  Create Practice Prompt
                </Button>
              </form>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                  <thead className="bg-[#FAF9F6] border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 w-[45%] border-r border-slate-200 text-left">
                        Practice Question & Evaluation
                      </th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 w-[55%] text-left">
                        Suggested STAR Answer & Refinement Coach
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {interviewPrepData.questions.map((q: any, idx: number) => {
                      const isActive = selectedQuestionIndex === idx;
                      const practiced = practicedIndices[idx];

                      if (!isActive) {
                        return (
                          <tr 
                            key={idx} 
                            onClick={() => {
                              setSelectedQuestionIndex(idx);
                              setPracticeText("");
                              setEvaluation(null);
                              window.speechSynthesis.cancel();
                              setIsSpeaking(false);
                            }}
                            className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                          >
                            <td className="p-5 border-r border-slate-200 align-top text-left">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase text-[#9c1c1c] tracking-wider bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                    {q.type} Question
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {practiced && (
                                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5 shrink-0">
                                        <Check className="w-2.5 h-2.5" /> Practiced
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => handleRemoveQuestion(idx, e)}
                                      className="opacity-0 group-hover:opacity-100 duration-150 p-1 text-slate-405 hover:text-red-500 rounded hover:bg-slate-100 shrink-0"
                                      title="Delete Question"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                                  {q.question}
                                </h5>
                              </div>
                            </td>
                            <td className="p-5 text-left align-top">
                              <div className="flex flex-col justify-between h-full space-y-2">
                                <p className="text-[11px] text-slate-400 italic line-clamp-1">
                                  {q.starAnswer?.situation
                                    ? `S: ${q.starAnswer.situation.substring(0, 100)}...`
                                    : "No baseline model answer recorded."}
                                </p>
                                <span className="text-[10px] text-blue-600 font-bold group-hover:underline inline-flex items-center gap-1">
                                  Click row to activate mock practice & AI refinement tools →
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      {/* ACTIVE ITEM EXPANDED CELLS */}
                      return (
                        <tr key={idx} className="bg-white">
                          {/* Active Left Column cell */}
                          <td className="p-6 border-r border-slate-200 align-top text-left space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#9c1c1c] bg-red-50 px-2.5 py-1 rounded border border-red-200">
                                {currentQuestion?.type.toUpperCase()} WORKSPACE
                              </span>
                              
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    isSpeaking
                                      ? stopSpeaking()
                                      : speakQuestion(currentQuestion?.question || "")
                                  }
                                  className={`h-7 px-2.5 rounded-full border border-primary/20 text-[10px] font-bold flex items-center gap-1 transition-all ${
                                    isSpeaking
                                      ? "bg-primary text-white scale-105 animate-pulse"
                                      : "bg-transparent text-primary hover:bg-primary/5"
                                  }`}
                                  title="Ask Aloud"
                                >
                                  <Volume2 className={`w-3 h-3 ${isSpeaking ? "animate-bounce" : ""}`} />
                                  Ask Aloud
                                </button>

                                <Button
                                  size="sm"
                                  variant={isEditingQuestion ? "secondary" : "outline"}
                                  onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                                  className={`h-7 px-2.5 rounded-full text-[10px] font-bold gap-1 transition-all ${
                                    isEditingQuestion 
                                      ? "bg-[#9c1c1c] text-white" 
                                      : "text-[#9c1c1c] border-[#9c1c1c]/20 hover:bg-[#9c1c1c]/5 bg-white"
                                  }`}
                                >
                                  {isEditingQuestion ? <Check className="w-3 h-3 text-[#fff]" /> : "✏️ Edit"}
                                </Button>

                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveQuestion(idx, e)}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 shrink-0"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Question Title & Category selection */}
                            <div className="space-y-2.5">
                              {isEditingQuestion ? (
                                <div className="space-y-2 text-left">
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-slate-500 uppercase">Question Prompt Text</Label>
                                    <Input
                                      value={currentQuestion?.question || ""}
                                      onChange={(e) => handleUpdateQuestionText(e.target.value)}
                                      className="text-xs h-9 text-black font-bold bg-white border-slate-300 focus:outline-[#9c1c1c]"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-slate-500 uppercase">Question Classification</Label>
                                    <select
                                      value={currentQuestion?.type || "Behavioral"}
                                      onChange={(e) => handleUpdateQuestionType(e.target.value)}
                                      className="w-full bg-white border border-slate-300 p-2 rounded-lg text-xs font-black focus:ring-1 focus:ring-[#9c1c1c] h-9 text-black"
                                    >
                                      <option value="Behavioral">Behavioral / Situational Scenario</option>
                                      <option value="Technical">Technical / Practical Competency</option>
                                    </select>
                                  </div>
                                </div>
                              ) : (
                                <h4 
                                  onMouseUp={handleInterviewTextSelection}
                                  className="text-[13px] font-sans font-extrabold text-slate-900 leading-snug cursor-pointer hover:bg-slate-100 rounded transition-all italic pl-1 border-l-4 border-[#9c1c1c]"
                                  title="Highlight text to refine answers"
                                >
                                  {currentQuestion?.question}
                                </h4>
                              )}

                              {/* Coaching guide reference */}
                              <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl text-left space-y-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                                  Recommended Answer Strategy
                                </span>
                                {isEditingQuestion ? (
                                  <Textarea
                                    value={currentQuestion?.coachingTips || ""}
                                    onChange={(e) => handleUpdateQuestionTips(e.target.value)}
                                    className="text-xs bg-white border-slate-300 text-black font-semibold min-h-[60px] focus:outline-[#9c1c1c] p-2"
                                    placeholder="Type strategic answers criteria..."
                                  />
                                ) : (
                                  <p 
                                    onMouseUp={handleInterviewTextSelection}
                                    className="text-[11px] text-slate-705 leading-relaxed font-sans cursor-pointer hover:bg-slate-100/50 rounded p-1 transition-all"
                                    title="Highlight text to refine answers"
                                  >
                                    {currentQuestion?.coachingTips}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Practice Recorder */}
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-left">
                              <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-extrabold text-slate-650 uppercase tracking-widest flex items-center gap-1">
                                  <Mic className="w-3.5 h-3.5 text-red-650" /> Live Practice recorder
                                </h5>
                                {isListening && (
                                  <span className="flex items-center gap-1.5 text-[9px] text-red-600 font-extrabold animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-ping" /> Listening...
                                  </span>
                                )}
                              </div>

                              {isListening && (
                                <div className="flex items-center justify-center gap-1 bg-red-50/40 border border-red-100 rounded-lg h-8 animate-pulse">
                                  <div className="w-0.5 h-3 bg-red-500 rounded animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <div className="w-0.5 h-5 bg-red-500 rounded animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <div className="w-0.5 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: "300ms" }} />
                                  <div className="w-0.5 h-6 bg-red-500 rounded animate-bounce" style={{ animationDelay: "100ms" }} />
                                  <div className="w-0.5 h-2 bg-red-500 rounded animate-bounce" style={{ animationDelay: "200ms" }} />
                                  <div className="w-0.5 h-5 bg-red-500 rounded animate-bounce" style={{ animationDelay: "450ms" }} />
                                </div>
                              )}

                              <Textarea
                                placeholder="Record your audio answer, or write it directly in this field to analyze alignment performance..."
                                value={practiceText}
                                onChange={(e) => setPracticeText(e.target.value)}
                                className="min-h-[110px] text-xs resize-none text-black font-semibold bg-white border-slate-300"
                              />

                              <div className="flex gap-2.5">
                                <Button
                                  variant={isListening ? "destructive" : "outline"}
                                  onClick={toggleListening}
                                  className="h-9 text-xs font-bold"
                                >
                                  {isListening ? "Stop" : "Record"}
                                </Button>

                                <Button
                                  onClick={handleEvaluateResponse}
                                  disabled={isEvaluating || !practiceText.trim()}
                                  className="h-9 text-xs font-bold uppercase tracking-wider flex-1 text-white bg-slate-900 hover:bg-slate-800"
                                >
                                  {isEvaluating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                                  )}
                                  Evaluate Answer
                                </Button>
                              </div>
                            </div>

                            {/* scorecard inline */}
                            {evaluation && (
                              <div className="bg-[#FAF9F6] border border-amber-200/60 rounded-xl p-4 space-y-4 text-left animate-in duration-300">
                                <div className="flex items-center justify-between border-b pb-2">
                                  <div className="flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Practice scorecard</h4>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                                    SCORE: {isEditingEvaluation ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={evaluation.score}
                                        onChange={(e) => {
                                          setEvaluation({
                                            ...evaluation,
                                            score: Number(e.target.value) || 0
                                          });
                                        }}
                                        className="w-10 bg-white border border-slate-300 rounded px-1 py-0.5 text-center font-bold text-black"
                                      />
                                    ) : (
                                      <span className="text-[#9c1c1c] font-black">{evaluation.score}</span>
                                    )} / 10
                                  </div>
                                </div>

                                <div className="space-y-3 text-xs">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Constructive Critique</span>
                                    {isEditingEvaluation ? (
                                      <Textarea
                                        value={evaluation.critique}
                                        onChange={(e) => {
                                          setEvaluation({
                                            ...evaluation,
                                            critique: e.target.value
                                          });
                                        }}
                                        className="text-xs bg-white text-black font-semibold min-h-[50px] p-2 border border-slate-300 rounded"
                                      />
                                    ) : (
                                      <p className="text-[11px] text-slate-800 leading-relaxed bg-white border p-2.5 rounded">
                                        {evaluation.critique}
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Coaching Tips</span>
                                    {isEditingEvaluation ? (
                                      <Textarea
                                        value={evaluation.tips}
                                        onChange={(e) => {
                                          setEvaluation({
                                            ...evaluation,
                                            tips: e.target.value
                                          });
                                        }}
                                        className="text-xs bg-white text-black font-semibold min-h-[50px] p-2 border border-slate-300 rounded"
                                      />
                                    ) : (
                                      <p className="text-[11px] text-[#7c5b1d] leading-relaxed bg-amber-50/50 p-2.5 rounded border border-amber-100">
                                        {evaluation.tips}
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Expert Sample Answer Script</span>
                                    {isEditingEvaluation ? (
                                      <Textarea
                                        value={evaluation.revisedAnswer}
                                        onChange={(e) => {
                                          setEvaluation({
                                            ...evaluation,
                                            revisedAnswer: e.target.value
                                          });
                                        }}
                                        className="text-xs bg-white text-black font-semibold min-h-[80px] p-2 border border-slate-300 rounded font-serif italic"
                                      />
                                    ) : (
                                      <p 
                                        onMouseUp={handleInterviewTextSelection}
                                        className="text-[11px] text-slate-850 leading-relaxed font-serif bg-white p-3 rounded border italic cursor-pointer hover:bg-slate-50"
                                      >
                                        "{evaluation.revisedAnswer}"
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 gap-2 border-t text-[10px]">
                                  <Button
                                    size="sm"
                                    variant={isEditingEvaluation ? "secondary" : "outline"}
                                    onClick={() => setIsEditingEvaluation(!isEditingEvaluation)}
                                    className="h-7 text-[10px]"
                                  >
                                    {isEditingEvaluation ? "Close" : "✏️ Edit Scorecard"}
                                  </Button>
                                  <div className="flex gap-1.5">
                                    <Button
                                      onClick={() => {
                                        setPracticeText("");
                                        setEvaluation(null);
                                      }}
                                      variant="ghost"
                                      className="h-7 text-[10px]"
                                    >
                                      Reset
                                    </Button>
                                    <Button onClick={markAsPracticed} size="sm" className="h-7 text-[10px] text-white">
                                      Save Badge
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Active Right Column Cell (STAR representation and refinement!) */}
                          <td className="p-6 align-top text-left space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                                RECOMMENDED STAR REPRESENTATION
                              </span>
                              <span className="text-[10px] bg-red-50 text-[#9c1c1c] px-2 py-0.5 rounded font-bold font-sans">
                                {isEditingQuestion ? "✏️ Edit Mode Active" : "Interactive Blueprint"}
                              </span>
                            </div>

                            {/* 4 points STAR Answer */}
                            <div className="space-y-4 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-200">
                              {/* Situation */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-[#9c1c1c] tracking-widest block">SITUATION (THE CONTEXT):</span>
                                {isEditingQuestion ? (
                                  <Textarea
                                    value={currentQuestion?.starAnswer?.situation || ""}
                                    onChange={(e) => handleUpdateQuestionStar("situation", e.target.value)}
                                    className="text-xs bg-white text-black font-semibold min-h-[60px] p-2 border border-slate-350 rounded mt-1"
                                    placeholder="Type situation..."
                                  />
                                ) : (
                                  <p 
                                    onMouseUp={handleInterviewTextSelection}
                                    className="text-[11px] text-slate-800 leading-relaxed font-sans cursor-pointer hover:bg-slate-200/50 rounded p-1 transition-all"
                                    title="Highlight text to refine answers"
                                  >
                                    {currentQuestion?.starAnswer?.situation}
                                  </p>
                                )}
                              </div>

                              {/* Task */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-[#9c1c1c] tracking-widest block">TASK (THE CHALLENGE):</span>
                                {isEditingQuestion ? (
                                  <Textarea
                                    value={currentQuestion?.starAnswer?.task || ""}
                                    onChange={(e) => handleUpdateQuestionStar("task", e.target.value)}
                                    className="text-xs bg-white text-black font-semibold min-h-[60px] p-2 border border-slate-350 rounded mt-1"
                                    placeholder="Type task..."
                                  />
                                ) : (
                                  <p 
                                    onMouseUp={handleInterviewTextSelection}
                                    className="text-[11px] text-slate-800 leading-relaxed font-sans cursor-pointer hover:bg-slate-200/50 rounded p-1 transition-all"
                                    title="Highlight text to refine answers"
                                  >
                                    {currentQuestion?.starAnswer?.task}
                                  </p>
                                )}
                              </div>

                              {/* Action */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-[#9c1c1c] tracking-widest block">ACTION (CORE IMPLEMENTATION):</span>
                                {isEditingQuestion ? (
                                  <Textarea
                                    value={currentQuestion?.starAnswer?.action || ""}
                                    onChange={(e) => handleUpdateQuestionStar("action", e.target.value)}
                                    className="text-xs bg-white text-black font-semibold min-h-[70px] p-2 border border-slate-350 rounded mt-1"
                                    placeholder="Type action..."
                                  />
                                ) : (
                                  <p 
                                    onMouseUp={handleInterviewTextSelection}
                                    className="text-[11px] text-slate-800 leading-relaxed font-sans cursor-pointer hover:bg-slate-200/50 rounded p-1 transition-all"
                                    title="Highlight text to refine answers"
                                  >
                                    {currentQuestion?.starAnswer?.action}
                                  </p>
                                )}
                              </div>

                              {/* Result */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-[#9c1c1c] tracking-widest block">RESULT (OUTCOME & METRICS):</span>
                                {isEditingQuestion ? (
                                  <Textarea
                                    value={currentQuestion?.starAnswer?.result || ""}
                                    onChange={(e) => handleUpdateQuestionStar("result", e.target.value)}
                                    className="text-xs bg-white text-black font-semibold min-h-[60px] p-2 border border-slate-350 rounded mt-1"
                                    placeholder="Type result..."
                                  />
                                ) : (
                                  <p 
                                    onMouseUp={handleInterviewTextSelection}
                                    className="text-[11px] text-slate-800 leading-relaxed font-sans cursor-pointer hover:bg-slate-200/50 rounded p-1 transition-all"
                                    title="Highlight text to refine answers"
                                  >
                                    {currentQuestion?.starAnswer?.result}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Refinement instruction and prompt */}
                            <div className="bg-slate-50 border border-blue-105 rounded-xl p-4 space-y-3 mt-2 text-left">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                                  <h5 className="text-xs font-black text-slate-900 font-sans tracking-tight">
                                    Iterative Answer & Case Study Customizer
                                  </h5>
                                </div>
                                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                                  💡 <strong>Highlight Selection:</strong> Drag and select any specific word, sentence, or full answer above on either the left or the right side with your mouse. It will target that selection so you can rewrite just that snippet!
                                </p>
                              </div>

                              <div className="space-y-2 relative">
                                {interviewSelectedText && (
                                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-[10px] text-blue-900 font-sans">
                                    <span className="truncate max-w-[80%] font-semibold">
                                      🎯 Selected: "{interviewSelectedText.substring(0, 50)}..."
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setInterviewSelectedText("")}
                                      className="text-[10px] font-black text-blue-700 hover:text-blue-900"
                                    >
                                      Clear Selection
                                    </button>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <Input
                                    placeholder={
                                      interviewSelectedText
                                        ? `e.g. "Focus more on automatic Python datum shift scripting" ...`
                                        : `e.g. "Use my actual GDA2020 datum conversion case study instead" ...`
                                    }
                                    value={interviewRefinementText}
                                    onChange={(e) => setInterviewRefinementText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && interviewRefinementText.trim() && handleRefineInterviewAnswerSelectionAndPrompt()}
                                    disabled={isRefiningAnswer}
                                    className="bg-white border-slate-300 text-xs h-10 text-black font-semibold placeholder-slate-400 focus-visible:ring-blue-500"
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleRefineInterviewAnswerSelectionAndPrompt}
                                    disabled={isRefiningAnswer || !interviewRefinementText.trim()}
                                    className="h-10 text-xs font-bold px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-1 shrink-0 transition-all font-sans"
                                  >
                                    {isRefiningAnswer ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Refining...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-3.5 h-3.5 mr-0.5" />
                                        Refine Answer
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-4xl mx-auto space-y-8 py-4 w-full">
            <div className="flex flex-col items-center justify-center p-6 md:p-12 text-center bg-white border border-border rounded-xl shadow-sm space-y-4 min-h-[300px]">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-901">Custom STAR Interview Arena</h3>
                <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                  Your workspace is fully connected. Build your specialized practice questions list using our AI target compiler, select a baseline simulation, or manually design your own scenario data deck.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-6 max-w-3xl">
                {/* Option 1: AI compile */}
                <button
                  type="button"
                  onClick={handleGeneratePrep}
                  disabled={isPrepGenerating}
                  className="flex flex-col items-center justify-between p-5 rounded-xl border border-primary/20 bg-[#FDF2F2] hover:bg-primary/10 transition-all text-center group h-52 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 mx-auto">
                    {isPrepGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">⚡ AI Auto-Compile</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">Generate highly tailored technical and behavioral questions matched to your profile & target role.</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary inline-flex items-center gap-1 mt-2">
                    {isPrepGenerating ? "Compiling..." : "Generate with AI →"}
                  </span>
                </button>

                {/* Option 2: Add Manual */}
                <button
                  type="button"
                  onClick={() => setShowAddQuestionForm(true)}
                  className="flex flex-col items-center justify-between p-5 rounded-xl border border-dashed border-gray-300 bg-white hover:border-gray-50 transition-all text-center group h-52 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3 mx-auto">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">✍️ Create Custom Question</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">Manually input custom interview questions, panel prompts, and structured answer suggestions.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 inline-flex items-center gap-1 mt-2">
                    Start Typing →
                  </span>
                </button>

                {/* Option 3: Benchmark Template */}
                <button
                  type="button"
                  onClick={handleLoadBaselineQuestions}
                  className="flex flex-col items-center justify-between p-5 rounded-xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/50 transition-all text-center group h-52 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 mx-auto">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">💡 Load Benchmarks</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">Instantly pre-populate 4 standard core competency & technical practice question templates.</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1 mt-2">
                    Load Baseline →
                  </span>
                </button>
              </div>
            </div>

            {/* Inline Custom Question Form when clicked */}
            {showAddQuestionForm && (
              <form onSubmit={handleAddCustomQuestion} className="bg-white border text-left border-border rounded-xl shadow-md p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 font-sans">
                    <Briefcase className="w-4 h-4 text-primary" /> Design Practice Prompt Data
                  </h4>
                  <button type="button" onClick={() => setShowAddQuestionForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                  <div className="space-y-2 col-span-1">
                    <Label className="text-xs font-bold text-gray-700">Question Classification</Label>
                    <select 
                      value={newQuestionType} 
                      onChange={(e) => setNewQuestionType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-border p-2 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary h-10 text-slate-800"
                    >
                      <option value="Behavioral">Behavioral / Situational Scenario</option>
                      <option value="Technical">Technical / Practical Competency</option>
                    </select>
                  </div>

                  <div className="space-y-2 col-span-1">
                    <Label className="text-xs font-bold text-gray-700">Question Prompt Text</Label>
                    <Input 
                      placeholder="e.g. Can you describe a datum conversion project you implemented?" 
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="text-xs h-10 text-slate-800 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-xs font-bold text-gray-700">Strategic Coaching Guidelines for Evaluator</Label>
                  <Textarea 
                    placeholder="e.g. Candidates should explain conformal transformations and NTv2 shift calculations under heavy time pressure." 
                    value={newQuestionCoaching}
                    onChange={(e) => setNewQuestionCoaching(e.target.value)}
                    className="text-xs h-16 min-h-[60px] text-slate-800 font-medium"
                  />
                </div>

                <div className="border-t pt-4 space-y-3 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Structured STAR Model Baseline Guidelines</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Situation (The Context)</Label>
                      <Textarea 
                        placeholder="e.g. NSW Dispatch grid was operating on legacy GDA94 systems." 
                        value={newSituation} 
                        onChange={(e) => setNewSituation(e.target.value)}
                        className="text-xs h-16 min-h-[60px] resize-none text-slate-800 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-500 font-mono">Task (The Challenge)</Label>
                      <Textarea 
                        placeholder="e.g. Map centroid shifts across 50 dispatch areas safely." 
                        value={newTestingTask} 
                        onChange={(e) => setNewTestingTask(e.target.value)}
                        className="text-xs h-16 min-h-[60px] resize-none text-slate-800 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-500 font-mono">Action (Your Execution)</Label>
                      <Textarea 
                        placeholder="e.g. Developed and executed an automated Python shift calculation grid." 
                        value={newExecutionAction} 
                        onChange={(e) => setNewExecutionAction(e.target.value)}
                        className="text-xs h-16 min-h-[60px] resize-none text-slate-800 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-500 font-mono">Result (Quantifiable Outcome)</Label>
                      <Textarea 
                        placeholder="e.g. Successfully converted 100% of dispatch points error-free." 
                        value={newResolvedResult} 
                        onChange={(e) => setNewResolvedResult(e.target.value)}
                        className="text-xs h-16 min-h-[60px] resize-none text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddQuestionForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="font-bold uppercase tracking-wider text-white">
                    Save New Study Question
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* End of 'questions' tab wrapper */}
        </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: HIRING PANEL & LINKEDIN STUDY                     */}
        {/* ========================================================= */}
        {activeInterviewTab === "panel" && (
          <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
            {/* Header */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-2">
              <span className="text-[9px] bg-blue-105 text-blue-700 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-max">
                VERIFIED DECISION PANEL TARGET
              </span>
              <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">Hiring Panel & LinkedIn History Search</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                Study your panel's LinkedIn backgrounds, professional focused experience, and align your communications to speak to their specific objectives. Review current panel members or add custom interviewer names to simulate custom search indexing.
              </p>
            </div>

            {/* List of current interviewers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interviewers.map((int) => (
                <div key={int.id} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative">
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterviewer(int.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Remove Interviewer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-650 font-bold shrink-0 font-sans">
                        {int.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5 leading-snug">
                          {int.name}
                          <span className="text-[10px] font-bold text-[#1e5480] bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-blue-100">
                            <Linkedin className="w-2.5 h-2.5" /> Checked
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">{int.role}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono mt-0.5">{int.org}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Simulated LinkedIn Bio & History</span>
                        <p className="text-slate-700 leading-relaxed font-sans">{int.backstory}</p>
                      </div>

                      {int.linkedinSearchSim && (
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#1e5480] block mb-0.5">LinkedIn Shared Content & Industry Focus</span>
                          <p className="text-slate-600 leading-relaxed italic border-l-2 border-blue-100 pl-2">
                            "{int.linkedinSearchSim}"
                          </p>
                        </div>
                      )}

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#9c1c1c] block mb-1">🎯 Communication Appeal Strategy</span>
                        <p className="text-slate-700 font-medium leading-relaxed font-sans">{int.tactic}</p>
                      </div>
                    </div>
                  </div>

                  {int.suggestedQuestions && int.suggestedQuestions.length > 0 && (
                    <div className="pt-3 border-t">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#155724] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block w-max mb-2">
                        💡 Suggested Question to Ask Them
                      </span>
                      <div className="flex flex-col gap-2 bg-[#F6FDF9] border border-emerald-100/30 p-3 rounded-xl relative justify-between">
                        <p className="text-xs text-[#155724] font-medium leading-relaxed font-serif italic text-left">
                          "{int.suggestedQuestions[0]}"
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(int.suggestedQuestions[0]);
                            toast.success("Coaching question copied to clipboard!");
                          }}
                          className="self-end text-[10px] text-emerald-750 hover:text-emerald-800 hover:bg-emerald-100/50 h-6 px-1.5 gap-1 font-bold mt-1"
                        >
                          <Copy className="w-2.5 h-2.5" /> Copy Question
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form to insert custom names */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 tracking-tight font-sans">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Add Interviewer Panelist & Analyze Career Profile
                </h4>
                <p className="text-[10px] text-slate-500 font-sans italic">
                  Tip: Type "Owen Ziebell &lt;owen.ziebell@afac.com.au&gt;" or any name & email
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5 text-left md:col-span-3">
                  <Label className="text-xs font-bold text-gray-700 font-sans">Full Name / Search Query</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Owen Ziebell <owen.ziebell@afac.com.au> or Susan Sweeney"
                      value={newInterviewerName}
                      onChange={(e) => setNewInterviewerName(e.target.value)}
                      className="text-xs h-10 bg-white border border-slate-200 flex-1"
                      required
                    />
                    <Button
                      type="button"
                      onClick={handleSearchInterviewerProfiles}
                      disabled={isSearchingMatches}
                      className="h-10 text-xs font-bold px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      {isSearchingMatches ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          Locate Matches
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left md:col-span-1">
                  <Label className="text-xs font-bold text-gray-700 font-sans">Title/Specialty</Label>
                  <Input
                    placeholder="e.g. Senior Knowledge Broker"
                    value={newInterviewerRole}
                    onChange={(e) => setNewInterviewerRole(e.target.value)}
                    className="text-xs h-10 bg-white border border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5 text-left md:col-span-2">
                  <Label className="text-xs font-bold text-gray-700 font-sans">Organization/Division</Label>
                  <Input
                    placeholder="e.g. NESP"
                    value={newInterviewerOrg}
                    onChange={(e) => setNewInterviewerOrg(e.target.value)}
                    className="text-xs h-10 bg-white border border-slate-200"
                  />
                </div>

                {showMatchesSuggestion && (
                  <div className="md:col-span-3 bg-slate-50 border border-blue-100 rounded-xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <h5 className="text-xs font-bold text-gray-800 font-sans">
                          Suggested Matching LinkedIn Profiles ({suggestedMatches.length} found)
                        </h5>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowMatchesSuggestion(false)}
                        className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                      >
                        Dismiss Matches
                      </Button>
                    </div>

                    {isSearchingMatches ? (
                      <div className="flex flex-col items-center justify-center p-6 space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <p className="text-[11px] text-slate-500 font-sans">Querying professional registries and synthesizing profiles with Gemini...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {suggestedMatches.map((match, idx) => {
                          const isActive = newInterviewerRole === match.role && newInterviewerOrg === match.org;
                          return (
                            <div 
                              key={idx} 
                              className={`p-3.5 border rounded-xl flex flex-col justify-between transition-all text-left ${
                                isActive
                                  ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-300' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-1">
                                  <span className="text-[9px] font-black tracking-wide text-blue-600 uppercase">
                                    {match.matchScore}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground font-mono">
                                    {match.location}
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-900 font-sans">{match.name}</p>
                                  <p className="text-[11px] font-medium text-slate-700 leading-snug">{match.role}</p>
                                  <p className="text-[10px] text-slate-500">{match.org}</p>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-relaxed font-sans line-clamp-3 italic border-t pt-2 mt-1">
                                  "{match.bioText}"
                                </p>
                              </div>

                              <Button
                                type="button"
                                size="sm"
                                variant={isActive ? "secondary" : "outline"}
                                onClick={() => {
                                  setNewInterviewerName(match.name);
                                  setNewInterviewerRole(match.role);
                                  setNewInterviewerOrg(match.org);
                                  setNewInterviewerLinkedin(match.bioText);
                                  toast.success(`Selected matched profile for ${match.name}!`);
                                }}
                                className={`w-full h-7 mt-3 text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-800 font-extrabold hover:bg-blue-150'
                                    : 'text-slate-700'
                                }`}
                              >
                                {isActive ? '✓ Selected Match' : 'Select This Profile'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 text-left md:col-span-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-700 font-sans flex items-center gap-1">
                      <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                      Real LinkedIn Profile / Bio Raw Text Copy-Paste (Optional)
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-sans">AI will summarize & build communication tactics</span>
                  </div>
                  <Textarea
                    placeholder="Paste the interviewer's about section, experience, or raw clipboard profile text here so Gemini can extract exact communication strategy and custom Q&A questions..."
                    value={newInterviewerLinkedin}
                    onChange={(e) => setNewInterviewerLinkedin(e.target.value)}
                    rows={2}
                    className="text-xs bg-white border border-slate-200 resize-none font-sans"
                  />
                </div>

                <div className="space-y-1.5 text-left md:col-span-3 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-700 font-sans">
                      ✍️ Custom Interviewer Details / Career Bio (Optional - Manual Override)
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-sans">Bypasses AI simulation if filled manually</span>
                  </div>
                  <Textarea
                    placeholder="Describe their backstory, previous roles, or focus points. (e.g. 'A strategic executive focused on operational deadlines...')"
                    value={newInterviewerBackstory}
                    onChange={(e) => setNewInterviewerBackstory(e.target.value)}
                    rows={2}
                    className="text-xs bg-white border border-slate-200 resize-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-3 pt-1">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-bold text-gray-700 font-sans">
                      🎯 Targeted Communication Tactic (Optional - Manual Override)
                    </Label>
                    <Textarea
                      placeholder="Advice on how to present. (e.g. 'Emphasize quantitative accuracy, user empathy, and process alignment.')"
                      value={newInterviewerTactic}
                      onChange={(e) => setNewInterviewerTactic(e.target.value)}
                      rows={2}
                      className="text-xs bg-white border border-slate-200 resize-none font-sans"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-bold text-gray-700 font-sans">
                      ❓ Suggested Q&A Questions to Ask (Optional - Manual Override)
                    </Label>
                    <Textarea
                      placeholder="Type a custom question (or one per line) to ask this panelist during the Q&A segment of your interview."
                      value={newInterviewerQuestions}
                      onChange={(e) => setNewInterviewerQuestions(e.target.value)}
                      rows={2}
                      className="text-xs bg-white border border-slate-200 resize-none font-sans"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddInterviewerWithSearch}
                  disabled={isSearchingLinkedIn}
                  className="w-full md:col-span-3 h-11 text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 mt-2"
                >
                  {isSearchingLinkedIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin font-sans" />
                      Searching Public Archives & Analyzing Career Profile...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 mr-0.5" />
                      Add Panel Member (Direct Add or Simulate with LinkedIn)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ELEVATOR PITCH BUILDER                             */}
        {/* ========================================================= */}
        {activeInterviewTab === "elevator" && (() => {
          const pitch = interviewPrepData?.elevatorPitch || BASELINE_ELEVATOR_PITCH_FALLBACK;
          return (
            <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
              {/* Header */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-2">
                <span className="text-[9px] bg-orange-100 text-orange-705 px-2 py-0.5 rounded font-black uppercase block w-max">
                  THE FIRST 5 MINUTES
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">Structured Elevator Pitch Guide</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Practicing a structured opening introduction creates immediate authority. Tick off each strategic landmark as you practice reciting these polished, human-centered paragraphs.
                </p>
              </div>

              <div className="space-y-4">
                {/* Pillar 1 */}
                <div className={`p-6 border rounded-2xl transition-all ${elevatorChecks.passion ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-border'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 font-mono">
                        Landmark 1: Start with Passion 🌸
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 font-sans leading-none">{pitch.passion?.subtitle}</h4>
                    </div>
                    <Button
                      size="sm"
                      variant={elevatorChecks.passion ? "secondary" : "outline"}
                      onClick={() => toggleElevatorCheck("passion")}
                      className={`h-7 px-2.5 rounded-full text-xs font-bold ${elevatorChecks.passion ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : ''}`}
                    >
                      {elevatorChecks.passion ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : null}
                      {elevatorChecks.passion ? 'Practiced' : 'Mark Practiced'}
                    </Button>
                  </div>
                  <div className="mt-3.5 space-y-3">
                    <p className="text-xs text-slate-700 font-serif leading-relaxed italic p-3 bg-slate-50 border rounded-xl whitespace-pre-wrap">
                      "{pitch.passion?.paragraph}"
                    </p>
                    <div className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      <strong>Coaching Advice:</strong> {pitch.passion?.coaching}
                    </div>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className={`p-6 border rounded-2xl transition-all ${elevatorChecks.community ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-border'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 font-mono">
                        Landmark 2: Connect to Community & Impact ✊
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 font-sans leading-none">{pitch.community?.subtitle}</h4>
                    </div>
                    <Button
                      size="sm"
                      variant={elevatorChecks.community ? "secondary" : "outline"}
                      onClick={() => toggleElevatorCheck("community")}
                      className={`h-7 px-2.5 rounded-full text-xs font-bold ${elevatorChecks.community ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : ''}`}
                    >
                      {elevatorChecks.community ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : null}
                      {elevatorChecks.community ? 'Practiced' : 'Mark Practiced'}
                    </Button>
                  </div>
                  <div className="mt-3.5 space-y-3">
                    <p className="text-xs text-slate-700 font-serif leading-relaxed italic p-3 bg-slate-50 border rounded-xl whitespace-pre-wrap">
                      "{pitch.community?.paragraph}"
                    </p>
                    <div className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      <strong>Coaching Advice:</strong> {pitch.community?.coaching}
                    </div>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className={`p-6 border rounded-2xl transition-all ${elevatorChecks.experience ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-border'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 font-mono">
                        Landmark 3: Bridge to Australian Government & Startup Experience 🇦🇺
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 font-sans leading-none">{pitch.experience?.subtitle}</h4>
                    </div>
                    <Button
                      size="sm"
                      variant={elevatorChecks.experience ? "secondary" : "outline"}
                      onClick={() => toggleElevatorCheck("experience")}
                      className={`h-7 px-2.5 rounded-full text-xs font-bold ${elevatorChecks.experience ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : ''}`}
                    >
                      {elevatorChecks.experience ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : null}
                      {elevatorChecks.experience ? 'Practiced' : 'Mark Practiced'}
                    </Button>
                  </div>
                  <div className="mt-3.5 space-y-3">
                    <p className="text-xs text-slate-700 font-serif leading-relaxed italic p-3 bg-slate-50 border rounded-xl whitespace-pre-wrap">
                      "{pitch.experience?.paragraph}"
                    </p>
                    <div className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      <strong>Coaching Advice:</strong> {pitch.experience?.coaching}
                    </div>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className={`p-6 border rounded-2xl transition-all ${elevatorChecks.current ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-border'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 font-mono">
                        Landmark 4: Link to Current Department Spatial Scientist Role 🗺️
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 font-sans leading-none">{pitch.current?.subtitle}</h4>
                    </div>
                    <Button
                      size="sm"
                      variant={elevatorChecks.current ? "secondary" : "outline"}
                      onClick={() => toggleElevatorCheck("current")}
                      className={`h-7 px-2.5 rounded-full text-xs font-bold ${elevatorChecks.current ? 'bg-emerald-55 text-emerald-700 hover:bg-emerald-100' : ''}`}
                    >
                      {elevatorChecks.current ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : null}
                      {elevatorChecks.current ? 'Practiced' : 'Mark Practiced'}
                    </Button>
                  </div>
                  <div className="mt-3.5 space-y-3">
                    <p className="text-xs text-slate-700 font-serif leading-relaxed italic p-3 bg-slate-50 border rounded-xl whitespace-pre-wrap">
                      "{pitch.current?.paragraph}"
                    </p>
                    <div className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      <strong>Coaching Advice:</strong> {pitch.current?.coaching}
                    </div>
                  </div>
                </div>

                {/* Pillar 5 */}
                <div className={`p-6 border rounded-2xl transition-all ${elevatorChecks.value ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-border'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 font-mono">
                        Landmark 5: Bring it Home to the Active Role 🎯
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 font-sans leading-none">{pitch.value?.subtitle}</h4>
                    </div>
                    <Button
                      size="sm"
                      variant={elevatorChecks.value ? "secondary" : "outline"}
                      onClick={() => toggleElevatorCheck("value")}
                      className={`h-7 px-2.5 rounded-full text-xs font-bold ${elevatorChecks.value ? 'bg-emerald-55 text-emerald-700 hover:bg-emerald-100' : ''}`}
                    >
                      {elevatorChecks.value ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : null}
                      {elevatorChecks.value ? 'Practiced' : 'Mark Practiced'}
                    </Button>
                  </div>
                  <div className="mt-3.5 space-y-3">
                    <p className="text-xs text-slate-700 font-serif leading-relaxed italic p-3 bg-slate-50 border rounded-xl whitespace-pre-wrap">
                      "{pitch.value?.paragraph}"
                    </p>
                    <div className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      <strong>Coaching Advice:</strong> {pitch.value?.coaching}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* TAB 4: WRITTEN ASSESSMENT & AI USE STATEMENT PLANNER     */}
        {/* ========================================================= */}
        {activeInterviewTab === "written_task" && (() => {
          const aiStatementData = interviewPrepData?.aiStatement || BASELINE_AI_STATEMENT_FALLBACK;
          return (
            <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
              {/* Header */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-2">
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black block w-max uppercase">
                  WRITTEN WORK DEFENSE
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">Written Assessment & AI Use Statement Summary</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Review the presentation structure of your written task defense, key panel concerns, and the strategic answer key explaining your Responsible deployment of artificial intelligence.
                </p>
              </div>

              {/* Core Strategy Cards */}
              <div className="grid grid-cols-1 gap-6">
                {/* AI Statement Strategic Key */}
                <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="text-emerald-600 w-5 h-5 animate-pulse" />
                    <h4 className="font-extrabold text-[#115e59] text-sm tracking-tight">Strategic Long-Form AI Statement Answer Key</h4>
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed font-sans">
                    The panel is highly likely to query how you leveraged artificial intelligence during your analysis of task assets. Recite this exact response to demonstrate extensive governance awareness:
                  </p>

                  <div className="bg-[#FAFDFB] border border-emerald-100 rounded-xl p-4 relative space-y-3 text-left">
                    <span className="text-[9px] font-bold text-[#115e59] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block w-max mb-1">
                      📋 Recommended Candidate Explanation Speech (Copyable)
                    </span>
                    <p className="text-xs text-slate-800 font-serif leading-relaxed text-left italic pl-2 border-l-2 border-emerald-500/30 whitespace-pre-wrap">
                      {aiStatementData.answerScript}
                    </p>

                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(aiStatementData.answerScript);
                          toast.success("AI Statement copied to clipboard!");
                        }}
                        className="bg-emerald-110 text-emerald-800 hover:bg-emerald-200 px-3 h-8 text-[11px] font-bold border border-emerald-300"
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy AI Answer Script
                      </Button>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground leading-relaxed pt-2 bg-emerald-50/50 p-4 rounded-xl border border-dashed border-emerald-200">
                    <h5 className="font-extrabold text-[#115e59] mb-1.5 uppercase tracking-widest text-[10px]">Why This Approach Wins over standard answers:</h5>
                    <ul className="list-disc pl-4 space-y-1 font-sans text-xs">
                      {aiStatementData.whyWinsBulletPoints?.map((bullet: string, bIdx: number) => {
                        const colonIndex = bullet.indexOf(":");
                        if (colonIndex !== -1) {
                          const title = bullet.substring(0, colonIndex);
                          const detail = bullet.substring(colonIndex + 1);
                          return (
                            <li key={bIdx}>
                              <strong>{title}</strong>:{detail}
                            </li>
                          );
                        }
                        return <li key={bIdx}>{bullet}</li>;
                      })}
                    </ul>
                  </div>
                </div>

                {/* Presentation Task Staging */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4 text-left font-sans">
                  <div className="flex items-center gap-2">
                    <Bookmark className="text-[#9c1c1c] w-5 h-5 mb-0.5" />
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">Presentation Task Outline & Follow-Ups</h4>
                  </div>
                  <div className="space-y-3.5 text-xs text-slate-700">
                    <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-orange-500 shrink-0 font-mono">0 - 10 MINS:</span>
                      <div>
                        <strong className="block text-slate-900">10-Minute Slide Delivery</strong>
                        <p className="leading-relaxed mt-0.5 text-slate-500">
                          Synthesize your three-step solution: <strong>Step 1 (Explore via Web Map)</strong>, <strong>Step 2 (Audit using GIS coordinates)</strong>, and <strong>Step 3 (Automate in Python)</strong>. Keep explanations centered on stakeholders.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-[#1e5480] shrink-0 font-mono">10 - 20 MINS:</span>
                      <div>
                        <strong className="block text-slate-900">Q&A Defense (The Technical Deep-Dive)</strong>
                        <p className="leading-relaxed mt-0.5 text-slate-500">
                          The hiring panel will focus on georeferencing accuracy, database integrity, and validation metrics under operational stress. Review follow-up Star Answer scripts inside the STAR Arena to prep!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Slide Prompter & Proctor Deck */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6 text-left font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-emerald-600 w-5 h-5 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">🎙️ Proctored Capability Presentation Trainer</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Practice pacing, view suggested visual slide setups, and play copyable speaker note prompter scripts out loud to perfect your 10-minute defense.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const slidesList = interviewPrepData?.presentationSlides || BASELINE_PREP_FALLBACK.presentationSlides;
                    if (!slidesList || slidesList.length === 0) return null;
                    
                    // Clamp index just in case activePrepSlideIndex model output has fewer slides
                    const currentIndex = Math.min(activePrepSlideIndex, slidesList.length - 1);
                    const currentSlide = slidesList[currentIndex];

                    return (
                      <div className="space-y-6">
                        {/* Slide Selector Buttons */}
                        <div className="flex flex-wrap gap-2 border-b pb-4">
                          {slidesList.map((slide: any, idx: number) => {
                            const isCurrent = idx === currentIndex;
                            return (
                              <Button
                                key={idx}
                                size="sm"
                                variant={isCurrent ? "default" : "outline"}
                                onClick={() => {
                                  stopSpeaking();
                                  setActivePrepSlideIndex(idx);
                                }}
                                className={`text-xs font-semibold py-1 px-3.5 rounded-full transition-all ${
                                  isCurrent 
                                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm" 
                                    : "bg-white text-slate-705 hover:bg-slate-50 border-slate-200"
                                }`}
                              >
                                {slide.slideNumber || `Slide ${idx + 1}`}
                              </Button>
                            );
                          })}
                        </div>

                        {/* Selected Slide Detail View */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          {/* Slide Content and Notes (8 columns) */}
                          <div className="lg:col-span-8 space-y-4">
                            {/* Title & Timing info */}
                            <div className="flex items-center justify-between gap-4 bg-slate-50 border p-4 rounded-xl">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 bg-white border px-2 py-0.5 rounded shadow-sm">
                                  {currentSlide.slideNumber}
                                </span>
                                <h5 className="font-extrabold text-slate-900 text-sm mt-1">
                                  {currentSlide.title}
                                </h5>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                <Clock className="w-3.5 h-3.5 text-orange-600" />
                                {currentSlide.timingMinutes || "2.0 mins"}
                              </div>
                            </div>

                            {/* Speaker notes controls and text */}
                            <div className="bg-slate-900 text-slate-105 rounded-2xl p-5 shadow-inner relative space-y-3.5 overflow-hidden border border-slate-800">
                              <div className="absolute top-0 right-0 p-1.5 bg-slate-800/50 backdrop-blur rounded-bl border-l border-b border-slate-700 flex items-center gap-1">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded">
                                  PROMPTER SPEECH
                                </span>
                              </div>

                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                                EXACT SPOKEN WORD SCRIPT (FIRST PERSON):
                              </p>

                              <p className="text-xs text-white md:text-sm font-serif leading-relaxed italic border-l-2 border-emerald-500 pl-4 py-1.5 whitespace-pre-wrap">
                                "{currentSlide.speakerNotes}"
                              </p>

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-850">
                                <div className="flex items-center gap-1.5">
                                  {isSpeaking ? (
                                    <span className="flex h-2 w-2 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                  ) : null}
                                  <span className="text-[10px] font-medium font-sans text-slate-400">
                                    {isSpeaking ? "TTS Coach reading slide notes..." : "Proctor audio synthesis standby."}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Speech synthesizer controls */}
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      if (isSpeaking) {
                                        stopSpeaking();
                                      } else {
                                        speakQuestion(currentSlide.speakerNotes);
                                      }
                                    }}
                                    className={`px-3.5 h-8 text-[11px] font-bold gap-1.5 transition-all rounded-lg border shadow-sm ${
                                      isSpeaking 
                                        ? "bg-rose-500 text-white hover:bg-rose-600 border-rose-450" 
                                        : "bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-550"
                                    }`}
                                  >
                                    {isSpeaking ? (
                                      <>
                                        <VolumeX className="w-3.5 h-3.5 text-white" /> Pause / Stop
                                      </>
                                    ) : (
                                      <>
                                        <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" /> Read Aloud
                                      </>
                                    )}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(currentSlide.speakerNotes);
                                      toast.success(`${currentSlide.slideNumber} speaker script copied!`);
                                    }}
                                    className="bg-slate-800 text-slate-205 border-slate-700 hover:bg-slate-700 hover:text-white px-3 h-8 text-[11px] font-bold rounded-lg"
                                  >
                                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Script
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Slide View Visuals Prompt and Pacing Advice (4 columns) */}
                          <div className="lg:col-span-4 space-y-4">
                            {/* Suggested Visual layout */}
                            <div className="bg-[#FAFDFB] border border-emerald-100 rounded-xl p-4.5 space-y-2 text-left">
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase block w-max">
                                slide visuals mockup
                              </span>
                              <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap pl-1">
                                {currentSlide.visualLayout}
                              </div>
                              <div className="pt-2 text-right">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(currentSlide.visualLayout);
                                    toast.success("Visual setup proposal copied to clipboard!");
                                  }}
                                  className="h-6 px-2 text-[10px] text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-200 shadow-sm"
                                >
                                  <Copy className="w-3 h-3 mr-1" /> Copy Layout Prompt
                                </Button>
                              </div>
                            </div>

                            {/* Pacing Advice */}
                            <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-4.5 space-y-2 text-left">
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase block w-max font-sans">
                                pacing & gesture advice
                              </span>
                              <div className="text-xs text-amber-900 leading-relaxed font-sans pl-1">
                                {currentSlide.pacingAdvice}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}
