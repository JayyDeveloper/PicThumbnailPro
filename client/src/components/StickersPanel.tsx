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
    "https://cdn-icons-png.flaticon.com/512/1828/1828884.png", // Circle
    "https://cdn-icons-png.flaticon.com/512/1828/1828885.png", // Square
    "https://cdn-icons-png.flaticon.com/512/1828/1828886.png", // Triangle
    "https://cdn-icons-png.flaticon.com/512/1828/1828887.png", // Diamond
    "https://cdn-icons-png.flaticon.com/512/1828/1828888.png", // Hexagon
    "https://cdn-icons-png.flaticon.com/512/1828/1828889.png", // Star
    "https://cdn-icons-png.flaticon.com/512/1828/1828890.png", // Heart
    "https://cdn-icons-png.flaticon.com/512/1828/1828891.png", // Arrow
    "https://cdn-icons-png.flaticon.com/512/1828/1828892.png", // Cross
  ],
  emoji: [
    "https://cdn-icons-png.flaticon.com/512/742/742751.png", // Smile
    "https://cdn-icons-png.flaticon.com/512/742/742752.png", // Laugh
    "https://cdn-icons-png.flaticon.com/512/742/742753.png", // Wink
    "https://cdn-icons-png.flaticon.com/512/742/742754.png", // Cool
    "https://cdn-icons-png.flaticon.com/512/742/742755.png", // Heart Eyes
    "https://cdn-icons-png.flaticon.com/512/742/742756.png", // Surprised
    "https://cdn-icons-png.flaticon.com/512/742/742757.png", // Sad
    "https://cdn-icons-png.flaticon.com/512/742/742758.png", // Angry
    "https://cdn-icons-png.flaticon.com/512/742/742759.png", // Tongue
  ],
  icons: [
    "https://cdn-icons-png.flaticon.com/512/1828/1828765.png", // Camera
    "https://cdn-icons-png.flaticon.com/512/1828/1828766.png", // Microphone
    "https://cdn-icons-png.flaticon.com/512/1828/1828767.png", // Headphones
    "https://cdn-icons-png.flaticon.com/512/1828/1828768.png", // Play Button
    "https://cdn-icons-png.flaticon.com/512/1828/1828769.png", // Pause Button
    "https://cdn-icons-png.flaticon.com/512/1828/1828770.png", // Volume
    "https://cdn-icons-png.flaticon.com/512/1828/1828771.png", // Settings
    "https://cdn-icons-png.flaticon.com/512/1828/1828772.png", // Share
    "https://cdn-icons-png.flaticon.com/512/1828/1828773.png", // Like
  ],
  social: [
    "https://cdn-icons-png.flaticon.com/512/2111/2111463.png", // Instagram
    "https://cdn-icons-png.flaticon.com/512/733/733579.png", // Twitter
    "https://cdn-icons-png.flaticon.com/512/2111/2111612.png", // YouTube
    "https://cdn-icons-png.flaticon.com/512/2111/2111615.png", // TikTok
    "https://cdn-icons-png.flaticon.com/512/2111/2111610.png", // Facebook
  ],
  gaming: [
    "https://cdn-icons-png.flaticon.com/512/3659/3659784.png", // Controller
    "https://cdn-icons-png.flaticon.com/512/3659/3659782.png", // Trophy
    "https://cdn-icons-png.flaticon.com/512/3659/3659783.png", // Headset
    "https://cdn-icons-png.flaticon.com/512/3659/3659781.png", // Keyboard
    "https://cdn-icons-png.flaticon.com/512/3659/3659780.png", // Mouse
  ],
  business: [
    "https://cdn-icons-png.flaticon.com/512/3659/3659785.png", // Chart
    "https://cdn-icons-png.flaticon.com/512/3659/3659786.png", // Money
    "https://cdn-icons-png.flaticon.com/512/3659/3659787.png", // Briefcase
    "https://cdn-icons-png.flaticon.com/512/3659/3659788.png", // Calendar
    "https://cdn-icons-png.flaticon.com/512/3659/3659789.png", // Clock
  ],
  nature: [
    "https://cdn-icons-png.flaticon.com/512/3659/3659790.png", // Tree
    "https://cdn-icons-png.flaticon.com/512/3659/3659791.png", // Flower
    "https://cdn-icons-png.flaticon.com/512/3659/3659792.png", // Sun
    "https://cdn-icons-png.flaticon.com/512/3659/3659793.png", // Moon
    "https://cdn-icons-png.flaticon.com/512/3659/3659794.png", // Cloud
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Flatten all stickers for search
  const allStickers = Object.entries(STICKER_COLLECTIONS).flatMap(([category, urls]) => 
    urls.map(url => ({ category, url }))
  );

  // Filter stickers based on search query
  const filteredStickers = searchQuery
    ? allStickers.filter(({ url }) => 
        url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : STICKER_COLLECTIONS[activeTab as keyof typeof STICKER_COLLECTIONS]?.map(url => ({ category: activeTab, url })) || [];

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
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Selected Sticker</p>
            <div className="flex justify-center">
              <div 
                className="relative w-24 h-24 rounded-lg border-2 border-primary flex items-center justify-center p-2 bg-muted/50"
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
          <p className="text-sm text-center text-muted-foreground mb-6">
            Click on a sticker to add it to your thumbnail
          </p>
        )}
        
        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search stickers..."
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSearchQuery(""); // Clear search when changing tabs
        }}>
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="shapes">Shapes</TabsTrigger>
            <TabsTrigger value="emoji">Emoji</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="gaming">Gaming</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="nature">Nature</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            {searchQuery ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredStickers.map(({ url }, index) => (
                  <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="shapes" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {STICKER_COLLECTIONS.shapes.map((url, index) => (
                      <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="emoji" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {STICKER_COLLECTIONS.emoji.map((url, index) => (
                      <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="icons" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {STICKER_COLLECTIONS.icons.map((url, index) => (
                      <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="social" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {STICKER_COLLECTIONS.social.map((url, index) => (
                      <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="gaming" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {STICKER_COLLECTIONS.gaming.map((url, index) => (
                      <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="business" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {STICKER_COLLECTIONS.business.map((url, index) => (
                      <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="nature" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {STICKER_COLLECTIONS.nature.map((url, index) => (
                      <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="mt-0">
                  {customStickers.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {customStickers.map((url, index) => (
                        <StickerItem key={index} url={url} onSelect={onStickerSelected} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-2">No custom stickers yet</p>
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
              </>
            )}
          </div>
        </Tabs>
        
        <div className="mt-8">
          <p className="text-xs text-muted-foreground text-center">
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
      className="w-full aspect-square p-3 bg-muted/50 rounded-lg border border-border hover:border-primary cursor-pointer flex items-center justify-center transition-all duration-200 hover:shadow-md"
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