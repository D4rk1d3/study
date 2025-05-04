import fs from 'fs/promises';
import path from 'path';
import { db } from '@db';
import * as schema from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { Document, ProcessingOptions } from '../client/src/types';
import { nanoid } from 'nanoid';

// Ensure storage directories exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const OUTPUT_DIR = path.join(process.cwd(), 'outputs');

// Create directories if they don't exist
async function ensureDirectoriesExist() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

ensureDirectoriesExist();

export const storage = {
  // Create a new document
  async createDocument(title: string, options: ProcessingOptions): Promise<string> {
    // Generate a random ID
    const id = nanoid();
    
    const [document] = await db.insert(schema.documents).values({
      id,
      title,
      status: 'preparing',
      progress: 0,
      exportFormat: options.exportFormat,
      settings: JSON.stringify(options)
    }).returning({ id: schema.documents.id });
    
    return document.id;
  },
  
  // Update document status
  async updateDocumentStatus(documentId: string, status: string, progress: number, errorMessage?: string): Promise<void> {
    const updateData: any = {
      status,
      progress,
      updatedAt: new Date()
    };
    
    // Se è stato fornito un messaggio di errore, aggiungilo ai metadati
    if (errorMessage) {
      // Ottieni il documento corrente per aggiornare i metadati
      const document = await this.getDocumentById(documentId);
      if (document) {
        // Aggiungi l'errore ai metadati
        const settingsObj = document.settings ? JSON.parse(document.settings || '{}') : {};
        settingsObj.lastErrorMessage = errorMessage;
        settingsObj.lastErrorTime = new Date().toISOString();
        
        // Aggiorna i metadati
        updateData.settings = JSON.stringify(settingsObj);
      }
    }
    
    await db.update(schema.documents)
      .set(updateData)
      .where(eq(schema.documents.id, documentId));
  },
  
  // Update document output path
  async updateDocumentOutput(documentId: string, outputPath: string): Promise<void> {
    await db.update(schema.documents)
      .set({ outputPath: outputPath, status: 'completed', progress: 100, updatedAt: new Date() })
      .where(eq(schema.documents.id, documentId));
  },
  
  // Get document by ID
  async getDocumentById(documentId: string): Promise<Document | null> {
    const document = await db.query.documents.findFirst({
      where: eq(schema.documents.id, documentId),
      with: {
        files: true
      }
    });
    
    if (!document) return null;
    
    return {
      id: document.id,
      title: document.title,
      progress: document.progress,
      status: document.status as any,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      fileIds: document.files.map(file => file.id),
      outputPath: document.outputPath || undefined,
      exportFormat: document.exportFormat
    };
  },
  
  // Save file information
  async saveFile(documentId: string, originalname: string, filename: string, mimetype: string, size: number): Promise<string> {
    // Generate a random ID
    const id = nanoid();
    
    const [file] = await db.insert(schema.files).values({
      id,
      documentId: documentId,
      originalName: originalname,
      filename,
      mimetype,
      size,
      status: 'uploaded'
    }).returning({ id: schema.files.id });
    
    return file.id;
  },
  
  // Get file path
  async getFilePath(fileId: string): Promise<string> {
    const file = await db.query.files.findFirst({
      where: eq(schema.files.id, fileId)
    });
    
    if (!file) {
      throw new Error(`File not found with ID: ${fileId}`);
    }
    
    return path.join(UPLOAD_DIR, file.filename);
  },
  
  // Get output path
  getOutputPath(documentId: string, format: string): string {
    return path.join(OUTPUT_DIR, `${documentId}.${format}`);
  },
  
  // Save file to disk
  async saveFileToDisk(buffer: Buffer, filename: string): Promise<void> {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filepath, buffer);
  },
  
  // Store processed content
  async storeProcessedContent(fileId: string, content: string, metadata: any): Promise<void> {
    await db.update(schema.files)
      .set({ 
        processedContent: content,
        metadata: JSON.stringify(metadata),
        status: 'processed',
        updatedAt: new Date()
      })
      .where(eq(schema.files.id, fileId));
  },
  
  // Get processed content for a document
  async getProcessedContentForDocument(documentId: string): Promise<Array<{ content: string, metadata: any }>> {
    const files = await db.query.files.findMany({
      where: eq(schema.files.documentId, documentId),
      orderBy: schema.files.createdAt
    });
    
    return files.map(file => ({
      content: file.processedContent || '',
      metadata: file.metadata ? JSON.parse(file.metadata) : {}
    }));
  },
  
  // Get document settings
  async getDocumentSettings(documentId: string): Promise<ProcessingOptions | null> {
    const document = await db.query.documents.findFirst({
      where: eq(schema.documents.id, documentId)
    });
    
    if (!document || !document.settings) return null;
    
    return JSON.parse(document.settings) as ProcessingOptions;
  }
};
