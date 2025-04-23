import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Layout, Star, Flame, TrendingUp } from "lucide-react";
import { ThumbnailData, TextElement } from "@/pages/EditorPage";
import { StickerElement } from "@/hooks/useStickerEditor";

interface TemplateLibraryProps {
  onSelectTemplate: (template: ThumbnailTemplate) => void;
}

// Define the template structure
export interface ThumbnailTemplate {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  elements: TextElement[];
  stickers: StickerElement[];
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    filterName: string | null;
  };
}

// Predefined templates categorized
const TEMPLATE_COLLECTIONS = {
  popular: [
    {
      id: "popular-1",
      name: "Dramatic Title",
      category: "popular",
      imageUrl: "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "ULTIMATE GUIDE",
          x: 50,
          y: 30,
          fontSize: 42,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "900",
          color: "#ffffff",
          backgroundColor: "#ff0000",
          backgroundOpacity: 80,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: true
        },
        {
          id: "template-text-2",
          content: "How to Master Any Skill Fast",
          x: 50,
          y: 70,
          fontSize: 26,
          fontFamily: "'Open Sans', sans-serif",
          fontWeight: "600",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 60,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: true
        }
      ],
      stickers: [],
      filters: {
        brightness: 5,
        contrast: 15,
        saturation: 10,
        blur: 0,
        filterName: "Dramatic"
      }
    },
    {
      id: "popular-2",
      name: "Top 10 List",
      category: "popular",
      imageUrl: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "TOP 10",
          x: 20,
          y: 30,
          fontSize: 48,
          fontFamily: "'Roboto', sans-serif",
          fontWeight: "900",
          color: "#ffffff",
          backgroundColor: "#ff4500",
          backgroundOpacity: 90,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        },
        {
          id: "template-text-2",
          content: "LIFE-CHANGING HABITS",
          x: 20,
          y: 65,
          fontSize: 28,
          fontFamily: "'Roboto', sans-serif",
          fontWeight: "700",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 70,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        }
      ],
      stickers: [
        {
          id: "template-sticker-1",
          imageUrl: "https://cdn-icons-png.flaticon.com/512/5231/5231019.png",
          x: 80,
          y: 50,
          width: 120,
          height: 120,
          rotation: 0,
          scale: 1.2,
          zIndex: 2
        }
      ],
      filters: {
        brightness: 0,
        contrast: 10,
        saturation: 20,
        blur: 0,
        filterName: null
      }
    }
  ],
  gaming: [
    {
      id: "gaming-1",
      name: "Game Review",
      category: "gaming",
      imageUrl: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "GAME REVIEW",
          x: 50,
          y: 20,
          fontSize: 36,
          fontFamily: "'Play', sans-serif",
          fontWeight: "700",
          color: "#ffffff",
          backgroundColor: "#9147ff",
          backgroundOpacity: 80,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: true
        },
        {
          id: "template-text-2",
          content: "Is It Worth Your Money?",
          x: 50,
          y: 65,
          fontSize: 24,
          fontFamily: "'Play', sans-serif",
          fontWeight: "400",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 70,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: false
        }
      ],
      stickers: [
        {
          id: "template-sticker-1",
          imageUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828743.png",
          x: 85,
          y: 85,
          width: 100,
          height: 100,
          rotation: 0,
          scale: 1,
          zIndex: 2
        }
      ],
      filters: {
        brightness: 0,
        contrast: 5,
        saturation: 10,
        blur: 0,
        filterName: "Neon"
      }
    },
    {
      id: "gaming-2",
      name: "Pro Tips",
      category: "gaming",
      imageUrl: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "PRO TIPS",
          x: 50,
          y: 30,
          fontSize: 44,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "800",
          color: "#ffffff",
          backgroundColor: "#ff4500",
          backgroundOpacity: 85,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: true
        },
        {
          id: "template-text-2",
          content: "5 Secrets to Win Every Game",
          x: 50,
          y: 70,
          fontSize: 26,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "600",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 70,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: true
        }
      ],
      stickers: [],
      filters: {
        brightness: 0,
        contrast: 15,
        saturation: 5,
        blur: 0,
        filterName: "Vibrant"
      }
    }
  ],
  tutorial: [
    {
      id: "tutorial-1",
      name: "Step-by-Step Guide",
      category: "tutorial",
      imageUrl: "https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "COMPLETE GUIDE",
          x: 30,
          y: 25,
          fontSize: 36,
          fontFamily: "'Open Sans', sans-serif",
          fontWeight: "800",
          color: "#ffffff",
          backgroundColor: "#4285f4",
          backgroundOpacity: 90,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        },
        {
          id: "template-text-2",
          content: "Master This Skill in 10 Minutes",
          x: 30,
          y: 60,
          fontSize: 24,
          fontFamily: "'Open Sans', sans-serif",
          fontWeight: "600",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 70,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        }
      ],
      stickers: [
        {
          id: "template-sticker-1",
          imageUrl: "https://www.freeiconspng.com/thumbs/arrow-icon/arrow-icon--myiconfinder-23.png",
          x: 80,
          y: 40,
          width: 100,
          height: 100,
          rotation: 45,
          scale: 1,
          zIndex: 2
        }
      ],
      filters: {
        brightness: 5,
        contrast: 10,
        saturation: 0,
        blur: 0,
        filterName: null
      }
    },
    {
      id: "tutorial-2",
      name: "How-To Tutorial",
      category: "tutorial",
      imageUrl: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "HOW TO",
          x: 25,
          y: 30,
          fontSize: 44,
          fontFamily: "'Roboto', sans-serif",
          fontWeight: "900",
          color: "#ffffff",
          backgroundColor: "#ff5722",
          backgroundOpacity: 85,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        },
        {
          id: "template-text-2",
          content: "Become an Expert in 24 Hours",
          x: 25,
          y: 60,
          fontSize: 22,
          fontFamily: "'Roboto', sans-serif",
          fontWeight: "700",
          color: "#ffffff",
          backgroundColor: "#212121",
          backgroundOpacity: 75,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        }
      ],
      stickers: [],
      filters: {
        brightness: 0,
        contrast: 5,
        saturation: 0,
        blur: 0,
        filterName: "Normal"
      }
    }
  ],
  reaction: [
    {
      id: "reaction-1",
      name: "Shocked Reaction",
      category: "reaction",
      imageUrl: "https://images.pexels.com/photos/3811867/pexels-photo-3811867.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "OMG! 😱",
          x: 50,
          y: 25,
          fontSize: 50,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "900",
          color: "#ffffff",
          backgroundColor: "#ff0000",
          backgroundOpacity: 90,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: true
        },
        {
          id: "template-text-2",
          content: "YOU WON'T BELIEVE WHAT HAPPENED!",
          x: 50,
          y: 70,
          fontSize: 24,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "800",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 70,
          italic: false,
          underline: false,
          alignment: "center" as "center",
          bold: true
        }
      ],
      stickers: [
        {
          id: "template-sticker-1",
          imageUrl: "https://cdn-icons-png.flaticon.com/512/1791/1791330.png",
          x: 85,
          y: 85,
          width: 100,
          height: 100,
          rotation: 0,
          scale: 1,
          zIndex: 2
        }
      ],
      filters: {
        brightness: 5,
        contrast: 15,
        saturation: 10,
        blur: 0,
        filterName: "Vibrant"
      }
    },
    {
      id: "reaction-2",
      name: "First Impression",
      category: "reaction",
      imageUrl: "https://images.pexels.com/photos/6393335/pexels-photo-6393335.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1",
      elements: [
        {
          id: "template-text-1",
          content: "FIRST LOOK",
          x: 25,
          y: 20,
          fontSize: 40,
          fontFamily: "'Roboto', sans-serif",
          fontWeight: "900",
          color: "#ffffff",
          backgroundColor: "#2196f3",
          backgroundOpacity: 85,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        },
        {
          id: "template-text-2",
          content: "My Honest Reaction!",
          x: 25,
          y: 55,
          fontSize: 26,
          fontFamily: "'Roboto', sans-serif",
          fontWeight: "700",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 70,
          italic: false,
          underline: false,
          alignment: "left" as "left",
          bold: true
        }
      ],
      stickers: [],
      filters: {
        brightness: 0,
        contrast: 10,
        saturation: 5,
        blur: 0,
        filterName: "Normal"
      }
    }
  ]
};

export default function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [activeTab, setActiveTab] = useState<string>("popular");

  return (
    <Card className="overflow-hidden">
      <div className="bg-secondary p-3">
        <div className="flex items-center">
          <Layout className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Template Library</h3>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-sm text-gray-500 mb-4">
          Select a template to quickly create professional thumbnails
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="popular" className="flex items-center">
              <Star className="h-3 w-3 mr-1" /> Popular
            </TabsTrigger>
            <TabsTrigger value="gaming">Gaming</TabsTrigger>
            <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
            <TabsTrigger value="reaction">Reaction</TabsTrigger>
          </TabsList>
          
          {Object.entries(TEMPLATE_COLLECTIONS).map(([category, templates]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <TemplateItem 
                    key={template.id} 
                    template={template} 
                    onSelect={() => onSelectTemplate(template)} 
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Individual template item component
function TemplateItem({ 
  template, 
  onSelect 
}: { 
  template: ThumbnailTemplate; 
  onSelect: () => void;
}) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video overflow-hidden rounded-md border border-gray-200 mb-1 group-hover:border-primary transition-colors">
        <img 
          src={template.imageUrl} 
          alt={template.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Preview overlay of the template elements */}
        <div className="absolute inset-0">
          {template.elements.map(element => (
            <div 
              key={element.id}
              className="absolute font-bold"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: `${element.backgroundColor}${Math.round(element.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                textAlign: element.alignment,
                fontSize: `${element.fontSize / 4}px`, // Scale down for preview
              }}
            >
              <span 
                style={{
                  color: element.color,
                  fontFamily: element.fontFamily,
                  fontWeight: element.fontWeight,
                  fontStyle: element.italic ? 'italic' : 'normal',
                  textDecoration: element.underline ? 'underline' : 'none',
                }}
              >
                {element.content}
              </span>
            </div>
          ))}
        </div>
        
        {/* Hover overlay with use button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <Button 
            size="sm" 
            className="bg-primary text-white"
            onClick={onSelect}
          >
            Use Template
          </Button>
        </div>
      </div>
      <p className="text-sm font-medium">{template.name}</p>
    </div>
  );
}