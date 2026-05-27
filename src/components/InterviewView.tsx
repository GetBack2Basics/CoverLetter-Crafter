import React, { useState } from "react";
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
  Mic,
  MicOff,
  Award,
  Copy,
  Check
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { evaluateInterviewResponse } from "../services/gemini";

export const BASELINE_PREP_FALLBACK = {
  insightSummary: "A comprehensive baseline of behavioral and technical competency questions mapped to spatial operations, emergency services compliance, and system optimization.",
  questions: [
    {
      type: "Technical",
      question: "Could you walk us through the technical steps required to convert a set of coordinate grids from GDA94 to GDA2020 on local GIS systems?",
      starAnswer: {
        situation: "The regional command dispatch database was operating on legacy GDA94 coordinates, creating a minor spatial misalignment with national emergency feeds.",
        task: "Perform spatial conversion for 50 regional dispatch command centers conforming to the Geocentric Datum transformation protocol.",
        action: "Implemented a python-based transform script calling spatial datum NTv2 grid arrays to calculate coordinate centroids automatically.",
        result: "Preserved emergency coordinate system compliance with spatial error ratios kept safely under 0.05 meters."
      },
      coachingTips: "State coordinate shift deltas clearly (approx. 1.5 - 1.8 meters across Australia) and describe your script validation logs."
    },
    {
      type: "Behavioral",
      question: "Describe a time when you were presented with a massive list of assets in multiple databases and had to ensure absolute query consistency under a strict deadline.",
      starAnswer: {
        situation: "The volunteer command bureau mapped regional water assets across different local councils with differing schemas and validation formats.",
        task: "Consolidate and validate spatial attributes for thousands of critical water mains before fire hazard season.",
        action: "Designed an automated SQL query cross-checking coordinate fields and flagging duplicate spatial indices directly inside the primary command table.",
        result: "Restored 100% database consistency within 48 hours, facilitating real-time maps for rapid on-the-ground volunteer dispatch."
      },
      coachingTips: "Focus on database validation checks, schemas, and collaborative alignment with diverse provincial stakeholders."
    },
    {
      type: "Technical",
      question: "How do you automate geospatial layer updates to ensure emergency response maps reflect real-time incident updates?",
      starAnswer: {
        situation: "Map updates were handled manually every morning, risking inaccurate containment line feeds to volunteer commanders during shifting bushfires.",
        task: "Establish an automated layer execution script linking live coordinate sensor arrays directly to incident maps.",
        action: "Wrote a custom python automation script that triggers automatic buffer calculations around hazard dispatch points as sensors ping.",
        result: "Slashed coordinate refresh times from 24 hours down to less than 5 minutes, significantly boosting containment positioning safety."
      },
      coachingTips: "Address automated event pings, layer triggers, and the importance of localized buffer geometry precision."
    },
    {
      type: "Behavioral",
      question: "How do you present complex spatial coordinate shift maps to selective panel members who may not possess a deep technical mapping background?",
      starAnswer: {
        situation: "Presenting datum transformation results to administrative board members who are responsible for volunteer funding and operational policy.",
        task: "Demystify coordinate transformation calculations and validate compliance metrics simply and visually.",
        action: "Built high-contrast slide decks mapping spatial precision changes as clear red-to-green buffer rings around local communities.",
        result: "Secured unanimous board sign-off and approval on the physical transition budget within a single presentation."
      },
      coachingTips: "Emphasize visual representation of complex geographic metrics over raw numbers, and relate precision directly to user safety."
    }
  ]
};

export function InterviewView({
  userProfile,
  jobDescription,
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
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-[#FAF9F6]">
      {/* Left Input/Portfolio Setup Panel */}
      <aside className="w-full md:w-[350px] lg:w-[380px] border-b md:border-b-0 md:border-r border-border bg-white flex flex-col gap-6 p-6 overflow-y-auto shrink-0">
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
                <Label className="text-[10px] uppercase font-bold text-gray-600">Active Job Description</Label>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold font-sans">Linked from Cover Letter</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[140px] overflow-y-auto text-left">
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {jobDescription || "No job description loaded yet. Please add one in the Cover Letter Hub."}
                </p>
              </div>
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
      <section className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6 bg-[#FAF9F6]">
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Question list (Left Column of stage structure) */}
              <div className="md:col-span-4 space-y-2.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    PREP QUESTIONS ({interviewPrepData.questions?.length || 0})
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddQuestionForm(!showAddQuestionForm)} 
                    className="h-6 px-2 text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest"
                  >
                    <Plus className="w-3 h-3 mr-0.5" /> Add Custom
                  </Button>
                </div>

                {/* Optional Inline ADD Form */}
                {showAddQuestionForm && (
                  <form onSubmit={handleAddCustomQuestion} className="bg-white border border-primary/20 p-4 rounded-xl space-y-3 shadow-md border-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold uppercase text-[#9c1c1c]">New Practice Question</span>
                      <button type="button" onClick={() => setShowAddQuestionForm(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[9px] uppercase font-bold text-gray-500 font-mono">Classification</Label>
                      <select 
                        value={newQuestionType} 
                        onChange={(e) => setNewQuestionType(e.target.value as any)}
                        className="w-full bg-slate-50 border rounded p-1 text-xs focus:ring-1 focus:ring-primary h-8 border-border text-slate-800 font-medium"
                      >
                        <option value="Behavioral">Behavioral / Situation</option>
                        <option value="Technical">Technical / Competency</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[9px] uppercase font-bold text-gray-500 font-mono">Question Prompt</Label>
                      <Input 
                        placeholder="What's your geocentric coordinate transformation process?" 
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="text-xs h-8 text-slate-800 font-medium bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[9px] uppercase font-bold text-gray-500 font-mono">Strategic Coach Guidelines</Label>
                      <Input 
                        placeholder="Emphasize sub-meter validation checks..." 
                        value={newQuestionCoaching}
                        onChange={(e) => setNewQuestionCoaching(e.target.value)}
                        className="text-xs h-8 text-slate-800 font-medium bg-white"
                      />
                    </div>

                    <div className="border-t pt-2 space-y-2 text-left">
                      <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider font-mono">STAR Outline Guides (Optional)</span>
                      
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input 
                          placeholder="Situation" 
                          value={newSituation} 
                          onChange={(e) => setNewSituation(e.target.value)}
                          className="text-[10px] h-7 px-1.5 text-slate-800 font-medium bg-white"
                        />
                        <Input 
                          placeholder="Task" 
                          value={newTestingTask} 
                          onChange={(e) => setNewTestingTask(e.target.value)}
                          className="text-[10px] h-7 px-1.5 text-slate-800 font-medium bg-white"
                        />
                        <Input 
                          placeholder="Action" 
                          value={newExecutionAction} 
                          onChange={(e) => setNewExecutionAction(e.target.value)}
                          className="text-[10px] h-7 px-1.5 col-span-2 text-slate-800 font-medium bg-white"
                        />
                        <Input 
                          placeholder="Result" 
                          value={newResolvedResult} 
                          onChange={(e) => setNewResolvedResult(e.target.value)}
                          className="text-[10px] h-7 px-1.5 col-span-2 text-slate-800 font-medium bg-white"
                        />
                      </div>
                    </div>

                    <Button type="submit" size="sm" className="w-full h-8 text-[11px] font-sans font-bold uppercase tracking-wider text-white">
                      Create Practice Prompt
                    </Button>
                  </form>
                )}

                {interviewPrepData.questions.length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-xl bg-slate-50 text-gray-400">
                    <p className="text-xs font-medium">No questions left in checklist</p>
                    <p className="text-[10px]">Click 'Add Custom' above to create one!</p>
                  </div>
                ) : (
                  interviewPrepData.questions.map((q: any, idx: number) => {
                    const practiced = practicedIndices[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedQuestionIndex(idx);
                          setPracticeText("");
                          setEvaluation(null);
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        }}
                        className={`w-full p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[95px] cursor-pointer group hover:shadow-sm ${
                          selectedQuestionIndex === idx
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "bg-white border-border hover:bg-white/80"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#9c1c1c]">
                            {q.type} Question
                          </span>
                          <div className="flex items-center gap-1">
                            {practiced && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1 shrink-0">
                                <Check className="w-3 h-3" /> Practiced
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveQuestion(idx, e)}
                              className="opacity-0 group-hover:opacity-100 duration-150 p-1 text-gray-400 hover:text-red-500 rounded hover:bg-slate-100 shrink-0"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug mt-2">
                          {q.question}
                        </p>
                      </div>
                    );
                  })
                )}
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

                  <h4 className="text-base font-sans font-bold text-gray-901 leading-snug text-left">
                    {currentQuestion?.question}
                  </h4>

                  {/* Coaching guide reference */}
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-left">
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
                    className="min-h-[140px] text-xs resize-none text-slate-800 font-medium"
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
                  <div className="bg-white border border-[#E9E9E9] rounded-2xl shadow-xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300 text-left">
                    <div className="flex items-center justify-between border-b pb-3 border-border">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-gray-900 text-sm animate-in fade-in duration-300">STAR Practice scorecard</h4>
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
                        <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border">
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
                        <p className="text-xs text-gray-800 font-serif leading-relaxed bg-slate-100 p-4 rounded-xl border italic">
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
                        className="text-xs h-10 font-bold"
                      >
                        Try Practicing Again
                      </Button>
                      <Button onClick={markAsPracticed} className="text-xs h-10 font-bold uppercase font-sans">
                        🎉 Practiced Enough & Proceed
                      </Button>
                    </div>
                  </div>
                )}

                {/* Traditional Recommended Guide Drawer for Static Reference */}
                <div className="border border-border bg-white rounded-2xl p-6 shadow-sm space-y-4 text-left">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block border-b pb-2">
                    STAR STRUCTURAL REFERENCE
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">SITUATION:</span>
                      <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                        {currentQuestion?.starAnswer.situation}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1 font-sans">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">TASK:</span>
                      <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                        {currentQuestion?.starAnswer.task}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1 col-span-1 md:col-span-2">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">ACTION:</span>
                      <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                        {currentQuestion?.starAnswer.action}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1 col-span-1 md:col-span-2">
                      <span className="font-bold text-[10px] text-[#9c1c1c]">RESULT:</span>
                      <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                        {currentQuestion?.starAnswer.result}
                      </p>
                    </div>
                  </div>
                </div>
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
                    <p className="text-[10px] text-muted-foreground leading-snug">Instantly pre-populate 4 standard tech expert & GIS selection panel simulation templates.</p>
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
      </section>
    </div>
  );
}
