// Text analysis service for processing and analyzing text
export const textAnalyzer = {
  // Analyze text to extract structure and metadata
  async analyzeText(text: string): Promise<any> {
    try {
      // Extract headings
      const headings = this.extractHeadings(text);
      
      // Extract keywords
      const keywords = this.extractKeywords(text);
      
      return {
        headings,
        keywords
      };
    } catch (error) {
      console.error('Text analysis error:', error);
      return { headings: [], keywords: [] };
    }
  },
  
  // Extract headings from text using regex patterns
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
    const seen = new Set<string>();
    
    for (const paragraph of paragraphs) {
      const normalized = paragraph.trim().toLowerCase();
      
      // Skip empty paragraphs
      if (!normalized) continue;
      
      // Check if we've seen this paragraph before
      if (seen.has(normalized)) continue;
      
      // Check for similar paragraphs (simple implementation)
      let isDuplicate = false;
      for (const seenParagraph of seen) {
        if (this.calculateSimilarity(normalized, seenParagraph) > 0.8) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        seen.add(normalized);
        uniqueParagraphs.push(paragraph);
      }
    }
    
    return uniqueParagraphs.join('\n\n');
  },
  
  // Calculate similarity between two strings (Jaccard similarity)
  calculateSimilarity(str1: string, str2: string): number {
    // Convert strings to sets of words
    const set1 = new Set(str1.split(/\s+/));
    const set2 = new Set(str2.split(/\s+/));
    
    // Calculate intersection
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    // Calculate union
    const union = new Set([...set1, ...set2]);
    
    // Return Jaccard similarity
    return intersection.size / union.size;
  },
  
  // Summarize text
  async summarizeText(text: string, level: number): Promise<string> {
    // In a real implementation, you would use a transformer-based model for summarization
    // For this demo, we'll implement a simple extractive summarization
    
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
  }
};
