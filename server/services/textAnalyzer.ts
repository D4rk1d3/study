// Text analysis service for processing and analyzing text
import { openaiService } from "./openaiService";

export const textAnalyzer = {
  // Analyze text to extract structure and metadata
  async analyzeText(text: string, useAI: boolean = true): Promise<any> {
    try {
      let headings = [];
      let keywords = [];
      
      if (useAI && process.env.OPENAI_API_KEY) {
        console.log("Utilizzando OpenAI per l'analisi del testo");
        // Extract headings using OpenAI
        headings = await openaiService.generateStructuredIndex(text);
        
        // Extract keywords using traditional method for now
        keywords = this.extractKeywords(text);
      } else {
        console.log("Utilizzando analisi del testo tradizionale");
        // Fallback to traditional method
        headings = this.extractHeadings(text);
        keywords = this.extractKeywords(text);
      }
      
      return {
        headings,
        keywords
      };
    } catch (error) {
      console.error('Text analysis error:', error);
      // Fallback to traditional method in case of error
      return { 
        headings: this.extractHeadings(text), 
        keywords: this.extractKeywords(text) 
      };
    }
  },
  
  // Extract headings from text using regex patterns (traditional method)
  extractHeadings(text: string): Array<{ text: string, level: number }> {
    const headings = [];
    
    // Pattern for headings:
    // 1. Numbered headings like "1.", "1.2", etc.
    // 2. Capitalized lines ending with newlines
    // 3. Lines ending with colons
    
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Check for numbered headings
      if (/^(\d+\.)+\s+\w+/.test(trimmedLine)) {
        const level = (trimmedLine.match(/\./g) || []).length;
        headings.push({
          text: trimmedLine,
          level: level
        });
        continue;
      }
      
      // Check for capitalized headings (if more than 3 words and all caps)
      const words = trimmedLine.split(' ');
      if (words.length >= 3 && words.length <= 10 && 
          trimmedLine === trimmedLine.toUpperCase() && 
          !/[.!?]$/.test(trimmedLine)) {
        headings.push({
          text: trimmedLine,
          level: 1
        });
        continue;
      }
      
      // Check for lines ending with colons and not too long
      if (trimmedLine.endsWith(':') && trimmedLine.length < 50) {
        headings.push({
          text: trimmedLine.slice(0, -1), // Remove the colon
          level: 2
        });
      }
    }
    
    return headings;
  },
  
  // Extract keywords using basic frequency analysis
  extractKeywords(text: string): string[] {
    // Remove common stopwords
    const stopwords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'about', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'this', 'that', 'these', 'those',
      'of', 'from', 'as', 'un', 'una', 'il', 'la', 'di', 'da', 'come'
    ]);
    
    // Tokenize text
    const tokens = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)            // Split by whitespace
      .filter(word => word.length > 2 && !stopwords.has(word)); // Filter short words and stopwords
    
    // Count frequency
    const frequency: Record<string, number> = {};
    for (const token of tokens) {
      frequency[token] = (frequency[token] || 0) + 1;
    }
    
    // Sort by frequency
    const sortedWords = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);
    
    // Return top keywords (max 20)
    return sortedWords.slice(0, 20);
  },
  
  // Remove duplicate content
  async deduplicateContent(text: string): Promise<string> {
    // Split text into paragraphs
    const paragraphs = text.split('\n\n');
    
    // Simple deduplication by comparing paragraph similarity
    const uniqueParagraphs: string[] = [];
    const seenParagraphs: string[] = [];
    
    for (const paragraph of paragraphs) {
      const normalized = paragraph.trim().toLowerCase();
      
      // Skip empty paragraphs
      if (!normalized) continue;
      
      // Check if we've seen this paragraph before
      if (seenParagraphs.includes(normalized)) continue;
      
      // Check for similar paragraphs (simple implementation)
      let isDuplicate = false;
      for (const seenParagraph of seenParagraphs) {
        if (this.calculateSimilarity(normalized, seenParagraph) > 0.8) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        seenParagraphs.push(normalized);
        uniqueParagraphs.push(paragraph);
      }
    }
    
    return uniqueParagraphs.join('\n\n');
  },
  
  // Calculate similarity between two strings (Jaccard similarity)
  calculateSimilarity(str1: string, str2: string): number {
    // Convert strings to arrays of words
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    // Create sets for comparison (as arrays)
    const uniqueWords1 = Array.from(new Set(words1));
    const uniqueWords2 = Array.from(new Set(words2));
    
    // Calculate intersection
    const intersection = uniqueWords1.filter(word => uniqueWords2.includes(word));
    
    // Calculate union (combine arrays and remove duplicates)
    const union = Array.from(new Set([...uniqueWords1, ...uniqueWords2]));
    
    // Return Jaccard similarity
    return intersection.length / union.length;
  },
  
  // Summarize text
  async summarizeText(text: string, level: number): Promise<string> {
    // Use OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("Utilizzando OpenAI per la sintesi del testo");
        return await openaiService.summarizeText(text, level);
      } catch (error: any) {
        // Controlla specificamente gli errori di quota OpenAI
        if (error.message === "Quota OpenAI insufficiente" || error.code === 'insufficient_quota') {
          console.warn("Quota OpenAI insufficiente. Passaggio al metodo tradizionale.");
        } else {
          console.error("Errore con OpenAI, fallback al metodo tradizionale:", error);
        }
      }
    }
    
    console.log("Utilizzando sintesi del testo tradizionale");
    // Fallback to traditional method if OpenAI is not available or fails
    
    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    // Score sentences based on word frequency
    const wordFrequency: Record<string, number> = {};
    const sentenceScores: number[] = [];
    
    // Calculate word frequency
    for (const sentence of sentences) {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      for (const word of words) {
        if (word.length > 3) { // Only consider words longer than 3 characters
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      }
    }
    
    // Score sentences based on word frequency
    for (const sentence of sentences) {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      let score = 0;
      for (const word of words) {
        if (word.length > 3) {
          score += wordFrequency[word] || 0;
        }
      }
      sentenceScores.push(score);
    }
    
    // Normalize scores
    const maxScore = Math.max(...sentenceScores);
    const normalizedScores = sentenceScores.map(score => score / maxScore);
    
    // Determine how many sentences to keep based on summarization level
    // Level 1: Most detailed (keep 80%)
    // Level 5: Most concise (keep 20%)
    const keepRatio = 1 - (level - 1) * 0.15;
    const keepCount = Math.max(1, Math.round(sentences.length * keepRatio));
    
    // Create pairs of [index, score]
    const indexedScores = normalizedScores.map((score, index) => [index, score]);
    
    // Sort by score (descending)
    indexedScores.sort((a, b) => b[1] - a[1]);
    
    // Get indices of top sentences
    const topIndices = indexedScores
      .slice(0, keepCount)
      .map(pair => pair[0])
      .sort((a, b) => a - b); // Sort by original position
    
    // Construct summary
    const summarySentences = topIndices.map(index => sentences[index]);
    return summarySentences.join(' ');
  },
  
  /**
   * Rielabora il testo utilizzando OpenAI
   * @param text Testo da rielaborare
   * @param level Livello di rielaborazione (1-5)
   * @returns Testo rielaborato
   */
  async rewriteText(text: string, level: number): Promise<string> {
    if (process.env.OPENAI_API_KEY) {
      try {
        return await openaiService.rewriteText(text, level);
      } catch (error: any) {
        // Controlla specificamente gli errori di quota OpenAI
        if (error.message === "Quota OpenAI insufficiente" || error.code === 'insufficient_quota') {
          console.warn("Quota OpenAI insufficiente. Impossibile rielaborare il testo.");
        } else {
          console.error("Errore nella rielaborazione con OpenAI:", error);
        }
      }
    } else {
      console.log("OpenAI API key non configurata. Utilizzo del testo originale.");
    }
    
    // Se OpenAI non è disponibile o fallisce, restituisci il testo originale
    return text;
  },
  
  /**
   * Genera un glossario utilizzando OpenAI
   * @param text Testo del documento
   * @param keywords Parole chiave estratte
   * @returns Array di termini e definizioni
   */
  async generateGlossary(text: string, keywords: string[]): Promise<Array<{ term: string, definition: string }>> {
    if (process.env.OPENAI_API_KEY) {
      try {
        return await openaiService.generateGlossary(text, keywords);
      } catch (error: any) {
        // Controlla specificamente gli errori di quota OpenAI
        if (error.message === "Quota OpenAI insufficiente" || error.code === 'insufficient_quota') {
          console.warn("Quota OpenAI insufficiente. Generazione glossario semplificato.");
        } else {
          console.error("Errore nella generazione del glossario con OpenAI:", error);
        }
      }
    } else {
      console.log("OpenAI API key non configurata. Utilizzo del glossario semplificato.");
    }
    
    // Fallback a un glossario semplice basato sulle parole chiave
    console.log("Generando glossario semplificato basato sulle parole chiave");
    return keywords.slice(0, 10).map(term => ({
      term,
      definition: `Termine utilizzato nel documento. Questo termine appare frequentemente nel testo ed è stato identificato come importante per la comprensione del contenuto.`
    }));
  }
};
