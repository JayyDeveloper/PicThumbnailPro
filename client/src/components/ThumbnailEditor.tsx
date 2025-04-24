import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Crop, 
  Type, 
  Palette, 
  Sliders, 
  Layers, 
  Undo, 
  RefreshCcw, 
  Save, 
  Download,
  ImagePlus,
  Trash2,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThumbnailData, TextElement } from "@/pages/EditorPage";
import { StickerElement } from "@/hooks/useStickerEditor";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ShareModal } from "@/components/ShareModal";

interface ThumbnailEditorProps {
  thumbnailData: ThumbnailData;
  selectedElement: TextElement | null;
  selectedSticker: StickerElement | null;
  onElementSelect: (element: TextElement | null) => void;
  onStickerSelect: (sticker: StickerElement | null) => void;
  onElementUpdate: (element: TextElement) => void;
  onStickerUpdate: (sticker: StickerElement) => void;
  onElementDelete: (id: string) => void;
  onStickerDelete: () => void;
  onAddText: () => void;
  onAddSticker: (imageUrl: string) => void; 
  onBringToFront: () => void;
  onSendToBack: () => void;
  onReset: () => void;
}

export default function ThumbnailEditor({
  thumbnailData, 
  selectedElement,
  selectedSticker,
  onElementSelect,
  onStickerSelect,
  onElementUpdate,
  onStickerUpdate,
  onElementDelete,
  onStickerDelete,
  onAddText,
  onAddSticker,
  onBringToFront,
  onSendToBack,
  onReset
}: ThumbnailEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Function to handle downloading the thumbnail
  const downloadThumbnail = async () => {
    if (!thumbnailData.imageUrl) {
      toast({
        title: "Cannot Download",
        description: "Please select an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/thumbnails/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thumbnailData),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${thumbnailData.name || 'youtube-thumbnail'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Complete",
        description: "Your thumbnail has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your thumbnail.",
        variant: "destructive",
      });
    }
  };

  // Save thumbnail mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/thumbnails', thumbnailData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thumbnail Saved",
        description: "Your thumbnail has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "There was an error saving your thumbnail.",
        variant: "destructive",
      });
    }
  });

  // Handle mouse events for drag-and-drop text elements
  const handleMouseDown = (e: React.MouseEvent, element: TextElement) => {
    if (selectedElement?.id !== element.id) {
      onElementSelect(element);
      
      // Deselect any sticker when selecting a text element
      if (selectedSticker) {
        onStickerSelect(null);
      }
    }
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDragging(true);
    e.preventDefault();
  };
  
  // Handle mouse events for drag-and-drop sticker elements
  const handleStickerMouseDown = (e: React.MouseEvent, sticker: StickerElement) => {
    if (selectedSticker?.id !== sticker.id) {
      onStickerSelect(sticker);
      
      // Deselect any text element when selecting a sticker
      if (selectedElement) {
        onElementSelect(null);
      }
    }
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    // Variables to track the previous position for smoother movement
    let lastX = 0;
    let lastY = 0;
    let animationFrameId: number | null = null;
    
    const updatePosition = (x: number, y: number) => {
      // Calculate the distance moved from the last position
      const deltaX = x - lastX;
      const deltaY = y - lastY;
      
      // Only update if there's significant movement (reduces jitter)
      if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
        lastX = x;
        lastY = y;
        
        // Update position with precise values based on what's selected
        if (selectedElement) {
          onElementUpdate({
            ...selectedElement,
            x: parseFloat(Math.max(0, Math.min(100, x)).toFixed(3)), // Keep 3 decimal places for smoother movement
            y: parseFloat(Math.max(0, Math.min(100, y)).toFixed(3))
          });
        } else if (selectedSticker) {
          onStickerUpdate({
            ...selectedSticker,
            x: parseFloat(Math.max(0, Math.min(100, x)).toFixed(3)),
            y: parseFloat(Math.max(0, Math.min(100, y)).toFixed(3))
          });
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || (!selectedElement && !selectedSticker) || !editorRef.current) return;
      
      // Cancel any pending animation frame to avoid multiple updates
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Use requestAnimationFrame for smoother updates
      animationFrameId = requestAnimationFrame(() => {
        const rect = editorRef.current!.getBoundingClientRect();
        
        // Calculate x and y with higher precision
        const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
        const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
        
        // Initialize last position values if they haven't been set
        if (lastX === 0 && lastY === 0) {
          lastX = x;
          lastY = y;
        }
        
        updatePosition(x, y);
      });
    };
    
    const handleMouseUp = () => {
      setDragging(false);
    };
    
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, selectedElement, selectedSticker, onElementUpdate, onStickerUpdate]);

  // Generate filter styles based on the selected filter name and slider values
  const getFilterStyle = () => {
    const { brightness, contrast, saturation, blur, filterName } = thumbnailData.filters;
    
    // Apply the named filter presets
    if (filterName) {
      switch (filterName) {
        case 'Normal':
          return {
            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) blur(${blur}px)`,
          };
        case 'Muted':
          return {
            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${50 + saturation * 0.5}%) blur(${blur}px)`,
          };
        case 'Vibrant':
          return {
            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${150 + saturation * 0.5}%) blur(${blur}px)`,
          };
        case 'Dramatic':
          return {
            filter: `brightness(${110 + brightness * 0.5}%) contrast(${140 + contrast * 0.3}%) saturate(${120 + saturation * 0.3}%) blur(${blur}px)`,
          };
        case 'Retro':
          return {
            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${120 + saturation * 0.3}%) sepia(60%) hue-rotate(320deg) blur(${blur}px)`,
          };
        case 'Neon':
          return {
            filter: `brightness(${110 + brightness * 0.5}%) contrast(${120 + contrast * 0.3}%) saturate(${180 + saturation * 0.2}%) hue-rotate(20deg) blur(${blur}px)`,
          };
        case 'Noir':
          return {
            filter: `grayscale(100%) contrast(${120 + contrast * 0.3}%) brightness(${90 + brightness * 0.5}%) blur(${blur}px)`,
          };
        case 'Vintage':
          return {
            filter: `sepia(40%) brightness(${90 + brightness * 0.5}%) contrast(${85 + contrast * 0.3}%) saturate(${110 + saturation * 0.3}%) hue-rotate(350deg) blur(${blur}px)`,
          };
        case 'Blueprint':
          return {
            filter: `brightness(${100 + brightness * 0.5}%) contrast(${100 + contrast * 0.3}%) grayscale(100%) invert(90%) sepia(100%) hue-rotate(180deg) blur(${blur}px)`,
          };
        default:
          return {
            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) blur(${blur}px)`,
          };
      }
    }
    
    // Default filter just using the sliders
    return {
      filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) blur(${blur}px)`,
    };
  };

  // Apply filters to thumbnail preview
  const applyFilters = (url: string) => {
    // We're applying the filters using CSS in the style, so just return the URL
    return url;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">YouTube Thumbnail Editor</h2>
        <div className="text-sm text-gray-500">1280 × 720 px</div>
      </div>
      
      {/* Main Canvas Area */}
      <div 
        ref={editorRef}
        className="relative aspect-video border border-gray-200 rounded-lg bg-gray-100 overflow-hidden mb-4"
        onClick={() => onElementSelect(null)} // Deselect when clicking on canvas
      >
        {/* Background Image */}
        {thumbnailData.imageUrl ? (
          <img 
            src={applyFilters(thumbnailData.imageUrl)} 
            alt="Current thumbnail" 
            className="absolute inset-0 w-full h-full object-cover" 
            style={getFilterStyle()}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400">Select or upload an image to get started</p>
          </div>
        )}
        
        {/* Sticker Elements */}
        {thumbnailData.stickers.map(sticker => (
          <div 
            key={sticker.id}
            className={`relative group ${dragging && selectedSticker?.id === sticker.id ? 'dragging' : ''} ${selectedSticker?.id === sticker.id ? 'outline outline-blue-500' : ''}`}
            style={{
              position: 'absolute',
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              width: `${sticker.width}px`,
              height: `${sticker.height}px`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
              transition: dragging ? 'none' : 'box-shadow 0.2s ease, left 0.05s ease-out, top 0.05s ease-out',
              userSelect: 'none',
              zIndex: sticker.zIndex,
              cursor: 'move'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onStickerSelect(sticker);
            }}
            onMouseDown={(e) => {
              // Don't trigger drag if clicking on the delete button
              if ((e.target as HTMLElement).closest('.delete-btn')) {
                e.stopPropagation();
                return;
              }
              handleStickerMouseDown(e, sticker);
            }}
          >
            <img 
              src={sticker.imageUrl} 
              alt="Sticker" 
              className="w-full h-full object-contain"
              draggable="false"
            />
            
            {/* Delete button that appears on hover */}
            <button
              className="delete-btn absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onStickerSelect(sticker);
                onStickerDelete();
              }}
              title="Delete sticker"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {/* Text Elements */}
        {thumbnailData.elements.map(element => (
          <div 
            key={element.id}
            className={`relative group ${dragging && selectedElement?.id === element.id ? 'dragging' : ''} ${selectedElement?.id === element.id ? 'outline outline-blue-500' : ''}`}
            style={{
              position: 'absolute',
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: dragging ? 'none' : 'box-shadow 0.2s ease, left 0.05s ease-out, top 0.05s ease-out',
              userSelect: 'none',
              backgroundColor: `${element.backgroundColor}${Math.round(element.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`,
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textAlign: element.alignment,
              zIndex: selectedElement?.id === element.id ? 10 : 1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(element);
            }}
            onMouseDown={(e) => {
              // Don't trigger drag if clicking on the delete button
              if ((e.target as HTMLElement).closest('.delete-btn')) {
                e.stopPropagation();
                return;
              }
              handleMouseDown(e, element)
            }}
          >
            <h3 
              style={{
                fontSize: `${element.fontSize}px`,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                fontStyle: element.italic ? 'italic' : 'normal',
                textDecoration: element.underline ? 'underline' : 'none',
                letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                textTransform: (element.transform || 'none') as any,
                transform: element.rotateZ ? `rotateZ(${element.rotateZ}deg)` : 'none',
                textShadow: element.textShadow?.enabled 
                  ? `${element.textShadow.offsetX}px ${element.textShadow.offsetY}px ${element.textShadow.blur}px ${element.textShadow.color}` 
                  : 'none',
                WebkitTextStroke: element.outline?.enabled 
                  ? `${element.outline.width}px ${element.outline.color}` 
                  : '0px transparent',
                color: element.gradient?.enabled ? 'transparent' : element.color,
                ...(element.gradient?.enabled 
                  ? {
                      backgroundImage: `linear-gradient(${element.gradient.direction}, ${element.gradient.startColor}, ${element.gradient.endColor})`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                    }
                  : {}
                ),
              }}
            >
              {element.content}
            </h3>
            
            {/* Delete button that appears on hover */}
            <button
              className="delete-btn absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onElementDelete(element.id);
              }}
              title="Delete text"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {/* Show a placeholder if no image is selected */}
        {!thumbnailData.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="bg-gray-200 rounded-lg p-8 mb-4">
                <Crop className="h-10 w-10 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-500 text-sm">
                Drag & drop an image from the left panel or click "Browse Files"
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Tool Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={() => toast({ title: "Feature Coming Soon", description: "Crop functionality will be available soon." })}
        >
          <Crop className="h-4 w-4 mr-1" /> Crop
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={onAddText}
        >
          <Type className="h-4 w-4 mr-1" /> Text
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={() => {
            // Use a simple sticker URL for demo purposes
            const demoStickers = [
              'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Thumbs_up_silhouette.svg/1200px-Thumbs_up_silhouette.svg.png',
              'https://cdn-icons-png.flaticon.com/512/5231/5231019.png',
              'https://static.vecteezy.com/system/resources/previews/011/571/337/original/fire-icon-flame-symbol-free-png.png',
              'https://static.vecteezy.com/system/resources/previews/014/980/555/original/star-icon-transparent-free-png.png',
              'https://www.freeiconspng.com/thumbs/arrow-icon/arrow-icon--myiconfinder-23.png'
            ];
            const randomIndex = Math.floor(Math.random() * demoStickers.length);
            onAddSticker(demoStickers[randomIndex]);
          }}
        >
          <ImagePlus className="h-4 w-4 mr-1" /> Sticker
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={() => toast({ title: "Feature Coming Soon", description: "Filter options will be available soon." })}
        >
          <Palette className="h-4 w-4 mr-1" /> Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={() => toast({ title: "Feature Coming Soon", description: "Adjust options will be available soon." })}
        >
          <Sliders className="h-4 w-4 mr-1" /> Adjust
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={() => toast({ title: "Feature Coming Soon", description: "Layer management will be available soon." })}
        >
          <Layers className="h-4 w-4 mr-1" /> Layers
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={() => toast({ title: "Feature Coming Soon", description: "Undo functionality will be available soon." })}
        >
          <Undo className="h-4 w-4 mr-1" /> Undo
        </Button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center"
          onClick={onReset}
        >
          <RefreshCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center"
            onClick={() => setShareModalOpen(true)}
            disabled={!thumbnailData.imageUrl}
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="text-sm flex items-center bg-secondary hover:bg-green-600"
            onClick={downloadThumbnail}
            disabled={!thumbnailData.imageUrl}
          >
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        imageUrl={thumbnailData.imageUrl || ''}
        thumbnailName={thumbnailData.name || 'YouTube Thumbnail'}
      />
    </div>
  );
}
