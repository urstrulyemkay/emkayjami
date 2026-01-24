import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Sparkles, Volume2, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkpoint, CheckpointOption } from "@/data/inspectionCheckpoints";

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
  const [partialTranscript, setPartialTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

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
        setFullTranscript((prev) => prev + " " + final);
        parseTranscriptAndAutoFill(final);
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

    try {
      // Get Scribe token from edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");
      
      if (error || !data?.token) {
        throw new Error(error?.message || "Failed to get transcription token");
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      // Create WebSocket connection to ElevenLabs Scribe
      const ws = new WebSocket("wss://api.elevenlabs.io/v1/speech-to-text/realtime");
      wsRef.current = ws;

      // Set a timeout to fallback if connection takes too long
      const connectionTimeout = setTimeout(() => {
        if (!isRecording) {
          console.log("ElevenLabs connection timeout, falling back to Web Speech API");
          ws.close();
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          startWebSpeechRecognition();
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        
        // Send authentication with token
        ws.send(JSON.stringify({
          type: "auth",
          token: data.token,
        }));
        
        // Send configuration after auth
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: "config",
            model_id: "scribe_v2_realtime",
            audio_format: "pcm_16000",
            sample_rate: 16000,
            commit_strategy: "vad",
            language_code: "en",
          }));
        }, 100);

        // Start sending audio
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
            }
            
            // Convert to base64
            const bytes = new Uint8Array(pcmData.buffer);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            
            ws.send(JSON.stringify({
              type: "audio",
              audio: base64,
            }));
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        
        setIsRecording(true);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "partial_transcript") {
          setPartialTranscript(data.text || "");
        } else if (data.type === "committed_transcript") {
          const text = data.text || "";
          setFullTranscript((prev) => prev + " " + text);
          setPartialTranscript("");
          
          // Try to auto-fill based on transcript
          parseTranscriptAndAutoFill(text);
          onTranscriptReceived?.(text);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        clearTimeout(connectionTimeout);
        stopRecording();
        
        // Fallback to Web Speech API
        console.log("Falling back to Web Speech API");
        startWebSpeechRecognition();
      };

      ws.onclose = () => {
        clearTimeout(connectionTimeout);
        if (!usingFallback) {
          setIsRecording(false);
          setIsConnecting(false);
        }
      };

    } catch (error) {
      console.error("Error starting recording:", error);
      // Fallback to Web Speech API
      console.log("Falling back to Web Speech API due to error");
      startWebSpeechRecognition();
    }
  };

  const stopRecording = useCallback(() => {
    // Stop Web Speech API if using fallback
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsConnecting(false);
    setPartialTranscript("");
  }, []);

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
      {(isRecording || fullTranscript) && (
        <div className="mb-3 p-3 rounded-lg bg-background border border-border min-h-[60px]">
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
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isConnecting}
        variant={isRecording ? "destructive" : "default"}
        className={cn(
          "w-full h-12 gap-2",
          isRecording && "animate-pulse"
        )}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting...
          </>
        ) : isRecording ? (
          <>
            <MicOff className="w-5 h-5" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Start Voice Recording
          </>
        )}
      </Button>

      {/* Hint */}
      <p className="mt-2 text-xs text-center text-muted-foreground">
        Speak naturally about the vehicle condition. AI will auto-fill matching fields.
      </p>
    </div>
  );
}