import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import { PreviewData } from "@/types";

interface OutputPreviewProps {
  previewData: PreviewData | null;
  isVisible: boolean;
  onDownload: () => void;
}

export default function OutputPreview({
  previewData,
  isVisible,
  onDownload,
}: OutputPreviewProps) {
  if (!isVisible || !previewData) {
    return null;
  }

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
        
        <ScrollArea className="border border-gray-200 rounded-lg p-4 mb-4 h-64">
          {previewData.tableOfContents && (
            <>
              <h3 className="text-sm font-semibold mb-2">Table of Contents</h3>
              <ul className="text-xs text-gray-700 space-y-1">
                {previewData.tableOfContents.map((item, index) => (
                  <li key={index} className="flex items-baseline" style={{ paddingLeft: `${item.level * 0.75}rem` }}>
                    <span className="mr-1">{item.number}</span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-3" />
            </>
          )}
          
          {previewData.summary && (
            <>
              <h3 className="text-sm font-semibold mb-2">Summary Sample</h3>
              <p className="text-xs text-gray-700">
                {previewData.summary}
              </p>
              
              {previewData.glossary && previewData.glossary.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <h3 className="text-sm font-semibold mb-2">Glossary Sample</h3>
                  <dl className="text-xs text-gray-700 space-y-2">
                    {previewData.glossary.slice(0, 3).map((term, index) => (
                      <div key={index}>
                        <dt className="font-medium">{term.term}</dt>
                        <dd className="pl-4">{term.definition}</dd>
                      </div>
                    ))}
                    {previewData.glossary.length > 3 && (
                      <p className="text-xs text-gray-500 italic">And {previewData.glossary.length - 3} more terms...</p>
                    )}
                  </dl>
                </>
              )}
            </>
          )}
        </ScrollArea>
        
        <Button 
          className="w-full bg-primary hover:bg-primary-600 text-white rounded-lg py-2.5 px-4 font-medium transition-colors flex items-center justify-center"
          onClick={onDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          <span>Download Compiled Notes</span>
        </Button>
      </CardContent>
    </Card>
  );
}
