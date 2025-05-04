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
import { ProcessingOptions } from "@/types";

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
              onValueChange={(value) => onChange({ exportFormat: value })}
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
        </div>
      </CardContent>
    </Card>
  );
}
