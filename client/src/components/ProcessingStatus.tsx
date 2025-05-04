import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { AlertTriangle, InfoIcon, Sparkles, XCircle } from "lucide-react";
import { ProcessingOptions } from "@/types";

interface ProcessingStatusProps {
  status: string;
  progress: number;
  isVisible: boolean;
  processingOptions?: ProcessingOptions;
}

export default function ProcessingStatus({
  status,
  progress,
  isVisible,
  processingOptions,
}: ProcessingStatusProps) {
  if (!isVisible) {
    return null;
  }

  // Determina se la rielaborazione AI è attiva
  const isAIEnabled = processingOptions?.useAI && processingOptions?.rewriteLevel;
  const aiLevel = processingOptions?.rewriteLevel || 3;
  
  // Verifica se c'è un errore relativo all'AI nel messaggio di stato
  const hasAIError = status.toLowerCase().includes("openai") || 
                    status.toLowerCase().includes("quota") ||
                    status.toLowerCase().includes("errore ai");
  
  // Controlla se c'è un fallback al metodo tradizionale
  const usingFallback = hasAIError || status.toLowerCase().includes("metodi tradizionali");

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Status</h2>
        
        <div className="space-y-4">
          <ProgressIndicator
            label={status}
            value={progress}
            showPercentage={true}
          />
          
          {isAIEnabled && (
            <Alert className={`${hasAIError ? 'bg-yellow-50 text-yellow-800 border-yellow-100' : 'bg-amber-50 text-amber-800 border-amber-100'} mt-3`}>
              {hasAIError ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <Sparkles className="h-4 w-4 text-amber-500" />
              )}
              <AlertDescription className="text-xs">
                {hasAIError ? (
                  <>
                    <p className="font-medium">Problemi con l'elaborazione AI</p>
                    <p>Continuando con metodi tradizionali. Questo potrebbe influire sulla qualità finale del documento.</p>
                  </>
                ) : (
                  <>Rielaborazione AI attiva (Livello {aiLevel}). Il processo potrebbe richiedere più tempo.</>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {usingFallback && (
            <Alert className="bg-blue-50 text-blue-800 border-blue-100">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Utilizzando algoritmi di elaborazione tradizionali. Questa modalità non richiede OpenAI e funziona sempre, ma potrebbe produrre risultati meno sofisticati.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className="bg-blue-50 text-blue-800 border-blue-100">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Questo processo può richiedere alcuni minuti a seconda della dimensione e complessità dei file.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
