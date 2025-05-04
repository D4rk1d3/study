import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { fileProcessor } from "./services/fileProcessor";
import { pdfGenerator } from "./services/pdfGenerator";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (_req, file, cb) => {
    // Check file types by extension only (ignoring MIME type which can be unreliable for text files)
    const filetypes = /pdf|docx?|txt|jpe?g|png|md|markdown/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    }
    
    cb(new Error("File upload only supports PDF, DOCX, TXT, MD, JPG, and PNG formats"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new document
  app.post("/api/documents", upload.array("files", 10), async (req: Request, res: Response) => {
    try {
      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      // Get processing options
      const options = req.body.options ? JSON.parse(req.body.options) : {};
      
      // Create document
      const documentId = await storage.createDocument("Study Notes", options);
      
      // Process each file
      for (const file of req.files as Express.Multer.File[]) {
        // Generate unique filename
        const filename = `${nanoid()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        
        // Save file metadata to database
        await storage.saveFile(
          documentId,
          file.originalname,
          filename,
          file.mimetype,
          file.size
        );
        
        // Save file to disk
        await storage.saveFileToDisk(file.buffer, filename);
      }
      
      // Start background processing
      fileProcessor.processDocumentFiles(documentId);
      
      // Return document ID
      res.status(201).json({ documentId });
    } catch (error: any) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  });
  
  // Get document status
  app.get("/api/documents/:id/status", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocumentById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({
        documentId: document.id,
        stage: document.status,
        progress: document.progress
      });
    } catch (error: any) {
      console.error("Error getting document status:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  });
  
  // Get document preview
  app.get("/api/documents/:id/preview", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocumentById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // If document is not processed yet
      if (document.status !== "completed") {
        return res.status(400).json({ message: "Document processing not completed" });
      }
      
      // Get processed content
      const processedContents = await storage.getProcessedContentForDocument(req.params.id);
      
      // Generate preview data
      const tableOfContents: any[] = [];
      let glossary: any[] = [];
      let summary = "";
      
      // Extract TOC from metadata
      processedContents.forEach(({ metadata }) => {
        if (metadata && metadata.headings) {
          metadata.headings.forEach((heading: { text: string; level: number }, index: number) => {
            const prefix = heading.level === 1 ? `${tableOfContents.filter(h => h.level === 1).length + 1}.` : 
                          `${Math.floor(index / 3) + 1}.${index % 3 + 1}`;
            
            tableOfContents.push({
              number: prefix,
              title: heading.text,
              level: heading.level - 1
            });
          });
        }
      });
      
      // Get summary from first processed content
      if (processedContents.length > 0) {
        const firstContent = processedContents[0].content;
        summary = firstContent.substring(0, 250) + "...";
        
        // Generate simple glossary from keywords
        const keywords = processedContents.reduce((acc, { metadata }) => {
          return acc.concat(metadata.keywords || []);
        }, [] as string[]);
        
        // Deduplicate keywords
        const uniqueKeywords = [...new Set(keywords)];
        
        // Create glossary items (mock definitions for preview)
        glossary = uniqueKeywords.slice(0, 5).map(term => ({
          term,
          definition: `Definition for ${term} would appear here after processing.`
        }));
      }
      
      res.json({
        tableOfContents,
        summary,
        glossary
      });
    } catch (error: any) {
      console.error("Error getting document preview:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  });
  
  // Download document
  app.get("/api/documents/:id/download", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocumentById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // If document is not processed yet
      if (document.status !== "completed") {
        return res.status(400).json({ message: "Document processing not completed" });
      }
      
      // Check if output file exists
      const format = req.query.format as string || document.exportFormat;
      const outputPath = storage.getOutputPath(document.id, format);
      
      if (!fs.existsSync(outputPath)) {
        // Generate the document if it doesn't exist
        await pdfGenerator.generateDocument(document.id, format);
      }
      
      // Set appropriate Content-Type
      const contentTypes: Record<string, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        html: 'text/html'
      };
      
      res.setHeader('Content-Type', contentTypes[format] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="study_notes.${format}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
