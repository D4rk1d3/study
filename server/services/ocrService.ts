import { createWorker } from 'tesseract.js';
import fs from 'fs/promises';

// Definiamo un tipo personalizzato per il worker di Tesseract.js
// poiché TypeScript non riconosce correttamente i tipi dalla libreria
interface TesseractWorker {
  loadLanguage: (langs: string) => Promise<any>;
  initialize: (langs: string) => Promise<any>;
  recognize: (image: Buffer | string) => Promise<{
    data: { text: string; hocr: string; };
  }>;
  terminate: () => Promise<any>;
}

// OCR service for extracting text from images
export const ocrService = {
  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      console.log(`Eseguendo OCR sull'immagine: ${imagePath}`);
      
      // Create a worker (using newer API)
      // Cast per correggere l'errore di TypeScript
      const worker = await createWorker() as unknown as TesseractWorker;
      
      try {
        // Read the image file
        const imageBuffer = await fs.readFile(imagePath);
        
        // Recognize text (simplified API call)
        console.log("Esecuzione riconoscimento OCR...");
        const result = await worker.recognize(imageBuffer);
        
        const extractedText = result.data.text || '';
        
        console.log(`OCR completato, testo estratto (prime 100 lettere): ${extractedText.substring(0, 100)}...`);
        
        // Terminate the worker
        await worker.terminate();
        
        return extractedText;
      } catch (innerError) {
        console.error('Errore durante il processo OCR:', innerError);
        
        // Assicuriamoci che il worker venga terminato anche in caso di errore
        try {
          await worker.terminate();
        } catch (e) {
          console.error('Errore durante la terminazione del worker OCR:', e);
        }
        
        throw innerError;
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      // Registra maggiori dettagli sull'errore
      if (error instanceof Error) {
        console.error(`OCR error details: ${error.name} - ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
      }
      return '';
    }
  },
  
  // Check if image needs rotation or preprocessing
  async preprocessImage(imagePath: string): Promise<string> {
    // In a real implementation, you might use libraries like sharp 
    // to preprocess the image (adjust contrast, rotate, etc.)
    
    // For this demo, we'll just return the original path
    return imagePath;
  }
};
