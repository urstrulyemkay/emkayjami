import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Square, Check, Trash2, ChevronRight, AlertCircle } from "lucide-react";
import { DEFECT_CATEGORIES, DefectCategory, VoiceRecording as VoiceRecordingType, Defect } from "@/types/inspection";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";

const VoiceRecordingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleData = location.state;

  const [selectedCategory, setSelectedCategory] = useState<DefectCategory | null>(null);
  const [voiceRecordings, setVoiceRecordings] = useState<VoiceRecordingType[]>([]);
  const [extractedDefects, setExtractedDefects] = useState<Defect[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onCommittedTranscript: (data) => {
      if (selectedCategory && data.text.trim()) {
        // Create voice recording entry
        const newRecording: VoiceRecordingType = {
          id: `voice_${Date.now()}`,
          category: selectedCategory,
          audioUri: "",
          transcript: data.text,
          duration: recordingTime,
          timestamp: new Date().toISOString(),
        };
        setVoiceRecordings((prev) => [...prev, newRecording]);

        // Create defect from transcript
        const newDefect: Defect = {
          id: `defect_${Date.now()}`,
          category: selectedCategory,
          description: data.text,
          severity: "moderate",
          extractedFrom: "voice",
          confidence: 0.9,
        };
        setExtractedDefects((prev) => [...prev, newDefect]);
      }
    },
  });

  const startRecording = useCallback(async () => {
    if (!selectedCategory) return;

    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");
      
      if (error || !data?.token) {
        console.error("Failed to get scribe token:", error);
        return;
      }

      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setRecordingTime(0);
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [selectedCategory, scribe]);

  const stopRecording = useCallback(() => {
    scribe.disconnect();
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [scribe, timerInterval]);

  const removeDefect = (defectId: string) => {
    setExtractedDefects((prev) => prev.filter((d) => d.id !== defectId));
    setVoiceRecordings((prev) => prev.filter((v) => v.id !== defectId.replace("defect_", "voice_")));
  };

  const handleComplete = () => {
    navigate("/inspection/summary", {
      state: { ...vehicleData, voiceRecordings, defects: extractedDefects },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCategoryDefects = (category: DefectCategory) => {
    return extractedDefects.filter((d) => d.category === category);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Voice Notes</p>
          <p className="font-semibold text-foreground">Record Defects</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Instructions */}
      <div className="px-4 mb-4">
        <div className="p-4 rounded-xl bg-info/10 border border-info/20 flex gap-3">
          <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground text-sm font-medium">How to record</p>
            <p className="text-muted-foreground text-xs mt-1">
              Select a category, then tap and hold the mic to describe any defects found.
              Speak clearly about what you observe.
            </p>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="px-4 mb-4">
        <p className="text-sm text-muted-foreground mb-3">Select Category</p>
        <div className="grid grid-cols-4 gap-2">
          {DEFECT_CATEGORIES.map((cat) => {
            const defectCount = getCategoryDefects(cat.category).length;
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                disabled={scribe.isConnected}
                className={`relative p-3 rounded-xl border-2 transition-all ${
                  selectedCategory === cat.category
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-xs text-foreground font-medium">{cat.label}</span>
                {defectCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                    {defectCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Transcript */}
      {scribe.isConnected && (
        <div className="px-4 mb-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">Recording...</span>
              <span className="text-sm font-mono text-foreground ml-auto">
                {formatTime(recordingTime)}
              </span>
            </div>
            <p className="text-foreground">
              {scribe.partialTranscript || "Listening..."}
            </p>
          </div>
        </div>
      )}

      {/* Extracted Defects */}
      <div className="flex-1 px-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-3">
          Recorded Defects ({extractedDefects.length})
        </p>
        {extractedDefects.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border text-center">
            <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No defects recorded yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {extractedDefects.map((defect) => {
              const category = DEFECT_CATEGORIES.find((c) => c.category === defect.category);
              return (
                <div
                  key={defect.id}
                  className="p-4 rounded-xl bg-card border border-border flex items-start gap-3"
                >
                  <span className="text-xl">{category?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{category?.label}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {defect.description}
                    </p>
                  </div>
                  <button
                    onClick={() => removeDefect(defect.id)}
                    className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-4">
        {scribe.isConnected ? (
          <Button onClick={stopRecording} variant="destructive" className="w-full h-14">
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </Button>
        ) : selectedCategory ? (
          <div className="flex gap-3">
            <Button onClick={startRecording} className="flex-1 h-14">
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
            <Button onClick={handleComplete} variant="outline" className="h-14 px-6">
              <Check className="w-5 h-5 mr-2" />
              Done
            </Button>
          </div>
        ) : (
          <Button onClick={handleComplete} className="w-full h-14">
            Continue to Summary
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceRecordingPage;
