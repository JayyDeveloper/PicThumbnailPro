import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"; 
import { ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  description: string;
}

export default function ThumbnailChecklist() {
  const [expanded, setExpanded] = useState(true);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "clear-subject",
      text: "Clear, identifiable subject",
      checked: false,
      description: "Ensure your thumbnail has a clear focal point that viewers can identify in under 2 seconds."
    },
    {
      id: "emotional-face",
      text: "Include emotional faces",
      checked: false,
      description: "Human faces showing emotion (surprise, excitement, curiosity) drive higher click-through rates."
    },
    {
      id: "contrast-colors",
      text: "High contrast colors",
      checked: false,
      description: "Use contrasting colors to make your thumbnail stand out in a crowded feed."
    },
    {
      id: "large-text",
      text: "Large, readable text (3-5 words)",
      checked: false,
      description: "Keep text concise and large enough to read on mobile devices (remember: 70% of YouTube views are on mobile)."
    },
    {
      id: "consistent-branding",
      text: "Consistent branding elements",
      checked: false,
      description: "Include recognizable elements like logos, colors, or styles that match your channel's brand."
    },
    {
      id: "rule-thirds",
      text: "Apply the rule of thirds",
      checked: false,
      description: "Place important elements along the lines where viewers' eyes naturally focus."
    },
    {
      id: "curiosity-gap",
      text: "Create a curiosity gap",
      checked: false,
      description: "Design your thumbnail to pose a question that can only be answered by watching."
    },
    {
      id: "test-small",
      text: "Test visibility at small sizes",
      checked: false,
      description: "Ensure your thumbnail is clear even when shown in a smaller format in recommended feeds."
    }
  ]);

  const toggleChecklist = () => {
    setExpanded(!expanded);
  };

  const toggleItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const completedItems = checklist.filter(item => item.checked).length;
  const progressPercentage = (completedItems / checklist.length) * 100;

  return (
    <Card className="shadow-sm bg-card border-border">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center text-foreground">
          <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
          Thumbnail Best Practices
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={toggleChecklist} className="h-8 w-8 p-0">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-4 pt-2">
          <div className="flex items-center mb-3">
            <div className="w-full bg-muted rounded-full h-2.5 mr-2">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-muted-foreground">{completedItems}/{checklist.length}</span>
          </div>
          
          <Accordion type="multiple" className="space-y-2">
            {checklist.map((item) => (
              <AccordionItem 
                key={item.id} 
                value={item.id}
                className="border px-3 py-1 rounded-md bg-muted/30 dark:border-border"
              >
                <div className="flex items-center">
                  <Checkbox 
                    id={item.id} 
                    checked={item.checked}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mr-2 h-4 w-4"
                  />
                  <Label 
                    htmlFor={item.id} 
                    className={`text-sm flex-1 ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {item.text}
                  </Label>
                  <AccordionTrigger className="ml-auto" />
                </div>
                <AccordionContent className="pl-6 pr-2 text-sm text-muted-foreground">
                  {item.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-3 text-sm text-muted-foreground flex items-center">
            <Info className="h-4 w-4 mr-1" />
            <span>Following these practices can increase engagement by up to 40%</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}