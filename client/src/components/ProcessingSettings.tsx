import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ProcessingOptions } from "@/types";
import { Sparkles } from "lucide-react";

interface ProcessingSettingsProps {
  options: ProcessingOptions;
  onChange: (options: Partial<ProcessingOptions>) => void;
  disabled?: boolean;
}

export default function ProcessingSettings({ 
  options, 
  onChange, 
  disabled = false
}: ProcessingSettingsProps) {
  // Initialize AI options with default values if not set
  const aiOptions = {
    useAI: options.useAI ?? false,
    rewriteLevel: options.rewriteLevel ?? 3
  };

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Output Settings</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="summarizationLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Summarization Level
            </Label>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Detailed</span>
              <Slider
                id="summarizationLevel"
                value={[options.summarizationLevel]}
                min={1}
                max={5}
                step={1}
                className="w-full"
                onValueChange={(value) => onChange({ summarizationLevel: value[0] })}
                disabled={disabled}
              />
              <span className="text-xs text-gray-500 ml-2">Concise</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="generateIndex" 
              checked={options.generateIndex}
              onCheckedChange={(checked) => onChange({ generateIndex: !!checked })}
              disabled={disabled}
            />
            <Label htmlFor="generateIndex" className="text-sm text-gray-700">
              Generate Index
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="generateGlossary" 
              checked={options.generateGlossary}
              onCheckedChange={(checked) => onChange({ generateGlossary: !!checked })}
              disabled={disabled}
            />
            <Label htmlFor="generateGlossary" className="text-sm text-gray-700">
              Create Glossary
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="deduplicateContent" 
              checked={options.deduplicateContent}
              onCheckedChange={(checked) => onChange({ deduplicateContent: !!checked })}
              disabled={disabled}
            />
            <Label htmlFor="deduplicateContent" className="text-sm text-gray-700">
              Remove Duplicates
            </Label>
          </div>
          
          <div>
            <Label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </Label>
            <Select 
              value={options.exportFormat} 
              onValueChange={(value) => onChange({ exportFormat: value as 'pdf' | 'docx' | 'html' })}
              disabled={disabled}
            >
              <SelectTrigger id="exportFormat" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="docx">Word Document</SelectItem>
                <SelectItem value="html">HTML Web Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-4" />
          
          {/* AI Content Rewriting Section */}
          <div className="pt-2">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-md font-medium text-gray-900">Rielaborazione AI</h3>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">
              Utilizza l'intelligenza artificiale di OpenAI per migliorare la qualità del testo, 
              renderlo più chiaro, coerente e leggibile.
            </p>
            
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox 
                id="useAI" 
                checked={aiOptions.useAI}
                onCheckedChange={(checked) => {
                  onChange({ useAI: !!checked });
                }}
                disabled={disabled}
              />
              <Label htmlFor="useAI" className="text-sm text-gray-700">
                Abilita Rielaborazione AI
              </Label>
            </div>
            
            {aiOptions.useAI && (
              <div className="ml-7 mt-3">
                <Label htmlFor="rewriteLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Livello di Rielaborazione
                </Label>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Minimo</span>
                  <Slider
                    id="rewriteLevel"
                    value={[aiOptions.rewriteLevel]}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                    onValueChange={(value) => onChange({ rewriteLevel: value[0] })}
                    disabled={disabled}
                  />
                  <span className="text-xs text-gray-500 ml-2">Completo</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Livello {aiOptions.rewriteLevel}: {getRewriteLevelDescription(aiOptions.rewriteLevel)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get the description for each rewrite level
function getRewriteLevelDescription(level: number): string {
  switch (level) {
    case 1:
      return "Correzioni grammaticali e di punteggiatura minime";
    case 2:
      return "Miglioramenti leggeri alla leggibilità";
    case 3:
      return "Rielaborazione per migliorare la chiarezza";
    case 4:
      return "Rielaborazione significativa della struttura";
    case 5:
      return "Completa sintesi e riscrittura creativa";
    default:
      return "Rielaborazione per migliorare la chiarezza";
  }
}
