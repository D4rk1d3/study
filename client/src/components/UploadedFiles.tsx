import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, FileImage, FileArchive } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { FileInfo } from "@/types";

interface UploadedFilesProps {
  files: FileInfo[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
  onStartProcessing: () => void;
  disabled?: boolean;
}

export default function UploadedFiles({
  files,
  onRemoveFile,
  onClearAll,
  onStartProcessing,
  disabled = false,
}: UploadedFilesProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="text-red-500 h-6 w-6" />;
    } else if (fileType.includes("word") || fileType.includes("docx")) {
      return <FileText className="text-blue-500 h-6 w-6" />;
    } else if (fileType.includes("text") || fileType.includes("txt")) {
      return <FileText className="text-gray-500 h-6 w-6" />;
    } else if (fileType.includes("image")) {
      return <FileImage className="text-green-500 h-6 w-6" />;
    } else {
      return <FileArchive className="text-yellow-500 h-6 w-6" />;
    }
  };

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Uploaded Files</h2>
          {files.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
              onClick={onClearAll}
              disabled={disabled}
            >
              Clear All
            </Button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 transition-colors h-8 w-8 p-0"
                  onClick={() => onRemoveFile(file.id)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Button
            className="w-full bg-primary hover:bg-primary-600 text-white rounded-lg py-3 px-4 font-medium transition-colors"
            onClick={onStartProcessing}
            disabled={files.length === 0 || disabled}
          >
            Generate Study Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
