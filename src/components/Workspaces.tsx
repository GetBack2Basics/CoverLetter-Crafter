import React, { useState } from "react";
import { 
  Calendar, 
  Layers, 
  Table, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Copy, 
  Printer, 
  ArrowRight, 
  FileCode, 
  Wand2, 
  Lightbulb, 
  User, 
  Download,
  Building,
  Check,
  Plus,
  Trash2,
  X,
  FileCheck,
  Volume2,
  Mic,
  MicOff,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { JobRole } from "../types";
import { evaluateInterviewResponse } from "../services/gemini";

// --------------------------------------------------------------------------
// 1. DASHBOARD VIEW COMPONENT
// --------------------------------------------------------------------------
export function DashboardView({ 
  userProfile, 
  setActiveView, 
  roles,
  activeRoleId,
  setActiveRoleId,
  onCreateRole,
  onUpdateRoleStatus,
  onDeleteRole
}: { 
  userProfile: any;
  setActiveView: (view: "dashboard" | "cover" | "interview" | "work") => void;
  roles: JobRole[];
  activeRoleId: string;
  setActiveRoleId: (id: string) => void;
  onCreateRole: (companyName: string, jobTitle: string, jobDescription: string) => void;
  onUpdateRoleStatus: (id: string, status: JobRole["status"]) => void;
  onDeleteRole: (id: string) => void;
}) {
  const [roleFilter, setRoleFilter] = useState<"incomplete" | "all">("incomplete");
  const [showCreator, setShowCreator] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const activeRole = roles.find((r) => r.id === activeRoleId);

  // Filter roles list
  const filteredRoles = roles.filter((role) => {
    if (roleFilter === "incomplete") {
      return role.status !== "Accepted" && role.status !== "Rejected";
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newTitle.trim()) {
      toast.error("Please provide both Company and Job Title");
      return;
    }
    onCreateRole(newCompany, newTitle, newDesc);
    toast.success(`Role for ${newCompany} created and set active!`);
    setNewCompany("");
    setNewTitle("");
    setNewDesc("");
    setShowCreator(false);
  };

  // Pre-calculate metrics for active campaign
  const checkAssets = () => {
    if (!activeRole) return { total: 0, completed: 0, items: [] };
    
    const items = [
      {
        name: "Tailored Cover Letter",
        desc: "Custom matching letter matching candidate profile experience.",
        status: !!activeRole.coverLetter,
        view: "cover" as const,
        icon: <FileText className="w-4 h-4 text-orange-600" />,
        bg: "bg-orange-50",
        label: "Cover Letter Hub"
      },
      {
        name: "STAR Mock Interview Q&A",
        desc: "Interactive behavioral questions and coaching scenarios.",
        status: !!activeRole.interviewPrepData,
        view: "interview" as const,
        icon: <GraduationCap className="w-4 h-4 text-blue-600" />,
        bg: "bg-blue-50",
        label: "Interview Prep"
      },
      {
        name: "Capability Presentation slides",
        desc: "Formatted slide previews with speaker scripts and structures.",
        status: !!activeRole.taskDraftOutput && activeRole.taskDraftOutput.outputType === "slides",
        view: "interview" as const,
        icon: <Layers className="w-4 h-4 text-purple-600" />,
        bg: "bg-purple-50",
        label: "Task Presentation"
      },
      {
        name: "Operational Policy SOP",
        desc: "SOP brief, standard instructions or script for work task requirements.",
        status: !!activeRole.generatedDoc,
        view: "work" as const,
        icon: <FileCode className="w-4 h-4 text-teal-600" />,
        bg: "bg-teal-50",
        label: "SOP Document"
      },
      {
        name: "Asset & Budget Spreadsheet Grid",
        desc: "Interactive tabular rows specifying coordinate grids or metadata summaries.",
        status: !!activeRole.generatedSheet,
        view: "work" as const,
        icon: <Table className="w-4 h-4 text-emerald-600" />,
        bg: "bg-emerald-50",
        label: "Sheets Matrix"
      }
    ];

    const completed = items.filter((i) => i.status).length;
    return { total: items.length, completed, items };
  };

  const assetMetrics = checkAssets();

  // Color-coded badges for status
  const getStatusBadge = (status: JobRole["status"]) => {
    switch (status) {
      case "Drafting":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Applied":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Interview Scheduled":
        return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
      case "Accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold shadow-sm";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FAF9F6]">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-4 md:space-y-0">
        <div className="space-y-1">
          <p className="text-[10px] tracking-widest text-primary uppercase font-bold">WORKSPACE ANALYTICS</p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back, {userProfile.name || "Candidate"}!</h2>
          <p className="text-sm text-muted-foreground">Manage your campaigns, track workspace files, and toggle interview cycles seamlessly.</p>
        </div>
        
        {activeRole && (
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-border shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div className="text-xs text-left">
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">ACTIVE SPECIFICATION</p>
              <p className="font-extrabold text-[#9c1c1c] truncate max-w-[150px]">{activeRole.companyName}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 cols: Campaigns Repository Selector */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Applications Campaigns
              </h3>
              <Button size="sm" variant="outline" onClick={() => setShowCreator(!showCreator)} className="h-8 py-0 px-2.5 text-xs">
                {showCreator ? <X className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                New Campaign
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">Create multiple job listings. Swapping the active role preloads all relevant cover letter configs, templates, mock interview guides, SOP drafts, and spreadsheet data.</p>
            
            {/* Inline Creation Form */}
            {showCreator && (
              <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-3.5 animate-in slide-in-from-top duration-300">
                <p className="text-[10px] uppercase font-bold text-gray-500">Create New Job Campaign</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="new-company" className="text-[9px] uppercase font-bold text-gray-500">Company Name</Label>
                      <Input 
                        id="new-company"
                        placeholder="e.g. NSW Rural Fire Service" 
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        className="h-8 text-xs bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-title" className="text-[9px] uppercase font-bold text-gray-500">Job Title</Label>
                      <Input 
                        id="new-title"
                        placeholder="e.g. Senior GIS Specialist" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="h-8 text-xs bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-desc" className="text-[9px] uppercase font-bold text-gray-500">Job Description Keywords / Raw Specs</Label>
                    <Textarea 
                      id="new-desc"
                      placeholder="Paste target description or specific selection specifications..." 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="text-xs bg-white min-h-[70px] resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowCreator(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-8 text-xs px-3 font-bold bg-primary uppercase tracking-wider text-white">
                    Create Campaign
                  </Button>
                </div>
              </form>
            )}

            {/* Incomplete / All Toggles */}
            <div className="grid grid-cols-2 gap-1 bg-secondary/40 p-1 rounded-lg">
              <button 
                onClick={() => setRoleFilter("incomplete")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  roleFilter === "incomplete" ? "bg-white text-[#9c1c1c] shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Incomplete Hunt
              </button>
              <button 
                onClick={() => setRoleFilter("all")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  roleFilter === "all" ? "bg-white text-[#9c1c1c] shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Campaigns ({roles.length})
              </button>
            </div>

            {/* Roles List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredRoles.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl text-gray-400 space-y-1">
                  <p className="text-xs font-medium">No job roles in this filter list</p>
                  <p className="text-[10px]">Toggle the filters or click 'New Campaign' above.</p>
                </div>
              ) : (
                filteredRoles.map((role) => {
                  const isActive = role.id === activeRoleId;
                  // count of generated items for indicators
                  const itemsCount = [
                    role.coverLetter,
                    role.interviewPrepData,
                    role.taskDraftOutput,
                    role.generatedDoc,
                    role.generatedSheet
                  ].filter(Boolean).length;

                  return (
                    <div 
                      key={role.id}
                      onClick={() => setActiveRoleId(role.id)}
                      className={`group p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative relative ${
                        isActive 
                          ? "bg-[#9c1c1c]/5 border-[#9c1c1c]/30 shadow-sm ring-1 ring-[#9c1c1c]/10" 
                          : "bg-white border-border hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1 pr-6 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-gray-500 block truncate max-w-[150px]">{role.companyName}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold font-mono tracking-wide ${getStatusBadge(role.status)}`}>
                            {role.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-primary transition-colors block leading-tight">{role.jobTitle}</h4>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-2">
                        <span className="text-[9px] text-gray-400 font-mono">Vault Assets: <span className="font-bold text-gray-700">{itemsCount} / 5</span></span>
                        
                        {/* Tiny Indicator dots/icons */}
                        <div className="flex items-center gap-1.5 text-gray-400 grayscale group-hover:grayscale-0 transition-all opacity-70">
                          {role.coverLetter && <span title="Cover Letter Ready"><FileText className="w-3 h-3 text-orange-500" /></span>}
                          {role.interviewPrepData && <span title="Interview Guidance Ready"><GraduationCap className="w-3 h-3 text-blue-500" /></span>}
                          {role.taskDraftOutput && <span title="Presentation Slide Deck Ready"><Layers className="w-3 h-3 text-purple-500" /></span>}
                          {role.generatedDoc && <span title="SOP ready"><FileCode className="w-3 h-3 text-teal-500" /></span>}
                          {role.generatedSheet && <span title="Data Sheet ready"><Table className="w-3 h-3 text-emerald-500" /></span>}
                        </div>
                      </div>

                      {/* Delete button (except for default RFS role so we preserve initial state) */}
                      {roles.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRole(role.id);
                          }}
                          className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 duration-200 text-gray-400 hover:text-red-500 p-0.5 rounded transition-all hover:bg-slate-100"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 7 cols: Campaign Hub Workspaces & Document Vault */}
        <div className="lg:col-span-7 space-y-6">
          {activeRole ? (
            <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-6">
              {/* Campaign Header Profile */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9.5px] font-bold text-[#c94141] uppercase tracking-widest font-mono">HUNT CAMPAIGN TARGET</span>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-snug">{activeRole.jobTitle}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    {activeRole.companyName} • Added {activeRole.createdDate}
                  </p>
                </div>

                {/* Status Picker Selector */}
                <div className="flex flex-col items-start gap-1">
                  <Label htmlFor="status-picker" className="text-[10px] uppercase font-bold text-gray-500 font-mono tracking-wider">Campaign Milestone State</Label>
                  <select
                    id="status-picker"
                    value={activeRole.status}
                    onChange={(e) => onUpdateRoleStatus(activeRole.id, e.target.value as JobRole["status"])}
                    className="rounded-lg border-2 border-border bg-[#FDFEFE] px-2.5 py-1 text-xs font-bold text-gray-800 transition-all select-none hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary h-8"
                  >
                    <option value="Drafting">Drafting Application Documents</option>
                    <option value="Applied">Submitted / Applied</option>
                    <option value="Interview Scheduled">Interview Scheduled / Task Release</option>
                    <option value="Accepted">Accepted / Success (Offer Received) 🎉</option>
                    <option value="Rejected">Rejected / Campaign Closed 🔕</option>
                  </select>
                </div>
              </div>

              {/* Progress and Requirements Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 font-mono">Vault Compilation Score</p>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-extrabold text-primary">{assetMetrics.completed}</span>
                    <span className="text-sm font-semibold text-gray-400">/ {assetMetrics.total} assets</span>
                  </div>
                  {/* Miniature progress bar */}
                  <div className="w-full bg-[#EAEAEA] h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${(assetMetrics.completed / assetMetrics.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 p-4 bg-[#FCF8E3]/60 border border-amber-200/60 rounded-xl flex items-start gap-3 text-left">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Target Requirements Summary</p>
                    <p className="text-xs text-amber-700 leading-relaxed font-sans line-clamp-3">
                      {activeRole.jobDescription || "No specific job description Keywords have been parsed. Complete the initial resume extraction flow in Cover Letter space to pull qualifications and compliance keywords from the job description!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Registry Files Vault List */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Active Document Registry Logs</h4>
                
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-[#FDFEFE] overflow-hidden">
                  {assetMetrics.items.map((asset, idx) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-transparent hover:bg-slate-50/50 duration-200">
                      <div className="flex gap-3 text-left">
                        <div className={`w-9 h-9 rounded-xl ${asset.bg} flex items-center justify-center shrink-0`}>
                          {asset.icon}
                        </div>
                        <div className="space-y-0.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-gray-800 font-sans">{asset.name}</span>
                            <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${
                              asset.status 
                                ? "bg-emerald-100/50 text-emerald-800 border-emerald-200" 
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}>
                              {asset.status ? "✓ COMPILATION READY" : "— PENDING DRAFT"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1">{asset.desc}</p>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        variant={asset.status ? "outline" : "default"} 
                        className={`h-8 text-xs font-bold uppercase tracking-wide shrink-0 ${
                          !asset.status ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => {
                          setActiveView(asset.view);
                          // Provide useful toast confirmation
                          if (asset.status) {
                            toast.success(`Loaded saved file into the ${asset.label}`);
                          } else {
                            toast.info(`Initialised document generation in the ${asset.label}`);
                          }
                        }}
                      >
                        {asset.status ? "Open & Edit" : "Begin Drafting"}
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special panel context: If this is the RFS active role, keep its interview timeline visible! */}
              {activeRole.id === "default-rfs-campaign" && (
                <div className="border border-blue-100 bg-blue-50/40 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-left">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest font-mono">NSW RFS Delivery Calendar Milestones</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed text-left">
                    "Meaghan Jenkins from NSW RFS has scheduled the Selection Panel presentation of **Capability Task 2** at **2:00 PM** follow-up with the core interview. Ensure standard SOP documents are compiled to local spreadsheet inventory matrix grids beforehand."
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 p-12 rounded-2xl text-center text-gray-400 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                <Briefcase className="w-7 h-7 opacity-30 text-gray-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-700">No Job Campaign Selected</h4>
                <p className="text-xs max-w-sm">Please choose an active role on the left panel campaign list, or add a custom campaign to track.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 2. INTERVIEW & CAPABILITY TASK PREPARATION VIEW COMPONENT
// --------------------------------------------------------------------------
export function InterviewView({
  userProfile,
  jobDescription,
  setJobDescription,
  coverLetter,
  interviewPrepData,
  isPrepGenerating,
  handleGeneratePrep,
  selectedQuestionIndex,
  setSelectedQuestionIndex,
  userStarsAnswers,
  setUserStarsAnswers,
}: {
  userProfile: any;
  jobDescription: string;
  setJobDescription?: (val: string) => void;
  coverLetter?: string;
  interviewPrepData: any;
  isPrepGenerating: boolean;
  handleGeneratePrep: () => void;
  selectedQuestionIndex: number;
  setSelectedQuestionIndex: (idx: number) => void;
  userStarsAnswers: Record<string, string>;
  setUserStarsAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
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

    // Pick Australian or English voice if available
    const voices = window.speechSynthesis.getVoices();
    const cleanVoice = voices.find(
      (v) => v.lang.includes("AU") || v.lang.includes("GB") || v.lang.includes("US")
    );
    if (cleanVoice) utterance.voice = cleanVoice;

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
        console.error(e);
        setIsListening(false);
        toast.error("Microphone access error. Check permissions and try again.");
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

    const currentQ = interviewPrepData?.questions[selectedQuestionIndex];
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
    if (interviewPrepData && selectedQuestionIndex < interviewPrepData.questions.length - 1) {
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

  const currentQuestion = interviewPrepData?.questions[selectedQuestionIndex];

  return (
    <div className="flex-1 flex overflow-hidden bg-[#FAF9F6]">
      {/* Left Input/Portfolio Setup Panel */}
      <aside className="w-[380px] border-r border-border bg-white flex flex-col gap-6 p-6 overflow-y-auto shrink-0">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#9c1c1c]">Active Interview Prep</p>
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
                <Label className="text-[10px] uppercase font-bold text-gray-600">Target Job Description</Label>
                <span className="text-[9px] font-mono text-muted-foreground">Linked context</span>
              </div>
              <Textarea
                placeholder="Paste the target job description details here. The AI will inspect this and your custom cover letter to synthesize highly relevant questions."
                value={jobDescription}
                onChange={(e) => setJobDescription?.(e.target.value)}
                className="min-h-[140px] text-xs resize-none"
              />
            </div>

            {coverLetter ? (
              <div className="bg-[#f0f9ff] border border-blue-100 rounded-xl p-3 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-[#1e5480] flex items-center gap-1.5">
                  <FileText className="w-3" /> Job Portfolio cover letter loaded
                </span>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-snug">
                  "{coverLetter.replace(/<[^>]*>/g, "")}"
                </p>
              </div>
            ) : (
              <div className="bg-[#fcf8e3] border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800">
                ⚠️ No cover letter drafted for this role. Defaulting purely to candidate profile.
              </div>
            )}

            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/40 text-left text-[11px] text-[#9c1c1c] leading-relaxed">
              <strong className="block mb-1">Tailored Selection Targeting</strong>
              The compiler generates situational technical testing matching key selection specifications exactly.
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
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

      {/* Main Interactive Stage */}
      <section className="flex-1 p-8 overflow-y-auto flex flex-col gap-6">
        {interviewPrepData ? (
          <div className="space-y-6 w-full max-w-4xl mx-auto">
            {/* Header Insight */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-2">
              <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                ALIGNMENT STRATEGY
              </span>
              <h3 className="text-xl font-bold text-gray-900">Custom Selection Alignment</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {interviewPrepData.insightSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Question list (Left Column of stage structure) */}
              <div className="md:col-span-4 space-y-2.5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">
                  PREP QUESTIONS
                </p>
                {interviewPrepData.questions.map((q: any, idx: number) => {
                  const practiced = practicedIndices[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedQuestionIndex(idx);
                        setPracticeText("");
                        setEvaluation(null);
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                      }}
                      className={`w-full p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
                        selectedQuestionIndex === idx
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-white border-border hover:bg-white/80"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#9c1c1c]">
                          {q.type} Question
                        </span>
                        {practiced && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" /> Practiced
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug mt-2">
                        {q.question}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Questionnaire Interactive Live Arena */}
              <div className="md:col-span-8 space-y-6">
                {/* Active Question Box */}
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4 relative">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#9c1c1c]">
                      {currentQuestion?.type.toUpperCase()} SPECIFICATION
                    </span>
                    <button
                      onClick={() =>
                        isSpeaking
                          ? stopSpeaking()
                          : speakQuestion(currentQuestion?.question || "")
                      }
                      className={`h-7 px-3 rounded-full border border-primary/20 text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isSpeaking
                          ? "bg-primary text-white scale-105"
                          : "bg-transparent text-primary hover:bg-primary/5"
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-bounce" : ""}`} />
                      {isSpeaking ? "Stop Speaking" : "Ask Question Aloud"}
                    </button>
                  </div>

                  <h4 className="text-base font-sans font-bold text-gray-900 leading-snug">
                    {currentQuestion?.question}
                  </h4>

                  {/* Coaching guide reference */}
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                      Recommended Answer Strategy
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{currentQuestion?.coachingTips}"
                    </p>
                  </div>
                </div>

                {/* Voice & Text Practice Region */}
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      🎤 Live Practice Voice Recorder
                    </h5>
                    {isListening && (
                      <span className="flex items-center gap-1.5 text-xs text-red-600 font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Recording Stream...
                      </span>
                    )}
                  </div>

                  {/* soundwave visual indicator */}
                  {isListening && (
                    <div className="flex items-center justify-center gap-1 bg-red-50/20 border border-red-100/30 rounded-xl h-10 animate-pulse">
                      <div className="w-1 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1 h-6 bg-red-500 rounded animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1 h-5 bg-red-500 rounded animate-bounce" style={{ animationDelay: "300ms" }} />
                      <div className="w-1 h-7 bg-red-500 rounded animate-bounce" style={{ animationDelay: "100ms" }} />
                      <div className="w-1 h-3 bg-red-500 rounded animate-bounce" style={{ animationDelay: "200ms" }} />
                      <div className="w-1 h-6 bg-red-500 rounded animate-bounce" style={{ animationDelay: "450ms" }} />
                    </div>
                  )}

                  <Textarea
                    placeholder="Speak your answer clearly using microphone, or type your response here directly. Construct your situational response using the STAR framework..."
                    value={practiceText}
                    onChange={(e) => setPracticeText(e.target.value)}
                    className="min-h-[140px] text-xs resize-none"
                  />

                  <div className="flex gap-3 pt-1">
                    <Button
                      variant={isListening ? "destructive" : "outline"}
                      onClick={toggleListening}
                      className="h-10 text-xs font-bold"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 mr-2" /> Stop Speaking
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 mr-2" /> Speak Answer
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleEvaluateResponse}
                      disabled={isEvaluating || !practiceText.trim()}
                      className="h-10 text-xs font-bold uppercase tracking-wider flex-1"
                    >
                      {isEvaluating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                      )}
                      ⚡ Evaluate Performance Response
                    </Button>
                  </div>
                </div>

                {/* Real-time AI Evaluation Screen */}
                {evaluation && (
                  <div className="bg-white border border-[#E9E9E9] rounded-2xl shadow-xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between border-b pb-3 border-border">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-gray-900 text-sm">STAR Practice scorecard</h4>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-[#FAF9F6] border px-3 py-1 rounded-full text-slate-800">
                        SCORE: <span className="text-primary text-sm font-black">{evaluation.score}</span> / 10
                      </div>
                    </div>

                    {/* Progress rating gauge */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          evaluation.score >= 8
                            ? "bg-emerald-500"
                            : evaluation.score >= 5
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${evaluation.score * 10}%` }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                          Constructive Critique
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-xl border">
                          {evaluation.critique}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                          Coaching Tips & Refinement Specs
                        </span>
                        <p className="text-xs text-[#7c5b1d] leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                          {evaluation.tips}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                            Polished Expert Response Blueprint
                          </span>
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => {
                              navigator.clipboard.writeText(evaluation.revisedAnswer);
                              toast.success("Polished answer copied!");
                            }}
                            className="text-xs h-6 px-1 font-bold decoration-transparent text-[#9c1c1c]"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" /> Copy Script
                          </Button>
                        </div>
                        <p className="text-xs text-gray-800 font-serif leading-relaxed bg-slate-900 text-slate-150 p-4 rounded-xl border italic">
                          "{evaluation.revisedAnswer}"
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          setPracticeText("");
                          setEvaluation(null);
                        }}
                        variant="outline"
                        className="text-xs h-10"
                      >
                        Try Practicing Again
                      </Button>
                      <Button onClick={markAsPracticed} className="text-xs h-10 font-bold uppercase">
                        🎉 Practiced Enough & Proceed
                      </Button>
                    </div>
                  </div>
                )}

                {/* Traditional Recommended Guide Drawer for Static Reference */}
                <div className="border border-border bg-white rounded-2xl p-6 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block border-b pb-2">
                    STAR STRUCTURAL REFERENCE
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">SITUATION:</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {currentQuestion?.starAnswer.situation}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">TASK:</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {currentQuestion?.starAnswer.task}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1 col-span-2">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">ACTION:</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {currentQuestion?.starAnswer.action}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1 col-span-2">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">RESULT:</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {currentQuestion?.starAnswer.result}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-4 min-h-[400px]">
            <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-8 h-8 opacity-30 text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-700">Live Voice Practice Arena Ready</p>
              <p className="text-xs max-w-sm">
                Paste the job description and click "Compile STAR Q&A Partner" to initialize behavioral & technical simulation questions mapped exactly to your portfolio cover letter.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// --------------------------------------------------------------------------
// 3. OPERATIONAL WORK TASKS & DATA GRID COMPONENT
// --------------------------------------------------------------------------
export function WorkView({
  userProfile,
  workTaskDesc,
  setWorkTaskDesc,
  selectedDocType,
  setSelectedDocType,
  generatedDoc,
  isDocGenerating,
  handleGenerateWorkDocument,
  sheetInput,
  setSheetInput,
  generatedSheet,
  isSheetGenerating,
  handleGenerateWorkSheet,
  taskInstructions,
  setTaskInstructions,
  taskDraftOutput,
  isTaskDrafting,
  handleGenerateTaskDraft,
  activeSlideIndex,
  setActiveSlideIndex,
}: {
  userProfile: any;
  workTaskDesc: string;
  setWorkTaskDesc: (val: string) => void;
  selectedDocType: string;
  setSelectedDocType: (val: string) => void;
  generatedDoc: string;
  isDocGenerating: boolean;
  handleGenerateWorkDocument: () => void;
  sheetInput: string;
  setSheetInput: (val: string) => void;
  generatedSheet: any;
  isSheetGenerating: boolean;
  handleGenerateWorkSheet: () => void;
  taskInstructions: string;
  setTaskInstructions: (val: string) => void;
  taskDraftOutput: any;
  isTaskDrafting: boolean;
  handleGenerateTaskDraft: (outputType: "slides" | "report") => void;
  activeSlideIndex: number;
  setActiveSlideIndex: (idx: number) => void;
}) {
  // Unified Output Format Blueprint State: "slides" | "sheets" | "docs"
  const [activeWorkTab, setActiveWorkTab] = useState<"slides" | "sheets" | "docs">("slides");

  // Local handler maps inputs dynamically so user views/edits a single unified prompt field
  const activePromptText =
    activeWorkTab === "slides"
      ? taskInstructions
      : activeWorkTab === "sheets"
      ? sheetInput
      : workTaskDesc;

  const handlePromptTextChange = (v: string) => {
    if (activeWorkTab === "slides") setTaskInstructions(v);
    else if (activeWorkTab === "sheets") setSheetInput(v);
    else setWorkTaskDesc(v);
  };

  const handleUnifiedGenerate = () => {
    if (activeWorkTab === "slides") {
      handleGenerateTaskDraft("slides");
    } else if (activeWorkTab === "sheets") {
      handleGenerateWorkSheet();
    } else if (activeWorkTab === "docs") {
      handleGenerateWorkDocument();
    }
  };

  const isAnyGenerating = isTaskDrafting || isSheetGenerating || isDocGenerating;

  // Grid editing helpers for Sheets Tab
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  React.useEffect(() => {
    if (generatedSheet && generatedSheet.rows) {
      setSheetRows(generatedSheet.rows);
    }
  }, [generatedSheet]);

  const handleCellEdit = (rIdx: number, cIdx: number, val: string) => {
    const updated = [...sheetRows];
    updated[rIdx][cIdx] = val;
    setSheetRows(updated);
  };

  const copySheetData = () => {
    if (!generatedSheet) return;
    const clipboardText = [
      generatedSheet.headers.join("\t"),
      ...sheetRows.map((row) => row.join("\t")),
    ].join("\n");
    navigator.clipboard.writeText(clipboardText);
    toast.success("Matrix TSV compiled (ready for Excel/Sheets copy-paste)!");
  };

  const copySlidesText = () => {
    if (!taskDraftOutput || !taskDraftOutput.slides) return;
    const slidesString = taskDraftOutput.slides
      .map(
        (s: any) =>
          `SLIDE ${s.slideNumber}: ${s.title}\n------------------------\n${s.content
            .map((c: any) => `• ${c}`)
            .join("\n")}\n\n[Presenter Script]: ${s.presenterNotes}\n`
      )
      .join("\n\n=======================\n\n");
    navigator.clipboard.writeText(slidesString);
    toast.success("Slides outline text script copied!");
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#FAF9F6]">
      {/* Left Unified Input Control Panel */}
      <aside className="w-[380px] border-r border-border bg-white flex flex-col gap-6 p-6 overflow-y-auto shrink-0">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#155724]">
            Unified Workspace
          </p>
          <h3 className="text-lg font-bold text-gray-900">Work Tasks Automation</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Translate complex assessment queries, and select slides, spreadsheet sheets, or professional document scripts.
          </p>
        </div>

        {/* Blueprint Output Selector */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-gray-500">Output Blueprint Format</Label>
          <div className="grid grid-cols-3 gap-1 bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveWorkTab("slides")}
              className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeWorkTab === "slides"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🖥️ Slides
            </button>
            <button
              onClick={() => setActiveWorkTab("sheets")}
              className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeWorkTab === "sheets"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📊 Sheets
            </button>
            <button
              onClick={() => setActiveWorkTab("docs")}
              className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeWorkTab === "docs"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📄 Docs
            </button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* If docs is chosen, show format template selection */}
            {activeWorkTab === "docs" && (
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-dashed">
                <Label className="text-[10px] uppercase font-bold text-gray-600">Document Template style</Label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background h-9 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="SOP Document">Standard Operating Procedure (SOP)</option>
                  <option value="GIS ArcPy Automation Script">Python GIS Automation Script</option>
                  <option value="Briefing Memo">Executive Briefing Memo</option>
                  <option value="Technical Guidelines">Technical Guidelines Spec Sheet</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-gray-600">
                Pasted Task / Assessment Instructions
              </Label>
              <Textarea
                placeholder={
                  activeWorkTab === "slides"
                    ? "Paste instructions (e.g. 'Capability Task 2 requires designing a 15-minute presentation covering GDA2020 coordinate updates, automated scripting workflows, and QA checking...')"
                    : activeWorkTab === "sheets"
                    ? "Paste data specs (e.g. 'NSW Coordinate datum tracking matrices, detailing compliance parameters, layer offsets, validation buffers...')"
                    : "Paste requirements (e.g. 'Standard Operating Procedure explaining satellite geodata intake conversion into high contrast imagery grids...')"
                }
                value={activePromptText}
                onChange={(e) => handlePromptTextChange(e.target.value)}
                className="min-h-[160px] text-xs resize-none"
              />
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/40 text-[11px] text-[#155724] leading-relaxed">
              <strong className="block mb-1">Interactive Asset Generation</strong>
              Translate assessment specs on the fly to support slides, spreadsheets, or technical briefings.
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Button
              onClick={handleUnifiedGenerate}
              disabled={isAnyGenerating || !activePromptText.trim()}
              className="w-full h-11 text-xs font-bold uppercase tracking-wider text-white bg-[#155724] hover:bg-[#114a1e]"
            >
              {isAnyGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  Generating asset...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Generate {activeWorkTab.toUpperCase()} Blueprint
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Right Stage Output Screen */}
      <section className="flex-1 p-8 overflow-y-auto flex flex-col gap-6">
        {/* Render SLIDES */}
        {activeWorkTab === "slides" && (
          taskDraftOutput ? (
            <div className="space-y-6 w-full max-w-4xl mx-auto anim-fade">
              {/* Top Action Bar */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                    SLIDES BLUEPRINT OUTLINE
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{taskDraftOutput.title}</h3>
                  <p className="text-xs text-muted-foreground">{taskDraftOutput.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copySlidesText} className="h-9 font-bold text-xs">
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy Outline
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Slide index switcher */}
                <div className="md:col-span-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#155724] mb-2">
                    Presentation Slides Navigation
                  </p>
                  {taskDraftOutput.slides?.map((slide: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 min-h-[64px] ${
                        activeSlideIndex === idx
                          ? "bg-emerald-50 border-emerald-500 shadow-sm"
                          : "bg-white border-border hover:bg-white/80"
                      }`}
                    >
                      <span className="font-mono text-xs text-emerald-700 font-bold">
                        0{slide.slideNumber}
                      </span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {slide.title}
                        </p>
                        <p className="text-[9px] text-muted-foreground truncate">
                          {slide.designSuggestion}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Simulated visual slide card mock frame */}
                <div className="md:col-span-8 space-y-4">
                  <div className="bg-slate-900 text-white p-10 rounded-2xl shadow-2xl min-h-[320px] flex flex-col justify-between border border-slate-800">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                        Operational Technical Presentation Pitch
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Slide 0{taskDraftOutput.slides?.[activeSlideIndex]?.slideNumber} of{" "}
                        {taskDraftOutput.slides?.length}
                      </span>
                    </div>

                    <div className="py-6 space-y-4">
                      <h4 className="text-xl font-sans font-bold tracking-tight text-white">
                        {taskDraftOutput.slides?.[activeSlideIndex]?.title}
                      </h4>
                      <ul className="space-y-2 text-slate-300">
                        {taskDraftOutput.slides?.[activeSlideIndex]?.content.map(
                          (bullet: string, i: number) => (
                            <li key={i} className="text-xs flex items-start gap-2.5 leading-relaxed">
                              <span className="text-emerald-400 mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{bullet}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Delivery Matrix Blueprint</span>
                      <span>CONFIDENTIAL - PROPRIETARY</span>
                    </div>
                  </div>

                  {/* Presenter scripts */}
                  <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#155724]" /> Presenter Spoken Voice Script
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed mt-2 p-3 bg-slate-50 rounded-lg border italic">
                        "{taskDraftOutput.slides?.[activeSlideIndex]?.presenterNotes}"
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Design suggestion</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {taskDraftOutput.slides?.[activeSlideIndex]?.designSuggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-4 min-h-[400px]">
              <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <Layers className="w-8 h-8 opacity-30 text-gray-400" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Presentation Slides Panel Ready</p>
                <p className="text-xs max-w-sm">
                  Paste the capability or assessment task query on the left pane and hit "Generate SLIDES Blueprint" to draft slides.
                </p>
              </div>
            </div>
          )
        )}

        {/* Render SHEETS */}
        {activeWorkTab === "sheets" && (
          generatedSheet ? (
            <div className="space-y-6 w-full max-w-5xl mx-auto anim-fade">
              {/* Sheets Top Title Card */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                    DATATABLE BLANKET MATRIX
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{generatedSheet.sheetTitle}</h3>
                  <p className="text-xs text-muted-foreground">{generatedSheet.sheetDescription}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copySheetData}
                    className="h-9 font-bold text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy TSV Grid (Excel ready)
                  </Button>
                </div>
              </div>

              {/* Data spreadsheet grid container */}
              <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden bg-[#fafafa]">
                <div className="bg-[#f3f3f3] border-b border-border px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono ml-4 select-none">
                      jobcrafter_metric_audit.xlsx
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs select-none">
                    <thead>
                      <tr className="bg-[#ECECEC] border-b border-border h-9">
                        <th className="w-10 text-center border-r border-border text-gray-400 font-mono text-[10px]"></th>
                        {generatedSheet.headers.map((h: string, idx: number) => (
                          <th
                            key={idx}
                            className="px-3 border-r border-border font-bold text-gray-700 font-sans tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.map((row: string[], rIdx: number) => (
                        <tr
                          key={rIdx}
                          className="bg-white border-b border border-border/60 hover:bg-emerald-50/20 group h-9 transition-colors"
                        >
                          <td className="text-center font-mono text-[9px] border-r border-border bg-[#F5F5F5] text-gray-500 font-bold select-none">
                            {rIdx + 1}
                          </td>
                          {row.map((cell: string, cIdx: number) => (
                            <td
                              key={cIdx}
                              className="px-3 border-r border-border font-mono text-gray-800 text-[11px] font-medium bg-transparent focus-within:bg-orange-50/20"
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleCellEdit(rIdx, cIdx, e.target.value)}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-[11px] font-mono h-6 transition-all"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}

                      {generatedSheet.summaryStats && (
                        <tr className="bg-emerald-50/40 border-b border-emerald-100 h-9 font-bold">
                          <td className="text-center font-mono text-[9px] border-r border-border bg-[#ECECEC] text-gray-500 font-bold">
                            ∑
                          </td>
                          <td className="px-3 border-r border-border font-sans uppercase tracking-widest text-[#155724] text-[10px] flex items-center h-9">
                            {generatedSheet.summaryStats.label}
                          </td>
                          <td
                            colSpan={generatedSheet.headers.length - 1}
                            className="px-3 border-r border-border font-mono text-[#0f3d1a] font-bold text-right text-[11px]"
                          >
                            {generatedSheet.summaryStats.value}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sheet Insights Footer */}
              <div className="border border-emerald-200 bg-emerald-50/30 p-5 rounded-2xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                    Data Logic Summary
                  </h5>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    {generatedSheet.professionalInsight}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-4 min-h-[400px]">
              <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                <Table className="w-8 h-8 opacity-30 text-gray-400" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Database Spreadsheet Grid Panel Ready</p>
                <p className="text-xs max-w-sm">
                  Paste the structural coordinates or matrix data instructions on the left pane and select "Generate SHEETS Blueprint".
                </p>
              </div>
            </div>
          )
        )}

        {/* Render DOCS */}
        {activeWorkTab === "docs" && (
          generatedDoc ? (
            <div className="space-y-6 w-full max-w-4xl mx-auto anim-fade">
              {/* Docs Top bar */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                    {selectedDocType.toUpperCase()} OUTLINE BRIEF
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">Standard Operational Protocol</h3>
                  <p className="text-xs text-muted-foreground">Polished documentation script ready for export.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDoc);
                      toast.success("Markdown documentation copied!");
                    }}
                    className="h-9 font-bold text-xs"
                  >
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy Markdown
                  </Button>
                </div>
              </div>

              {/* Main Document Body */}
              <div className="bg-white border border-border p-10 rounded-2xl shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                  <ReactMarkdown>{generatedDoc}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-4 min-h-[400px]">
              <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <FileCode className="w-8 h-8 opacity-30 text-gray-400" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Polished Corporate Document Ready</p>
                <p className="text-xs max-w-sm">
                  Pasted task details on the left controls and choose standard document templates then trigger "Generate DOCS Blueprint".
                </p>
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}

