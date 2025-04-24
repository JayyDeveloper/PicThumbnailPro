import { useState, useEffect } from "react";
import ReferenceImagesPanel from "@/components/ReferenceImagesPanel";
import ThumbnailEditor from "@/components/ThumbnailEditor";
import EditorTools from "@/components/EditorTools";
import PreviewSection from "@/components/PreviewSection";
import RecentThumbnails from "@/components/RecentThumbnails";
import EmojiTextStyleGenerator from "@/components/EmojiTextStyleGenerator";
import StickersPanel from "@/components/StickersPanel";
import TemplateLibrary, { ThumbnailTemplate } from "@/components/TemplateLibrary";
import ThumbnailChecklist from "@/components/ThumbnailChecklist";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsufficientPointsDialog } from "@/components/InsufficientPointsDialog";
import { StickerElement } from "@/hooks/useStickerEditor";
import { Sparkles } from "lucide-react";
import { Link } from "wouter";

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
  // Advanced text effects
  textShadow?: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  outline?: {
    enabled: boolean;
    color: string;
    width: number;
  };
  gradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    direction: 'to-bottom' | 'to-right' | 'to-top' | 'to-left' | 'to-bottom-right' | 'to-top-right';
  };
  letterSpacing?: number;
  transform?: 'normal' | 'uppercase' | 'lowercase' | 'capitalize';
  rotateZ?: number;
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
  const { user } = useAuth();

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
  
  // Thumbnail history for undo functionality
  const [thumbnailHistory, setThumbnailHistory] = useState<ThumbnailData[]>([]);

  const [selectedElement, setSelectedElement] = useState<TextElement | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<StickerElement | null>(null);
  
  // State for insufficient points modal
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

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

  // Function to add current state to history
  const addToHistory = (thumbnail: ThumbnailData) => {
    setThumbnailHistory(prev => [...prev, JSON.parse(JSON.stringify(thumbnail))]);
  };
  
  // Function to handle undo action
  const handleUndo = () => {
    if (thumbnailHistory.length === 0) {
      toast({
        title: "Nothing to Undo",
        description: "There are no actions to undo.",
      });
      return;
    }
    
    // Get the last state from history
    const lastState = thumbnailHistory[thumbnailHistory.length - 1];
    
    // Update current thumbnail to the previous state
    setCurrentThumbnail(lastState);
    
    // Remove the last state from history
    setThumbnailHistory(prev => prev.slice(0, -1));
    
    // Clear selection
    setSelectedElement(null);
    setSelectedSticker(null);
    
    toast({
      title: "Undo Complete",
      description: "Your last action has been undone.",
    });
  };

  const handleAddTextElement = () => {
    // Add current state to history before making changes
    addToHistory(currentThumbnail);
    
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
      // Advanced text effects with default values
      textShadow: {
        enabled: false,
        color: '#000000',
        blur: 4,
        offsetX: 2,
        offsetY: 2,
      },
      outline: {
        enabled: false,
        color: '#000000',
        width: 2,
      },
      gradient: {
        enabled: false,
        startColor: '#FF5F6D',
        endColor: '#FFC371',
        direction: 'to-bottom',
      },
      letterSpacing: 0,
      transform: 'normal',
      rotateZ: 0,
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
    // Add current state to history before making changes
    addToHistory(currentThumbnail);
    
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
    // Add current state to history before making changes
    addToHistory(currentThumbnail);
    
    setCurrentThumbnail({
      // Keep the image, but remove everything else
      imageUrl: currentThumbnail.imageUrl,
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
      description: "All elements have been removed, but the image is kept.",
    });
  };
  
  const handleAddEmoji = (emoji: string) => {
    // Add current state to history before making changes
    addToHistory(currentThumbnail);
    
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
      // Advanced text effects with default values
      textShadow: {
        enabled: false,
        color: '#000000',
        blur: 4,
        offsetX: 2,
        offsetY: 2,
      },
      outline: {
        enabled: false,
        color: '#000000',
        width: 2,
      },
      gradient: {
        enabled: false,
        startColor: '#FF5F6D',
        endColor: '#FFC371',
        direction: 'to-bottom',
      },
      letterSpacing: 0,
      transform: 'normal',
      rotateZ: 0,
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
    // Add current state to history before making changes
    addToHistory(currentThumbnail);
    
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
    
    // Add current state to history before making changes
    addToHistory(currentThumbnail);
    
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
  
  // Save thumbnail mutation
  const saveThumbnailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/thumbnails", currentThumbnail);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Thumbnail Saved",
        description: "Your thumbnail has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/thumbnails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      // Check for specific error messages
      if (error.message && (
        error.message.includes("Insufficient points") || 
        error.message.includes("403") || 
        error.message.toLowerCase().includes("out of points")
      )) {
        setIsPointsModalOpen(true);
      } else {
        toast({
          title: "Save Failed",
          description: "Out of points! Purchase more to save thumbnails.",
          variant: "destructive",
        });
      }
    },
  });
  
  // Handle save thumbnail
  const handleSaveThumbnail = () => {
    if (!currentThumbnail.imageUrl) {
      toast({
        title: "Cannot Save",
        description: "Please select an image before saving.",
        variant: "destructive",
      });
      return;
    }
    
    saveThumbnailMutation.mutate();
  };
  
  // Export thumbnail mutation
  const exportThumbnailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/thumbnails/export", {
        imageUrl: currentThumbnail.imageUrl,
        elements: currentThumbnail.elements,
        filters: currentThumbnail.filters,
      });
      
      // Get filename from response
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "thumbnail.png";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: "Your thumbnail has been downloaded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      console.error("Export error:", error);
      // Check for specific error messages
      if (error.message && (
        error.message.includes("Insufficient points") || 
        error.message.includes("403") || 
        error.message.toLowerCase().includes("out of points")
      )) {
        setIsPointsModalOpen(true);
      } else {
        toast({
          title: "Export Failed",
          description: "Out of points! Purchase more to export thumbnails.",
          variant: "destructive",
        });
      }
    },
  });
  
  // Handle export thumbnail
  const handleExportThumbnail = () => {
    if (!currentThumbnail.imageUrl) {
      toast({
        title: "Cannot Export",
        description: "Please select an image before exporting.",
        variant: "destructive",
      });
      return;
    }
    
    exportThumbnailMutation.mutate();
  };

  return (
    <div className="bg-background">
      {/* Insufficient Points Dialog */}
      <InsufficientPointsDialog 
        open={isPointsModalOpen} 
        onOpenChange={setIsPointsModalOpen} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Main editor */}
          <div className="lg:col-span-7">
            {!currentThumbnail.imageUrl ? (
              <>
                <div className="bg-card rounded-lg shadow-sm p-6 mb-6 dark:border dark:border-border">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">Upload or Select an Image</h2>
                  <ReferenceImagesPanel 
                    onImageSelected={handleImageSelected}
                    stockCategories={stockCategories}
                  />
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-6 dark:border dark:border-border">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">Or Choose from Template Library</h2>
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
                  onUndo={handleUndo}
                />
                
                <div className="mt-6">
                  <PreviewSection thumbnailData={currentThumbnail} />
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between items-center gap-4 mt-4">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-yellow-500 mr-1.5" />
                    <span className="mr-1 font-medium">{user?.points ?? 1} available {(user?.points ?? 1) === 1 ? 'point' : 'points'}</span>
                    {(user?.points ?? 1) === 1 && (
                      <span className="text-xs text-muted-foreground">(Free trial)</span>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveThumbnail}
                      disabled={saveThumbnailMutation.isPending}
                      className="px-4 py-2 bg-primary text-white rounded-md font-medium flex items-center hover:bg-primary/90"
                    >
                      {saveThumbnailMutation.isPending ? 'Saving...' : 'Save Thumbnail'}
                    </button>
                    
                    <button
                      onClick={handleExportThumbnail}
                      disabled={exportThumbnailMutation.isPending}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium flex items-center hover:bg-secondary/90"
                    >
                      {exportThumbnailMutation.isPending ? 'Exporting...' : 'Download Thumbnail'}
                    </button>
                  </div>
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
                
                <ThumbnailChecklist />
                
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
