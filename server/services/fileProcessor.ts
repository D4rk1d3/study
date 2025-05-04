import { storage } from "../storage";
import { ocrService } from "./ocrService";
import { textAnalyzer } from "./textAnalyzer";
import { pdfGenerator } from "./pdfGenerator";
import fs from 'fs/promises';
import path from 'path';
import * as mammoth from 'mammoth';

// Process document files in background
export const fileProcessor = {
  async processDocumentFiles(documentId: string): Promise<void> {
    try {
      // Get document
      const document = await storage.getDocumentById(documentId);
      if (!document) throw new Error("Document not found");
      
      // Update document status
      await storage.updateDocumentStatus(documentId, "ocr", 5);
      
      // Get document settings
      const settings = await storage.getDocumentSettings(documentId);
      if (!settings) throw new Error("Document settings not found");
      
      // Get files associated with document
      const files = await storage.getDocumentById(documentId);
      if (!files) throw new Error("No files found for document");
      
      // Track progress
      let processedFileCount = 0;
      const totalFiles = files.fileIds.length;
      
      // Process each file
      for (const fileId of files.fileIds) {
        try {
          // Get file info from database
          const file = await storage.getDocumentById(documentId);
          if (!file) continue;
          
          // Get file path
          const filePath = storage.getFilePath(file.fileIds[0]);
          
          // Extract text based on file type
          let text = "";
          let metadata: any = { headings: [], keywords: [] };
          
          // Update document status
          await storage.updateDocumentStatus(
            documentId, 
            "ocr", 
            5 + Math.round((processedFileCount / totalFiles) * 20)
          );
          
          // Process file based on type
          if (filePath.endsWith(".pdf")) {
            // PDF file processing
            text = await this.processPdfFile(filePath);
          } else if (filePath.endsWith(".docx") || filePath.endsWith(".doc")) {
            // Word document processing
            text = await this.processWordFile(filePath);
          } else if (filePath.endsWith(".txt")) {
            // Text file processing
            text = await this.processTextFile(filePath);
          } else if (/\.(jpe?g|png)$/i.test(filePath)) {
            // Image file processing with OCR
            text = await ocrService.extractTextFromImage(filePath);
          }
          
          // Update document status to parsing
          await storage.updateDocumentStatus(
            documentId, 
            "parsing", 
            25 + Math.round((processedFileCount / totalFiles) * 20)
          );
          
          // Analyze and extract structure
          if (text) {
            metadata = await textAnalyzer.analyzeText(text);
          }
          
          // Store processed content
          await storage.storeProcessedContent(fileId, text, metadata);
          
          // Increment processed count
          processedFileCount++;
          
          // Update progress
          await storage.updateDocumentStatus(
            documentId,
            "analyzing",
            45 + Math.round((processedFileCount / totalFiles) * 20)
          );
        } catch (error) {
          console.error(`Error processing file ${fileId}:`, error);
        }
      }
      
      // Update status to summarizing
      await storage.updateDocumentStatus(documentId, "summarizing", 65);
      
      // Get all processed content for the document
      const processedContents = await storage.getProcessedContentForDocument(documentId);
      
      // Combine all text
      const combinedText = processedContents.map(item => item.content).join("\n\n");
      
      // Remove duplicate content if enabled
      let dedupedText = combinedText;
      if (settings.deduplicateContent) {
        dedupedText = await textAnalyzer.deduplicateContent(combinedText);
      }
      
      // Generate summary
      const summarizedText = await textAnalyzer.summarizeText(
        dedupedText,
        settings.summarizationLevel
      );
      
      // Extract headings and keywords
      const combinedMetadata = processedContents.reduce(
        (acc, { metadata }) => {
          if (metadata.headings) acc.headings.push(...metadata.headings);
          if (metadata.keywords) acc.keywords.push(...metadata.keywords);
          return acc;
        },
        { headings: [], keywords: [] }
      );
      
      // Update status to finalizing
      await storage.updateDocumentStatus(documentId, "finalizing", 85);
      
      // Generate document based on settings
      const generatedFilePath = await pdfGenerator.generateDocument(
        documentId,
        settings.exportFormat,
        {
          text: summarizedText,
          metadata: combinedMetadata,
          generateIndex: settings.generateIndex,
          generateGlossary: settings.generateGlossary
        }
      );
      
      // Update document with output path
      await storage.updateDocumentOutput(documentId, generatedFilePath);
      
      // Completed
      await storage.updateDocumentStatus(documentId, "completed", 100);
    } catch (error) {
      console.error("Error processing document:", error);
      
      // Update document status to failed
      await storage.updateDocumentStatus(documentId, "failed", 0);
    }
  },
  
  async processPdfFile(filePath: string): Promise<string> {
    // In a real implementation, use a PDF parsing library
    // For this demo, we'll simulate PDF text extraction
    return `Sample extracted text from PDF file at ${filePath}. This would contain all the text content from the PDF document parsed using a proper PDF library.`;
  },
  
  async processWordFile(filePath: string): Promise<string> {
    try {
      // Use mammoth.js to extract text from Word documents
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error("Error processing Word file:", error);
      return "";
    }
  },
  
  async processTextFile(filePath: string): Promise<string> {
    try {
      // Simply read the text file
      const text = await fs.readFile(filePath, 'utf-8');
      return text;
    } catch (error) {
      console.error("Error processing text file:", error);
      return "";
    }
  }
};
