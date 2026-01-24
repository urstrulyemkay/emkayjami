import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Video, Square, Check, RotateCcw, ChevronRight, Loader2, SkipForward, Gavel } from "lucide-react";
import { VideoType, CapturedVideo } from "@/types/inspection";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Reduced minimum durations for faster testing - can be increased for production
const VIDEO_TYPES: { type: VideoType; label: string; description: string; minDuration: number }[] = [
  { type: "walkaround", label: "360° Walkaround", description: "Walk around the entire bike slowly", minDuration: 2 },
  { type: "engine_start", label: "Engine Start", description: "Capture cold start behavior", minDuration: 2 },
  { type: "idle_sound", label: "Idle Sound", description: "Record engine idling", minDuration: 2 },
  { type: "acceleration", label: "Acceleration", description: "Rev the engine gently", minDuration: 2 },
];

const VideoCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleData = location.state;
  const { uploadFile, isUploading } = useStorageUpload();
  const { toast } = useToast();

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [capturedVideos, setCapturedVideos] = useState<CapturedVideo[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = VIDEO_TYPES[currentVideoIndex];
  const progress = (capturedVideos.length / VIDEO_TYPES.length) * 100;

  // Get current user - allow mock user for development
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        setUserId(`temp_${Date.now()}`);
      }
    };
    getUser();
  }, []);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        setCameraError("Unable to access camera/microphone. Please grant permissions.");
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setPreviewBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const confirmVideo = useCallback(async () => {
    if (!previewBlob) return;

    const timestamp = Date.now();
    const currentType = currentVideo.type;
    const currentRecordingTime = recordingTime;
    const currentIndex = currentVideoIndex;
    const currentPreviewUrl = previewUrl;

    // Create video object
    const newVideo: CapturedVideo = {
      id: `vid_${timestamp}`,
      type: currentType,
      uri: currentPreviewUrl || "",
      duration: currentRecordingTime,
      timestamp: new Date().toISOString(),
      location: { latitude: 0, longitude: 0 },
    };

    // If we have a real user, try to upload
    if (userId && !userId.startsWith("temp_")) {
      const fileName = `${vehicleData?.inspectionId || 'temp'}_${currentType}_${timestamp}.webm`;
      const result = await uploadFile("inspection-videos", previewBlob, fileName, userId);
      
      if (result) {
        newVideo.uri = result.path;
      }
    }

    setCapturedVideos((prev) => {
      const filtered = prev.filter(v => v.type !== currentType);
      return [...filtered, newVideo];
    });
    
    toast({
      title: "Video saved",
      description: `${currentVideo.label} captured successfully`,
    });

    // Cleanup preview
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);

    if (currentIndex < VIDEO_TYPES.length - 1) {
      setCurrentVideoIndex(currentIndex + 1);
    }
  }, [previewBlob, previewUrl, currentVideo, recordingTime, currentVideoIndex, userId, uploadFile, vehicleData, toast]);

  const retakeVideo = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
  }, [previewUrl]);

  const skipVideo = () => {
    toast({
      title: "Video skipped",
      description: `${currentVideo.label} skipped`,
    });
    if (currentVideoIndex < VIDEO_TYPES.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1);
    }
  };

  const skipAllVideos = () => {
    toast({
      title: "Videos skipped",
      description: "Proceeding to consent & auction",
    });
    handleComplete();
  };

  const handleComplete = () => {
    // Go directly to consent flow, which leads to auction
    navigate("/inspection/consent", {
      state: { 
        ...vehicleData, 
        videos: capturedVideos,
        images: vehicleData?.images || [],
        defects: vehicleData?.defects || [],
      },
    });
  };

  const handleStartAuction = () => {
    // Direct path to auction setup
    navigate("/auction/setup", {
      state: {
        registration: vehicleData?.registration,
        make: vehicleData?.make,
        model: vehicleData?.model,
        year: vehicleData?.year,
        conditionScore: 85, // Mock score for quick testing
        consentGiven: true,
        frozenAt: new Date().toISOString(),
      },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isVideoCaptured = (type: VideoType) => {
    return capturedVideos.some((vid) => vid.type === type);
  };

  const allVideosCaptured = capturedVideos.length === VIDEO_TYPES.length;
  const meetsMinDuration = recordingTime >= currentVideo.minDuration;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-card border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Video Capture</p>
          <p className="font-bold text-lg text-foreground">
            {currentVideoIndex + 1}/{VIDEO_TYPES.length}
          </p>
        </div>
        <button
          onClick={skipAllVideos}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Skip All
        </button>
      </header>

      {/* Progress */}
      <div className="px-4 py-2 bg-card">
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Current Video Info */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{currentVideo.label}</h2>
            <p className="text-muted-foreground text-xs">{currentVideo.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Min: {currentVideo.minDuration}s</p>
          </div>
        </div>
      </div>

      {/* Video Viewfinder */}
      <div className="flex-1 relative mx-4 mb-3 rounded-2xl overflow-hidden bg-secondary border-2 border-border">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-destructive text-center">{cameraError}</p>
          </div>
        ) : previewUrl ? (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            controls
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-mono font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Duration guide */}
        {isRecording && !meetsMinDuration && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-xs text-foreground">
              {currentVideo.minDuration - recordingTime}s more needed
            </p>
          </div>
        )}

        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Saving video...</p>
          </div>
        )}
      </div>

      {/* Video Type Thumbnails */}
      <div className="px-4 mb-3">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {VIDEO_TYPES.map((video, index) => {
            const captured = isVideoCaptured(video.type);
            const isCurrent = index === currentVideoIndex;
            
            return (
              <button
                key={video.type}
                onClick={() => !isRecording && setCurrentVideoIndex(index)}
                disabled={isRecording}
                className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-lg border-2 flex items-center gap-2 transition-all",
                  isCurrent && "border-primary bg-primary/10",
                  !isCurrent && captured && "border-success bg-success/10",
                  !isCurrent && !captured && "border-border bg-card hover:border-muted-foreground"
                )}
              >
                {captured ? (
                  <Check className={cn("w-4 h-4", isCurrent ? "text-primary" : "text-success")} />
                ) : (
                  <Video className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {video.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-2 bg-card border-t border-border">
        {previewUrl ? (
          <div className="flex gap-3">
            <Button 
              onClick={retakeVideo} 
              variant="outline" 
              className="flex-1 h-14 gap-2"
              disabled={isUploading}
            >
              <RotateCcw className="w-5 h-5" />
              Retake
            </Button>
            <Button 
              onClick={confirmVideo} 
              className="flex-1 h-14 gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {isUploading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        ) : allVideosCaptured ? (
          <div className="flex gap-3">
            <Button onClick={handleComplete} variant="outline" className="flex-1 h-14 gap-2">
              Review & Consent
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button onClick={handleStartAuction} className="flex-1 h-14 gap-2">
              <Gavel className="w-5 h-5" />
              Start Auction
            </Button>
          </div>
        ) : isRecording ? (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="w-full h-14"
            disabled={!meetsMinDuration}
          >
            <Square className="w-5 h-5 mr-2" />
            {meetsMinDuration ? "Stop Recording" : `Recording... (${currentVideo.minDuration - recordingTime}s)`}
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={skipVideo}
              variant="outline"
              className="w-14 h-14"
              size="icon"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button onClick={startRecording} className="flex-1 h-14 gap-2" disabled={!isCameraReady}>
              <Video className="w-5 h-5" />
              Start Recording
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;