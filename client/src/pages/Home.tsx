import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProcessSteps from "@/components/ProcessSteps";
import FileUploader from "@/components/FileUploader";
import UploadedFiles from "@/components/UploadedFiles";
import ProcessingSettings from "@/components/ProcessingSettings";
import ProcessingStatus from "@/components/ProcessingStatus";
import OutputPreview from "@/components/OutputPreview";
import { nanoid } from "nanoid";
import { FileInfo, ProcessingOptions, PreviewData, ProcessingStage } from "@/types";

export default function Home() {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    summarizationLevel: 3,
    generateIndex: true,
    generateGlossary: true,
    deduplicateContent: true,
    exportFormat: "pdf",
  });
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const { toast } = useToast();

  // Steps for the process
  const steps = [
    { number: 1, title: "Upload", subtitle: "Materials" },
    { number: 2, title: "Processing", subtitle: "Files" },
    { number: 3, title: "Download", subtitle: "Compilation" },
  ];

  // Handle file selection
  const handleFilesSelected = (newFiles: File[]) => {
    // Add files to the state with unique IDs
    const fileInfos: FileInfo[] = newFiles.map((file) => ({
      id: nanoid(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));

    setFiles((prev) => [...prev, ...fileInfos]);
  };

  // Handle removing a file
  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Handle clearing all files
  const handleClearAllFiles = () => {
    setFiles([]);
  };

  // Handle processing options change
  const handleOptionsChange = (options: Partial<ProcessingOptions>) => {
    setProcessingOptions((prev) => ({ ...prev, ...options }));
  };

  // Poll for processing status
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (documentId && isProcessing) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/documents/${documentId}/status`);
          if (!response.ok) throw new Error("Failed to get status");
          
          const data = await response.json();
          
          setProcessingStage(data.stage);
          setProcessingProgress(data.progress);
          
          if (data.stage === "completed") {
            setIsProcessing(false);
            setCurrentStep(3);
            
            // Get preview data
            fetchPreviewData();
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [documentId, isProcessing]);

  // Fetch preview data
  const fetchPreviewData = async () => {
    if (!documentId) return;
    
    try {
      const response = await fetch(`/api/documents/${documentId}/preview`);
      if (!response.ok) throw new Error("Failed to get preview");
      
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error("Error fetching preview:", error);
      toast({
        title: "Error",
        description: "Failed to load document preview",
        variant: "destructive",
      });
    }
  };

  // Start processing
  const handleStartProcessing = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setCurrentStep(2);
    setProcessingStage("preparing");
    setProcessingProgress(0);
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append each file
    files.forEach((fileInfo) => {
      formData.append("files", fileInfo.file);
    });
    
    // Append processing options
    formData.append("options", JSON.stringify(processingOptions));
    
    try {
      // Upload files and start processing
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("File upload failed");
      }
      
      const data = await response.json();
      setDocumentId(data.documentId);
      
    } catch (error) {
      console.error("Error uploading files:", error);
      setIsProcessing(false);
      setCurrentStep(1);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle document download
  const handleDownloadDocument = async () => {
    if (!documentId) return;
    
    try {
      // Create an anchor and trigger the download
      const a = document.createElement("a");
      a.href = `/api/documents/${documentId}/download?format=${processingOptions.exportFormat}`;
      a.download = `study_notes.${processingOptions.exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get status text based on processing stage
  const getStatusText = () => {
    switch (processingStage) {
      case "preparing":
        return "Preparing Files";
      case "ocr":
        return "OCR Processing";
      case "parsing":
        return "Parsing Documents";
      case "analyzing":
        return "Analyzing Content";
      case "summarizing":
        return "Generating Summary";
      case "finalizing":
        return "Finalizing Document";
      default:
        return "Processing";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ProcessSteps steps={steps} currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Section */}
        <div className="lg:col-span-8">
          <FileUploader onFilesSelected={handleFilesSelected} />
          <UploadedFiles
            files={files}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAllFiles}
            onStartProcessing={handleStartProcessing}
            disabled={isProcessing}
          />
        </div>

        {/* Right Column: Settings & Status */}
        <div className="lg:col-span-4">
          <ProcessingSettings
            options={processingOptions}
            onChange={handleOptionsChange}
            disabled={isProcessing}
          />
          <ProcessingStatus
            status={getStatusText()}
            progress={processingProgress}
            isVisible={isProcessing}
          />
          <OutputPreview
            previewData={previewData}
            isVisible={currentStep === 3 && !!previewData}
            onDownload={handleDownloadDocument}
          />
        </div>
      </div>
    </div>
  );
}
