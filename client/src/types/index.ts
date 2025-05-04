// File information object
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

// Processing options
export interface ProcessingOptions {
  summarizationLevel: number;
  generateIndex: boolean;
  generateGlossary: boolean;
  deduplicateContent: boolean;
  exportFormat: 'pdf' | 'docx' | 'html';
}

// Preview data for the document
export interface PreviewData {
  tableOfContents?: TableOfContentsItem[];
  summary?: string;
  glossary?: GlossaryItem[];
}

// Table of contents item
export interface TableOfContentsItem {
  number: string;
  title: string;
  level: number;
}

// Glossary item
export interface GlossaryItem {
  term: string;
  definition: string;
}

// Processing stages
export type ProcessingStage = 
  | 'idle'
  | 'preparing'
  | 'ocr'
  | 'parsing'
  | 'analyzing'
  | 'summarizing'
  | 'finalizing'
  | 'completed'
  | 'failed';

// Document status response
export interface DocumentStatusResponse {
  documentId: string;
  stage: ProcessingStage;
  progress: number;
  error?: string;
}

// Document model
export interface Document {
  id: string;
  title: string;
  progress: number;
  status: ProcessingStage;
  createdAt: string;
  updatedAt: string;
  fileIds: string[];
  outputPath?: string;
  exportFormat: string;
}

// Processed text content
export interface ProcessedContent {
  text: string;
  metadata: {
    title?: string;
    headings: { text: string; level: number }[];
    keywords: string[];
  };
}
