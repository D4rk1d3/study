import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { InfoIcon, Sparkles } from "lucide-react";
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
            <Alert className="bg-amber-50 text-amber-800 border-amber-100 mt-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-xs">
                Rielaborazione AI attiva (Livello {aiLevel}). Il processo potrebbe richiedere più tempo.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className="bg-blue-50 text-blue-800 border-blue-100">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This process may take a few minutes depending on file size and complexity.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
