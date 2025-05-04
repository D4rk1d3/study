import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { InfoIcon } from "lucide-react";

interface ProcessingStatusProps {
  status: string;
  progress: number;
  isVisible: boolean;
}

export default function ProcessingStatus({
  status,
  progress,
  isVisible,
}: ProcessingStatusProps) {
  if (!isVisible) {
    return null;
  }

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
