import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, Check, RotateCcw, ChevronRight, Loader2, X, AlertCircle } from "lucide-react";
import { IMAGE_ANGLES, ImageAngle, CapturedImage } from "@/types/inspection";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ImageCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleData = location.state;
  const { uploadFile, isUploading } = useStorageUpload();
  const { toast } = useToast();
  
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = IMAGE_ANGLES[currentAngleIndex];
  const progress = (capturedImages.length / IMAGE_ANGLES.length) * 100;

  // Get current user - allow mock user for development
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // For development/mock purposes, use a temp ID
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
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
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
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    
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
  }, [isCameraReady]);

  const confirmImage = useCallback(async () => {
    if (!previewBlob) {
      toast({
        title: "No image to confirm",
        description: "Please capture an image first.",
        variant: "destructive",
      });
      return;
    }

    const timestamp = Date.now();
    
    // Create image object first (for local state)
    const newImage: CapturedImage = {
      id: `img_${timestamp}`,
      angle: currentAngle.angle as ImageAngle,
      uri: previewUrl || "", // Use local URL for now
      timestamp: new Date().toISOString(),
      location: { latitude: 0, longitude: 0 },
    };

    // If we have a user, try to upload
    if (userId && !userId.startsWith("temp_")) {
      const fileName = `${vehicleData?.inspectionId || 'temp'}_${currentAngle.angle}_${timestamp}.jpg`;
      const result = await uploadFile("inspection-images", previewBlob, fileName, userId);
      
      if (result) {
        newImage.uri = result.path;
      }
    }

    // Add to captured images
    setCapturedImages((prev) => {
      // Replace if already captured for this angle
      const filtered = prev.filter(img => img.angle !== currentAngle.angle);
      return [...filtered, newImage];
    });
    
    // Show success toast
    toast({
      title: "Image captured",
      description: `${currentAngle.label} saved successfully`,
    });

    // Cleanup preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);

    // Move to next angle if not at the end
    if (currentAngleIndex < IMAGE_ANGLES.length - 1) {
      setCurrentAngleIndex((prev) => prev + 1);
    }
  }, [previewBlob, previewUrl, currentAngle, currentAngleIndex, userId, uploadFile, vehicleData, toast]);

  const retakeImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
  }, [previewUrl]);

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
      state: { ...vehicleData, images: capturedImages },
    });
  };

  const isAngleCaptured = (angle: ImageAngle) => {
    return capturedImages.some((img) => img.angle === angle);
  };

  const getCapturedImage = (angle: ImageAngle) => {
    return capturedImages.find((img) => img.angle === angle);
  };

  const allImagesCaptured = capturedImages.length === IMAGE_ANGLES.length;
  const currentAngleCaptured = isAngleCaptured(currentAngle.angle);

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
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
        <Progress value={progress} className="h-1.5" />
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
              {/* Corner guides */}
              <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-primary/60 rounded-tl-lg" />
              <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-primary/60 rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-primary/60 rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-primary/60 rounded-br-lg" />
              
              {/* Center target */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/40" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/40" />
              </div>
              
              {/* Instruction banner */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-xs text-foreground font-medium whitespace-nowrap">
                  Align {currentAngle.label.toLowerCase()}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Upload overlay */}
        {isUploading && (
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
              disabled={isUploading}
            >
              <RotateCcw className="w-5 h-5" />
              Retake
            </Button>
            <Button 
              onClick={confirmImage} 
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