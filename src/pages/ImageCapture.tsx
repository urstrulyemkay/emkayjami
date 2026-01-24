import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, Check, RotateCcw, ChevronRight, Loader2, AlertCircle, RefreshCw, Zap } from "lucide-react";
import { IMAGE_ANGLES, ImageAngle, CapturedImage } from "@/types/inspection";
import { useInspectionPersistence } from "@/hooks/useInspectionPersistence";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VehicleData {
  inspectionId?: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineCC?: number;
  odometerReading?: number;
  customerName?: string;
  customerPhone?: string;
}

const ImageCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleData = location.state as VehicleData | null;
  const { toast } = useToast();
  
  // Use persistence hook with inspection ID from navigation state
  const {
    inspectionId,
    userId,
    isLoading: isPersistenceLoading,
    capturedImages,
    saveImage,
    isAuthenticated,
  } = useInspectionPersistence(vehicleData?.inspectionId);

  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = IMAGE_ANGLES[currentAngleIndex];
  const progress = (capturedImages.length / IMAGE_ANGLES.length) * 100;

  // Find first uncaptured angle on load (to resume from where user left off)
  useEffect(() => {
    if (capturedImages.length > 0 && !isPersistenceLoading) {
      const capturedAngles = new Set(capturedImages.map(img => img.angle));
      const firstUncapturedIndex = IMAGE_ANGLES.findIndex(
        angle => !capturedAngles.has(angle.angle)
      );
      if (firstUncapturedIndex !== -1 && firstUncapturedIndex !== currentAngleIndex) {
        setCurrentAngleIndex(firstUncapturedIndex);
      }
    }
  }, [capturedImages, isPersistenceLoading]);

  const attachStreamToVideo = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    try {
      await video.play();
    } catch {
      // Ignore autoplay restrictions
    }

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setIsCameraReady(true);
    }
  }, []);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
        await attachStreamToVideo();
      } catch (err) {
        setCameraError("Unable to access camera. Please grant camera permissions.");
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [attachStreamToVideo]);

  // Re-attach camera when leaving preview mode
  useEffect(() => {
    if (!previewUrl) {
      void attachStreamToVideo();
    }
  }, [previewUrl, currentAngleIndex, attachStreamToVideo]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (!isCameraReady) {
      await attachStreamToVideo();
    }
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      toast({
        title: "Camera not ready",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          setPreviewBlob(blob);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }, "image/jpeg", 0.9);
    }
  }, [isCameraReady, attachStreamToVideo, toast]);

  const confirmImage = useCallback(async () => {
    if (!previewBlob) {
      toast({
        title: "No image to confirm",
        description: "Please capture an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const currentAngleValue = currentAngle.angle;
    const currentAngleLabel = currentAngle.label;
    const currentPreviewUrl = previewUrl;
    const currentIndex = currentAngleIndex;

    // Save image using persistence hook (handles storage + DB)
    const savedImage = await saveImage(currentAngleValue, previewBlob);

    setIsSaving(false);

    if (savedImage) {
      toast({
        title: "Image saved",
        description: `${currentAngleLabel} captured${isAuthenticated ? " and synced" : ""}`,
      });
    }

    // Cleanup preview
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
    }
    
    setPreviewBlob(null);
    setPreviewUrl(null);

    // Move to next angle if not at the end
    if (currentIndex < IMAGE_ANGLES.length - 1) {
      setCurrentAngleIndex(currentIndex + 1);
    }
  }, [previewBlob, previewUrl, currentAngle, currentAngleIndex, saveImage, isAuthenticated, toast]);

  const retakeImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
    void attachStreamToVideo();
  }, [previewUrl, attachStreamToVideo]);

  const skipToNext = () => {
    if (currentAngleIndex < IMAGE_ANGLES.length - 1) {
      setCurrentAngleIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentAngleIndex > 0) {
      setCurrentAngleIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    navigate("/inspection/video", {
      state: { ...vehicleData, inspectionId, images: capturedImages },
    });
  };

  // Skip all images for testing/QA purposes
  const handleSkipAllImages = () => {
    toast({
      title: "Skipping image capture",
      description: "Proceeding to video capture (test mode)",
    });
    navigate("/inspection/video", {
      state: { ...vehicleData, inspectionId, images: capturedImages, skippedImages: true },
    });
  };

  const isAngleCaptured = (angle: ImageAngle) => {
    return capturedImages.some((img) => img.angle === angle);
  };

  const allImagesCaptured = capturedImages.length === IMAGE_ANGLES.length;
  const currentAngleCaptured = isAngleCaptured(currentAngle.angle);

  // Show loading while restoring progress
  if (isPersistenceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading inspection...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Image Capture</p>
          <p className="font-bold text-lg text-foreground">
            {currentAngleIndex + 1}/{IMAGE_ANGLES.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
            {isAuthenticated && (
              <span className="text-[10px] text-success">Synced</span>
            )}
          </div>
          {/* Skip button for testing */}
          <Button
            onClick={handleSkipAllImages}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1 text-warning hover:text-warning hover:bg-warning/10"
          >
            <Zap className="w-3 h-3" />
            Skip
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
        <Progress value={progress} className="h-1.5" />
        {capturedImages.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            {capturedImages.length} images saved • Progress auto-saved
          </p>
        )}
      </div>

      {/* Current Angle Info Card */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{currentAngle.label}</h2>
            <p className="text-muted-foreground text-xs">{currentAngle.description}</p>
          </div>
          {currentAngleCaptured && (
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-success" />
            </div>
          )}
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative mx-4 mb-3 rounded-2xl overflow-hidden bg-secondary border-2 border-border">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-3">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-destructive text-center text-sm">{cameraError}</p>
          </div>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Captured preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm">
              <p className="text-xs font-medium text-foreground">Preview</p>
            </div>
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Camera overlay guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-primary/60 rounded-tl-lg" />
              <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-primary/60 rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-primary/60 rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-primary/60 rounded-br-lg" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/40" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/40" />
              </div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-xs text-foreground font-medium whitespace-nowrap">
                  Align {currentAngle.label.toLowerCase()}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Saving overlay */}
        {isSaving && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Saving image...</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Angle Thumbnails */}
      <div className="px-4 mb-3">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {IMAGE_ANGLES.map((angle, index) => {
            const captured = isAngleCaptured(angle.angle);
            const isCurrent = index === currentAngleIndex;
            
            return (
              <button
                key={angle.angle}
                onClick={() => setCurrentAngleIndex(index)}
                className={cn(
                  "flex-shrink-0 w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-all",
                  isCurrent && "border-primary bg-primary/10 ring-2 ring-primary/20",
                  !isCurrent && captured && "border-success bg-success/10",
                  !isCurrent && !captured && "border-border bg-card hover:border-muted-foreground"
                )}
              >
                {captured ? (
                  <Check className={cn("w-4 h-4", isCurrent ? "text-primary" : "text-success")} />
                ) : (
                  <span className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                )}
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
              onClick={retakeImage}
              variant="outline"
              className="flex-1 h-14 gap-2"
              disabled={isSaving}
            >
              <RotateCcw className="w-5 h-5" />
              Retake
            </Button>
            <Button 
              onClick={confirmImage} 
              className="flex-1 h-14 gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {isSaving ? "Saving..." : "Confirm"}
            </Button>
          </div>
        ) : allImagesCaptured ? (
          <Button onClick={handleComplete} className="w-full h-14 gap-2">
            Continue to Video
            <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={goToPrevious}
              variant="outline"
              disabled={currentAngleIndex === 0}
              className="w-14 h-14"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={captureImage}
              disabled={!isCameraReady}
              className="flex-1 h-14 gap-2"
            >
              <Camera className="w-6 h-6" />
              {currentAngleCaptured ? "Recapture" : "Capture"}
            </Button>
            <Button
              onClick={skipToNext}
              variant="outline"
              disabled={currentAngleIndex === IMAGE_ANGLES.length - 1}
              className="w-14 h-14"
              size="icon"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCapture;