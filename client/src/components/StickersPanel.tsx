import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickerElement } from '@/hooks/useStickerEditor';
import { useQuery } from "@tanstack/react-query";

// Sticker categories with some placeholder stickers for demonstration
const STICKER_CATEGORIES = [
  {
    id: 'shapes',
    name: 'Shapes',
    stickers: [
      { id: 'shape-1', url: '/uploads/stickers/circle.png', alt: 'Circle' },
      { id: 'shape-2', url: '/uploads/stickers/square.png', alt: 'Square' },
      { id: 'shape-3', url: '/uploads/stickers/triangle.png', alt: 'Triangle' },
      { id: 'shape-4', url: '/uploads/stickers/star.png', alt: 'Star' },
    ]
  },
  {
    id: 'emojis',
    name: 'Emojis',
    stickers: [
      { id: 'emoji-1', url: '/uploads/stickers/smile.png', alt: 'Smile' },
      { id: 'emoji-2', url: '/uploads/stickers/thumbsup.png', alt: 'Thumbs Up' },
      { id: 'emoji-3', url: '/uploads/stickers/fire.png', alt: 'Fire' },
      { id: 'emoji-4', url: '/uploads/stickers/heart.png', alt: 'Heart' },
    ]
  },
  {
    id: 'decorations',
    name: 'Decorations',
    stickers: [
      { id: 'deco-1', url: '/uploads/stickers/arrow.png', alt: 'Arrow' },
      { id: 'deco-2', url: '/uploads/stickers/badge.png', alt: 'Badge' },
      { id: 'deco-3', url: '/uploads/stickers/burst.png', alt: 'Burst' },
      { id: 'deco-4', url: '/uploads/stickers/ribbon.png', alt: 'Ribbon' },
    ]
  }
];

// For now, we'll use these placeholder images for the initial version
// Later, these could be fetched from an API
const PLACEHOLDER_STICKERS = [
  { id: 'placeholder-1', url: 'https://picsum.photos/100/100?random=1', alt: 'Sticker 1' },
  { id: 'placeholder-2', url: 'https://picsum.photos/100/100?random=2', alt: 'Sticker 2' },
  { id: 'placeholder-3', url: 'https://picsum.photos/100/100?random=3', alt: 'Sticker 3' },
  { id: 'placeholder-4', url: 'https://picsum.photos/100/100?random=4', alt: 'Sticker 4' },
  { id: 'placeholder-5', url: 'https://picsum.photos/100/100?random=5', alt: 'Sticker 5' },
  { id: 'placeholder-6', url: 'https://picsum.photos/100/100?random=6', alt: 'Sticker 6' },
];

interface StickersPanelProps {
  selectedSticker: StickerElement | null;
  onStickerSelected: (imageUrl: string) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDeleteSticker: () => void;
}

export default function StickersPanel({ 
  selectedSticker,
  onStickerSelected,
  onBringToFront,
  onSendToBack,
  onDeleteSticker
}: StickersPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('placeholder');

  // In a real implementation, we would fetch stickers from the API
  // const { data: stickerCategories = [] } = useQuery<any[]>({
  //   queryKey: ["/api/stickers/categories"],
  // });

  // For now, we'll use the placeholder data
  const stickerCategories = STICKER_CATEGORIES;
  const placeholderStickers = PLACEHOLDER_STICKERS;

  const handleStickerClick = (imageUrl: string) => {
    onStickerSelected(imageUrl);
    toast({
      title: "Sticker Added",
      description: "The sticker has been added to your thumbnail."
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Stickers & Clip Art</h3>
      </div>

      <Tabs defaultValue="placeholder" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full h-auto">
          <TabsTrigger value="placeholder" className="text-xs py-2">Quick Add</TabsTrigger>
          {stickerCategories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="text-xs py-2"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Placeholder Stickers Tab */}
        <TabsContent value="placeholder" className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            {placeholderStickers.map(sticker => (
              <div key={sticker.id} className="relative group overflow-hidden rounded-lg bg-gray-50 border border-gray-200 p-2">
                <img
                  src={sticker.url}
                  alt={sticker.alt}
                  className="w-full h-auto aspect-square object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => handleStickerClick(sticker.url)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button 
                    size="sm"
                    variant="secondary" 
                    className="rounded-full w-8 h-8 p-0"
                    onClick={() => handleStickerClick(sticker.url)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Sticker Category Tabs */}
        {stickerCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              {category.stickers.map(sticker => (
                <div key={sticker.id} className="relative group overflow-hidden rounded-lg bg-gray-50 border border-gray-200 p-2">
                  <img
                    src={sticker.url}
                    alt={sticker.alt}
                    className="w-full h-auto aspect-square object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => handleStickerClick(sticker.url)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button 
                      size="sm"
                      variant="secondary" 
                      className="rounded-full w-8 h-8 p-0"
                      onClick={() => handleStickerClick(sticker.url)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Layer Controls (only shown when a sticker is selected) */}
      {selectedSticker && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium mb-2">Sticker Controls</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center justify-center"
              onClick={onBringToFront}
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-xs">Front</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center justify-center"
              onClick={onSendToBack}
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              <span className="text-xs">Back</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center justify-center text-red-600 hover:text-red-700"
              onClick={onDeleteSticker}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Delete</span>
            </Button>
          </div>
        </div>
      )}

      {/* Upload your own sticker - this would be implemented later */}
      <div className="mb-2 opacity-50">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          disabled={true}
        >
          <Image className="h-4 w-4 mr-2" />
          <span>Upload Custom Sticker</span>
        </Button>
        <p className="text-xs text-gray-500 mt-1 text-center">Coming soon!</p>
      </div>
    </div>
  );
}