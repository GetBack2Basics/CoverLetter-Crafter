import React, { useState } from "react";
import { 
  Calendar, 
  Layers, 
  Table, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Building, 
  Plus, 
  Trash2, 
  X, 
  ChevronRight,
  AlertCircle,
  FileCode,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { JobRole } from "../types";

export function DashboardView({ 
  userProfile, 
  setActiveView, 
  roles,
  activeRoleId,
  setActiveRoleId,
  onCreateRole,
  onUpdateRoleStatus,
  onDeleteRole,
  setActiveWorkTab
}: { 
  userProfile: any;
  setActiveView: (view: "dashboard" | "cover" | "interview" | "work") => void;
  roles: JobRole[];
  activeRoleId: string;
  setActiveRoleId: (id: string) => void;
  onCreateRole: (companyName: string, jobTitle: string, jobDescription: string) => void;
  onUpdateRoleStatus: (id: string, status: JobRole["status"]) => void;
  onDeleteRole: (id: string) => void;
  setActiveWorkTab?: (tab: "slides" | "sheets" | "docs") => void;
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
        view: "work" as const,
        workTab: "slides" as const,
        icon: <Layers className="w-4 h-4 text-purple-600" />,
        bg: "bg-purple-50",
        label: "Task Presentation"
      },
      {
        name: "Operational Policy SOP",
        desc: "SOP brief, standard instructions or script for work task requirements.",
        status: !!activeRole.generatedDoc,
        view: "work" as const,
        workTab: "docs" as const,
        icon: <FileCode className="w-4 h-4 text-teal-600" />,
        bg: "bg-teal-50",
        label: "SOP Document"
      },
      {
        name: "Asset & Budget Spreadsheet Grid",
        desc: "Interactive tabular rows specifying coordinate grids or metadata summaries.",
        status: !!activeRole.generatedSheet,
        view: "work" as const,
        workTab: "sheets" as const,
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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#FAF9F6]">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-4 md:space-y-0">
        <div className="space-y-1">
          <p className="text-[10px] tracking-widest text-primary uppercase font-bold">WORKSPACE ANALYTICS</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Welcome Back, {userProfile.name || "Candidate"}!</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Manage your campaigns, track workspace files, and toggle interview cycles seamlessly.</p>
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
          <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-[#9c1c1c] font-bold">Campaigns list</p>
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
                          className="h-8 text-xs bg-white text-slate-800 font-medium"
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
                          className="h-8 text-xs bg-white text-slate-800 font-medium"
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
                        className="text-xs bg-white min-h-[70px] resize-none text-slate-800 font-medium"
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
                        className={`group p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
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
                          if ((asset as any).workTab && setActiveWorkTab) {
                            setActiveWorkTab((asset as any).workTab);
                          }
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
