import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Video, Mic, Check, AlertTriangle, ChevronRight, Send } from "lucide-react";
import { DEFECT_CATEGORIES } from "@/types/inspection";

const InspectionSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inspectionData = location.state || {};

  const images = inspectionData.images || [];
  const videos = inspectionData.videos || [];
  const defects = inspectionData.defects || [];

  const totalImages = 12;
  const totalVideos = 4;

  const handleSubmit = () => {
    // Would submit to backend
    navigate("/", { replace: true });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-destructive bg-destructive/10";
      case "major":
        return "text-warning bg-warning/10";
      case "moderate":
        return "text-info bg-info/10";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Inspection Summary</h1>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Vehicle Info */}
        {inspectionData.make && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-lg font-semibold text-foreground">
              {inspectionData.make} {inspectionData.model}
            </p>
            <p className="text-muted-foreground">
              {inspectionData.registration} • {inspectionData.year}
            </p>
          </div>
        )}

        {/* Capture Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Camera className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {images.length}/{totalImages}
            </p>
            <p className="text-xs text-muted-foreground">Images</p>
            {images.length === totalImages && (
              <Check className="w-4 h-4 text-success mx-auto mt-1" />
            )}
          </div>

          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Video className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {videos.length}/{totalVideos}
            </p>
            <p className="text-xs text-muted-foreground">Videos</p>
            {videos.length === totalVideos && (
              <Check className="w-4 h-4 text-success mx-auto mt-1" />
            )}
          </div>

          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Mic className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{defects.length}</p>
            <p className="text-xs text-muted-foreground">Defects</p>
            {defects.length > 0 && (
              <AlertTriangle className="w-4 h-4 text-warning mx-auto mt-1" />
            )}
          </div>
        </div>

        {/* Defects List */}
        {defects.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Recorded Defects</p>
            <div className="space-y-2">
              {defects.map((defect: any) => {
                const category = DEFECT_CATEGORIES.find((c) => c.category === defect.category);
                return (
                  <div
                    key={defect.id}
                    className="p-4 rounded-xl bg-card border border-border flex items-start gap-3"
                  >
                    <span className="text-xl">{category?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{category?.label}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(defect.severity)}`}
                        >
                          {defect.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {defect.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completion Status */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-3">Completion Status</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Images</span>
              <span
                className={`text-sm font-medium ${
                  images.length === totalImages ? "text-success" : "text-warning"
                }`}
              >
                {images.length === totalImages ? "Complete" : `${totalImages - images.length} missing`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Videos</span>
              <span
                className={`text-sm font-medium ${
                  videos.length === totalVideos ? "text-success" : "text-warning"
                }`}
              >
                {videos.length === totalVideos ? "Complete" : `${totalVideos - videos.length} missing`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Defect Notes</span>
              <span className="text-sm font-medium text-success">
                {defects.length} recorded
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleSubmit} className="w-full h-14">
            <Send className="w-5 h-5 mr-2" />
            Submit Inspection
          </Button>
          <Button
            onClick={() => navigate("/inspection/capture", { state: inspectionData })}
            variant="outline"
            className="w-full h-12"
          >
            Add More Evidence
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InspectionSummary;
