"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary";
}

export function ImageUpload({
  onFileChange,
  accept = "image/*",
  maxSizeMB = 5,
  buttonText = "Upload Image",
  variant = "outline",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }
    
    onFileChange(file);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Button 
        type="button" 
        onClick={handleClick} 
        variant={variant}
      >
        <Upload className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default ImageUpload;
