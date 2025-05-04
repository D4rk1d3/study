import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const handleFileSelect = (files: File[]) => {
    onFilesSelected(files);
  };

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Study Materials</h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
          icon={<Upload className="h-12 w-12 text-primary-300 mx-auto mb-2" />}
          maxSize={20}
        />
      </CardContent>
    </Card>
  );
}
