import * as React from "react";
import { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export interface FileUploadProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect: (files: File[]) => void;
  dropMessage?: string;
  browseMessage?: string;
  supportedFormatsMessage?: string;
  supportedFormats?: string[];
  icon?: React.ReactNode;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({
  onFileSelect,
  dropMessage = "Drag & drop files here",
  browseMessage = "or click to browse",
  supportedFormatsMessage = "Supported formats:",
  supportedFormats = ["PDF", "DOCX", "TXT", "MD", "JPG/PNG"],
  icon,
  maxSize,
  accept,
  className,
  ...props
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  }, [isDragOver]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={cn(
        "file-upload-area",
        isDragOver && "dragover",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        accept={accept}
        multiple
        {...props}
      />
      
      <div className="max-w-md mx-auto">
        {icon || (
          <div className="text-5xl text-primary-300 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
        )}
        <p className="mb-1 text-gray-700 font-medium">{dropMessage}</p>
        <p className="text-sm text-gray-500 mb-4">{browseMessage}</p>
        
        <p className="text-xs text-gray-500 mb-2">{supportedFormatsMessage}</p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {supportedFormats.map((format) => (
            <span key={format} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-mono">
              {format}
            </span>
          ))}
        </div>
        {maxSize && (
          <p className="text-xs text-gray-500">
            Maximum file size: {maxSize}MB
          </p>
        )}
      </div>
    </div>
  );
}
