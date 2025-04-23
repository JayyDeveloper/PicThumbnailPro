import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickerElement } from "@/hooks/useStickerEditor";
import { Layers, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface StickersPanelProps {
  selectedSticker: StickerElement | null;
  onStickerSelected: (imageUrl: string) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDeleteSticker: () => void;
}

// Predefined stickers categorized
const STICKER_COLLECTIONS = {
  shapes: [
    "https://www.freeiconspng.com/thumbs/arrow-icon/arrow-icon--myiconfinder-23.png",
    "https://static.vecteezy.com/system/resources/previews/014/980/555/original/star-icon-transparent-free-png.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/2048px-HTML5_logo_and_wordmark.svg.png",
    "https://cdn-icons-png.flaticon.com/512/9381/9381177.png",
    "https://cdn-icons-png.flaticon.com/512/481/481059.png",
  ],
  emoji: [
    "https://cdn-icons-png.flaticon.com/512/5231/5231019.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Thumbs_up_silhouette.svg/1200px-Thumbs_up_silhouette.svg.png",
    "https://cdn-icons-png.flaticon.com/512/1791/1791330.png",
    "https://cdn-icons-png.flaticon.com/512/4226/4226889.png",
    "https://cdn-icons-png.flaticon.com/512/742/742751.png",
  ],
  icons: [
    "https://static.vecteezy.com/system/resources/previews/011/571/337/original/fire-icon-flame-symbol-free-png.png",
    "https://cdn-icons-png.flaticon.com/512/2711/2711616.png",
    "https://cdn-icons-png.flaticon.com/512/616/616494.png",
    "https://cdn-icons-png.flaticon.com/512/1828/1828743.png",
    "https://cdn-icons-png.flaticon.com/512/3393/3393220.png",
  ],
};

export default function StickersPanel({ 
  selectedSticker,
  onStickerSelected,
  onBringToFront,
  onSendToBack,
  onDeleteSticker 
}: StickersPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("shapes");

  return (
    <Card className="overflow-hidden">
      <div className="bg-secondary p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Stickers & Clip Art</h3>
          {selectedSticker && (
            <div className="flex gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7"
                onClick={onBringToFront}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7"
                onClick={onSendToBack}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7"
                onClick={onDeleteSticker}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        {selectedSticker ? (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-2">Selected Sticker</p>
            <div className="flex justify-center">
              <div 
                className="relative w-20 h-20 rounded border border-gray-200 flex items-center justify-center p-2 bg-gray-50"
              >
                <img 
                  src={selectedSticker.imageUrl} 
                  alt="Selected sticker" 
                  className="max-w-full max-h-full"
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-center text-gray-500 mb-4">
            Click on a sticker to add it to your thumbnail
          </p>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="shapes">Shapes</TabsTrigger>
            <TabsTrigger value="emoji">Emoji</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shapes" className="mt-0">
            <div className="grid grid-cols-3 gap-2">
              {STICKER_COLLECTIONS.shapes.map((url, index) => (
                <StickerItem key={index} url={url} onSelect={onStickerSelected} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="emoji" className="mt-0">
            <div className="grid grid-cols-3 gap-2">
              {STICKER_COLLECTIONS.emoji.map((url, index) => (
                <StickerItem key={index} url={url} onSelect={onStickerSelected} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="icons" className="mt-0">
            <div className="grid grid-cols-3 gap-2">
              {STICKER_COLLECTIONS.icons.map((url, index) => (
                <StickerItem key={index} url={url} onSelect={onStickerSelected} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <p className="text-xs text-gray-500 text-center">
            <Layers className="h-3 w-3 inline mr-1" />
            Tip: Layer stickers to create complex designs
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual sticker item component
function StickerItem({ url, onSelect }: { url: string; onSelect: (url: string) => void }) {
  return (
    <div 
      className="w-full aspect-square p-2 bg-gray-50 rounded border border-gray-200 hover:border-primary cursor-pointer flex items-center justify-center transition-colors"
      onClick={() => onSelect(url)}
    >
      <img 
        src={url} 
        alt="Sticker" 
        className="max-w-full max-h-full"
      />
    </div>
  );
}