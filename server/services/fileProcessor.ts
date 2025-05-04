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
      console.log(`Processing document files for document ${documentId}`);
      
      // Get document
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        console.error("Document not found");
        throw new Error("Document not found");
      }
      
      console.log(`Document found: ${document.id}, status: ${document.status}`);
      
      // Update document status
      await storage.updateDocumentStatus(documentId, "ocr", 5);
      
      // Get document settings
      const settings = await storage.getDocumentSettings(documentId);
      if (!settings) {
        console.error("Document settings not found");
        throw new Error("Document settings not found");
      }
      
      console.log(`Document settings: ${JSON.stringify(settings)}`);
      
      // Track progress
      let processedFileCount = 0;
      const totalFiles = document.fileIds.length;
      
      console.log(`Found ${totalFiles} files to process`);
      
      // Process each file
      for (const fileId of document.fileIds) {
        try {
          console.log(`Processing file ID: ${fileId}`);
          
          // Extract text based on file type
          let text = "";
          let metadata: any = { headings: [], keywords: [] };
          
          // Update document status
          await storage.updateDocumentStatus(
            documentId, 
            "ocr", 
            5 + Math.round((processedFileCount / totalFiles) * 20)
          );
          
          // Get file path - ensure we await the Promise
          const filePath = await storage.getFilePath(fileId);
          console.log(`File path: ${filePath}`);
            
          // Now that we have awaited the Promise, we can use the string methods
          // Process file based on type
          if (filePath.endsWith(".pdf")) {
            // PDF file processing
            console.log("Processing PDF file");
            text = await this.processPdfFile(filePath);
          } else if (filePath.endsWith(".docx") || filePath.endsWith(".doc")) {
            // Word document processing
            console.log("Processing Word file");
            text = await this.processWordFile(filePath);
          } else if (filePath.endsWith(".txt")) {
            // Text file processing
            console.log("Processing Text file");
            text = await this.processTextFile(filePath);
          } else if (filePath.endsWith(".md") || filePath.endsWith(".markdown")) {
            // Markdown file processing
            console.log("Processing Markdown file");
            text = await this.processMarkdownFile(filePath);
          } else if (/\.(jpe?g|png|gif|bmp|tiff?)$/i.test(filePath)) {
            // Image file processing with OCR
            console.log("Elaborazione immagine con OCR:", filePath);
            
            try {
              // Pre-process the image if needed (rotazione, miglioramento contrasto, ecc.)
              const preprocessedPath = await ocrService.preprocessImage(filePath);
              
              // Extract text using OCR
              console.log("Avvio OCR su immagine preprocessata");
              text = await ocrService.extractTextFromImage(preprocessedPath);
              
              if (!text || text.trim().length === 0) {
                console.warn("OCR non ha estratto testo dall'immagine");
                await storage.updateDocumentStatus(documentId, "ocr", 35, 
                  "Non è stato possibile estrarre testo dall'immagine. Controlla che l'immagine contenga testo leggibile.");
              } else {
                console.log(`OCR completato con successo. Estratti ${text.length} caratteri.`);
              }
            } catch (error) {
              console.error("Errore nell'elaborazione OCR:", error);
              await storage.updateDocumentStatus(documentId, "ocr", 35, 
                "Si è verificato un errore durante l'OCR. Prova con un'immagine di migliore qualità.");
              text = '';
            }
          } else {
            console.log(`Formato file non supportato: ${filePath}`);
          }
          
          console.log(`Extracted text (sample): ${text.substring(0, 100)}...`);
          
          // Update document status to parsing
          await storage.updateDocumentStatus(
            documentId, 
            "parsing", 
            25 + Math.round((processedFileCount / totalFiles) * 20)
          );
          
          // Analyze and extract structure
          if (text) {
            console.log('Analyzing text structure...');
            metadata = await textAnalyzer.analyzeText(text);
            console.log(`Extracted metadata: ${JSON.stringify(metadata)}`);
          } else {
            console.log('No text extracted, skipping analysis');
          }
          
          // Store processed content
          console.log(`Storing processed content for file ${fileId}`);
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
      const combinedMetadata: {
        headings: Array<{ text: string; level: number }>;
        keywords: string[];
        glossaryItems?: Array<{ term: string; definition: string }>;
      } = processedContents.reduce(
        (acc: { 
          headings: Array<{ text: string; level: number }>; 
          keywords: string[];
        }, { metadata }) => {
          if (metadata.headings && Array.isArray(metadata.headings)) {
            // Dobbiamo fare un cast esplicito dei tipi per evitare errori TS
            const typedHeadings = metadata.headings as Array<{ text: string; level: number }>;
            acc.headings = [...acc.headings, ...typedHeadings];
          }
          if (metadata.keywords && Array.isArray(metadata.keywords)) {
            // Dobbiamo fare un cast esplicito dei tipi per evitare errori TS
            const typedKeywords = metadata.keywords as string[];
            acc.keywords = [...acc.keywords, ...typedKeywords];
          }
          return acc;
        },
        { headings: [], keywords: [] }
      );
      
      // Rielabora il testo utilizzando OpenAI se richiesto
      let processedText = summarizedText;
      let aiUsed = false;
      
      if (settings.useAI) {
        if (process.env.OPENAI_API_KEY) {
          console.log("Rielaborando il testo con OpenAI...");
          try {
            const rewrittenText = await textAnalyzer.rewriteText(
              summarizedText,
              settings.rewriteLevel || 3
            );
            
            // Verifica se il testo è stato effettivamente rielaborato
            if (rewrittenText !== summarizedText) {
              processedText = rewrittenText;
              aiUsed = true;
              console.log("Rielaborazione AI completata con successo");
            } else {
              console.log("Il testo non è stato rielaborato da AI, si utilizza la versione originale");
            }
          } catch (error) {
            console.error("Errore nella rielaborazione del testo:", error);
            // Aggiorna il documento con informazioni sull'errore
            await storage.updateDocumentStatus(documentId, "analyzing", 70);
          }
        } else {
          console.log("OpenAI API key non configurata. Utilizzo metodi tradizionali.");
          await storage.updateDocumentStatus(documentId, "analyzing", 70);
        }
      } else {
        console.log("Rielaborazione AI non richiesta");
      }
      
      // Genera un glossario avanzato se richiesto
      if (settings.generateGlossary) {
        if (process.env.OPENAI_API_KEY) {
          console.log("Generando un glossario avanzato con OpenAI");
          try {
            combinedMetadata.glossaryItems = await textAnalyzer.generateGlossary(
              processedText, 
              combinedMetadata.keywords
            );
          } catch (error) {
            console.error("Errore nella generazione del glossario:", error);
            combinedMetadata.glossaryItems = combinedMetadata.keywords.slice(0, 10).map(term => ({
              term,
              definition: `Termine chiave del documento identificato tramite analisi del testo.`
            }));
          }
        } else {
          console.log("OpenAI API key non configurata. Generando glossario semplificato.");
          combinedMetadata.glossaryItems = combinedMetadata.keywords.slice(0, 10).map(term => ({
            term,
            definition: `Termine chiave del documento identificato tramite analisi del testo.`
          }));
        }
      }
      
      // Update status to finalizing
      await storage.updateDocumentStatus(documentId, "finalizing", 85);
      
      // Generate document based on settings
      const generatedFilePath = await pdfGenerator.generateDocument(
        documentId,
        settings.exportFormat,
        {
          text: processedText, // Use the rewritten text if available
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
  },
  
  async processMarkdownFile(filePath: string): Promise<string> {
    try {
      // Read the markdown file
      const markdownText = await fs.readFile(filePath, 'utf-8');
      
      // Basic markdown to plain text conversion
      // Remove headers (# Header)
      let plainText = markdownText.replace(/#{1,6}\s+([^\n]+)/g, '$1\n');
      
      // Remove bold and italic markers
      plainText = plainText.replace(/(\*\*|__)(.*?)\1/g, '$2');
      plainText = plainText.replace(/(\*|_)(.*?)\1/g, '$2');
      
      // Convert links [text](url) to just text
      plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      // Convert lists to plain text
      plainText = plainText.replace(/^\s*[-*+]\s+/gm, '• ');
      plainText = plainText.replace(/^\s*\d+\.\s+/gm, '• ');
      
      // Remove code blocks
      plainText = plainText.replace(/```[\s\S]*?```/g, '');
      
      // Remove horizontal rules
      plainText = plainText.replace(/^\s*[-*_]{3,}\s*$/gm, '');
      
      return plainText;
    } catch (error) {
      console.error("Error processing markdown file:", error);
      return "";
    }
  }
};
