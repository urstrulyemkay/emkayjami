import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Sparkles, Volume2, CheckCircle2, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkpoint, CheckpointOption } from "@/data/inspectionCheckpoints";
import { useScribe, CommitStrategy } from "@elevenlabs/react";

interface SectionVoiceRecorderProps {
  stepTitle: string;
  checkpoints: Checkpoint[];
  responses: Record<string, string>;
  onAutoFill: (checkpointId: string, value: string) => void;
  onTranscriptReceived?: (transcript: string) => void;
  onMarkAllGood?: () => void;
  onAutoFillTest?: () => void;
}

// Keywords to match for auto-filling
const SEVERITY_KEYWORDS: Record<string, string[]> = {
  ok: ["ok", "okay", "good", "fine", "working", "smooth", "clean", "intact", "excellent", "present", "valid", "verified", "matches", "genuine", "responsive", "stable", "strong", "clear", "none", "all working", "yes", "perfect", "great"],
  minor: ["minor", "slight", "small", "little", "worn", "faded", "dusty", "weak", "soft", "dim", "rough", "dark", "creaky", "expired", "tight"],
  major: ["major", "bad", "damaged", "broken", "failing", "cracked", "missing", "corroded", "leaking", "clogged", "severe", "not working", "bald", "grinding", "loose", "exposed"],
  critical: ["critical", "dangerous", "unsafe", "dead", "seized", "tampered", "mismatch", "does not match", "milky", "contaminated", "bent", "stalling"],
};

// SpeechRecognition types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function SectionVoiceRecorder({
  stepTitle,
  checkpoints,
  responses,
  onAutoFill,
  onTranscriptReceived,
  onMarkAllGood,
  onAutoFillTest,
}: SectionVoiceRecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef<string>("");

  // Official ElevenLabs client (more reliable than manual WebSocket handling)
  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onPartialTranscript: (data: any) => {
      // data: { text: string }
      setPartialTranscript(data?.text || "");
    },
    onCommittedTranscript: (data: any) => {
      const text = data?.text || "";
      if (!text) return;
      const newTranscript = (transcriptRef.current + " " + text).trim();
      transcriptRef.current = newTranscript;
      setFullTranscript(newTranscript);
      setPartialTranscript("");
      onTranscriptReceived?.(text);
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const parseTranscriptAndAutoFill = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    let filledCount = 0;
    
    // Check each checkpoint for potential matches
    checkpoints.forEach((checkpoint) => {
      // Skip if already responded
      if (responses[checkpoint.id]) return;

      // Check if transcript mentions this checkpoint's context
      const questionWords = checkpoint.question.toLowerCase().split(/\s+/);
      const hasContext = questionWords.some((word) => 
        word.length > 3 && lowerTranscript.includes(word)
      );

      // Also check voice prompt for context
      const promptWords = checkpoint.voicePrompt.toLowerCase().split(/\s+/);
      const hasPromptContext = promptWords.some((word) => 
        word.length > 3 && lowerTranscript.includes(word)
      );

      if (hasContext || hasPromptContext) {
        // Try to find matching option
        let matchedOption: CheckpointOption | null = null;
        let highestPriority = -1;

        checkpoint.options.forEach((option) => {
          const optionLabel = option.label.toLowerCase();
          
          // Direct label match
          if (lowerTranscript.includes(optionLabel)) {
            const priority = option.severity === "critical" ? 4 : 
                           option.severity === "major" ? 3 : 
                           option.severity === "minor" ? 2 : 1;
            if (priority > highestPriority) {
              matchedOption = option;
              highestPriority = priority;
            }
          }

          // Severity keyword match
          const severity = option.severity || "ok";
          const keywords = SEVERITY_KEYWORDS[severity] || [];
          keywords.forEach((keyword) => {
            if (lowerTranscript.includes(keyword)) {
              const priority = severity === "critical" ? 4 : 
                             severity === "major" ? 3 : 
                             severity === "minor" ? 2 : 1;
              if (priority > highestPriority) {
                matchedOption = option;
                highestPriority = priority;
              }
            }
          });
        });

        if (matchedOption) {
          onAutoFill(checkpoint.id, matchedOption.value);
          filledCount++;
        }
      }
    });

    if (filledCount > 0) {
      toast({
        title: `Auto-filled ${filledCount} field${filledCount > 1 ? "s" : ""}`,
        description: "Voice input matched checkpoint responses",
      });
    }
  }, [checkpoints, responses, onAutoFill, toast]);

  // Fallback to Web Speech API
  const startWebSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      setIsConnecting(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsRecording(true);
      setIsConnecting(false);
      setUsingFallback(true);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setPartialTranscript(interim);
      
      if (final) {
        const newTranscript = (transcriptRef.current + " " + final).trim();
        transcriptRef.current = newTranscript;
        setFullTranscript(newTranscript);
        onTranscriptReceived?.(final);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        toast({
          title: "Recognition error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsConnecting(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [parseTranscriptAndAutoFill, onTranscriptReceived, toast]);

  const startRecording = async () => {
    setIsConnecting(true);
    setFullTranscript("");
    setPartialTranscript("");
    setUsingFallback(false);
    transcriptRef.current = ""; // Reset transcript ref

    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");
      if (error || !data?.token) {
        throw new Error(error?.message || "Failed to get transcription token");
      }

      // Attempt ElevenLabs realtime first
      const connectPromise = scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // If connection hangs, fallback to browser speech recognition
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("scribe_connect_timeout")), 6000)
      );

      await Promise.race([connectPromise, timeoutPromise]);

      setIsRecording(true);
      setIsConnecting(false);
    } catch (err) {
      console.error("Realtime transcription failed, falling back:", err);
      try {
        // Ensure scribe is disconnected before fallback
        if (scribe.isConnected) {
          scribe.disconnect();
        }
      } catch {
        // ignore
      }
      startWebSpeechRecognition();
    }
  };

  // Analyze transcript with AI after recording
  const analyzeTranscriptWithAI = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-voice-transcript", {
        body: {
          transcript: transcript.trim(),
          checkpoints,
          existingResponses: responses,
        },
      });

      if (error) throw error;

      const mappings = data?.mappings || {};
      const count = Object.keys(mappings).length;

      if (count > 0) {
        // Apply all mappings
        Object.entries(mappings).forEach(([checkpointId, value]) => {
          onAutoFill(checkpointId, value as string);
        });

        toast({
          title: `AI filled ${count} field${count > 1 ? "s" : ""}`,
          description: "Based on your voice recording",
        });
      } else {
        toast({
          title: "No matches found",
          description: "Try speaking more specifically about each checkpoint",
        });
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
      toast({
        title: "Analysis failed",
        description: "Falling back to keyword matching",
        variant: "destructive",
      });
      // Fallback to local keyword matching
      parseTranscriptAndAutoFill(transcript);
    } finally {
      setIsAnalyzing(false);
    }
  }, [checkpoints, responses, onAutoFill, toast, parseTranscriptAndAutoFill]);

  const stopRecording = useCallback(() => {
    const currentTranscript = transcriptRef.current;
    
    // Stop Web Speech API if using fallback
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop ElevenLabs scribe
    try {
      if (scribe.isConnected) {
        scribe.disconnect();
      }
    } catch {
      // ignore
    }

    setIsRecording(false);
    setIsConnecting(false);
    setPartialTranscript("");

    // Analyze the full transcript after stopping
    if (currentTranscript.trim()) {
      analyzeTranscriptWithAI(currentTranscript);
    }
  }, [scribe, analyzeTranscriptWithAI]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Voice Auto-Fill</p>
            <p className="text-xs text-muted-foreground">
              Speak to fill {stepTitle} fields
              {usingFallback && " (Browser API)"}
            </p>
          </div>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-medium text-destructive">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-3">
        {onMarkAllGood && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs gap-1 h-9 border-success/50 text-success hover:bg-success/10"
            onClick={onMarkAllGood}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark All Good
          </Button>
        )}
        {onAutoFillTest && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs gap-1 h-9 border-warning/50 text-warning hover:bg-warning/10"
            onClick={onAutoFillTest}
          >
            <Zap className="w-3.5 h-3.5" />
            Auto-Fill (Test)
          </Button>
        )}
      </div>

      {/* Transcript display */}
      {(isRecording || fullTranscript || isAnalyzing) && (
        <div className="mb-3 p-3 rounded-lg bg-background border border-border min-h-[60px]">
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-primary mb-2">
              <Brain className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">AI analyzing transcript...</span>
            </div>
          )}
          {fullTranscript && (
            <p className="text-sm text-foreground">{fullTranscript}</p>
          )}
          {partialTranscript && (
            <p className="text-sm text-muted-foreground italic">{partialTranscript}</p>
          )}
          {isRecording && !partialTranscript && !fullTranscript && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Listening...</span>
            </div>
          )}
        </div>
      )}

      {/* Recording button */}
      <div className="flex gap-2">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isConnecting || isAnalyzing}
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "flex-1 h-12 gap-2",
            isRecording && "animate-pulse"
          )}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              Stop & Analyze
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Voice Recording
            </>
          )}
        </Button>
        
        {/* Manual analyze button when there's a transcript but not recording */}
        {fullTranscript && !isRecording && !isAnalyzing && (
          <Button
            onClick={() => analyzeTranscriptWithAI(fullTranscript)}
            variant="outline"
            className="h-12 gap-2 border-primary/50"
          >
            <Brain className="w-5 h-5" />
            Re-analyze
          </Button>
        )}
      </div>

      {/* Hint */}
      <p className="mt-2 text-xs text-center text-muted-foreground">
        Speak naturally about the vehicle condition. AI will auto-fill after you stop.
      </p>
    </div>
  );
}