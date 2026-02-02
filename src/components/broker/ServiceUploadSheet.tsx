import { useState, useRef } from "react";
import { Camera, Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceUploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType?: string;
  onUpload: (file: File, serviceType: string, notes?: string) => Promise<boolean>;
}

const SERVICE_TYPES = [
  { value: "rc_transfer", label: "RC Transfer Proof" },
  { value: "name_transfer", label: "Name Transfer Proof" },
  { value: "insurance", label: "Insurance Document" },
  { value: "noc", label: "NOC (No Objection Certificate)" },
  { value: "payment", label: "Payment Receipt" },
  { value: "other", label: "Other Document" },
];

const ServiceUploadSheet = ({
  open,
  onOpenChange,
  serviceType: initialServiceType,
  onUpload,
}: ServiceUploadSheetProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState(initialServiceType || "");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFilePickerOpen = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile || !serviceType) return;

    setUploading(true);
    try {
      const success = await onUpload(selectedFile, serviceType, notes || undefined);
      if (success) {
        // Reset form
        handleRemoveFile();
        setServiceType(initialServiceType || "");
        setNotes("");
        onOpenChange(false);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    handleRemoveFile();
    setServiceType(initialServiceType || "");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Upload Service Document</SheetTitle>
          <SheetDescription>
            Upload proof or documents for your service requirement
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* File selection area */}
          {!selectedFile ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={handleCameraCapture}
                >
                  <Camera className="w-8 h-8" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={handleFilePickerOpen}
                >
                  <Upload className="w-8 h-8" />
                  <span>Choose File</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Supported: Images (JPG, PNG), PDF, DOC, DOCX
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File preview */}
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                    <File className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-center truncate">{selectedFile.name}</p>
            </div>
          )}

          {/* Service type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Upload button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedFile || !serviceType || uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ServiceUploadSheet;
