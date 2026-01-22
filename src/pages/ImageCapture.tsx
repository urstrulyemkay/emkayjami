import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, Check, RotateCcw, ChevronRight } from "lucide-react";
import { IMAGE_ANGLES, ImageAngle, CapturedImage } from "@/types/inspection";

const ImageCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleData = location.state;
  
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = IMAGE_ANGLES[currentAngleIndex];
  const progress = (capturedImages.length / IMAGE_ANGLES.length) * 100;

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

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageUri = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewImage(imageUri);
    }
    
    setIsCapturing(false);
  }, []);

  const confirmImage = useCallback(() => {
    if (!previewImage) return;

    const newImage: CapturedImage = {
      id: `img_${Date.now()}`,
      angle: currentAngle.angle as ImageAngle,
      uri: previewImage,
      timestamp: new Date().toISOString(),
      location: { latitude: 0, longitude: 0 }, // Would use geolocation API
    };

    setCapturedImages((prev) => [...prev, newImage]);
    setPreviewImage(null);

    if (currentAngleIndex < IMAGE_ANGLES.length - 1) {
      setCurrentAngleIndex((prev) => prev + 1);
    }
  }, [previewImage, currentAngle.angle, currentAngleIndex]);

  const retakeImage = () => {
    setPreviewImage(null);
  };

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

  const allImagesCaptured = capturedImages.length === IMAGE_ANGLES.length;

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
          <p className="text-sm text-muted-foreground">Image Capture</p>
          <p className="font-semibold text-foreground">
            {currentAngleIndex + 1} of {IMAGE_ANGLES.length}
          </p>
        </div>
        <div className="w-10" />
      </header>

      {/* Progress */}
      <div className="px-4 mb-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {capturedImages.length} captured
          </span>
          <span className="text-xs text-muted-foreground">
            {IMAGE_ANGLES.length - capturedImages.length} remaining
          </span>
        </div>
      </div>

      {/* Current Angle Info */}
      <div className="px-4 mb-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <h2 className="font-semibold text-foreground text-lg">{currentAngle.label}</h2>
          <p className="text-muted-foreground text-sm">{currentAngle.description}</p>
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative mx-4 mb-4 rounded-2xl overflow-hidden bg-secondary">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-destructive text-center">{cameraError}</p>
          </div>
        ) : previewImage ? (
          <img
            src={previewImage}
            alt="Captured"
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
        
        {/* Capture guide overlay */}
        {!previewImage && !cameraError && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-primary/50 rounded-xl" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full">
              <p className="text-xs text-foreground font-medium">
                Align {currentAngle.label.toLowerCase()} within frame
              </p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Angle Thumbnails */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {IMAGE_ANGLES.map((angle, index) => (
            <button
              key={angle.angle}
              onClick={() => setCurrentAngleIndex(index)}
              className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                index === currentAngleIndex
                  ? "border-primary bg-primary/10"
                  : isAngleCaptured(angle.angle)
                  ? "border-success bg-success/10"
                  : "border-border bg-card"
              }`}
            >
              {isAngleCaptured(angle.angle) ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <span className="text-xs text-muted-foreground font-medium">
                  {index + 1}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8">
        {previewImage ? (
          <div className="flex gap-3">
            <Button
              onClick={retakeImage}
              variant="outline"
              className="flex-1 h-14"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button onClick={confirmImage} className="flex-1 h-14">
              <Check className="w-5 h-5 mr-2" />
              Confirm
            </Button>
          </div>
        ) : allImagesCaptured ? (
          <Button onClick={handleComplete} className="w-full h-14">
            Continue to Video Capture
            <ChevronRight className="w-5 h-5 ml-2" />
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
              disabled={isCapturing}
              className="flex-1 h-14 btn-capture"
            >
              <Camera className="w-6 h-6" />
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
