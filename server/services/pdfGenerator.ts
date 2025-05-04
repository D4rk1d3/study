import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

// PDF Generator service
export const pdfGenerator = {
  async generateDocument(
    documentId: string,
    format: string = 'pdf',
    options: {
      text?: string;
      metadata?: any;
      generateIndex?: boolean;
      generateGlossary?: boolean;
    } = {}
  ): Promise<string> {
    // Get document data if not provided
    if (!options.text) {
      const processedContents = await storage.getProcessedContentForDocument(documentId);
      options.text = processedContents.map(item => item.content).join('\n\n');
      
      options.metadata = processedContents.reduce(
        (acc, { metadata }) => {
          if (metadata) {
            if (metadata.headings) acc.headings = [...(acc.headings || []), ...metadata.headings];
            if (metadata.keywords) acc.keywords = [...(acc.keywords || []), ...metadata.keywords];
          }
          return acc;
        },
        {} as any
      );
    }
    
    // Get document settings
    const settings = await storage.getDocumentSettings(documentId);
    
    // Default settings if not available
    const generateIndex = options.generateIndex ?? settings?.generateIndex ?? true;
    const generateGlossary = options.generateGlossary ?? settings?.generateGlossary ?? true;
    
    // Output path
    const outputPath = storage.getOutputPath(documentId, format);
    
    // Generate document based on format
    switch (format) {
      case 'pdf':
        await this.generatePdf(outputPath, options.text, options.metadata, generateIndex, generateGlossary);
        break;
      case 'docx':
        // For a real implementation, use docx library
        // For now, we'll just generate a text file with .docx extension
        await this.generateTextFile(outputPath, options.text, options.metadata, generateIndex, generateGlossary);
        break;
      case 'html':
        await this.generateHtml(outputPath, options.text, options.metadata, generateIndex, generateGlossary);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    return outputPath;
  },
  
  async generatePdf(
    outputPath: string,
    text: string,
    metadata: any,
    generateIndex: boolean,
    generateGlossary: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Pipe output to file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // Set font
        doc.font('Helvetica');
        
        // Add title
        doc.fontSize(24).text('Study Notes', { align: 'center' });
        doc.moveDown(2);
        
        // Add date
        doc.fontSize(10).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);
        
        // Add table of contents if enabled
        if (generateIndex && metadata && metadata.headings && metadata.headings.length > 0) {
          doc.fontSize(16).text('Table of Contents', { underline: true });
          doc.moveDown(1);
          
          // Process headings to create a hierarchical structure
          let currentLevel1 = 0;
          let currentLevel2 = 0;
          
          metadata.headings.forEach((heading: { text: string; level: number }) => {
            let prefix = '';
            
            if (heading.level === 1) {
              currentLevel1++;
              currentLevel2 = 0;
              prefix = `${currentLevel1}. `;
            } else if (heading.level === 2) {
              currentLevel2++;
              prefix = `    ${currentLevel1}.${currentLevel2} `;
            } else {
              prefix = '        - ';
            }
            
            doc.fontSize(12).text(`${prefix}${heading.text}`, { continued: false });
          });
          
          doc.moveDown(2);
          doc.addPage();
        }
        
        // Add main content
        doc.fontSize(14).text('Study Content', { underline: true });
        doc.moveDown(1);
        doc.fontSize(12).text(text, { align: 'justify' });
        
        // Add glossary if enabled
        if (generateGlossary && metadata && metadata.keywords && metadata.keywords.length > 0) {
          doc.addPage();
          doc.fontSize(16).text('Glossary', { underline: true });
          doc.moveDown(1);
          
          // Deduplicate keywords
          const uniqueKeywords = [...new Set(metadata.keywords)];
          
          // Add each keyword
          uniqueKeywords.sort().forEach((keyword: string) => {
            doc.fontSize(12).text(keyword, { continued: false, bold: true });
            // In a real implementation, you would have actual definitions for each term
            doc.fontSize(10).text(`Definition for "${keyword}" would be provided here.`, { indent: 20 });
            doc.moveDown(0.5);
          });
        }
        
        // Finalize the PDF
        doc.end();
        
        // Wait for file to be written
        stream.on('finish', () => {
          resolve();
        });
        
        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  
  async generateTextFile(
    outputPath: string,
    text: string,
    metadata: any,
    generateIndex: boolean,
    generateGlossary: boolean
  ): Promise<void> {
    let content = 'STUDY NOTES\n\n';
    content += `Generated on ${new Date().toLocaleDateString()}\n\n`;
    
    // Add table of contents if enabled
    if (generateIndex && metadata && metadata.headings && metadata.headings.length > 0) {
      content += 'TABLE OF CONTENTS\n\n';
      
      // Process headings
      let currentLevel1 = 0;
      let currentLevel2 = 0;
      
      metadata.headings.forEach((heading: { text: string; level: number }) => {
        let prefix = '';
        
        if (heading.level === 1) {
          currentLevel1++;
          currentLevel2 = 0;
          prefix = `${currentLevel1}. `;
        } else if (heading.level === 2) {
          currentLevel2++;
          prefix = `    ${currentLevel1}.${currentLevel2} `;
        } else {
          prefix = '        - ';
        }
        
        content += `${prefix}${heading.text}\n`;
      });
      
      content += '\n\n';
    }
    
    // Add main content
    content += 'STUDY CONTENT\n\n';
    content += text;
    
    // Add glossary if enabled
    if (generateGlossary && metadata && metadata.keywords && metadata.keywords.length > 0) {
      content += '\n\nGLOSSARY\n\n';
      
      // Deduplicate keywords
      const uniqueKeywords = [...new Set(metadata.keywords)];
      
      // Add each keyword
      uniqueKeywords.sort().forEach((keyword: string) => {
        content += `${keyword}\n`;
        content += `    Definition for "${keyword}" would be provided here.\n\n`;
      });
    }
    
    // Write to file
    await fs.promises.writeFile(outputPath, content, 'utf-8');
  },
  
  async generateHtml(
    outputPath: string,
    text: string,
    metadata: any,
    generateIndex: boolean,
    generateGlossary: boolean
  ): Promise<void> {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Study Notes</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #1D4ED8;
    }
    .toc {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .toc-item {
      margin-left: 20px;
    }
    .glossary {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-top: 30px;
    }
    .glossary dt {
      font-weight: bold;
      margin-top: 10px;
    }
    .glossary dd {
      margin-left: 20px;
    }
    .main-content {
      text-align: justify;
    }
  </style>
</head>
<body>
  <h1>Study Notes</h1>
  <p>Generated on ${new Date().toLocaleDateString()}</p>`;
    
    // Add table of contents if enabled
    if (generateIndex && metadata && metadata.headings && metadata.headings.length > 0) {
      html += `
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>`;
      
      // Process headings
      let currentLevel1 = 0;
      let currentLevel2 = 0;
      
      metadata.headings.forEach((heading: { text: string; level: number }) => {
        let prefix = '';
        let style = '';
        
        if (heading.level === 1) {
          currentLevel1++;
          currentLevel2 = 0;
          prefix = `${currentLevel1}. `;
          style = '';
        } else if (heading.level === 2) {
          currentLevel2++;
          prefix = `${currentLevel1}.${currentLevel2} `;
          style = 'margin-left: 20px;';
        } else {
          prefix = '- ';
          style = 'margin-left: 40px;';
        }
        
        html += `
      <li style="${style}">${prefix}${heading.text}</li>`;
      });
      
      html += `
    </ul>
  </div>`;
    }
    
    // Add main content
    html += `
  <div class="main-content">
    <h2>Study Content</h2>
    <p>${text.replace(/\n/g, '</p><p>')}</p>
  </div>`;
    
    // Add glossary if enabled
    if (generateGlossary && metadata && metadata.keywords && metadata.keywords.length > 0) {
      html += `
  <div class="glossary">
    <h2>Glossary</h2>
    <dl>`;
      
      // Deduplicate keywords
      const uniqueKeywords = [...new Set(metadata.keywords)];
      
      // Add each keyword
      uniqueKeywords.sort().forEach((keyword: string) => {
        html += `
      <dt>${keyword}</dt>
      <dd>Definition for "${keyword}" would be provided here.</dd>`;
      });
      
      html += `
    </dl>
  </div>`;
    }
    
    html += `
</body>
</html>`;
    
    // Write to file
    await fs.promises.writeFile(outputPath, html, 'utf-8');
  }
};
