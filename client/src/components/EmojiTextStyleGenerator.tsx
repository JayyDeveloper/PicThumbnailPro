import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextElement } from "@/hooks/useTextEditor";

// Common emojis categorized
const emojiCategories = [
  {
    name: "Popular",
    emojis: ["😀", "😂", "🔥", "👍", "❤️", "🎉", "✨", "💯", "🙌", "👏"]
  },
  {
    name: "Reactions",
    emojis: ["😮", "😱", "🤔", "😎", "🤩", "😍", "🤑", "😭", "😡", "🤯"]
  },
  {
    name: "Objects",
    emojis: ["💰", "💎", "🎮", "📱", "💻", "📸", "🎬", "🎤", "🏆", "🛒"]
  },
  {
    name: "Symbols",
    emojis: ["⚠️", "❌", "✅", "⭐", "🔴", "🟢", "🔵", "⚡", "💬", "🔔"]
  }
];

// Predefined text styles
const textStyles = [
  {
    name: "Title Bold",
    style: {
      fontSize: 42,
      fontWeight: "bold",
      color: "#ffffff",
      backgroundColor: "#000000",
      backgroundOpacity: 0.5,
      fontFamily: "Arial",
    }
  },
  {
    name: "Subtitle",
    style: {
      fontSize: 28,
      fontWeight: "normal",
      color: "#ffffff",
      backgroundColor: "#000000",
      backgroundOpacity: 0.3,
      fontFamily: "Arial",
    }
  },
  {
    name: "Highlight",
    style: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#ff0000",
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.7,
      fontFamily: "Impact",
    }
  },
  {
    name: "Minimal",
    style: {
      fontSize: 32,
      fontWeight: "normal",
      color: "#ffffff",
      backgroundColor: "transparent",
      backgroundOpacity: 0,
      fontFamily: "Helvetica",
    }
  },
  {
    name: "Dramatic",
    style: {
      fontSize: 40,
      fontWeight: "bold",
      color: "#ffff00",
      backgroundColor: "#ff0000",
      backgroundOpacity: 0.6,
      fontFamily: "Impact",
    }
  },
  {
    name: "Modern",
    style: {
      fontSize: 34,
      fontWeight: "bold",
      color: "#00ffff",
      backgroundColor: "#333333",
      backgroundOpacity: 0.8,
      fontFamily: "Tahoma",
    }
  },
  {
    name: "Elegant",
    style: {
      fontSize: 30,
      fontWeight: "normal",
      color: "#e0e0e0",
      backgroundColor: "#333333",
      backgroundOpacity: 0.4,
      fontFamily: "Georgia",
    }
  },
  {
    name: "Trendy",
    style: {
      fontSize: 38,
      fontWeight: "bold",
      color: "#ff6600",
      backgroundColor: "#000000",
      backgroundOpacity: 0.5,
      fontFamily: "Arial",
    }
  }
];

interface EmojiTextStyleGeneratorProps {
  selectedElement: TextElement | null;
  onElementUpdate: (element: TextElement) => void;
  onAddEmoji: (emoji: string) => void;
}

export default function EmojiTextStyleGenerator({ 
  selectedElement, 
  onElementUpdate,
  onAddEmoji
}: EmojiTextStyleGeneratorProps) {
  const [activeTab, setActiveTab] = useState<string>("emojis");
  
  const handleEmojiClick = (emoji: string) => {
    if (selectedElement) {
      // Append emoji to existing text
      const updatedElement = { 
        ...selectedElement, 
        content: selectedElement.content + emoji 
      };
      onElementUpdate(updatedElement);
    } else {
      // Create a new text element with just the emoji
      onAddEmoji(emoji);
    }
  };
  
  const handleStyleClick = (style: any) => {
    if (selectedElement) {
      const updatedElement = { 
        ...selectedElement, 
        ...style.style 
      };
      onElementUpdate(updatedElement);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Emoji & Text Styles</CardTitle>
        <CardDescription>
          Add emojis or apply text styles to your thumbnail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="emojis" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="emojis">Emojis</TabsTrigger>
            <TabsTrigger value="styles">Text Styles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emojis">
            <Tabs defaultValue="Popular">
              <TabsList className="flex flex-wrap mb-4">
                {emojiCategories.map((category) => (
                  <TabsTrigger key={category.name} value={category.name} className="text-xs">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {emojiCategories.map((category) => (
                <TabsContent key={category.name} value={category.name}>
                  <div className="grid grid-cols-5 gap-2">
                    {category.emojis.map((emoji) => (
                      <Button 
                        key={emoji} 
                        variant="outline" 
                        className="text-2xl h-12"
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
          
          <TabsContent value="styles">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 gap-3">
                {textStyles.map((style) => (
                  <Button
                    key={style.name}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => handleStyleClick(style)}
                    disabled={!selectedElement}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-gray-500 mb-1">{style.name}</span>
                      <span 
                        style={{
                          color: style.style.color,
                          backgroundColor: style.style.backgroundColor,
                          fontWeight: style.style.fontWeight,
                          fontSize: `${Math.min(style.style.fontSize / 2, 24)}px`,
                          fontFamily: style.style.fontFamily,
                          padding: "2px 6px",
                          borderRadius: "2px",
                          opacity: style.style.backgroundOpacity === 0 ? 1 : 0.9
                        }}
                      >
                        Sample Text
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            {!selectedElement && (
              <div className="mt-2 text-sm text-center text-amber-600">
                Please select a text element to apply styles
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}