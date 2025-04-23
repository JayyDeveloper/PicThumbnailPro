import { useState } from "react";
import ReferenceImagesPanel from "@/components/ReferenceImagesPanel";
import ThumbnailEditor from "@/components/ThumbnailEditor";
import EditorTools from "@/components/EditorTools";
import PreviewSection from "@/components/PreviewSection";
import RecentThumbnails from "@/components/RecentThumbnails";
import EmojiTextStyleGenerator from "@/components/EmojiTextStyleGenerator";
import StickersPanel from "@/components/StickersPanel";
import TemplateLibrary, { ThumbnailTemplate } from "@/components/TemplateLibrary";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { StickerElement } from "@/hooks/useStickerEditor";

export interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  alignment: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface ThumbnailData {
  id?: number;
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
  name: string;
}

export default function EditorPage() {
  const { toast } = useToast();

  const [currentThumbnail, setCurrentThumbnail] = useState<ThumbnailData>({
    imageUrl: "",
    elements: [],
    stickers: [],
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      filterName: null,
    },
    name: "Untitled Thumbnail",
  });

  const [selectedElement, setSelectedElement] = useState<TextElement | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<StickerElement | null>(null);

  // Fetch stock categories
  const { data: stockCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/stock-categories"],
  });

  // Fetch recent thumbnails
  const { data: recentThumbnails = [] } = useQuery<any[]>({
    queryKey: ["/api/thumbnails/recent"],
  });

  const handleImageSelected = (imageUrl: string) => {
    setCurrentThumbnail({
      ...currentThumbnail,
      imageUrl,
    });
    toast({
      title: "Image Selected",
      description: "The image has been added to your thumbnail.",
    });
  };

  const handleAddTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      content: "YOUR TEXT HERE",
      x: 50,
      y: 50,
      fontSize: 36,
      fontFamily: "Bebas Neue", // Using one of our new attention-grabbing fonts
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "#000000",
      backgroundOpacity: 50,
      alignment: "center",
      bold: true,
      italic: false,
      underline: false,
    };

    setCurrentThumbnail({
      ...currentThumbnail,
      elements: [...currentThumbnail.elements, newElement],
    });
    setSelectedElement(newElement);
  };

  const handleUpdateElement = (updatedElement: TextElement) => {
    setCurrentThumbnail({
      ...currentThumbnail,
      elements: currentThumbnail.elements.map(el => 
        el.id === updatedElement.id ? updatedElement : el
      ),
    });
    setSelectedElement(updatedElement);
  };

  const handleDeleteElement = (id: string) => {
    setCurrentThumbnail({
      ...currentThumbnail,
      elements: currentThumbnail.elements.filter(el => el.id !== id),
    });
    
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
    
    toast({
      title: "Element Deleted",
      description: "The element has been removed from your thumbnail.",
    });
  };
  
  const handleUpdateFilters = (filters: ThumbnailData["filters"]) => {
    setCurrentThumbnail({
      ...currentThumbnail,
      filters,
    });
  };

  const handleElementSelect = (element: TextElement | null) => {
    setSelectedElement(element);
  };

  const handleReset = () => {
    setCurrentThumbnail({
      imageUrl: "",
      elements: [],
      stickers: [],
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        filterName: null,
      },
      name: "Untitled Thumbnail",
    });
    setSelectedElement(null);
    setSelectedSticker(null);
    toast({
      title: "Reset Complete",
      description: "Your thumbnail has been reset.",
    });
  };
  
  const handleAddEmoji = (emoji: string) => {
    const newElement: TextElement = {
      id: `emoji-${Date.now()}`,
      content: emoji,
      x: 50,
      y: 50,
      fontSize: 48, // Larger font size for emojis
      fontFamily: "Poppins", // Modern font that displays emojis well
      fontWeight: "Regular",
      color: "#FFFFFF",
      backgroundColor: "transparent",
      backgroundOpacity: 0,
      alignment: "center",
      bold: false,
      italic: false,
      underline: false,
    };

    setCurrentThumbnail({
      ...currentThumbnail,
      elements: [...currentThumbnail.elements, newElement],
    });
    setSelectedElement(newElement);
    setSelectedSticker(null); // Deselect any sticker when adding emoji
    
    toast({
      title: "Emoji Added",
      description: "The emoji has been added to your thumbnail.",
    });
  };
  
  // Add a new sticker
  const handleAddSticker = (imageUrl: string) => {
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      imageUrl,
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      rotation: 0,
      scale: 1,
      zIndex: currentThumbnail.stickers.length + 1
    };
    
    setCurrentThumbnail({
      ...currentThumbnail,
      stickers: [...currentThumbnail.stickers, newSticker]
    });
    setSelectedSticker(newSticker);
    setSelectedElement(null); // Deselect any text element when adding sticker
  };
  
  // Update a sticker
  const handleUpdateSticker = (updatedSticker: StickerElement) => {
    setCurrentThumbnail({
      ...currentThumbnail,
      stickers: currentThumbnail.stickers.map(sticker => 
        sticker.id === updatedSticker.id ? updatedSticker : sticker
      )
    });
    setSelectedSticker(updatedSticker);
  };
  
  // Delete a sticker
  const handleDeleteSticker = () => {
    if (!selectedSticker) return;
    
    setCurrentThumbnail({
      ...currentThumbnail,
      stickers: currentThumbnail.stickers.filter(sticker => sticker.id !== selectedSticker.id)
    });
    setSelectedSticker(null);
    
    toast({
      title: "Sticker Removed",
      description: "The sticker has been removed from your thumbnail."
    });
  };
  
  // Select a sticker
  const handleStickerSelect = (sticker: StickerElement | null) => {
    setSelectedSticker(sticker);
    setSelectedElement(null); // Deselect any text when selecting a sticker
  };
  
  // Bring selected sticker to front
  const handleBringToFront = () => {
    if (!selectedSticker) return;
    
    const maxZIndex = Math.max(...currentThumbnail.stickers.map(s => s.zIndex), 0);
    const updatedStickers = currentThumbnail.stickers.map(sticker => 
      sticker.id === selectedSticker.id ? { ...sticker, zIndex: maxZIndex + 1 } : sticker
    );
    
    setCurrentThumbnail({
      ...currentThumbnail,
      stickers: updatedStickers
    });
    
    const updatedSticker = updatedStickers.find(s => s.id === selectedSticker.id);
    if (updatedSticker) {
      setSelectedSticker(updatedSticker);
    }
  };
  
  // Send selected sticker to back
  const handleSendToBack = () => {
    if (!selectedSticker) return;
    
    const minZIndex = Math.min(...currentThumbnail.stickers.map(s => s.zIndex), 0);
    const updatedStickers = currentThumbnail.stickers.map(sticker => 
      sticker.id === selectedSticker.id ? { ...sticker, zIndex: minZIndex - 1 } : sticker
    );
    
    setCurrentThumbnail({
      ...currentThumbnail,
      stickers: updatedStickers
    });
    
    const updatedSticker = updatedStickers.find(s => s.id === selectedSticker.id);
    if (updatedSticker) {
      setSelectedSticker(updatedSticker);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: ThumbnailTemplate) => {
    setCurrentThumbnail({
      ...currentThumbnail,
      imageUrl: template.imageUrl,
      elements: template.elements,
      stickers: template.stickers,
      filters: template.filters,
      name: template.name
    });
    
    setSelectedElement(null);
    setSelectedSticker(null);
    
    toast({
      title: "Template Applied",
      description: `The "${template.name}" template has been applied.`,
    });
  };

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Main editor */}
          <div className="lg:col-span-7">
            {!currentThumbnail.imageUrl ? (
              <>
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Upload or Select an Image</h2>
                  <ReferenceImagesPanel 
                    onImageSelected={handleImageSelected}
                    stockCategories={stockCategories}
                  />
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Or Choose from Template Library</h2>
                  <TemplateLibrary onSelectTemplate={handleTemplateSelect} />
                </div>
              </>
            ) : (
              <>
                <ThumbnailEditor 
                  thumbnailData={currentThumbnail}
                  selectedElement={selectedElement}
                  selectedSticker={selectedSticker}
                  onElementSelect={handleElementSelect}
                  onStickerSelect={handleStickerSelect}
                  onElementUpdate={handleUpdateElement}
                  onStickerUpdate={handleUpdateSticker}
                  onElementDelete={handleDeleteElement}
                  onStickerDelete={handleDeleteSticker}
                  onAddText={handleAddTextElement}
                  onAddSticker={handleAddSticker}
                  onBringToFront={handleBringToFront}
                  onSendToBack={handleSendToBack}
                  onReset={handleReset}
                />
                
                <div className="mt-6">
                  <PreviewSection thumbnailData={currentThumbnail} />
                </div>
                
                {/* Recent Thumbnails */}
                <div className="mt-8">
                  <RecentThumbnails thumbnails={recentThumbnails} />
                </div>
              </>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {currentThumbnail.imageUrl && (
              <>
                <EditorTools 
                  selectedElement={selectedElement}
                  onElementUpdate={handleUpdateElement}
                  thumbnailData={currentThumbnail}
                  onUpdateFilters={handleUpdateFilters}
                />
                
                <EmojiTextStyleGenerator
                  selectedElement={selectedElement}
                  onElementUpdate={handleUpdateElement}
                  onAddEmoji={handleAddEmoji}
                />
                
                <StickersPanel
                  selectedSticker={selectedSticker}
                  onStickerSelected={handleAddSticker}
                  onBringToFront={handleBringToFront}
                  onSendToBack={handleSendToBack}
                  onDeleteSticker={handleDeleteSticker}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
