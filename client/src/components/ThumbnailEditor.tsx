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
  Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThumbnailData, TextElement } from "@/pages/EditorPage";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ThumbnailEditorProps {
  thumbnailData: ThumbnailData;
  selectedElement: TextElement | null;
  onElementSelect: (element: TextElement | null) => void;
  onElementUpdate: (element: TextElement) => void;
  onElementDelete: (id: string) => void;
  onAddText: () => void;
  onReset: () => void;
}

export default function ThumbnailEditor({
  thumbnailData, 
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onAddText,
  onReset
}: ThumbnailEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !selectedElement || !editorRef.current) return;
      
      const rect = editorRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      
      // Update element position
      onElementUpdate({
        ...selectedElement,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
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
  }, [dragging, dragOffset, selectedElement, onElementUpdate]);

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
        
        {/* Text Elements */}
        {thumbnailData.elements.map(element => (
          <div 
            key={element.id}
            className={`absolute text-overlay cursor-move ${selectedElement?.id === element.id ? 'outline outline-blue-500' : ''}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: 'translate(-50%, -50%)',
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
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <h3 
              style={{
                color: element.color,
                fontSize: `${element.fontSize}px`,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                fontStyle: element.italic ? 'italic' : 'normal',
                textDecoration: element.underline ? 'underline' : 'none',
              }}
            >
              {element.content}
            </h3>
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
    </div>
  );
}
