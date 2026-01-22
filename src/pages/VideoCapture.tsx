import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Video, Square, Check, RotateCcw, ChevronRight, Loader2 } from "lucide-react";
import { VideoType, CapturedVideo } from "@/types/inspection";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VIDEO_TYPES: { type: VideoType; label: string; description: string; minDuration: number }[] = [
  { type: "walkaround", label: "360° Walkaround", description: "Walk around the entire bike slowly", minDuration: 15 },
  { type: "engine_start", label: "Engine Start", description: "Capture cold start behavior", minDuration: 10 },
  { type: "idle_sound", label: "Idle Sound", description: "Record engine idling for 10 seconds", minDuration: 10 },
  { type: "acceleration", label: "Acceleration", description: "Rev the engine gently", minDuration: 8 },
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = VIDEO_TYPES[currentVideoIndex];
  const progress = (capturedVideos.length / VIDEO_TYPES.length) * 100;

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
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
    if (!previewBlob || !userId) return;

    const timestamp = Date.now();
    const fileName = `${vehicleData?.inspectionId || 'temp'}_${currentVideo.type}_${timestamp}.webm`;

    // Upload to storage
    const result = await uploadFile("inspection-videos", previewBlob, fileName, userId);
    
    if (!result) {
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const newVideo: CapturedVideo = {
      id: `vid_${timestamp}`,
      type: currentVideo.type,
      uri: result.path, // Store the storage path
      duration: recordingTime,
      timestamp: new Date().toISOString(),
      location: { latitude: 0, longitude: 0 },
    };

    setCapturedVideos((prev) => [...prev, newVideo]);
    
    // Cleanup preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);

    if (currentVideoIndex < VIDEO_TYPES.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1);
    }
  }, [previewBlob, previewUrl, currentVideo.type, recordingTime, currentVideoIndex, userId, uploadFile, vehicleData, toast]);

  const retakeVideo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
  };

  const handleComplete = () => {
    navigate("/inspection/voice", {
      state: { ...vehicleData, videos: capturedVideos },
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
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Video Capture</p>
          <p className="font-semibold text-foreground">
            {currentVideoIndex + 1} of {VIDEO_TYPES.length}
          </p>
        </div>
        <div className="w-10" />
      </header>

      {/* Progress */}
      <div className="px-4 mb-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Video Info */}
      <div className="px-4 mb-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <h2 className="font-semibold text-foreground text-lg">{currentVideo.label}</h2>
          <p className="text-muted-foreground text-sm">{currentVideo.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Minimum duration: {currentVideo.minDuration}s
          </p>
        </div>
      </div>

      {/* Video Viewfinder */}
      <div className="flex-1 relative mx-4 mb-4 rounded-2xl overflow-hidden bg-secondary">
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full">
            <p className="text-xs text-foreground">
              Keep recording: {currentVideo.minDuration - recordingTime}s more
            </p>
          </div>
        )}

        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-foreground">Uploading video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Type Thumbnails */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {VIDEO_TYPES.map((video, index) => (
            <button
              key={video.type}
              onClick={() => !isRecording && setCurrentVideoIndex(index)}
              disabled={isRecording}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                index === currentVideoIndex
                  ? "border-primary bg-primary/10"
                  : isVideoCaptured(video.type)
                  ? "border-success bg-success/10"
                  : "border-border bg-card"
              }`}
            >
              {isVideoCaptured(video.type) ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Video className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {video.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8">
        {previewUrl ? (
          <div className="flex gap-3">
            <Button 
              onClick={retakeVideo} 
              variant="outline" 
              className="flex-1 h-14"
              disabled={isUploading}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button 
              onClick={confirmVideo} 
              className="flex-1 h-14"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Confirm"}
            </Button>
          </div>
        ) : allVideosCaptured ? (
          <Button onClick={handleComplete} className="w-full h-14">
            Continue to Voice Notes
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : isRecording ? (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="w-full h-14"
            disabled={!meetsMinDuration}
          >
            <Square className="w-5 h-5 mr-2" />
            {meetsMinDuration ? "Stop Recording" : `Recording... (${currentVideo.minDuration - recordingTime}s more)`}
          </Button>
        ) : (
          <Button onClick={startRecording} className="w-full h-14">
            <Video className="w-5 h-5 mr-2" />
            Start Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;
