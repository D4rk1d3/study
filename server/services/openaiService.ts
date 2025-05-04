import OpenAI from "openai";

// Inizializza il client OpenAI con la chiave API dall'ambiente
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export const openaiService = {
  /**
   * Rielabora un testo utilizzando OpenAI
   * @param text Il testo da rielaborare
   * @param level Il livello di rielaborazione (1-5)
   * @returns Il testo rielaborato
   */
  async rewriteText(text: string, level: number = 3): Promise<string> {
    try {
      console.log(`Rielaborando testo con OpenAI (livello ${level})...`);
      
      // Crea un prompt che varia in base al livello di rielaborazione
      const promptByLevel = {
        1: "Correggi gli errori grammaticali e di punteggiatura, ma mantieni il testo praticamente identico all'originale:",
        2: "Migliora leggermente la leggibilità e correggi gli errori, mantenendo la maggior parte del contenuto originale:",
        3: "Riscrivi il testo per migliorare la chiarezza e la coerenza, mantenendo tutti i concetti chiave:",
        4: "Rielabora il testo in modo significativo migliorando il flusso e la struttura, mantenendo il significato essenziale:",
        5: "Sintetizza e riscrivi completamente il testo, estraendo e presentando solo i concetti più importanti:"
      };
      
      const prompt = promptByLevel[level as keyof typeof promptByLevel] || promptByLevel[3];
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Sei un assistente specializzato nella rielaborazione di testi educativi. Il tuo compito è migliorare i testi mantenendo il significato originale, ma rendendoli più chiari, coerenti e ben strutturati."
          },
          {
            role: "user",
            content: `${prompt}\n\n${text}`
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      });
      
      const rewrittenText = response.choices[0].message.content || text;
      console.log("Rielaborazione completata");
      return rewrittenText;
    } catch (error) {
      console.error("Errore nella rielaborazione del testo con OpenAI:", error);
      // In caso di errore, restituisci il testo originale
      return text;
    }
  },
  
  /**
   * Genera un indice strutturato per il documento
   * @param text Il testo del documento
   * @returns Un array di intestazioni estratte e generate
   */
  async generateStructuredIndex(text: string): Promise<Array<{ text: string, level: number }>> {
    try {
      console.log("Generando indice strutturato con OpenAI...");
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Sei un assistente specializzato nell'analisi di contenuti educativi. Il tuo compito è estrarre e generare un indice strutturato dal testo fornito."
          },
          {
            role: "user",
            content: `Analizza il seguente testo ed estrai un indice strutturato con intestazioni e sottointestazioni. Restituisci l'output in formato JSON come array di oggetti, dove ogni oggetto ha le proprietà "text" (il testo dell'intestazione) e "level" (il livello dell'intestazione da 1 a 3).\n\n${text.substring(0, 3000)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });
      
      const resultContent = response.choices[0].message.content || "{}";
      try {
        const result = JSON.parse(resultContent);
        if (Array.isArray(result.headings)) {
          console.log(`Indice generato con ${result.headings.length} voci`);
          return result.headings;
        }
      } catch (parseError) {
        console.error("Errore nel parsing del JSON:", parseError);
      }
      
      return [];
    } catch (error) {
      console.error("Errore nella generazione dell'indice con OpenAI:", error);
      return [];
    }
  },
  
  /**
   * Genera un glossario dei termini chiave
   * @param text Il testo del documento
   * @param keywords Parole chiave già estratte
   * @returns Un array di termini e definizioni
   */
  async generateGlossary(text: string, keywords: string[]): Promise<Array<{ term: string, definition: string }>> {
    try {
      console.log("Generando glossario con OpenAI...");
      
      // Prepara i termini dal testo e dalle parole chiave
      const keywordsText = keywords.length > 0 
        ? `Considera in particolare questi termini chiave che sono stati identificati come importanti: ${keywords.join(", ")}.` 
        : '';
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Sei un assistente specializzato nella creazione di glossari educativi. Il tuo compito è identificare e definire i termini tecnici e concetti chiave dal testo fornito."
          },
          {
            role: "user",
            content: `Analizza il seguente testo ed estrai un glossario di termini tecnici e concetti chiave con le loro definizioni. ${keywordsText} Restituisci l'output in formato JSON come array di oggetti, dove ogni oggetto ha le proprietà "term" (il termine) e "definition" (la definizione breve e chiara). Limita il glossario ai 10-15 termini più importanti.\n\n${text.substring(0, 3000)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });
      
      const resultContent = response.choices[0].message.content || "{}";
      try {
        const result = JSON.parse(resultContent);
        if (Array.isArray(result.glossary)) {
          console.log(`Glossario generato con ${result.glossary.length} termini`);
          return result.glossary;
        }
      } catch (parseError) {
        console.error("Errore nel parsing del JSON:", parseError);
      }
      
      return [];
    } catch (error) {
      console.error("Errore nella generazione del glossario con OpenAI:", error);
      return [];
    }
  },
  
  /**
   * Genera una sintesi del testo
   * @param text Il testo da sintetizzare
   * @param level Livello di dettaglio (1-5)
   * @returns Testo sintetizzato
   */
  async summarizeText(text: string, level: number = 3): Promise<string> {
    try {
      console.log(`Sintetizzando testo con OpenAI (livello ${level})...`);
      
      // Il livello determina quanto dettagliata dovrebbe essere la sintesi
      const promptByLevel = {
        1: "Crea una sintesi molto dettagliata, mantenendo la maggior parte dei concetti importanti (circa 80% della lunghezza originale):",
        2: "Crea una sintesi dettagliata del testo (circa 60% della lunghezza originale):",
        3: "Crea una sintesi equilibrata, mantenendo i concetti chiave (circa 40% della lunghezza originale):",
        4: "Crea una sintesi concisa, concentrandoti solo sugli aspetti principali (circa 25% della lunghezza originale):",
        5: "Crea una sintesi molto breve, evidenziando solo i punti assolutamente essenziali (circa 10% della lunghezza originale):"
      };
      
      const prompt = promptByLevel[level as keyof typeof promptByLevel] || promptByLevel[3];
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Sei un assistente specializzato nella sintesi di testi educativi. Il tuo compito è condensare le informazioni mantenendo i concetti chiave."
          },
          {
            role: "user",
            content: `${prompt}\n\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });
      
      const summary = response.choices[0].message.content || "Non è stato possibile generare una sintesi.";
      console.log("Sintesi completata");
      return summary;
    } catch (error) {
      console.error("Errore nella sintesi del testo con OpenAI:", error);
      // In caso di errore, restituisci un messaggio di fallback
      return "Non è stato possibile generare una sintesi a causa di un errore.";
    }
  }
};