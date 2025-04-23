import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickerElement } from "@/hooks/useStickerEditor";
import { Layers, ArrowUp, ArrowDown, Trash2, Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("shapes");
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload mutation for custom stickers
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Add the new uploaded sticker to our custom stickers
      setCustomStickers([...customStickers, data.url]);
      // Automatically select the newly uploaded sticker
      onStickerSelected(data.url);
      // Switch to the custom tab
      setActiveTab('custom');
      
      toast({
        title: "Upload Complete",
        description: "Your custom sticker has been added.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    }
  });
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Upload the file
    uploadMutation.mutate(file);
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="shapes">Shapes</TabsTrigger>
            <TabsTrigger value="emoji">Emoji</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
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
          
          <TabsContent value="custom" className="mt-0">
            {customStickers.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {customStickers.map((url, index) => (
                  <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">No custom stickers yet</p>
              </div>
            )}
            
            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploadMutation.isPending ? "Uploading..." : "Upload Custom Sticker"}
              </Button>
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