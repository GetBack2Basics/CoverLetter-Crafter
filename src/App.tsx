import { useState, useRef, useEffect } from "react";
import { 
  generateCoverLetter, 
  extractJobDetails, 
  removeAiVoice, 
  analyzeCoverLetter,
  generateInterviewPrep,
  generateCapabilityTaskDraft,
  generateWorkDataSheet,
  generateWorkDocument
} from "./services/gemini";
import { profile as sampleProfile } from "./data/profile";
import { CandidateProfile, JobRole } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  FileText, 
  Send, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wand2, 
  Copy, 
  Download,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Loader2,
  Edit2,
  Save,
  RotateCcw,
  MessageSquarePlus,
  Plus,
  Link as LinkIcon,
  Cloud,
  FileCode,
  Layout,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
  Printer,
  FileUp,
  Calendar,
  Layers,
  Table,
  Cpu,
  Bookmark,
  Building,
  Check,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { DashboardView } from "./components/DashboardView";
import { InterviewView } from "./components/InterviewView";
import { WorkView } from "./components/WorkView";
import { 
  setupAuthListener, 
  saveCandidateProfile, 
  saveJobRole, 
  deleteJobRoleFromDb, 
  getCandidateProfile, 
  getJobRoles 
} from "./lib/firebase";

const DEFAULT_RFS_PREP_DATA = {
  insightSummary: "Highly aligned candidate with practical geocentric datum transition experience and Python scripting expertise suited for NSW Rural Fire Service's Spatial GIS Analyst requirements.",
  questions: [
    {
      type: "Behavioral",
      question: "Can you describe a time when you had to automate spatial data processing layers using Python?",
      starAnswer: {
        situation: "At my previous geospatial role, our incident response team was processing spatial grids manually, leading to delays.",
        task: "I was tasked with building a robust spatial automation script to convert and buffer emergency coordinate entries.",
        action: "I wrote a customized Python automation pipeline that processed coordinates, applied correct spatial hazard buffers, and sent alerts.",
        result: "This eliminated human errors, reduced coordinate ingestion lag by over 45%, and ensured real-time buffering readiness."
      },
      coachingTips: "Focus heavily on mentioning Python libraries like ArcPy or GeoPandas and highlight the quantified 45% lag reduction."
    },
    {
      type: "Technical",
      question: "How do you handle a geocentric datum transformation, such as converting datasets from GDA94 to GDA2020?",
      starAnswer: {
        situation: "Our emergency dispatch system was operating on legacy GDA94 datum, while regional sensors transitioned to modern GDA2020 coordinates.",
        task: "I had to spearhead a datum conversion for all 50 dispatch zones without corrupting geospatial layer integrity or offline data syncs.",
        action: "Using 7-parameter conformal transformation grids in Python, I automated the shifts, verified offset tolerances, and updated the metadata headers.",
        result: "This completely synchronized our regional warning indicators, resulting in sub-meter positioning accuracy across NSW dispatch lines."
      },
      coachingTips: "Elaborate on the 7-parameter transformation and the importance of coordinate precision in volunteer firefighter dispatch workflows."
    },
    {
      type: "Behavioral",
      question: "How do you explain complex coordinate offsets and geocentric shifts to local volunteer firefighters or non-technical members?",
      starAnswer: {
        situation: "Local command terminals experienced slight map errors due to inconsistent GDA94 and GDA2020 datums, confusing volunteer brigade captains.",
        task: "I had to bridge the gap and clarify how coordinate grid conversions affect live mobile tracking.",
        action: "I designed a simple visual coordinate-overlay interface, and drafted a clear, non-technical SOP guide translating datum error shifts into physical buffer sizes on maps (e.g., a 1.8-meter shift).",
        result: "This immediately improved volunteer map navigation accuracy and boosted situational fire ground confidence during active containment campaigns."
      },
      coachingTips: "Emphasize your user-empathy and ability to simplify complex spatial terminology for active operational workers."
    },
    {
      type: "Technical",
      question: "How do you ensure data integrity for emergency coordinates during active, high-pressure incident command grids mapping?",
      starAnswer: {
        situation: "During an active fire hazard season, coordinates were ingested from multiple channels under tight limits, threatening map alignment.",
        task: "I had to establish a secure database schema to validate and filter incoming emergency sensor coordinates in real-time.",
        action: "I developed automated validation rules checking format errors and applying spatial buffering filters on live layers.",
        result: "This secured 100% database synchronization reliability and prevented duplicate incident reports from misaligning command maps."
      },
      coachingTips: "Reference GIS validation rules, spatial indexing techniques, and database trigger scripts that enforce geospatial rules under pressure."
    }
  ]
};

const DEFAULT_RFS_TASK_DRAFT = {
  outputType: "slides",
  title: "NSW RFS GIS Automation Strategy",
  subtitle: "Transitioning dispatch operations from GDA94 to GDA2020",
  slides: [
    {
      slideNumber: 1,
      title: "GDA94 to GDA2020 Transition Scope",
      content: [
        "Analyzing 50 regional command coordinates",
        "Assessing offset shifts (approx. 1.5 to 1.8 meters across Australia)",
        "Reviewing legacy systems and ArcPy batch scripts compatibility"
      ],
      designSuggestion: "Two-column grid layout, high-contrast dark forest green theme, prominent warning badge.",
      presenterNotes: "Good morning selection panel. Today I will outline our transition plan mapping legacy GDA94 coordinates to GDA2020 for NSW RFS."
    },
    {
      slideNumber: 2,
      title: "Automated Shift Scripting Engine",
      content: [
        "Developing automated Python/ArcPy datum transformation filters",
        "Deploying local conformal NTv2 grid file integration",
        "Establishing verification checks on incoming coordinate arrays"
      ],
      designSuggestion: "Syntax-highlighted code drawer on the right, high contrast metrics.",
      presenterNotes: "By leveraging ArcPy automation, we convert 50 regional dispatch streams in under 3 seconds, preserving emergency spatial safety margins."
    }
  ],
  coachingNotes: "Be ready to answer questions about coordinate precision and Python transformation grids under active fire hazard conditions."
};

const DEFAULT_RFS_GENERATED_SHEET = {
  sheetTitle: "NSW RFS GDA94 to GDA2020 Conversion Matrix",
  sheetDescription: "Analytical coordinates, centroid shift errors, and validation compliance across 50 dispatch zones.",
  headers: ["Site ID", "GDA94 Easting", "GDA2020 Easting", "Shift Delta (m)", "Validation Status"],
  rows: [
    ["RFS-01-Sydney", "334125.42", "334126.85", "1.43", "Compliant"],
    ["RFS-02-BlueMtn", "289124.11", "289125.68", "1.57", "Compliant"],
    ["RFS-03-Newcastle", "375902.50", "375904.02", "1.52", "Compliant"],
    ["RFS-04-Wollongong", "302144.18", "302145.71", "1.53", "Compliant"],
    ["RFS-05-CoffsHr", "512401.88", "512403.49", "1.61", "Compliant"]
  ],
  summaryStats: {
    label: "Average Shift Error",
    value: "1.53 meters"
  },
  professionalInsight: "Synthesized 100% transformation success. Safe sub-meter operational precision maintained for volunteer map buffers."
};

const DEFAULT_RFS_GENERATED_DOC = `# NSW Rural Fire Service — Operational SOP
## Protocol 102: Geocentric Datum Transformation Procedures

### 1. Purpose
This Standard Operating Procedure (SOP) defines the validation and execution standards for translating emergency dispatch coordinates from the legacy **GDA94** to the modern **GDA2020** datum. High accuracy is essential to prevent spatial coordinate misalignment during multi-agency bushfire containment grids.

### 2. Scope
Applies to all GIS personnel, Spatial Analysts, and Incident Command Systems coordinators operating within the NSW Rural Fire Service Command & GIS Bureau.

### 3. Transformation Standards
- **Grid Reference**: Only use nationally recognized NTv2 shift grids.
- **Verification Rule**: All converted dispatch sites must be verified to have spatial errors under 0.05 meters compared to control points.
- **Error Limits**: Shifts exceeding 1.8 meters must be flagged for manual coordinate audit.

### 4. Technical Workflow
1. **Intake**: Export legacy GDA94 shapefiles from dispatch databases.
2. **Execute**: Run the \`rfs_datum_shift.py\` script to perform transformation mapping.
3. **Verify**: Apply automated validation test scripts using pre-defined coordinate targets.

---
*Authored by: George Chandeep Corea, GIS Spatial Analyst candidate*`;

const DEFAULT_SEED_ROLES: JobRole[] = [
  {
    id: "default-rfs-campaign",
    companyName: "NSW Rural Fire Service",
    jobTitle: "GIS Spatial Analyst",
    jobDescription: "The NSW Rural Fire Service (RFS) is the world's largest volunteer fire fighting agency...\n\nLooking for a GIS Spatial Analyst to lead spatial solutions, custom web mapping apps, Python scripts automation, emergency dispatch sensor integration, disaster response spatial coordinates mapping tool development, and geocentric datum conversions (GDA94 to GDA2020).",
    status: "Interview Scheduled",
    createdDate: "Mon 25 May",
    coverLetter: `George Chandeep Corea\nCoreaGC@gmail.com\n\n25 May 2026\n\nMeaghan Jenkins\nNSW Rural Fire Service (RFS)\n\nDear Meaghan Jenkins and the NSW RFS Selection Panel,\n\nI am writing to express my enthusiastic interest in the GIS Spatial Analyst / Spatial Specialist position at the NSW Rural Fire Service (RFS). With solid professional domain experience in emergency services geographical tools, automated Python script execution, and spatial coordinate grids, I am highly eager to lead spatial delivery and data validation operations at your world-class disaster management agency.\n\nThroughout my career as a Geospatial Specialist, I have prioritized optimizing data integrity and operational readiness. For example, during critical hazard mapping sprints, I successfully deployed python scripts for spatial automation, reducing coordinate grid ingest lag by over 40%. This matches directly with NSW RFS priorities to manage active coordinate datums (including converting local coordinates from GDA94 to GDA2020 datums cleanly in real-time) and supporting sensor networks deployed on incident command terminals.\n\nIn addition, I have extensive experience collaborating closely with operational incident command bureaus. I am accustomed to translating emergency directives into actionable digital maps, including developing customized drone hazard buffers and managing massive geospatial databases containing thousands of assets (such as water mains, fire hazard regions, and command zones).\n\nI am fully prepared to present my technical outputs for the selection panel's review on Friday, and I look forward to discussing how my spatial delivery credentials will guarantee GIS excellence at NSW RFS.\n\nSincerely,\nGeorge Chandeep Corea`,
    coverLetterSpecifics: "GDA94 to GDA2020 datum conversion script, python automation buffers",
    hiringManager: "Meaghan Jenkins",
    applicationEmail: "meaghan.jenkins@rfs.nsw.gov.au",
    keyRequirements: [
      "Datum conversion expertise (GDA94 to GDA2020)",
      "Python scripting for geospatial layers processing",
      "Incident Command Systems coordinates sensor dashboard mapping",
      "Specialized disaster management and fire hazard spatial buffering SOP layout"
    ],
    taskInstructions: "Capability Task 1: Spatial incident command system coordinates grid sensor mapping SOP.\nCapability Task 2: GDA94 to GDA2020 conversion python script presentation.",
    workTaskDesc: "Spatial automation script to convert coordinate inputs from GDA94 to GDA2020 datum across 50 dispatch points.",
    sheetInput: "Table outlining GDA94 geocentric coordinates, GDA2020 coordinate shifts, geocentric error tolerances, and transform status metrics across 50 regional dispatch sites.",
    interviewPrepData: DEFAULT_RFS_PREP_DATA,
    taskDraftOutput: DEFAULT_RFS_TASK_DRAFT,
    generatedDoc: DEFAULT_RFS_GENERATED_DOC,
    generatedSheet: DEFAULT_RFS_GENERATED_SHEET,
  },
  {
    id: "default-dcceew-campaign",
    companyName: "Department of Climate Change (DCCEEW)",
    jobTitle: "Remote Sensing Technical Officer",
    jobDescription: "Lead analytical drone LiDAR and satellite imagery forestry hazard audits across NSW conservation sectors.",
    status: "Applied",
    createdDate: "Sat 23 May",
    coverLetter: "Dear DCCEEW Selection Board,\n\nI am writing to apply for the Remote Sensing Technical Officer position. My skills in LiDAR forestry classifications and satellite bands processing are highly aligned...",
    workTaskDesc: "Drone LiDAR classification script to calculate canopy density indicators for bushfire hazard maps."
  },
  {
    id: "default-tablelands-campaign",
    companyName: "Tablelands Regional Council",
    jobTitle: "Senior GIS Geospatial Specialist",
    jobDescription: "Lead regional council asset audits, drainage structures mapping, and coordinate GITA spatial community metrics integration.",
    status: "Accepted",
    createdDate: "Wed 20 May",
    coverLetter: "To the Tablelands Selection Team,\n\nI am thrilled to accept the offer for Senior GIS Geospatial Specialist. This campaign represents a successful integration of municipal asset records..."
  },
  {
    id: "default-acme-campaign",
    companyName: "Acme Forestry Geospatial",
    jobTitle: "Junior GIS Developer",
    jobDescription: "Python script automation for woodland parcel spatial buffering operations.",
    status: "Rejected",
    createdDate: "Fri 15 May",
    coverLetter: "Dear Acme Hiring Group,\n\nPlease accept this letter of application for your Junior GIS Developer role where I highlight python spatial buffering operations..."
  }
];


export default function App() {
  const [activeView, setActiveView] = useState<"dashboard" | "cover" | "interview" | "work">("dashboard");
  const [userId, setUserId] = useState<string | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isInitialRoleLoaded, setIsInitialRoleLoaded] = useState(false);
  
  // Job Seeker Hub States
  const [interviewPrepData, setInterviewPrepData] = useState<any>(null);
  const [isPrepGenerating, setIsPrepGenerating] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [userStarsAnswers, setUserStarsAnswers] = useState<Record<string, string>>({});

  // Capability tasks state
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskDraftOutput, setTaskDraftOutput] = useState<any>(null);
  const [isTaskDrafting, setIsTaskDrafting] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Operational work tasks
  const [workTaskDesc, setWorkTaskDesc] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("SOP Document");
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [isDocGenerating, setIsDocGenerating] = useState(false);

  // Sheets simulator state
  const [sheetInput, setSheetInput] = useState("");
  const [generatedSheet, setGeneratedSheet] = useState<any>(null);
  const [isSheetGenerating, setIsSheetGenerating] = useState(false);
  const [activeWorkTab, setActiveWorkTab] = useState<"slides" | "sheets" | "docs">("slides");
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);

  const [activeRoleId, setActiveRoleId] = useState<string>(() => {
    const saved = localStorage.getItem("jobcrafter_active_role_id");
    return saved || "default-rfs-campaign";
  });

  // Multi-role lifecycle state management loaded from localStorage on mount
  const [roles, setRoles] = useState<JobRole[]>(() => {
    const saved = localStorage.getItem("jobcrafter_roles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing saved roles", e);
      }
    }
    return DEFAULT_SEED_ROLES;
  });

  // Identify the initial active role from our initial offline roles
  const initialActiveRole = roles.find(r => r.id === activeRoleId) || roles[0];

  const [companyName, setCompanyName] = useState(initialActiveRole?.companyName || "");
  const [jobTitle, setJobTitle] = useState(initialActiveRole?.jobTitle || "");
  const [applicationEmail, setApplicationEmail] = useState(initialActiveRole?.applicationEmail || "");
  const [hiringManager, setHiringManager] = useState(initialActiveRole?.hiringManager || "");
  const [coverLetterSpecifics, setCoverLetterSpecifics] = useState(initialActiveRole?.coverLetterSpecifics || "");
  const [companyInfo, setCompanyInfo] = useState(initialActiveRole?.companyInfo || "");
  const [keyRequirements, setKeyRequirements] = useState<string[]>(initialActiveRole?.keyRequirements || []);
  const [jobDescription, setJobDescription] = useState(initialActiveRole?.jobDescription || "");
  const [customQuestions, setCustomQuestions] = useState(initialActiveRole?.customQuestions || "");
  const [userProfile, setUserProfile] = useState<CandidateProfile>(sampleProfile);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState(initialActiveRole?.coverLetter || "");
  const [emailSubject, setEmailSubject] = useState(initialActiveRole?.emailSubject || "");
  const [emailBody, setEmailBody] = useState(initialActiveRole?.emailBody || "");
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [tempProfile, setTempProfile] = useState<CandidateProfile>(userProfile);
  const [advice, setAdvice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableLetter, setEditableLetter] = useState(initialActiveRole?.coverLetter || "");
  const [refinementText, setRefinementText] = useState("");
  const [analysisSuggestions, setAnalysisSuggestions] = useState<any[]>(initialActiveRole?.analysisSuggestions || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [template, setTemplate] = useState("modern");
  const [templates, setTemplates] = useState([
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'bold', name: 'Bold' },
    { id: 'executive', name: 'Executive' },
    { id: 'creative', name: 'Creative' },
    { id: 'professional', name: 'Professional' },
    { id: 'simple', name: 'Simple' }
  ]);

  const switchActiveRole = (newRoleId: string) => {
    // Suspend auto-saving to prevent race conditions during role switch
    setIsInitialRoleLoaded(false);

    // 1. Lock in the current state to the previously active role in the array
    setRoles(prevRoles => {
      const updated = prevRoles.map(r => {
        if (r.id === activeRoleId) {
          return {
            ...r,
            companyName,
            jobTitle,
            jobDescription,
            applicationEmail,
            hiringManager,
            coverLetterSpecifics,
            companyInfo,
            keyRequirements,
            coverLetter: generatedLetter,
            emailSubject,
            emailBody,
            analysisSuggestions,
            interviewPrepData,
            userStarsAnswers,
            taskInstructions,
            taskDraftOutput,
            workTaskDesc,
            selectedDocType,
            generatedDoc,
            sheetInput,
            generatedSheet,
            customQuestions,
          };
        }
        return r;
      });

      // 2. Load the state of the target role directly
      const targetRole = updated.find(r => r.id === newRoleId);
      if (targetRole) {
        setCompanyName(targetRole.companyName || "");
        setJobTitle(targetRole.jobTitle || "");
        setJobDescription(targetRole.jobDescription || "");
        setCustomQuestions(targetRole.customQuestions || "");
        setApplicationEmail(targetRole.applicationEmail || "");
        setHiringManager(targetRole.hiringManager || "");
        setCoverLetterSpecifics(targetRole.coverLetterSpecifics || "");
        setCompanyInfo(targetRole.companyInfo || "");
        setKeyRequirements(targetRole.keyRequirements || []);
        setGeneratedLetter(targetRole.coverLetter || "");
        setEditableLetter(targetRole.coverLetter || "");
        setEmailSubject(targetRole.emailSubject || "");
        setEmailBody(targetRole.emailBody || "");
        setAnalysisSuggestions(targetRole.analysisSuggestions || []);
        setInterviewPrepData(targetRole.interviewPrepData || null);
        setUserStarsAnswers(targetRole.userStarsAnswers || {});
        setTaskInstructions(targetRole.taskInstructions || "");
        setTaskDraftOutput(targetRole.taskDraftOutput || null);
        setWorkTaskDesc(targetRole.workTaskDesc || "");
        setSelectedDocType(targetRole.selectedDocType || "SOP Document");
        setGeneratedDoc(targetRole.generatedDoc || "");
        setSheetInput(targetRole.sheetInput || "");
        setGeneratedSheet(targetRole.generatedSheet || null);
      }

      localStorage.setItem("jobcrafter_roles", JSON.stringify(updated));
      return updated;
    });

    setActiveRoleId(newRoleId);
    localStorage.setItem("jobcrafter_active_role_id", newRoleId);

    // Safely enable auto-save after React finishes executing state batch updates
    setTimeout(() => {
      setIsInitialRoleLoaded(true);
    }, 150);
  };

  useEffect(() => {
    const unsubscribe = setupAuthListener(async (uid) => {
      setUserId(uid);
      try {
        let profileData = await getCandidateProfile(uid);
        let rolesData = await getJobRoles(uid);

        // First-time sandbox setup: check for existing working records in browser's localstorage
        if (!profileData) {
          profileData = sampleProfile;
          await saveCandidateProfile(uid, sampleProfile);

          // Attempt to migrate candidate's current working campaign records
          const localRolesStr = localStorage.getItem("jobcrafter_roles");
          let resolvedRoles = DEFAULT_SEED_ROLES;
          if (localRolesStr) {
            try {
              const parsed = JSON.parse(localRolesStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // If they have any saved data, migrate those instead of defaults to recover their progress
                resolvedRoles = parsed;
              }
            } catch (e) {
              console.error("Failed to parse local backup roles:", e);
            }
          }

          for (const r of resolvedRoles) {
            await saveJobRole(uid, r);
          }
          rolesData = resolvedRoles;
        }

        setUserProfile(profileData);
        setRoles(rolesData);

        const savedActiveId = localStorage.getItem("jobcrafter_active_role_id") || "default-rfs-campaign";
        const hasActiveRole = rolesData.some(r => r.id === savedActiveId);
        const activeId = hasActiveRole ? savedActiveId : (rolesData[0]?.id || "default-rfs-campaign");
        setActiveRoleId(activeId);

        const currentActiveRole = rolesData.find(r => r.id === activeId);
        if (currentActiveRole) {
          setCompanyName(currentActiveRole.companyName || "");
          setJobTitle(currentActiveRole.jobTitle || "");
          setJobDescription(currentActiveRole.jobDescription || "");
          setApplicationEmail(currentActiveRole.applicationEmail || "");
          setHiringManager(currentActiveRole.hiringManager || "");
          setCoverLetterSpecifics(currentActiveRole.coverLetterSpecifics || "");
          setCompanyInfo(currentActiveRole.companyInfo || "");
          setKeyRequirements(currentActiveRole.keyRequirements || []);
          setGeneratedLetter(currentActiveRole.coverLetter || "");
          setEditableLetter(currentActiveRole.coverLetter || "");
          setEmailSubject(currentActiveRole.emailSubject || "");
          setEmailBody(currentActiveRole.emailBody || "");
          setAnalysisSuggestions(currentActiveRole.analysisSuggestions || []);
          setInterviewPrepData(currentActiveRole.interviewPrepData || null);
          setUserStarsAnswers(currentActiveRole.userStarsAnswers || {});
          setTaskInstructions(currentActiveRole.taskInstructions || "");
          setTaskDraftOutput(currentActiveRole.taskDraftOutput || null);
          setWorkTaskDesc(currentActiveRole.workTaskDesc || "");
          setSelectedDocType(currentActiveRole.selectedDocType || "SOP Document");
          setGeneratedDoc(currentActiveRole.generatedDoc || "");
          setSheetInput(currentActiveRole.sheetInput || "");
          setGeneratedSheet(currentActiveRole.generatedSheet || null);
          setCustomQuestions(currentActiveRole.customQuestions || "");
        }

        // Release the auto-saver in the next microtask after states have fully committed
        setTimeout(() => {
          setIsInitialRoleLoaded(true);
        }, 200);

      } catch (err) {
        console.error("Error loading Firestore user data:", err);
      } finally {
        setIsFirebaseLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId || !userProfile) return;
    saveCandidateProfile(userId, userProfile).catch(err => {
      console.error("Firestore saveCandidateProfile error:", err);
    });
  }, [userId, userProfile]);

  useEffect(() => {
    if (!activeRoleId || !userId || isFirebaseLoading || !isInitialRoleLoaded) return;

    const currentRoleInState = roles.find(r => r.id === activeRoleId);
    let hasChange = true;
    if (currentRoleInState) {
      hasChange = 
        currentRoleInState.companyName !== companyName ||
        currentRoleInState.jobTitle !== jobTitle ||
        currentRoleInState.jobDescription !== jobDescription ||
        currentRoleInState.applicationEmail !== applicationEmail ||
        currentRoleInState.hiringManager !== hiringManager ||
        currentRoleInState.coverLetterSpecifics !== coverLetterSpecifics ||
        currentRoleInState.companyInfo !== companyInfo ||
        JSON.stringify(currentRoleInState.keyRequirements) !== JSON.stringify(keyRequirements) ||
        currentRoleInState.coverLetter !== generatedLetter ||
        currentRoleInState.emailSubject !== emailSubject ||
        currentRoleInState.emailBody !== emailBody ||
        JSON.stringify(currentRoleInState.analysisSuggestions) !== JSON.stringify(analysisSuggestions) ||
        JSON.stringify(currentRoleInState.interviewPrepData) !== JSON.stringify(interviewPrepData) ||
        JSON.stringify(currentRoleInState.userStarsAnswers) !== JSON.stringify(userStarsAnswers) ||
        currentRoleInState.taskInstructions !== taskInstructions ||
        JSON.stringify(currentRoleInState.taskDraftOutput) !== JSON.stringify(taskDraftOutput) ||
        currentRoleInState.workTaskDesc !== workTaskDesc ||
        currentRoleInState.selectedDocType !== selectedDocType ||
        currentRoleInState.generatedDoc !== generatedDoc ||
        currentRoleInState.sheetInput !== sheetInput ||
        JSON.stringify(currentRoleInState.generatedSheet) !== JSON.stringify(generatedSheet) ||
        currentRoleInState.customQuestions !== customQuestions;
    }

    if (!hasChange) return;

    const updatedRole: JobRole = {
      id: activeRoleId,
      companyName,
      jobTitle,
      jobDescription,
      applicationEmail,
      hiringManager,
      coverLetterSpecifics,
      companyInfo,
      keyRequirements,
      coverLetter: generatedLetter,
      emailSubject,
      emailBody,
      analysisSuggestions,
      interviewPrepData,
      userStarsAnswers,
      taskInstructions,
      taskDraftOutput,
      workTaskDesc,
      selectedDocType,
      generatedDoc,
      sheetInput,
      generatedSheet,
      customQuestions,
      status: currentRoleInState?.status || "Drafting",
      createdDate: currentRoleInState?.createdDate || new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short" })
    };

    setRoles(prevRoles => {
      const updated = prevRoles.map(r => r.id === activeRoleId ? updatedRole : r);
      localStorage.setItem("jobcrafter_roles", JSON.stringify(updated));
      return updated;
    });

    saveJobRole(userId, updatedRole).catch(err => {
      console.error("Firestore auto-save role error:", err);
    });

  }, [
    userId,
    isFirebaseLoading,
    isInitialRoleLoaded,
    activeRoleId,
    companyName,
    jobTitle,
    jobDescription,
    applicationEmail,
    hiringManager,
    coverLetterSpecifics,
    companyInfo,
    keyRequirements,
    generatedLetter,
    emailSubject,
    emailBody,
    analysisSuggestions,
    interviewPrepData,
    userStarsAnswers,
    taskInstructions,
    taskDraftOutput,
    workTaskDesc,
    selectedDocType,
    generatedDoc,
    sheetInput,
    generatedSheet,
    customQuestions
  ]);

  const handleCreateRole = (cmp: string, title: string, desc: string) => {
    const newId = `role-${Math.random().toString(36).substr(2, 9)}`;
    const newRole: JobRole = {
      id: newId,
      companyName: cmp,
      jobTitle: title,
      jobDescription: desc,
      status: "Drafting",
      createdDate: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short" })
    };

    setRoles(prev => {
      const updated = [...prev, newRole];
      localStorage.setItem("jobcrafter_roles", JSON.stringify(updated));
      return updated;
    });

    if (userId) {
      saveJobRole(userId, newRole).catch(err => {
        console.error("Firestore saveJobRole error:", err);
      });
    }

    switchActiveRole(newId);
  };

  const handleUpdateRoleStatus = (id: string, status: JobRole["status"]) => {
    let targetRole: JobRole | undefined;
    setRoles(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          targetRole = { ...r, status };
          return targetRole;
        }
        return r;
      });
      localStorage.setItem("jobcrafter_roles", JSON.stringify(updated));
      return updated;
    });

    if (userId) {
      setTimeout(() => {
        if (targetRole) {
          saveJobRole(userId!, targetRole).catch(err => {
            console.error("Firestore update role status error:", err);
          });
        }
      }, 50);
    }
    toast.success(`Milestone stage updated to: ${status}`);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem("jobcrafter_roles", JSON.stringify(updated));
      return updated;
    });

    if (userId) {
      deleteJobRoleFromDb(userId, id).catch(err => {
        console.error("Firestore deleteJobRole error:", err);
      });
    }

    // If deleting our active role, fallback to the first remaining role campaign
    if (activeRoleId === id) {
      setRoles(prev => {
        const remaining = prev.filter(r => r.id !== id);
        if (remaining.length > 0) {
          setTimeout(() => switchActiveRole(remaining[0].id), 0);
        }
        return prev;
      });
    }
    toast.success("Campaign removed successfully");
  };
  const [sources, setSources] = useState([
    { id: '1', type: 'linkedin', name: userProfile.linkedin, icon: <Linkedin className="w-3 h-3 text-[#0A66C2]" /> },
    { id: '2', type: 'file', name: 'Current Resume (Click to upload)', icon: <FileText className="w-3 h-3 text-primary" /> }
  ]);
  const [workSources, setWorkSources] = useState<Array<{ id: string; type: 'link' | 'file'; name: string }>>([
    { id: 'ws-1', type: 'link', name: 'https://hbr.org/2013/06/how-to-give-a-killer-presentation' },
    { id: 'ws-2', type: 'link', name: 'https://sloanreview.mit.edu/article/how-to-create-slides-that-suit-your-superiors-11-tips/' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI State for adding/editing
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [editSourceName, setEditSourceName] = useState("");
  
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateStyle, setNewTemplateStyle] = useState("");

  const handleAddSource = (type: 'link' | 'file' | 'cloud') => {
    if (type === 'file') {
      fileInputRef.current?.click();
      return;
    }
    
    if (type === 'cloud') {
      toast.info("Cloud integration requires API configuration. Please set up Google/OneDrive secrets in the panel.");
      return;
    }

    if (!newSourceName.trim()) return;
    setSources([...sources, { 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'link', 
      name: newSourceName, 
      icon: <LinkIcon className="w-3 h-3 text-muted-foreground" /> 
    }]);
    setNewSourceName("");
    setShowAddSource(false);
    toast.success("Source added!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newSources = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        type: 'file' as const,
        name: file.name,
        icon: <FileText className="w-3 h-3 text-primary" />
      }));
      setSources([...sources, ...newSources]);
      setShowAddSource(false);
      toast.success(`Uploaded ${files.length} file(s)`);
    }
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
    toast.success("Source removed");
  };

  const handleSaveEditSource = () => {
    if (!editingSourceId || !editSourceName.trim()) return;
    setSources(sources.map(s => s.id === editingSourceId ? { ...s, name: editSourceName } : s));
    setEditingSourceId(null);
    setEditSourceName("");
    toast.success("Source updated");
  };

  const handleAddTemplate = () => {
    if (!newTemplateName.trim()) return;
    const id = newTemplateName.toLowerCase().replace(/\s+/g, '-');
    setTemplates([...templates, { id, name: newTemplateName }]);
    setNewTemplateName("");
    setNewTemplateStyle("");
    setShowAddTemplate(false);
    toast.success(`Template "${newTemplateName}" added!`);
  };

  const [selectedText, setSelectedText] = useState("");

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
      if (text) {
        setSelectedText(text);
        toast.info(`Section selected: "${text.substring(0, 30)}..."`, {
          description: "Your next refinement will focus on this text.",
          duration: 3000
        });
      }
    }
  };

  const handleAddRequirement = () => {
    setKeyRequirements([...keyRequirements, ""]);
  };

  const handleUpdateRequirement = (index: number, value: string) => {
    const newReqs = [...keyRequirements];
    newReqs[index] = value;
    setKeyRequirements(newReqs);
  };

  const handleRemoveRequirement = (index: number) => {
    setKeyRequirements(keyRequirements.filter((_, i) => i !== index));
  };

  const handleExtractDetails = async () => {
    if (!jobDescription) {
      toast.error("Please paste a job description first.");
      return;
    }

    setIsExtracting(true);
    try {
      const details = await extractJobDetails(jobDescription);
      setCompanyName(details.companyName || "");
      setJobTitle(details.jobTitle || "");
      setApplicationEmail(details.applicationEmail || "");
      setHiringManager(details.hiringManager || "Hiring Manager");
      setCoverLetterSpecifics(details.coverLetterSpecifics || "");
      setCompanyInfo(details.companyInfo || "");
      setKeyRequirements(details.keyRequirements || []);
      setShowReview(true);
      toast.success("Details extracted! Please review.");
    } catch (error) {
      toast.error("Failed to extract details. You can still enter them manually.");
      setShowReview(true);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async (isRefinement = false) => {
    if (!isRefinement && !jobDescription) {
      toast.error("Please provide a job description.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCoverLetter(
        jobDescription, 
        companyName, 
        jobTitle,
        hiringManager,
        coverLetterSpecifics,
        companyInfo,
        keyRequirements,
        userProfile,
        "professional", 
        isRefinement ? refinementText : undefined, 
        isRefinement ? generatedLetter : undefined,
        isRefinement ? selectedText : undefined
      );
      
      if (result.letter) {
        setGeneratedLetter(result.letter);
        setEditableLetter(result.letter);
        setIsEditing(false);
      }

      if (result.emailSubject) {
        setEmailSubject(result.emailSubject);
      }

      if (result.emailBody) {
        setEmailBody(result.emailBody);
      }
      
      if (result.advice) {
        setAdvice(result.advice);
      }
      
      setRefinementText("");
      setSelectedText(""); // Clear selection after use
      if (!isRefinement) setShowReview(false);
      toast.success(isRefinement ? "Cover letter refined!" : "Cover letter generated!");
    } catch (error) {
      toast.error("Failed to process request. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveAiVoice = async () => {
    if (!generatedLetter) return;

    setIsGenerating(true);
    try {
      const result = await removeAiVoice(
        editableLetter || generatedLetter,
        userProfile,
        companyName,
        jobTitle
      );
      
      if (result.letter) {
        setGeneratedLetter(result.letter);
        setEditableLetter(result.letter);
        setIsEditing(false);
        toast.success("AI voice removed! The letter sounds more human now.");
      }
      
      if (result.advice) {
        setAdvice(result.advice);
      }
    } catch (error) {
      toast.error("Failed to humanize the letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!generatedLetter) return;
    
    setIsAnalyzing(true);
    setShowAnalysis(true);
    
    try {
      const result = await analyzeCoverLetter(
        generatedLetter,
        jobDescription,
        userProfile
      );
      setAnalysisSuggestions(result.suggestions);
      toast.success("Analysis complete! Review the suggestions below.");
    } catch (error) {
      toast.error("Failed to analyze the letter. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePrep = async () => {
    setIsPrepGenerating(true);
    try {
      const prep = await generateInterviewPrep(
        jobDescription,
        userProfile,
        generatedLetter,
        customQuestions,
        {
          generatedDoc,
          generatedSheet,
          taskDraftOutput
        }
      );
      setInterviewPrepData(prep);
      setSelectedQuestionIndex(0);
      toast.success("Tailored Interview Prep Guide compiled!");
    } catch (error) {
      toast.error("Failed to compile interview guide. Please try again.");
      console.error(error);
    } finally {
      setIsPrepGenerating(false);
    }
  };

  const handleGenerateTaskDraft = async (
    outputType: "slides" | "report",
    isRefinement = false,
    refinementText?: string,
    selectedText?: string
  ) => {
    if (!taskInstructions) {
      toast.error("Please insert Capability Task instructions first.");
      return;
    }
    setIsTaskDrafting(true);
    try {
      const cleanSources = workSources.map(s => ({ type: s.type, name: s.name }));
      const draft = await generateCapabilityTaskDraft(
        taskInstructions, 
        userProfile, 
        jobDescription, 
        outputType,
        cleanSources,
        isRefinement ? refinementText : undefined,
        isRefinement ? taskDraftOutput : undefined,
        isRefinement ? selectedText : undefined
      );
      setTaskDraftOutput(draft);
      setActiveSlideIndex(0);
      toast.success(isRefinement ? `Capability ${outputType === 'slides' ? 'Presentation' : 'Operational Memo'} refined!` : `Capability ${outputType === 'slides' ? 'Presentation' : 'Operational Memo'} created!`);
    } catch (error) {
      toast.error(isRefinement ? "Failed to refine task draft. Please try again." : "Failed to generate task draft. Please try again.");
      console.error(error);
    } finally {
      setIsTaskDrafting(false);
    }
  };

  const handleGenerateWorkDocument = async (
    isRefinement = false,
    refinementText?: string,
    selectedText?: string
  ) => {
    if (!workTaskDesc) {
      toast.error("Please describe the work task first.");
      return;
    }
    setIsDocGenerating(true);
    try {
      const cleanSources = workSources.map(s => ({ type: s.type, name: s.name }));
      const doc = await generateWorkDocument(
        workTaskDesc, 
        userProfile, 
        selectedDocType, 
        jobDescription,
        cleanSources,
        isRefinement ? refinementText : undefined,
        isRefinement ? generatedDoc : undefined,
        isRefinement ? selectedText : undefined
      );
      setGeneratedDoc(doc.markdownContent);
      toast.success(isRefinement ? "Operational SOP draft refined!" : "Operational SOP draft constructed!");
    } catch (error) {
      toast.error(isRefinement ? "Failed to refine document. Please try again." : "Failed to generate document. Please try again.");
      console.error(error);
    } finally {
      setIsDocGenerating(false);
    }
  };

  const handleGenerateWorkSheet = async (
    isRefinement = false,
    refinementText?: string,
    selectedText?: string
  ) => {
    if (!sheetInput) {
      toast.error("Please describe the spreadsheet database to compile.");
      return;
    }
    setIsSheetGenerating(true);
    try {
      const cleanSources = workSources.map(s => ({ type: s.type, name: s.name }));
      const sheet = await generateWorkDataSheet(
        sheetInput, 
        userProfile, 
        "NSW Rural Fire Service - Command & GIS Bureau", 
        jobDescription,
        cleanSources,
        isRefinement ? refinementText : undefined,
        isRefinement ? generatedSheet : undefined,
        isRefinement ? selectedText : undefined
      );
      setGeneratedSheet(sheet);
      toast.success(isRefinement ? "Operational database sheet refined!" : "Operational database sheet constructed!");
    } catch (error) {
      toast.error(isRefinement ? "Failed to refine spreadsheet. Please try again." : "Failed to compile spreadsheet. Please try again.");
      console.error(error);
    } finally {
      setIsSheetGenerating(false);
    }
  };

  const handleSaveEdit = () => {
    setGeneratedLetter(editableLetter);
    setIsEditing(false);
    toast.success("Changes saved!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast.success("Copied to clipboard!");
  };

  const handlePrint = () => {
    const printContent = document.getElementById('letter-content');
    if (!printContent) return;
    
    const win = window.open('', '', 'height=700,width=900');
    if (!win) return;
    
    const templateStyles = getTemplateStyles();
    const sanitizedCompany = companyName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    const sanitizedJob = jobTitle.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    const pdfName = `CoreaGC_CvrLtr_${sanitizedCompany}_${sanitizedJob}`;

    win.document.write(`
      <html>
        <head>
          <title>${pdfName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Space+Grotesk:wght@300..700&display=swap');
            
            body { 
              margin: 0; 
              padding: 20mm; 
              background: white; 
              -webkit-print-color-adjust: exact;
            }
            .letter-body {
              width: 170mm; /* A4 minus margins */
              margin: 0 auto;
              color: #111;
            }
            /* Apply template fonts */
            .classic { font-family: 'Playfair Display', serif; }
            .minimal { font-family: 'Outfit', sans-serif; }
            .executive { font-family: 'Space Grotesk', sans-serif; }
            .bold { font-family: sans-serif; }
            .professional { font-family: sans-serif; }
            .modern { font-family: sans-serif; }
            
            .prose p { margin-bottom: 1.25em; line-height: 1.6; }
            .prose strong { font-weight: 600; color: #000; }
            center { display: block; text-align: center; margin-bottom: 4px; }
            
            @page { size: A4; margin: 0; }
          </style>
        </head>
        <body>
          <div class="letter-body ${template}">
            <div class="prose ${templateStyles.prose}">
              ${printContent.innerHTML}
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const getTemplateStyles = () => {
    switch (template) {
      case 'classic':
        return {
          container: "max-w-[800px] shadow-2xl font-serif border-t-8 border-gray-800",
          content: "p-12 leading-relaxed text-[17px] text-gray-900 font-serif",
          prose: "prose-serif prose-p:mb-5 prose-p:leading-relaxed"
        };
      case 'minimal':
        return {
          container: "max-w-[700px] shadow-sm border border-gray-100 font-outfit",
          content: "p-8 leading-loose text-[14px] text-gray-700 font-outfit",
          prose: "prose-slate prose-p:mb-3 font-outfit"
        };
      case 'bold':
        return {
          container: "max-w-[800px] shadow-2xl border-l-[16px] border-primary bg-primary/5",
          content: "p-10 leading-snug text-[15px] font-medium font-sans",
          prose: "prose-indigo prose-p:mb-4 font-sans"
        };
      case 'executive':
        return {
          container: "max-w-[850px] shadow-2xl border-t-[40px] border-secondary",
          content: "p-10 leading-relaxed text-[15px] text-gray-900 font-space",
          prose: "prose-neutral prose-p:mb-4 font-space"
        };
      case 'creative':
        return {
          container: "max-w-[800px] shadow-2xl bg-slate-50 border-double border-4 border-primary/20",
          content: "p-10 leading-relaxed text-[15px] text-gray-800 font-outfit",
          prose: "prose-stone prose-p:mb-4 italic font-outfit"
        };
      case 'professional':
        return {
          container: "max-w-[800px] shadow-xl border-x border-gray-200",
          content: "p-10 leading-relaxed text-[15px] text-gray-900 font-sans",
          prose: "prose-zinc prose-p:mb-4 font-sans"
        };
      case 'simple':
        return {
          container: "max-w-[750px] shadow-none border-none",
          content: "p-8 leading-normal text-[15px] text-black font-sans",
          prose: "prose-p:mb-3 font-sans"
        };
      default: // modern
        return {
          container: "max-w-[800px] shadow-2xl rounded-xl overflow-hidden",
          content: "p-10 leading-relaxed text-[15px] font-sans",
          prose: "prose-p:mb-4 font-sans"
        };
    }
  };

  const templateStyles = getTemplateStyles();

  if (isFirebaseLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-901 tracking-tight font-sans">Syncing Persistent Sandbox</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Synchronizing candidate profile, saved campaign records, and voice-answers database. Please wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2 font-bold tracking-tight text-xl">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          JobCrafter AI
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase">
            PREMIUM PLAN
          </span>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium border border-border mt-0.5">
            {userProfile.name ? userProfile.name.split(' ').map(n => n[0]).join('') : "JC"}
          </div>
        </div>
      </header>

      {/* Navigation Sub-header */}
      <div className="bg-card border-b border-border h-12 flex items-center justify-between px-8 text-sm shrink-0">
        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto py-1">
          <button 
            onClick={() => setActiveView("dashboard")} 
            className={`py-1.5 px-3 rounded-md text-[11px] font-bold tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${activeView === "dashboard" ? "text-primary bg-primary/5 shadow-sm border border-primary/10 font-black" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Layout className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView("cover")} 
            className={`py-1.5 px-3 rounded-md text-[11px] font-bold tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${activeView === "cover" ? "text-primary bg-primary/5 shadow-sm border border-primary/10 font-black" : "text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Cover Letters
          </button>
          <button 
            onClick={() => setActiveView("interview")} 
            className={`py-1.5 px-3 rounded-md text-[11px] font-bold tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${activeView === "interview" ? "text-primary bg-primary/5 shadow-sm border border-primary/10 font-black" : "text-muted-foreground hover:text-foreground"}`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Interview Hub
          </button>
          <button 
            onClick={() => setActiveView("work")} 
            className={`py-1.5 px-3 rounded-md text-[11px] font-bold tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${activeView === "work" ? "text-primary bg-primary/5 shadow-sm border border-primary/10 font-black" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Work Tasks & Sheets
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <Cpu className="w-3 h-3 text-primary animate-pulse" />
          Powered by Gemini 3.5 Flash
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {activeView === "cover" && (
          <>
            {/* Sidebar */}
            {!isProfileCollapsed && (
              <aside className="w-[320px] border-r border-border bg-[#FAF9F6] flex flex-col gap-8 p-6 overflow-y-auto shrink-0 font-sans">
                {/* Candidate Bio */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-5 h-5 text-muted-foreground hover:text-primary p-0 h-auto w-auto"
                        title="Hide Profile"
                        onClick={() => setIsProfileCollapsed(true)}
                      >
                        <PanelLeftClose className="w-4 h-4" />
                      </Button>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        Candidate Profile
                      </p>
                    </div>
              <div className="flex gap-1">
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 text-muted-foreground hover:text-primary"
                  title="Reset to Sample"
                  onClick={() => {
                    setUserProfile(sampleProfile);
                    toast.success("Reset to sample data");
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 text-muted-foreground hover:text-destructive"
                  title="Clear All Info"
                  onClick={() => {
                    setUserProfile({
                      name: "",
                      email: "",
                      phone: "",
                      location: "",
                      linkedin: "",
                      summary: "",
                      experience: [],
                      education: [],
                      skills: []
                    });
                    toast.warning("Profile cleared. Please enter your details.");
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-xl border border-border space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold">{userProfile.name || "Unnamed Candidate"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userProfile.summary || "No summary provided"}</p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] w-full"
                  onClick={() => {
                    setTempProfile(userProfile);
                    setShowProfileEdit(true);
                  }}
                >
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit Profile Details
                </Button>
              </div>
            </div>
          </div>

          {/* Sources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Connected Sources
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-5 h-5 transition-colors ${showAddSource ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setShowAddSource(!showAddSource)}
              >
                <Plus className={`w-3 h-3 transition-transform ${showAddSource ? 'rotate-45' : ''}`} />
              </Button>
            </div>

            {showAddSource && (
              <div className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] border-dashed bg-background"
                    onClick={() => handleAddSource('file')}
                  >
                    <FileUp className="w-2 h-2 mr-1" /> Upload File
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] border-dashed bg-background"
                    onClick={() => handleAddSource('cloud')}
                  >
                    <Cloud className="w-2 h-2 mr-1" /> Cloud
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or Link</span>
                  </div>
                </div>

                <Input 
                  placeholder="URL or Name..." 
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="h-8 text-xs bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSource('link')}
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 text-[10px] flex-1" onClick={() => handleAddSource('link')}>Add Link</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setShowAddSource(false)}>Cancel</Button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                />
              </div>
            )}

            <div className="space-y-1">
              {sources.map((source) => (
                <div key={source.id} className="bg-card/50 border border-border/50 p-2 rounded flex flex-col gap-2 group hover:bg-card transition-colors">
                  {editingSourceId === source.id ? (
                    <div className="space-y-2 w-full">
                      <Input 
                        value={editSourceName}
                        onChange={(e) => setEditSourceName(e.target.value)}
                        className="h-7 text-[11px] bg-background"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditSource()}
                      />
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6 text-[9px] px-2" onClick={handleSaveEditSource}>Save</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[9px] px-2" onClick={() => setEditingSourceId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      {source.icon}
                      <span className="text-[11px] text-muted-foreground truncate flex-1">{source.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 
                          className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary" 
                          onClick={() => {
                            setEditingSourceId(source.id);
                            setEditSourceName(source.name);
                          }}
                        />
                        <Trash2 
                          className="w-3 h-3 text-destructive cursor-pointer hover:text-destructive/80" 
                          onClick={() => handleDeleteSource(source.id)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Design Templates
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-5 h-5 transition-colors ${showAddTemplate ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setShowAddTemplate(!showAddTemplate)}
              >
                <Plus className={`w-3 h-3 transition-transform ${showAddTemplate ? 'rotate-45' : ''}`} />
              </Button>
            </div>

            {showAddTemplate && (
              <div className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground">Template Name</Label>
                  <Input 
                    placeholder="e.g. Executive, Creative..." 
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground">Style Description (Optional)</Label>
                  <Textarea 
                    placeholder="e.g. Serif fonts, wide margins, blue accents..." 
                    value={newTemplateStyle}
                    onChange={(e) => setNewTemplateStyle(e.target.value)}
                    className="h-16 text-xs bg-background resize-none"
                  />
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 text-[10px] flex-1" onClick={handleAddTemplate}>Create Template</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setShowAddTemplate(false)}>Cancel</Button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    template === t.id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <Layout className={`w-4 h-4 mb-2 ${template === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coach Advice */}
          {advice && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-3 h-3" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Coach Advice</p>
              </div>
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg">
                <p className="text-xs leading-relaxed text-muted-foreground italic">
                  "{advice}"
                </p>
              </div>
            </div>
          )}

                {/* Context Box */}
                <div className="mt-auto p-4 bg-secondary/50 border border-border rounded-lg">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {companyName ? (
                      <>Targeting <strong>{companyName}</strong> application.</>
                    ) : (
                      <>Enter job details to begin.</>
                    )}
                  </p>
                </div>
              </aside>
            )}

            {/* Preview Area */}
            <section className="flex-1 flex flex-col gap-6 p-10 preview-gradient overflow-y-auto relative">
              {isProfileCollapsed && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute left-4 top-4 z-20 h-8 px-3 rounded-md bg-card shadow-sm border border-border shrink-0 text-xs font-bold gap-2 text-primary hover:bg-primary/5 transition-all"
                  onClick={() => setIsProfileCollapsed(false)}
                >
                  <PanelLeftOpen className="w-3.5 h-3.5" />
                  Show Profile
                </Button>
              )}
          {/* Floating Actions Bar (Visible when letter exists) */}
          {generatedLetter && (
            <div className="sticky top-0 z-10 flex justify-end mb-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-card/90 backdrop-blur-md border border-border p-1.5 rounded-full shadow-2xl flex items-center gap-1">
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-xs h-8 px-4 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleSaveEdit} className="text-primary bg-primary/10 text-xs h-8 px-4 rounded-full font-bold">
                    <Save className="w-3 h-3 mr-2" />
                    Save Changes
                  </Button>
                )}
                <div className="w-[1px] h-4 bg-border mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemoveAiVoice} 
                  disabled={isGenerating}
                  className="text-primary hover:bg-primary/5 text-xs h-8 px-4 rounded-full font-bold animate-pulse-slow"
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                  Remove AI Voice
                </Button>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                  className="text-primary hover:bg-primary/5 text-xs h-8 px-4 rounded-full font-bold"
                >
                  {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wand2 className="w-3 h-3 mr-2" />}
                  Analyze Letter
                </Button>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <Button variant="ghost" size="sm" onClick={handlePrint} className="text-xs h-8 px-3 rounded-full">
                  <Printer className="w-3 h-3 mr-2" />
                  Print / PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowEmailDraft(true)} className="text-xs h-8 px-3 rounded-full">
                  <Mail className="w-3 h-3 mr-2" />
                  Email version
                </Button>
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-xs h-8 px-3 rounded-full">
                  <Copy className="w-3 h-3 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}

          {/* Input & Toolbar */}
          <div className="flex flex-col gap-6 shrink-0">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1 max-w-2xl space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Job Description / Requirements</Label>
                    {jobDescription && (
                      <button 
                        onClick={() => setJobDescription("")}
                        className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-2 h-2" /> Clear
                      </button>
                    )}
                  </div>
                  <Textarea 
                    id="description" 
                    placeholder="Paste the job requirements or a URL here..." 
                    className="bg-card border-border min-h-[120px] max-h-[200px] text-sm resize-none"
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      if (showReview) setShowReview(false);
                    }}
                  />
                  <p className="text-[9px] text-muted-foreground italic">
                    Tip: If a URL doesn't analyze correctly, try pasting the full job text directly.
                  </p>
                </div>

                {showReview ? (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Sparkles className="w-3 h-3" />
                      <p className="text-[10px] uppercase tracking-widest font-bold">Review Extracted Details</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">Company Name</Label>
                        <Input 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">Job Title</Label>
                        <Input 
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">Hiring Manager</Label>
                        <Input 
                          value={hiringManager}
                          onChange={(e) => setHiringManager(e.target.value)}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">Company Info & Mission</Label>
                        <Textarea 
                          value={companyInfo}
                          onChange={(e) => setCompanyInfo(e.target.value)}
                          className="h-16 text-xs bg-background resize-none"
                          placeholder="Brief summary of company values/mission..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">Cover Letter Specifics</Label>
                        <Textarea 
                          value={coverLetterSpecifics}
                          onChange={(e) => setCoverLetterSpecifics(e.target.value)}
                          className="h-16 text-xs bg-background resize-none"
                          placeholder="e.g. Address selection criteria, limit to 2 pages..."
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">Key Requirements (Detected)</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 text-[8px] uppercase font-bold text-primary hover:text-primary/80 p-0"
                          onClick={handleAddRequirement}
                        >
                          <Plus className="w-2 h-2 mr-1" /> Add Requirement
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(keyRequirements || []).map((req, i) => (
                          <div key={i} className="flex gap-2">
                            <Input 
                              value={req}
                              onChange={(e) => handleUpdateRequirement(i, e.target.value)}
                              className="h-8 text-xs bg-background flex-1"
                              placeholder="e.g. 5+ years GIS experience..."
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveRequirement(i)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {(!keyRequirements || keyRequirements.length === 0) && (
                          <p className="text-[10px] text-muted-foreground italic">No requirements detected. Add some to help tailor the letter.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-10 px-4 text-xs font-bold uppercase tracking-wider"
                        onClick={() => setShowReview(false)}
                      >
                        Back
                      </Button>
                      <Button 
                        className="h-10 px-8 text-xs font-bold uppercase tracking-wider"
                        onClick={() => handleGenerate(false)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wand2 className="w-3 h-3 mr-2" />}
                        {isGenerating ? "Generating..." : "Confirm & Generate"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <Button 
                      className="h-10 px-8 text-xs font-bold uppercase tracking-wider"
                      onClick={handleExtractDetails}
                      disabled={isExtracting}
                    >
                      {isExtracting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ChevronRight className="w-3 h-3 mr-2" />}
                      {isExtracting ? "Analyzing..." : "Analyze Job Details"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0 pt-6">
                {/* Actions moved to floating bar */}
              </div>
            </div>
          </div>

          {/* Refinement Input */}
          {generatedLetter && !isEditing && (
            <div className="max-w-2xl shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input 
                    placeholder={selectedText ? `Refining selected section...` : "Ask for changes (e.g. 'Make the second paragraph shorter' or 'Focus more on my GIS skills')"}
                    value={refinementText}
                    onChange={(e) => setRefinementText(e.target.value)}
                    className="bg-card border-border h-10 pr-10 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate(true)}
                  />
                  {selectedText && (
                    <div className="absolute -top-6 left-0 flex items-center gap-2">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 flex items-center gap-1">
                        <Edit2 className="w-2 h-2" /> Editing Selection
                        <button onClick={() => setSelectedText("")} className="hover:text-destructive ml-1">×</button>
                      </span>
                    </div>
                  )}
                  <MessageSquarePlus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="h-10 px-4"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating || !refinementText}
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refine"}
                </Button>
              </div>
            </div>
          )}

          {/* Letter Container */}
          <div className="flex-1 flex flex-col items-center pb-10">
            {showAnalysis && (
              <div className="w-full max-w-4xl mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <Card className="bg-card/50 border-primary/20 shadow-xl backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-primary/10 py-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold">Smart Analysis & Suggestions</CardTitle>
                        <CardDescription className="text-[10px]">Actionable insights based on your profile and the job description</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowAnalysis(false)} className="h-8 w-8 rounded-full">
                      <Plus className="w-4 h-4 rotate-45" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-border/50">
                      {isAnalyzing ? (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-4">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground animate-pulse">Gemini is analyzing your letter...</p>
                        </div>
                      ) : analysisSuggestions.length > 0 ? (
                        analysisSuggestions.map((suggestion, i) => (
                          <div key={i} className="p-5 space-y-3 hover:bg-accent/5 transition-colors">
                            <div className="flex items-start justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {suggestion.type}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold leading-tight">{suggestion.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-3">{suggestion.feedback}</p>
                            <div className="pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-[10px] h-8 border-primary/20 hover:bg-primary/10 hover:text-primary font-bold transition-all"
                                onClick={() => {
                                  setRefinementText(`Add/Apply: ${suggestion.action}`);
                                  toast.info("Suggestion added to the refinement box.");
                                  // Scroll to refinement box
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                Use this Suggestion
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                          <h4 className="font-bold">Looking Good!</h4>
                          <p className="text-sm text-muted-foreground">No critical weaknesses detected in this draft.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div 
              id="letter-print-root"
              className={`w-full bg-white text-[#1a1a1a] rounded-sm flex flex-col min-h-[800px] transition-all duration-500 ${templateStyles.container}`}
            >
              {generatedLetter ? (
                <ScrollArea className="flex-1">
                  <div 
                    id="letter-content" 
                    onMouseUp={handleTextSelection}
                    className={templateStyles.content}
                  >
                    {isEditing ? (
                      <Textarea 
                        value={editableLetter}
                        onChange={(e) => setEditableLetter(e.target.value)}
                        className="min-h-[800px] w-full p-0 border-none focus-visible:ring-0 text-[15px] leading-relaxed text-gray-800 resize-none bg-transparent"
                      />
                    ) : (
                      <div className={`prose prose-sm max-w-none text-gray-800 ${templateStyles.prose}`}>
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{generatedLetter}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="text-gray-400">
                    <p className="font-medium">Preview will appear here</p>
                    <p className="text-xs">Fill in the job details to generate your letter.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
          </>
        )}

        {activeView === "dashboard" && (
          <DashboardView 
            userProfile={userProfile} 
            setActiveView={setActiveView} 
            roles={roles}
            activeRoleId={activeRoleId}
            setActiveRoleId={switchActiveRole}
            onCreateRole={handleCreateRole}
            onUpdateRoleStatus={handleUpdateRoleStatus}
            onDeleteRole={handleDeleteRole}
            setActiveWorkTab={setActiveWorkTab}
          />
        )}

        {activeView === "interview" && (
          <InterviewView 
            userProfile={userProfile}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            customQuestions={customQuestions}
            setCustomQuestions={setCustomQuestions}
            coverLetter={generatedLetter}
            interviewPrepData={interviewPrepData}
            isPrepGenerating={isPrepGenerating}
            handleGeneratePrep={handleGeneratePrep}
            selectedQuestionIndex={selectedQuestionIndex}
            setSelectedQuestionIndex={setSelectedQuestionIndex}
            userStarsAnswers={userStarsAnswers}
            setUserStarsAnswers={setUserStarsAnswers}
            setInterviewPrepData={setInterviewPrepData}
          />
        )}

        {activeView === "work" && (
          <WorkView 
            userProfile={userProfile}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            workTaskDesc={workTaskDesc}
            setWorkTaskDesc={setWorkTaskDesc}
            selectedDocType={selectedDocType}
            setSelectedDocType={setSelectedDocType}
            generatedDoc={generatedDoc}
            setGeneratedDoc={setGeneratedDoc}
            isDocGenerating={isDocGenerating}
            handleGenerateWorkDocument={handleGenerateWorkDocument}
            sheetInput={sheetInput}
            setSheetInput={setSheetInput}
            generatedSheet={generatedSheet}
            setGeneratedSheet={setGeneratedSheet}
            isSheetGenerating={isSheetGenerating}
            handleGenerateWorkSheet={handleGenerateWorkSheet}
            taskInstructions={taskInstructions}
            setTaskInstructions={setTaskInstructions}
            taskDraftOutput={taskDraftOutput}
            setTaskDraftOutput={setTaskDraftOutput}
            isTaskDrafting={isTaskDrafting}
            handleGenerateTaskDraft={handleGenerateTaskDraft}
            activeSlideIndex={activeSlideIndex}
            setActiveSlideIndex={setActiveSlideIndex}
            activeWorkTab={activeWorkTab}
            setActiveWorkTab={setActiveWorkTab}
            workSources={workSources}
            setWorkSources={setWorkSources}
          />
        )}
      </main>
      <Toaster position="bottom-right" theme="dark" />
      
      {/* Email Draft Overlay */}
      {showEmailDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl p-8 space-y-6 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowEmailDraft(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-all duration-300 hover:rotate-90 p-2"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Application Draft
              </h3>
              <p className="text-sm text-muted-foreground">Short, direct version for body-of-email applications.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center justify-between">
                  To (Email Address)
                  <span className="text-[9px] font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded flex items-center gap-1 normal-case tracking-normal">
                    <Edit2 className="w-2 h-2" /> Editable
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    value={applicationEmail} 
                    onChange={(e) => setApplicationEmail(e.target.value)}
                    placeholder="Enter recipient email..."
                    className="bg-secondary/50 border-border h-12"
                  />
                  <Button 
                    variant="outline" 
                    className="h-12 border-border hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    onClick={() => {
                      if (applicationEmail) {
                        navigator.clipboard.writeText(applicationEmail);
                        toast.success("Recipient email copied!");
                      } else {
                        toast.error("No recipient email found.");
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center justify-between">
                  Subject Line
                  <span className="text-[9px] font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded flex items-center gap-1 normal-case tracking-normal">
                    <Edit2 className="w-2 h-2" /> Editable
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    value={emailSubject} 
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="bg-secondary/50 border-border h-12 text-sm"
                  />
                  <Button 
                    variant="outline" 
                    className="h-12 border-border hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    onClick={() => {
                      navigator.clipboard.writeText(emailSubject);
                      toast.success("Subject copied!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center justify-between">
                  Email Body
                  <span className="text-[9px] font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded flex items-center gap-1 normal-case tracking-normal">
                    <Edit2 className="w-2 h-2" /> Editable
                  </span>
                </Label>
                <div className="relative">
                  <Textarea 
                    value={emailBody} 
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="bg-secondary/50 border-border min-h-[200px] leading-relaxed resize-none text-sm"
                  />
                   <Button 
                    className="absolute bottom-4 right-4 shadow-lg transition-transform active:scale-95"
                    onClick={() => {
                      navigator.clipboard.writeText(emailBody);
                      toast.success("Email body copied!");
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Body
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-between items-center">
              <p className="text-[11px] text-muted-foreground italic">
                Tip: Attach your PDF version of the full cover letter if applying via email.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const mailto = `mailto:${applicationEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                    window.open(mailto, '_blank');
                  }}
                  className="border-border hover:bg-primary/5"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Default Mail
                </Button>
                <Button variant="ghost" onClick={() => setShowEmailDraft(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Overlay */}
      {showProfileEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl p-8 space-y-6 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Edit Candidate Profile
                </h3>
                <p className="text-sm text-muted-foreground">These details are used by the AI to tailor your letters and emails.</p>
              </div>
              <button 
                onClick={() => setShowProfileEdit(false)}
                className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:rotate-90"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Full Name</Label>
                  <Input 
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="bg-secondary/50 border-border h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Email Address</Label>
                  <Input 
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                    placeholder="jane@example.com"
                    className="bg-secondary/50 border-border h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Phone</Label>
                  <Input 
                    value={tempProfile.phone}
                    onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                    placeholder="+61 400 000 000"
                    className="bg-secondary/50 border-border h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Location</Label>
                  <Input 
                    value={tempProfile.location}
                    onChange={(e) => setTempProfile({...tempProfile, location: e.target.value})}
                    placeholder="Sydney, NSW"
                    className="bg-secondary/50 border-border h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">LinkedIn URL</Label>
                <Input 
                  value={tempProfile.linkedin}
                  onChange={(e) => setTempProfile({...tempProfile, linkedin: e.target.value})}
                  placeholder="linkedin.com/in/janedoe"
                  className="bg-secondary/50 border-border h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Professional Summary</Label>
                <Textarea 
                  value={tempProfile.summary}
                  onChange={(e) => setTempProfile({...tempProfile, summary: e.target.value})}
                  placeholder="Experienced GIS Analyst with..."
                  className="bg-secondary/50 border-border min-h-[120px] resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-4">                <div className="flex items-center justify-between border-b border-border pb-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Experience & Skills</Label>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Note: Full editing of individual roles and specific skills is currently done through the 'Clear' and 'Reset' buttons in the sidebar. Use the Professional Summary above to give the AI specific instructions for your 'voice'.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">

              <Button 
                variant="outline" 
                onClick={() => setShowProfileEdit(false)}
                className="px-6 h-12"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setUserProfile(tempProfile);
                  setShowProfileEdit(false);
                  toast.success("Profile updated! Your next generation will use these details.");
                }}
                className="px-10 h-12 shadow-lg shadow-primary/20 font-bold"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
