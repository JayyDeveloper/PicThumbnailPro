import { useState } from "react";
import ReferenceImagesPanel from "@/components/ReferenceImagesPanel";
import ThumbnailEditor from "@/components/ThumbnailEditor";
import EditorTools from "@/components/EditorTools";
import PreviewSection from "@/components/PreviewSection";
import RecentThumbnails from "@/components/RecentThumbnails";
import EmojiTextStyleGenerator from "@/components/EmojiTextStyleGenerator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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
    
    toast({
      title: "Emoji Added",
      description: "The emoji has been added to your thumbnail.",
    });
  };

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Main editor */}
          <div className="lg:col-span-7">
            {!currentThumbnail.imageUrl ? (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Upload or Select an Image</h2>
                <ReferenceImagesPanel 
                  onImageSelected={handleImageSelected}
                  stockCategories={stockCategories}
                />
              </div>
            ) : (
              <>
                <ThumbnailEditor 
                  thumbnailData={currentThumbnail}
                  selectedElement={selectedElement}
                  onElementSelect={handleElementSelect}
                  onElementUpdate={handleUpdateElement}
                  onElementDelete={handleDeleteElement}
                  onAddText={handleAddTextElement}
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
