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
  Award
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export function WorkView({
  userProfile,
  jobDescription,
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
  activeWorkTab,
  setActiveWorkTab,
}: {
  userProfile: any;
  jobDescription?: string;
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
  activeWorkTab: "slides" | "sheets" | "docs";
  setActiveWorkTab: (tab: "slides" | "sheets" | "docs") => void;
}) {

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
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-[#FAF9F6]">
      {/* Left Unified Input Control Panel */}
      <aside className="w-full md:w-[350px] lg:w-[380px] border-b md:border-b-0 md:border-r border-border bg-white flex flex-col gap-6 p-6 overflow-y-auto shrink-0">
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

            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/40 text-[11px] text-[#155724] leading-relaxed text-left">
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
      <section className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6 bg-[#FAF9F6]">
        {/* Render SLIDES */}
        {activeWorkTab === "slides" && (
          taskDraftOutput ? (
            <div className="space-y-6 w-full max-w-4xl mx-auto text-left">
              {/* Top Action Bar */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest block w-max">
                    SLIDES BLUEPRINT OUTLINE
                  </span>
                  <h3 className="text-xl font-bold text-gray-901">{taskDraftOutput.title}</h3>
                  <p className="text-xs text-muted-foreground">{taskDraftOutput.subtitle}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={copySlidesText} className="h-9 font-bold text-xs bg-white">
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy Outline
                  </Button>
                </div>
              </div>

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
                  <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-3 text-left">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#155724]" /> Presenter Spoken Voice Script
                      </p>
                      <p className="text-xs text-slate-800 leading-relaxed mt-2 p-3 bg-slate-50 rounded-lg border italic">
                        "{taskDraftOutput.slides?.[activeSlideIndex]?.presenterNotes}"
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Design suggestion</p>
                      <p className="text-xs text-muted-foreground mt-1 font-sans">
                        {taskDraftOutput.slides?.[activeSlideIndex]?.designSuggestion}
                      </p>
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
            <div className="space-y-6 w-full max-w-5xl mx-auto text-left">
              {/* Sheets Top Title Card */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-widest block w-max">
                    DATATABLE BLANKET MATRIX
                  </span>
                  <h3 className="text-lg font-bold text-gray-901">{generatedSheet.sheetTitle}</h3>
                  <p className="text-xs text-muted-foreground">{generatedSheet.sheetDescription}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copySheetData}
                    className="h-9 font-bold text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
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
                            {generatedSheet.summaryStats.label}
                          </td>
                          <td
                            colSpan={generatedSheet.headers.length - 1}
                            className="px-3 border-r border-border font-mono text-[#0f3d1a] font-bold text-right text-[11px] h-9 align-middle"
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
                  <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                    Data Logic Summary
                  </h5>
                  <p className="text-xs text-emerald-700 leading-relaxed font-sans">
                    {generatedSheet.professionalInsight}
                  </p>
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
            <div className="space-y-6 w-full max-w-4xl mx-auto text-left">
              {/* Docs Top bar */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest block w-max">
                    {selectedDocType.toUpperCase()} OUTLINE BRIEF
                  </span>
                  <h3 className="text-lg font-bold text-gray-901">Standard Operational Protocol</h3>
                  <p className="text-xs text-muted-foreground font-sans">Polished documentation script ready for export.</p>
                </div>
                <div className="flex gap-2 shrink-0">
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

              {/* Main Document Body */}
              <div className="bg-white border border-border p-6 md:p-10 rounded-2xl shadow-sm">
                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans text-left markdown-body">
                  <ReactMarkdown>{generatedDoc}</ReactMarkdown>
                </div>
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
      </section>
    </div>
  );
}
