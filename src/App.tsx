import { useState, useRef, useEffect } from "react";
import { generateCoverLetter, extractJobDetails } from "./services/gemini";
import { profile } from "./data/profile";
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
  FileUp
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function App() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [coverLetterSpecifics, setCoverLetterSpecifics] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [keyRequirements, setKeyRequirements] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [advice, setAdvice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableLetter, setEditableLetter] = useState("");
  const [refinementText, setRefinementText] = useState("");
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
  const [sources, setSources] = useState([
    { id: '1', type: 'linkedin', name: profile.linkedin, icon: <Linkedin className="w-3 h-3 text-[#0A66C2]" /> },
    { id: '2', type: 'file', name: 'Current Resume (Click to upload)', icon: <FileText className="w-3 h-3 text-primary" /> }
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
        "professional", 
        isRefinement ? refinementText : undefined, 
        isRefinement ? generatedLetter : undefined,
        isRefinement ? selectedText : undefined
      );
      
      if (result.letter) {
        setGeneratedLetter(result.letter);
        setEditableLetter(result.letter);
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
    
    win.document.write('<html><head><title>Cover Letter</title>');
    win.document.write('<style>body{font-family:serif;padding:40px;line-height:1.6;color:#1a1a1a;} .prose p{margin-bottom:1.5em;}</style>');
    win.document.write('</head><body>');
    win.document.write(printContent.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  const getTemplateStyles = () => {
    switch (template) {
      case 'classic':
        return {
          container: "max-w-[800px] shadow-2xl font-serif border-t-4 border-gray-200",
          content: "p-12 leading-relaxed text-[16px] text-gray-900",
          prose: "prose-serif prose-p:mb-4"
        };
      case 'minimal':
        return {
          container: "max-w-[700px] shadow-sm border border-gray-100",
          content: "p-8 leading-loose text-[14px] text-gray-700",
          prose: "prose-slate prose-p:mb-3"
        };
      case 'bold':
        return {
          container: "max-w-[800px] shadow-2xl border-t-[12px] border-primary",
          content: "p-10 leading-snug text-[15px] font-medium",
          prose: "prose-indigo prose-p:mb-4"
        };
      case 'executive':
        return {
          container: "max-w-[850px] shadow-2xl border-l-[40px] border-gray-800",
          content: "p-10 leading-relaxed text-[15px] text-gray-900",
          prose: "prose-neutral prose-p:mb-4"
        };
      case 'creative':
        return {
          container: "max-w-[800px] shadow-2xl bg-gradient-to-br from-white to-gray-50 border-r-8 border-primary/30",
          content: "p-10 leading-relaxed text-[15px] italic text-gray-800",
          prose: "prose-stone prose-p:mb-4"
        };
      case 'professional':
        return {
          container: "max-w-[800px] shadow-xl border-y border-gray-200",
          content: "p-10 leading-relaxed text-[15px] text-gray-900",
          prose: "prose-zinc prose-p:mb-4"
        };
      case 'simple':
        return {
          container: "max-w-[750px] shadow-none border-none",
          content: "p-8 leading-normal text-[15px] text-black",
          prose: "prose-p:mb-3"
        };
      default: // modern
        return {
          container: "max-w-[800px] shadow-2xl",
          content: "p-10 leading-relaxed text-[15px]",
          prose: "prose-p:mb-4"
        };
    }
  };

  const templateStyles = getTemplateStyles();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2 font-bold tracking-tight text-xl">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          CoverCraft AI
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase">
            PREMIUM PLAN
          </span>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium border border-border">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[320px] border-r border-border bg-background flex flex-col gap-8 p-6 overflow-y-auto shrink-0">
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

        {/* Preview Area */}
        <section className="flex-1 flex flex-col gap-6 p-10 preview-gradient overflow-y-auto relative">
          {/* Floating Actions Bar (Visible when letter exists) */}
          {generatedLetter && (
            <div className="sticky top-0 z-10 flex justify-end mb-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-card/80 backdrop-blur-md border border-border p-1.5 rounded-full shadow-xl flex items-center gap-1">
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-xs h-8 px-3 rounded-full">
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleSaveEdit} className="text-primary hover:text-primary hover:bg-primary/10 text-xs h-8 px-3 rounded-full">
                    <Save className="w-3 h-3 mr-2" />
                    Save
                  </Button>
                )}
                <div className="w-[1px] h-4 bg-border mx-1" />
                <Button variant="ghost" size="sm" onClick={handlePrint} className="text-xs h-8 px-3 rounded-full">
                  <Printer className="w-3 h-3 mr-2" />
                  Print / PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toast.info("DOCX export coming soon!")} className="text-xs h-8 px-3 rounded-full">
                  <FileCode className="w-3 h-3 mr-2" />
                  DOCX
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
          <div className="flex-1 flex justify-center pb-10">
            <div className={`w-full bg-white text-[#1a1a1a] rounded-sm flex flex-col min-h-[800px] transition-all duration-500 ${templateStyles.container}`}>
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
      </main>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
