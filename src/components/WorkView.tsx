import React, { useState } from "react";
import { 
  FileText, 
  Layers, 
  Table, 
  FileCode, 
  Copy, 
  Lightbulb,
  Loader2,
  Sparkles,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  Image,
  Video,
  Monitor,
  Check,
  Trash2,
  Plus,
  Globe,
  Edit2,
  Trash,
  Linkedin
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

function getVisualPrompts(jobDescription: string, activeWorkTab: string) {
  const desc = (jobDescription || "").toLowerCase();
  
  // 1. NSW Rural Fire Service
  if (desc.includes("fire") || desc.includes("rfs") || desc.includes("rural fire")) {
    return {
      title: "NSW Rural Fire Service - GIS Campaign",
      imageCover: "A high-impact professional title slide graphic. A high-tech bushfire incident command center in Sydney, with large geospatial digital map walls showing active telemetry tracking corridors and GDA2020 coordinate systems. Photographic, clean corporate style, 16:9 aspect ratio, soft warm control room lighting, ultra realistic.",
      imageScreenshot: "A detailed software dashboard screenshot mockup showing a Python-powered QGIS or ArcGIS interface. A panel on the left displays active sensors, GDA94 to GDA2020 conversions, and 100m buffer zones around woodland parcels in Blue Mountains. Clean UI design, modern dark mode dashboard, high-resolution vector layout, crisp typography.",
      videoDemo: "A cinematic video sequence of a Drone mapping payload being launched from a Rural Fire Service command vehicle at sunrise. The camera pans smoothly across the operator's digital telemetry pad showing real-time GPS coordinates and drone hazard classification sweeps. Professional 4K drone cinematography style."
    };
  }
  
  // 2. DCCEEW / Forestry LiDAR
  if (desc.includes("climate") || desc.includes("forestry") || desc.includes("lidar") || desc.includes("canopy")) {
    return {
      title: "Department of Climate Change (DCCEEW) Campaign",
      imageCover: "A striking environmental remote sensing concept. A high-altitude drone flying over lush Australian eucalyptus forest canopy, scanning the foliage with light beam lasers to represent LiDAR forestry audit points. Photorealistic, sunrise lighting, vibrant greens, highly technical overlay.",
      imageScreenshot: "A high-resolution screenshot mockup of a LiDAR density auditing interface. The screen displays a complex 3D point-cloud of tree trunks, heights, and bushfire risk indices. Minimalist geospatial web interface with a sidebar containing forest density charts and classification legends.",
      videoDemo: "Cinematic 4K drone video showing a flight survey across the rugged NSW conservation zones. Visible laser raster grids sweep over forest boundaries, showing remote sensing data collection in real-time."
    };
  }

  // 3. Tablelands Regional Council
  if (desc.includes("council") || desc.includes("drainage") || desc.includes("tablelands")) {
    return {
      title: "Tablelands Regional Council Campaign",
      imageCover: "A clean municipal asset audit graphic. A professional surveyor working alongside a regional Australian highway, holding a tablet displaying drainage structure mapping overlays and community utilities. Elegant daylight, clean professional composition.",
      imageScreenshot: "A spatial interface mockup tracking municipal water gates and drainage coordinates on a detailed community map. Features a list of asset conditions, GITA community indices alignment, and interactive survey points.",
      videoDemo: "A smooth panning video of an engineer navigating municipal GITA layers on a rugged tablet, and pointing to drainage valves in the suburban streets."
    };
  }

  // 4. Acme Forestry
  if (desc.includes("acme") || desc.includes("junior gis") || desc.includes("woodland parcel")) {
    return {
      title: "Acme Forestry Geospatial Developer",
      imageCover: "A modern technical cover art. Overlap of python code lines on a transparent background over a detailed vector map showing buffering zones and parcel plots in forestry layouts. Corporate developer style.",
      imageScreenshot: "A developer workspace showing VS Code with a Python script utilizing shapely and geopandas libraries for land parcel buffering. A sidebar visualizes the generated 50m woodland hazard buffers.",
      videoDemo: "A close-up video of code execution in a terminal, running a buffering script and printing logs as the geospatial layers render on a side screen."
    };
  }

  // 5. General / Dynamic Fallback
  return {
    title: "Dynamic Role Graphic Requirements",
    imageCover: "A professional corporate title graphics concept styled with sophisticated workflow charts, data layer symbols, and high-tech digital elements. High-contrast, clean corporate styling, 16:9 widescreen layout suitable for a executive slide deck.",
    imageScreenshot: "A detailed product interface screenshot mockup of a professional enterprise software dashboard. Displays active performance metric grids, interactive chart data visualizations, and sidebar process navigation. Tech-forward modern UI design, crisp sans-serif typography, highly detailed.",
    videoDemo: "Cinematic close-up of a high-tech workplace, featuring seamless camera panning across active monitors displaying rich analytics graphs and operational plans. 4K, realistic depth of field, corporate training presentation feel."
  };
}

export function WorkView({
  userProfile,
  jobDescription = "",
  setJobDescription,
  workTaskDesc,
  setWorkTaskDesc,
  selectedDocType,
  setSelectedDocType,
  generatedDoc,
  setGeneratedDoc,
  isDocGenerating,
  handleGenerateWorkDocument,
  sheetInput,
  setSheetInput,
  generatedSheet,
  setGeneratedSheet,
  isSheetGenerating,
  handleGenerateWorkSheet,
  taskInstructions,
  setTaskInstructions,
  taskDraftOutput,
  setTaskDraftOutput,
  isTaskDrafting,
  handleGenerateTaskDraft,
  activeSlideIndex,
  setActiveSlideIndex,
  activeWorkTab,
  setActiveWorkTab,
  workSources,
  setWorkSources,
}: {
  userProfile: any;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  workTaskDesc: string;
  setWorkTaskDesc: (val: string) => void;
  selectedDocType: string;
  setSelectedDocType: (val: string) => void;
  generatedDoc: string;
  setGeneratedDoc: (val: string) => void;
  isDocGenerating: boolean;
  handleGenerateWorkDocument: (isRefinement?: boolean, refinementText?: string, selectedText?: string) => void;
  sheetInput: string;
  setSheetInput: (val: string) => void;
  generatedSheet: any;
  setGeneratedSheet: (val: any) => void;
  isSheetGenerating: boolean;
  handleGenerateWorkSheet: (isRefinement?: boolean, refinementText?: string, selectedText?: string) => void;
  taskInstructions: string;
  setTaskInstructions: (val: string) => void;
  taskDraftOutput: any;
  setTaskDraftOutput: (val: any) => void;
  isTaskDrafting: boolean;
  handleGenerateTaskDraft: (outputType: "slides" | "report", isRefinement?: boolean, refinementText?: string, selectedText?: string) => void;
  activeSlideIndex: number;
  setActiveSlideIndex: (idx: number) => void;
  activeWorkTab: "slides" | "sheets" | "docs";
  setActiveWorkTab: (tab: "slides" | "sheets" | "docs") => void;
  workSources: Array<{ id: string; type: 'link' | 'file'; name: string }>;
  setWorkSources: (val: any) => void;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // States to toggle edit mode in each tab
  const [isEditingSlides, setIsEditingSlides] = useState(false);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [isEditingSheetHeader, setIsEditingSheetHeader] = useState(false);

  // AI Refinement Loops
  const [workSelectedText, setWorkSelectedText] = useState("");
  const [workRefinementText, setWorkRefinementText] = useState("");

  // Source additions
  const [showAddWorkSource, setShowAddWorkSource] = useState(false);
  const [newWorkSourceName, setNewWorkSourceName] = useState("");
  const [newWorkSourceType, setNewWorkSourceType] = useState<'link' | 'file'>('link');
  const [editingWorkSourceId, setEditingWorkSourceId] = useState<string | null>(null);
  const [editWorkSourceName, setEditWorkSourceName] = useState("");

  // Handler for adding dynamic reference documents / links
  const handleAddWorkSource = () => {
    if (!newWorkSourceName.trim()) return;
    const newSource = {
      id: Math.random().toString(36).substring(2, 11),
      type: newWorkSourceType,
      name: newWorkSourceName.trim()
    };
    setWorkSources([...workSources, newSource]);
    setNewWorkSourceName("");
    setShowAddWorkSource(false);
    toast.success("Reference source added!");
  };

  const handleDeleteWorkSource = (id: string) => {
    setWorkSources(workSources.filter((s: any) => s.id !== id));
    toast.success("Reference source deleted.");
  };

  const handleSaveEditWorkSource = () => {
    if (!editingWorkSourceId || !editWorkSourceName.trim()) return;
    setWorkSources(workSources.map((s: any) => s.id === editingWorkSourceId ? { ...s, name: editWorkSourceName } : s));
    setEditingWorkSourceId(null);
    setEditWorkSourceName("");
    toast.success("Reference source updated!");
  };

  const handleWorkTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
      if (text) {
        setWorkSelectedText(text);
        toast.info(`Selection target set!`, {
          description: `"${text.substring(0, 30)}..." marked for AI refinement instructions.`
        });
      }
    }
  };

  // Slides Layout & Content Editing Handlers
  const handleUpdateDeckTitle = (val: string) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    setTaskDraftOutput({
      ...taskDraftOutput,
      title: val
    });
  };

  const handleUpdateDeckSubtitle = (val: string) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    setTaskDraftOutput({
      ...taskDraftOutput,
      subtitle: val
    });
  };

  const handleUpdateSlideTitle = (slideIdx: number, val: string) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    const slides = [...(taskDraftOutput.slides || [])];
    if (slides[slideIdx]) {
      slides[slideIdx] = {
        ...slides[slideIdx],
        title: val
      };
      setTaskDraftOutput({
        ...taskDraftOutput,
        slides
      });
    }
  };

  const handleUpdateSlideBullet = (slideIdx: number, bulletIdx: number, val: string) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    const slides = [...(taskDraftOutput.slides || [])];
    if (slides[slideIdx]) {
      const content = [...(slides[slideIdx].content || [])];
      content[bulletIdx] = val;
      slides[slideIdx] = {
        ...slides[slideIdx],
        content
      };
      setTaskDraftOutput({
        ...taskDraftOutput,
        slides
      });
    }
  };

  const handleAddSlideBullet = (slideIdx: number) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    const slides = [...(taskDraftOutput.slides || [])];
    if (slides[slideIdx]) {
      const content = [...(slides[slideIdx].content || []), "New bullet point"];
      slides[slideIdx] = {
        ...slides[slideIdx],
        content
      };
      setTaskDraftOutput({
        ...taskDraftOutput,
        slides
      });
    }
  };

  const handleRemoveSlideBullet = (slideIdx: number, bulletIdx: number) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    const slides = [...(taskDraftOutput.slides || [])];
    if (slides[slideIdx]) {
      const content = (slides[slideIdx].content || []).filter((_: any, i: number) => i !== bulletIdx);
      slides[slideIdx] = {
        ...slides[slideIdx],
        content
      };
      setTaskDraftOutput({
        ...taskDraftOutput,
        slides
      });
    }
  };

  const handleUpdateSlideNotes = (slideIdx: number, val: string) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    const slides = [...(taskDraftOutput.slides || [])];
    if (slides[slideIdx]) {
      slides[slideIdx] = {
        ...slides[slideIdx],
        presenterNotes: val
      };
      setTaskDraftOutput({
        ...taskDraftOutput,
        slides
      });
    }
  };

  const handleUpdateSlideDesign = (slideIdx: number, val: string) => {
    if (!taskDraftOutput || !setTaskDraftOutput) return;
    const slides = [...(taskDraftOutput.slides || [])];
    if (slides[slideIdx]) {
      slides[slideIdx] = {
        ...slides[slideIdx],
        designSuggestion: val
      };
      setTaskDraftOutput({
        ...taskDraftOutput,
        slides
      });
    }
  };

  // Visual Assets & Prompt Library States
  const [coverPrompt, setCoverPrompt] = useState("");
  const [screenshotPrompt, setScreenshotPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");

  const [copiedCover, setCopiedCover] = useState(false);
  const [copiedScreenshot, setCopiedScreenshot] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [copiedSlidePrompt, setCopiedSlidePrompt] = useState(false);

  React.useEffect(() => {
    const fresh = getVisualPrompts(jobDescription, activeWorkTab);
    setCoverPrompt(fresh.imageCover);
    setScreenshotPrompt(fresh.imageScreenshot);
    setVideoPrompt(fresh.videoDemo);
  }, [jobDescription, activeWorkTab]);

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

  const handleUnifiedGenerate = (isRefinement = false) => {
    if (activeWorkTab === "slides") {
      handleGenerateTaskDraft("slides", isRefinement, isRefinement ? workRefinementText : undefined, isRefinement ? workSelectedText : undefined);
    } else if (activeWorkTab === "sheets") {
      handleGenerateWorkSheet(isRefinement, isRefinement ? workRefinementText : undefined, isRefinement ? workSelectedText : undefined);
    } else if (activeWorkTab === "docs") {
      handleGenerateWorkDocument(isRefinement, isRefinement ? workRefinementText : undefined, isRefinement ? workSelectedText : undefined);
    }
    setWorkRefinementText("");
    setWorkSelectedText("");
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
    if (updated[rIdx]) {
      updated[rIdx] = [...updated[rIdx]];
      updated[rIdx][cIdx] = val;
    }
    setSheetRows(updated);
    if (generatedSheet && setGeneratedSheet) {
      setGeneratedSheet({
        ...generatedSheet,
        rows: updated
      });
    }
  };

  const copySheetData = () => {
    if (!generatedSheet) return;
    const clipboardText = [
      generatedSheet.headers.join("\t"),
      ...sheetRows.map((row) => row.join("\t")),
      "",
      "[CONCLUDING AI STATEMENT]",
      "The author(s) utilized artificial intelligence to optimize internal administrative efficiencies, such as compiling trends and spatial information. In alignment with national responsible AI frameworks, we do not deploy AI for automated decision-making. Human oversight is strictly maintained for all outcomes affecting the community."
    ].join("\n");
    navigator.clipboard.writeText(clipboardText);
    toast.success("Matrix TSV compiled (including concluding AI Statement)!");
  };

  const renderAIRefinementCard = () => {
    return (
      <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse animate-none" />
            <span className="text-xs font-bold uppercase tracking-wider font-sans">
              ✨ Executive AI Refinement Loop
            </span>
          </div>
          <span className="text-[10px] text-emerald-700/80 font-medium font-sans">
            💡 Highlight (drag-select) any text inside the blueprint to target specific updates!
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-2 relative">
          <div className="flex-1 relative">
            <Input 
              placeholder={
                workSelectedText 
                  ? `Prompting AI to rewrite selected portion: "${workSelectedText.substring(0, 45)}..."` 
                  : `Instruct AI to regenerate or change sections of this ${activeWorkTab} (e.g. 'Add details of the Sloan/HBR guidelines', 'Change slide 2 titles', 'Clarify datum calculations')`
              }
              value={workRefinementText}
              onChange={(e) => setWorkRefinementText(e.target.value)}
              className="bg-white border-emerald-200 h-10 pr-10 text-xs text-slate-800 font-sans focus-visible:ring-emerald-500"
              onKeyDown={(e) => e.key === 'Enter' && workRefinementText.trim() && handleUnifiedGenerate(true)}
            />
            {workSelectedText && (
              <div className="absolute -top-6 left-0 flex items-center gap-2">
                <span className="text-[9px] bg-emerald-100/70 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1 font-semibold font-sans">
                  🎯 Selection Target Engaged
                  <button onClick={() => setWorkSelectedText("")} className="hover:text-destructive font-bold ml-1 text-[11px] leading-none">×</button>
                </span>
              </div>
            )}
          </div>
          <Button 
            onClick={() => handleUnifiedGenerate(true)}
            disabled={isAnyGenerating || !workRefinementText.trim()}
            className="h-10 px-5 text-xs font-bold bg-[#155724] text-white hover:bg-[#114a1e]"
          >
            {isAnyGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Refine with AI
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const copySlidesText = () => {
    if (!taskDraftOutput || !taskDraftOutput.slides) return;
    const slidesString = taskDraftOutput.slides
      .map(
        (s: any) =>
          `SLIDE ${s.slideNumber}: ${s.title}\n------------------------\n${s.content
            .map((c: any) => `• ${c}`)
            .join("\n")}\n\n[Slide Image Suggestion]: ${s.designSuggestion || "None"}\n`
      )
      .join("\n\n=======================\n\n");
    navigator.clipboard.writeText(slidesString);
    toast.success("Slides outline (Content & Image Suggestions) copied!");
  };

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
          Show Work Controls
        </Button>
      )}

      {/* Left Unified Input Control Panel */}
      {!isSidebarCollapsed && (
        <aside className="w-full md:w-[350px] lg:w-[380px] border-b md:border-b-0 md:border-r border-border bg-white flex flex-col gap-6 p-6 overflow-y-auto shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 text-muted-foreground hover:text-primary p-0 h-auto w-auto"
                  title="Hide Work Controls"
                  onClick={() => setIsSidebarCollapsed(true)}
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#155724]">
                  Unified Workspace
                </p>
              </div>
            </div>
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
                  ? "bg-white text-primary shadow-sm font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🖥️ Slides
            </button>
            <button
              onClick={() => setActiveWorkTab("sheets")}
              className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeWorkTab === "sheets"
                  ? "bg-white text-primary shadow-sm font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📊 Sheets
            </button>
            <button
              onClick={() => setActiveWorkTab("docs")}
              className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeWorkTab === "docs"
                  ? "bg-white text-primary shadow-sm font-extrabold"
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
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-dashed text-left">
                <Label className="text-[10px] uppercase font-bold text-gray-600">Document Template style</Label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background h-9 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-semibold"
                >
                  <option value="SOP Document font-semibold">Standard Operating Procedure (SOP)</option>
                  <option value="GIS ArcPy Automation Script font-semibold">Python GIS Automation Script</option>
                  <option value="Briefing Memo font-semibold">Executive Briefing Memo</option>
                  <option value="Technical Guidelines font-semibold">Technical Guidelines Spec Sheet</option>
                </select>
              </div>
            )}

            <div className="space-y-2 text-left bg-slate-50/60 p-3 rounded-xl border border-border">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase font-bold text-gray-600">
                  Original Job Role Description
                </Label>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold font-sans">
                  Editable
                </span>
              </div>
              <Textarea
                placeholder="Edit original job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[85px] max-h-[140px] text-xs resize-y text-slate-800 font-medium bg-white"
              />
            </div>

            <div className="space-y-2 text-left">
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
                className="min-h-[160px] text-xs resize-none text-slate-800 font-medium bg-white"
              />
            </div>

            {/* Reference Sources & URLs Panel */}
            <div className="space-y-2 border-t pt-4 text-left">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                  📁 Reference Sources & URLs
                </Label>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 text-emerald-700 hover:text-emerald-950 p-0"
                  title="Add Reference"
                  onClick={() => {
                    setNewWorkSourceType("link");
                    setShowAddWorkSource(!showAddWorkSource);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              {showAddWorkSource && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg space-y-2 mt-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800">Add New Reference Source</span>
                  <div className="grid grid-cols-2 gap-1 bg-white p-0.5 rounded border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setNewWorkSourceType("link")}
                      className={`py-1 text-[9px] font-bold rounded ${newWorkSourceType === "link" ? "bg-emerald-100 text-emerald-800 font-extrabold" : "text-muted-foreground"}`}
                    >
                      🔗 Link / URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewWorkSourceType("file")}
                      className={`py-1 text-[9px] font-bold rounded ${newWorkSourceType === "file" ? "bg-emerald-100 text-emerald-800 font-extrabold" : "text-muted-foreground"}`}
                    >
                      📂 Document / File
                    </button>
                  </div>
                  <div className="flex gap-1 justify-between">
                    <Input
                      placeholder={newWorkSourceType === "link" ? "Type Link/URL (e.g., https://...)" : "Type Document name (e.g., Guidebook.pdf)"}
                      value={newWorkSourceName}
                      onChange={(e) => setNewWorkSourceName(e.target.value)}
                      className="h-7 text-[10px] bg-white border border-emerald-200 flex-1 min-w-0"
                    />
                    <Button size="sm" className="h-7 px-2 text-[10px] bg-[#155724] text-white hover:bg-[#114a1e] shrink-0" onClick={handleAddWorkSource}>Add</Button>
                  </div>
                </div>
              )}

              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 py-1">
                {workSources.map((source: any) => (
                  <div key={source.id} className="bg-slate-50 border border-slate-200/60 p-2 rounded flex flex-col gap-1 group hover:bg-slate-100/50 transition-colors">
                    {editingWorkSourceId === source.id ? (
                      <div className="space-y-2 w-full">
                        <Input 
                          value={editWorkSourceName}
                          onChange={(e) => setEditWorkSourceName(e.target.value)}
                          className="h-7 text-[11px] bg-background"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEditWorkSource()}
                        />
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" className="h-6 text-[9px] px-2 bg-emerald-700 text-white hover:bg-emerald-800" onClick={handleSaveEditWorkSource}>Save</Button>
                          <Button size="sm" variant="ghost" className="h-6 text-[9px] px-2" onClick={() => setEditingWorkSourceId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        {source.type === 'link' ? <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                        <span 
                          className="text-[10px] text-slate-700 truncate flex-1 font-mono hover:underline cursor-pointer" 
                          title={source.name}
                        >
                          {source.name}
                        </span>
                        <div className="flex items-center gap-1 opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Edit2 
                            className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary" 
                            onClick={() => {
                              setEditingWorkSourceId(source.id);
                              setEditWorkSourceName(source.name);
                            }}
                          />
                          <Trash 
                            className="w-3 h-3 text-destructive cursor-pointer hover:text-destructive/80" 
                            onClick={() => handleDeleteWorkSource(source.id)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {workSources.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">No reference URLs or documents added yet.</span>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/40 text-[11px] text-[#155724] leading-relaxed text-left">
              <strong className="block mb-1">Interactive Asset Generation</strong>
              Translate assessment specs on the fly to support slides, spreadsheets, or technical briefings.
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Button
              onClick={() => handleUnifiedGenerate(false)}
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
      )}

      {/* Right Stage Output Screen */}
      <section className={`flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6 bg-[#FAF9F6] ${isSidebarCollapsed ? 'pt-16 md:pt-8' : ''}`}>
        {/* Render SLIDES */}
        {activeWorkTab === "slides" && (
          taskDraftOutput ? (
            <div onMouseUp={handleWorkTextSelection} className="space-y-6 w-full max-w-4xl mx-auto text-left">
              {/* Top Action Bar */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 w-full">
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest block w-max">
                    SLIDES BLUEPRINT OUTLINE
                  </span>
                  {isEditingSlides ? (
                    <div className="space-y-2 w-full max-w-xl">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-gray-500 uppercase">Presentation Title</Label>
                        <Input
                          value={taskDraftOutput.title || ""}
                          onChange={(e) => handleUpdateDeckTitle(e.target.value)}
                          className="h-8 text-sm font-bold text-slate-800 bg-slate-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-gray-500 uppercase">Presentation Subtitle</Label>
                        <Input
                          value={taskDraftOutput.subtitle || ""}
                          onChange={(e) => handleUpdateDeckSubtitle(e.target.value)}
                          className="h-8 text-xs font-semibold text-slate-600 bg-slate-50"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-901">{taskDraftOutput.title}</h3>
                      <p className="text-xs text-muted-foreground">{taskDraftOutput.subtitle}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
                  <Button
                    size="sm"
                    variant={isEditingSlides ? "secondary" : "outline"}
                    onClick={() => setIsEditingSlides(!isEditingSlides)}
                    className="h-9 font-bold text-xs bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                  >
                    {isEditingSlides ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Done Editing
                      </>
                    ) : (
                      <>
                        <span className="mr-1">✏️</span> Edit Layout Text
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={copySlidesText} className="h-9 font-bold text-xs bg-white text-slate-700">
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy Outline
                  </Button>
                </div>
              </div>

              {renderAIRefinementCard()}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Slide index switcher */}
                <div className="md:col-span-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#155724] mb-2 font-sans">
                    Presentation Slides Navigation
                  </p>
                  {taskDraftOutput.slides?.map((slide: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 min-h-[64px] cursor-pointer ${
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
                        <p className="text-[9px] text-muted-foreground truncate font-sans">
                          {slide.designSuggestion}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Simulated visual slide card mock frame */}
                <div className="md:col-span-8 space-y-4">
                  <div className="bg-slate-900 text-white p-6 md:p-10 rounded-2xl shadow-2xl min-h-[320px] flex flex-col justify-between border border-slate-850">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">
                        Operational Technical Presentation Pitch
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Slide 0{taskDraftOutput.slides?.[activeSlideIndex]?.slideNumber} of{" "}
                        {taskDraftOutput.slides?.length}
                      </span>
                    </div>

                    <div className="py-6 space-y-4 text-left">
                      {isEditingSlides ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-emerald-400 uppercase">Slide Title</Label>
                            <Input
                              value={taskDraftOutput.slides?.[activeSlideIndex]?.title || ""}
                              onChange={(e) => handleUpdateSlideTitle(activeSlideIndex, e.target.value)}
                              className="bg-slate-800 text-white border-slate-700 font-bold h-9 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-emerald-400 uppercase block">Slide Bullets (Max 3 for minimal impact)</Label>
                            {(taskDraftOutput.slides?.[activeSlideIndex]?.content || []).map((bullet: string, i: number) => (
                              <div key={i} className="flex gap-2 items-center">
                                <span className="text-emerald-400 font-mono text-xs w-4">0{i+1}.</span>
                                <Input
                                  value={bullet}
                                  onChange={(e) => handleUpdateSlideBullet(activeSlideIndex, i, e.target.value)}
                                  className="bg-slate-800 text-slate-200 border-slate-700 h-8 text-xs flex-1"
                                />
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleRemoveSlideBullet(activeSlideIndex, i)}
                                  className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-slate-800"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                            {(taskDraftOutput.slides?.[activeSlideIndex]?.content || []).length < 5 && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleAddSlideBullet(activeSlideIndex)}
                                className="h-7 border-emerald-800/60 text-emerald-400 hover:bg-slate-800 font-bold text-[10px] mt-1"
                              >
                                <Plus className="w-3 h-3 mr-1.5" /> Add Bullet Point
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Delivery Matrix Blueprint</span>
                      <span>CONFIDENTIAL - PROPRIETARY</span>
                    </div>
                  </div>

                  {/* Presenter scripts & Visual Asset Prompt Generator */}
                  <div className="space-y-4">
                    {/* Presenter Speech script */}
                    <div className="bg-white border border-border p-5 rounded-2xl shadow-sm text-left">
                      <p className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5 font-sans mb-2">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Presenter Spoken Voice Script
                      </p>
                      {isEditingSlides ? (
                        <Textarea
                          value={taskDraftOutput.slides?.[activeSlideIndex]?.presenterNotes || ""}
                          onChange={(e) => handleUpdateSlideNotes(activeSlideIndex, e.target.value)}
                          className="text-xs min-h-[90px] bg-slate-50 border-slate-200 text-slate-800 font-sans"
                          placeholder="Type script guidelines for presentation delivery..."
                        />
                      ) : (
                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 italic text-xs text-slate-800 leading-relaxed font-sans">
                          "{taskDraftOutput.slides?.[activeSlideIndex]?.presenterNotes || "Drafting spoken points..."}"
                        </div>
                      )}
                    </div>

                    {/* Integrated Per-Slide Graphic and Visual Creator Prompt */}
                    <div className="bg-white border border-border p-5 rounded-2xl shadow-sm text-left space-y-3.5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center border border-sky-100">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 font-sans">Slide Visuals Creator Prompt</p>
                            <p className="text-[9px] text-muted-foreground font-sans">Optimized code & layout text for Duet AI / Google Slides AI & Gemini</p>
                          </div>
                        </div>
                        
                        <Button
                          size="xs"
                          variant={copiedSlidePrompt ? "secondary" : "outline"}
                          onClick={() => {
                            const promptText = taskDraftOutput.slides?.[activeSlideIndex]?.designSuggestion || "";
                            navigator.clipboard.writeText(promptText);
                            toast.success(`Slide ${taskDraftOutput.slides?.[activeSlideIndex]?.slideNumber || 1} image generation prompt copied successfully!`);
                            setCopiedSlidePrompt(true);
                            setTimeout(() => setCopiedSlidePrompt(false), 2000);
                          }}
                          className={`h-7 px-3 text-[10px] font-bold gap-1.5 shrink-0 ${copiedSlidePrompt ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-700 hover:bg-slate-50 border-border"}`}
                        >
                          {copiedSlidePrompt ? (
                            <>
                              <Check className="w-3" /> Copied Setup
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-sky-600" /> Copy AI Prompt
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {isEditingSlides ? (
                          <Textarea
                            value={taskDraftOutput.slides?.[activeSlideIndex]?.designSuggestion || ""}
                            onChange={(e) => handleUpdateSlideDesign(activeSlideIndex, e.target.value)}
                            className="text-xs min-h-[90px] bg-slate-50 border-slate-200 text-slate-800 font-sans"
                            placeholder="Type prompt details for Google Workspace Slide generation..."
                          />
                        ) : (
                          <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 font-medium font-sans leading-relaxed whitespace-pre-wrap">
                            {taskDraftOutput.slides?.[activeSlideIndex]?.designSuggestion || "AI is generating specialized image composition instructions..."}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-sans italic px-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          Tip: Paste this directly in standard "Create image" prompts inside Google Workspace Sidebars (Gemini in Slides) to generate high-quality 16:9 widescreen presentation vectors.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center text-gray-400 space-y-4 min-h-[400px]">
              <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <Layers className="w-8 h-8 opacity-30 text-gray-400 animate-pulse" />
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
            <div onMouseUp={handleWorkTextSelection} className="space-y-6 w-full max-w-5xl mx-auto text-left">
              {/* Sheets Top Title Card */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1 w-full">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-widest block w-max">
                    DATATABLE BLANKET MATRIX
                  </span>
                  {isEditingSheetHeader ? (
                    <div className="space-y-2 mt-2 w-full max-w-xl">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-gray-500 uppercase">Sheet Title</Label>
                        <Input
                          value={generatedSheet.sheetTitle || ""}
                          onChange={(e) => {
                            if (generatedSheet && setGeneratedSheet) {
                              setGeneratedSheet({ ...generatedSheet, sheetTitle: e.target.value });
                            }
                          }}
                          className="h-8 text-sm font-bold text-slate-800 bg-slate-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-gray-500 uppercase">Sheet Description</Label>
                        <Input
                          value={generatedSheet.sheetDescription || ""}
                          onChange={(e) => {
                            if (generatedSheet && setGeneratedSheet) {
                              setGeneratedSheet({ ...generatedSheet, sheetDescription: e.target.value });
                            }
                          }}
                          className="h-8 text-xs font-semibold text-slate-600 bg-slate-50"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-gray-910">{generatedSheet.sheetTitle}</h3>
                      <p className="text-xs text-muted-foreground">{generatedSheet.sheetDescription}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
                  <Button
                    size="sm"
                    variant={isEditingSheetHeader ? "secondary" : "outline"}
                    onClick={() => setIsEditingSheetHeader(!isEditingSheetHeader)}
                    className="h-9 font-bold text-xs border-emerald-200 text-emerald-800 bg-white hover:bg-emerald-50"
                  >
                    {isEditingSheetHeader ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Done Metadata
                      </>
                    ) : (
                      <>
                        <span className="mr-1">✏️</span> Edit Header Info
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copySheetData}
                    className="h-9 font-bold text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                  >
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy TSV Grid
                  </Button>
                </div>
              </div>

              {renderAIRefinementCard()}

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
                             className="px-3 border-r border-border font-bold text-gray-700 font-sans tracking-wide min-w-[120px]"
                           >
                             {isEditingSheetHeader ? (
                               <input
                                 type="text"
                                 value={h}
                                 onChange={(e) => {
                                   if (generatedSheet && setGeneratedSheet) {
                                     const newHeaders = [...generatedSheet.headers];
                                     newHeaders[idx] = e.target.value;
                                     setGeneratedSheet({ ...generatedSheet, headers: newHeaders });
                                   }
                                 }}
                                 className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-800 focus:outline-[#155724]"
                               />
                             ) : (
                               h
                             )}
                           </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.map((row: string[], rIdx: number) => (
                        <tr
                          key={rIdx}
                          className="bg-white border-b border-border/60 hover:bg-emerald-50/20 group h-9 transition-colors"
                        >
                          <td className="text-center font-mono text-[9px] border-r border-border bg-[#F5F5F5] text-gray-500 font-bold select-none">
                            {rIdx + 1}
                          </td>
                          {row.map((cell: string, cIdx: number) => (
                            <td
                              key={cIdx}
                              className="px-2 border-r border-border font-mono text-gray-800 text-[11px] font-medium bg-transparent focus-within:bg-orange-50/20 min-w-[120px]"
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleCellEdit(rIdx, cIdx, e.target.value)}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-1 text-[11px] font-mono h-6 transition-all text-slate-800 font-semibold"
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
                          <td className="px-3 border-r border-border font-sans uppercase tracking-widest text-[#155724] text-[10px] h-9 align-middle">
                            {isEditingSheetHeader ? (
                              <input
                                type="text"
                                value={generatedSheet.summaryStats.label || ""}
                                onChange={(e) => {
                                  if (generatedSheet && setGeneratedSheet) {
                                    setGeneratedSheet({
                                      ...generatedSheet,
                                      summaryStats: {
                                        ...generatedSheet.summaryStats,
                                        label: e.target.value
                                      }
                                    });
                                  }
                                }}
                                className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#155724] focus:outline-[#155724]"
                              />
                            ) : (
                              generatedSheet.summaryStats.label
                            )}
                          </td>
                          <td
                            colSpan={generatedSheet.headers.length - 1}
                            className="px-3 border-r border-border font-mono text-[#0f3d1a] font-bold text-right text-[11px] h-9 align-middle"
                          >
                            {isEditingSheetHeader ? (
                              <input
                                type="text"
                                value={generatedSheet.summaryStats.value || ""}
                                onChange={(e) => {
                                  if (generatedSheet && setGeneratedSheet) {
                                    setGeneratedSheet({
                                      ...generatedSheet,
                                      summaryStats: {
                                        ...generatedSheet.summaryStats,
                                        value: e.target.value
                                      }
                                    });
                                  }
                                }}
                                className="w-48 ml-auto bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-mono text-right text-[#0f3d1a] focus:outline-[#155724]"
                              />
                            ) : (
                              generatedSheet.summaryStats.value
                            )}
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
                <div className="space-y-1 w-full">
                  <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                    Data Logic Summary
                  </h5>
                  {isEditingSheetHeader ? (
                    <Textarea
                      value={generatedSheet.professionalInsight || ""}
                      onChange={(e) => {
                        if (generatedSheet && setGeneratedSheet) {
                          setGeneratedSheet({
                            ...generatedSheet,
                            professionalInsight: e.target.value
                          });
                        }
                      }}
                      className="text-xs mt-1 w-full bg-white border border-slate-200 text-slate-900 font-sans p-2 min-h-[60px] focus:outline-[#155724]"
                    />
                  ) : (
                    <p className="text-xs text-emerald-700 leading-relaxed font-sans">
                      {generatedSheet.professionalInsight}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center text-gray-400 space-y-4 min-h-[400px]">
              <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                <Table className="w-8 h-8 opacity-30 text-gray-400 animate-pulse" />
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
            <div onMouseUp={handleWorkTextSelection} className="space-y-6 w-full max-w-4xl mx-auto text-left">
              {/* Docs Top bar */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest block w-max">
                    {selectedDocType.toUpperCase()} OUTLINE BRIEF
                  </span>
                  <h3 className="text-lg font-bold text-gray-901">Standard Operational Protocol</h3>
                  <p className="text-xs text-muted-foreground font-sans">Polished documentation script ready for export.</p>
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
                  <Button
                    size="sm"
                    variant={isEditingDoc ? "secondary" : "outline"}
                    onClick={() => setIsEditingDoc(!isEditingDoc)}
                    className="h-9 font-bold text-xs border-emerald-200 bg-white text-slate-800 hover:bg-emerald-50"
                  >
                    {isEditingDoc ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Done Editing
                      </>
                    ) : (
                      <>
                        <span className="mr-1.5">✏️</span> Edit Document Text
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDoc);
                      toast.success("Markdown documentation copied!");
                    }}
                    className="h-9 font-bold text-xs bg-white text-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy Markdown
                  </Button>
                </div>
              </div>

              {renderAIRefinementCard()}

              {/* Main Document Body */}
              <div className="bg-white border border-border p-6 md:p-10 rounded-2xl shadow-sm">
                {isEditingDoc ? (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Document Content (Markdown format)</Label>
                    <Textarea
                      value={generatedDoc}
                      onChange={(e) => setGeneratedDoc(e.target.value)}
                      className="min-h-[500px] text-xs font-mono p-4 bg-slate-50/50 text-slate-900 border-slate-200 leading-relaxed"
                      placeholder="Type markdown brief content here..."
                    />
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans text-left markdown-body">
                    <ReactMarkdown>{generatedDoc}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center text-gray-400 space-y-4 min-h-[400px]">
              <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <FileCode className="w-8 h-8 opacity-30 text-gray-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700 font-sans">Polished Corporate Document Ready</p>
                <p className="text-xs max-w-sm">
                  Pasted task details on the left controls and choose standard document templates then trigger "Generate DOCS Blueprint".
                </p>
              </div>
            </div>
          )
        )}

        {/* Visual Media & Create Prompts Section */}
        <div className="mt-8 border-t border-border pt-8 w-full max-w-5xl mx-auto text-left">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <span className="text-[9px] bg-sky-100 text-sky-800 px-2.5 py-1 rounded font-bold uppercase tracking-widest block w-max font-sans">
                  Visual Media Assets Planner
                </span>
                <h3 className="text-lg font-bold text-gray-900 font-sans">Suggested Media & Simulation Prompts</h3>
                <p className="text-xs text-muted-foreground">
                  Prompts designed to generate realistic background images, simulated system interfaces/screenshots, or training video footage.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const combined = `COVER VISUAL IMAGE PROMPT:\n${coverPrompt}\n\nSOFTWARE INTERFACE SCREENSHOT PROMPT:\n${screenshotPrompt}\n\nVIDEO B-ROLL PROMPT:\n${videoPrompt}`;
                    navigator.clipboard.writeText(combined);
                    toast.success("All dynamic prompts copied to clipboard as a storyboard suite!");
                  }}
                  className="h-9 font-bold text-xs bg-white text-slate-800 border-border"
                >
                  <Copy className="w-3.5 h-3.5 mr-2 text-sky-600" />
                  Copy All Prompts Block
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Cover Graphic Card */}
              <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4.5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100">
                      <Image className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-sans">Slide or Report Cover Visual</h4>
                      <p className="text-[10px] text-muted-foreground">Contextual cover or slide background</p>
                    </div>
                  </div>
                  
                  <Textarea
                    value={coverPrompt}
                    onChange={(e) => setCoverPrompt(e.target.value)}
                    className="text-xs min-h-[145px] max-h-[180px] bg-white text-slate-800 font-medium resize-none leading-relaxed"
                    placeholder="Enter image prompt..."
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Imagen / Midjourney
                  </span>
                  <Button
                    size="xs"
                    variant={copiedCover ? "secondary" : "ghost"}
                    onClick={() => {
                      navigator.clipboard.writeText(coverPrompt);
                      toast.success("Cover visual prompt copied!");
                      setCopiedCover(true);
                      setTimeout(() => setCopiedCover(false), 2000);
                    }}
                    className={`h-7 px-2.5 font-bold text-[10px] gap-1.5 ${copiedCover ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-600 hover:text-sky-700'}`}
                  >
                    {copiedCover ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 2. Simulation Interface / Screenshot Card */}
              <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4.5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <Monitor className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-sans">Software Interface Mockup</h4>
                      <p className="text-[10px] text-muted-foreground">GIS panel or system workspace screenshot</p>
                    </div>
                  </div>
                  
                  <Textarea
                    value={screenshotPrompt}
                    onChange={(e) => setScreenshotPrompt(e.target.value)}
                    className="text-xs min-h-[145px] max-h-[180px] bg-white text-slate-800 font-medium resize-none leading-relaxed"
                    placeholder="Enter screenshot prompt..."
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    UI Screenshot Mockup
                  </span>
                  <Button
                    size="xs"
                    variant={copiedScreenshot ? "secondary" : "ghost"}
                    onClick={() => {
                      navigator.clipboard.writeText(screenshotPrompt);
                      toast.success("Software interface prompt copied!");
                      setCopiedScreenshot(true);
                      setTimeout(() => setCopiedScreenshot(false), 2000);
                    }}
                    className={`h-7 px-2.5 font-bold text-[10px] gap-1.5 ${copiedScreenshot ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-600 hover:text-emerald-700'}`}
                  >
                    {copiedScreenshot ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 3. Operational B-Roll Video Card */}
              <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4.5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                      <Video className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-sans">Operational Training Video</h4>
                      <p className="text-[10px] text-muted-foreground">Real-world survey or command B-roll</p>
                    </div>
                  </div>
                  
                  <Textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="text-xs min-h-[145px] max-h-[180px] bg-white text-slate-800 font-medium resize-none leading-relaxed"
                    placeholder="Enter video prompt..."
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Veo / Sora Video
                  </span>
                  <Button
                    size="xs"
                    variant={copiedVideo ? "secondary" : "ghost"}
                    onClick={() => {
                      navigator.clipboard.writeText(videoPrompt);
                      toast.success("Video B-roll prompt copied!");
                      setCopiedVideo(true);
                      setTimeout(() => setCopiedVideo(false), 2000);
                    }}
                    className={`h-7 px-2.5 font-bold text-[10px] gap-1.5 ${copiedVideo ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-600 hover:text-amber-700'}`}
                  >
                    {copiedVideo ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-sky-600 mt-0.5 shrink-0 animate-pulse" />
              <div className="space-y-1">
                <h5 className="text-[10px] uppercase font-bold text-slate-900 block font-sans">
                  PRO TIP: HOW TO DECORATE YOUR SELECTION PANEL DELIVERABLE
                </h5>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  The hiring managers appreciate high-quality visual aids. Run these prompts in modern generative engines to obtain stunning widescreen backdrops or simulated screens, then slot them directly into your final presentation slides or Standard Operating Procedure manuals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
