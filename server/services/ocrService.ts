import { createWorker } from 'tesseract.js';
import fs from 'fs/promises';

// OCR service for extracting text from images
export const ocrService = {
  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      // Create a worker with English and Italian language support
      const worker = await createWorker();
      
      // Initialize the worker
      await worker.loadLanguage('eng+ita');
      await worker.initialize('eng+ita');
      
      // Set recognition parameters for better accuracy
      await worker.setParameters({
        tessedit_ocr_engine_mode: 3, // Fully automatic page segmentation, but no OSD
        preserve_interword_spaces: 1
      });
      
      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);
      
      // Recognize text
      const { data } = await worker.recognize(imageBuffer);
      
      // Terminate the worker
      await worker.terminate();
      
      return data.text;
    } catch (error) {
      console.error('OCR processing error:', error);
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
