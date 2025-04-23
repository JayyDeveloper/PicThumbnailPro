import { useState, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline 
} from "lucide-react";
import { TextElement, ThumbnailData } from "@/pages/EditorPage";

interface EditorToolsProps {
  selectedElement: TextElement | null;
  onElementUpdate: (element: TextElement) => void;
  thumbnailData: ThumbnailData;
  onUpdateFilters: (filters: ThumbnailData["filters"]) => void;
}

const fontOptions = [
  "Montserrat", 
  "Roboto", 
  "Open Sans", 
  "Oswald", 
  "Poppins", 
  "Raleway", 
  "Anton", 
  "Bebas Neue", 
  "Bungee", 
  "Staatliches"
];
const fontWeightOptions = ["Regular", "Medium", "Bold", "Black"];
const colorOptions = ["#FFFFFF", "#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#000000"];

export default function EditorTools({ 
  selectedElement, 
  onElementUpdate,
  thumbnailData,
  onUpdateFilters
}: EditorToolsProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image">(
    selectedElement ? "text" : "image"
  );
  
  // Update text content
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      content: e.target.value
    });
  };
  
  // Update font family
  const handleFontChange = (value: string) => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      fontFamily: value
    });
  };
  
  // Update font size
  const handleFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement) return;
    const size = parseInt(e.target.value);
    
    if (isNaN(size)) return;
    
    onElementUpdate({
      ...selectedElement,
      fontSize: size
    });
  };
  
  // Update font weight
  const handleFontWeightChange = (value: string) => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      fontWeight: value
    });
  };
  
  // Update text alignment
  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      alignment
    });
  };
  
  // Toggle text style (bold, italic, underline)
  const toggleTextStyle = (style: "bold" | "italic" | "underline") => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      [style]: !selectedElement[style]
    });
  };
  
  // Update text color
  const handleColorChange = (color: string) => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      color
    });
  };
  
  // Update background color
  const handleBgColorChange = (color: string) => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      backgroundColor: color
    });
  };
  
  // Update background opacity
  const handleOpacityChange = (values: number[]) => {
    if (!selectedElement) return;
    
    onElementUpdate({
      ...selectedElement,
      backgroundOpacity: values[0]
    });
  };
  
  // Image adjustment handlers
  const handleFilterChange = (filter: string) => {
    onUpdateFilters({
      ...thumbnailData.filters,
      filterName: filter
    });
  };
  
  const handleBrightnessChange = (values: number[]) => {
    onUpdateFilters({
      ...thumbnailData.filters,
      brightness: values[0]
    });
  };
  
  const handleContrastChange = (values: number[]) => {
    onUpdateFilters({
      ...thumbnailData.filters,
      contrast: values[0]
    });
  };
  
  const handleSaturationChange = (values: number[]) => {
    onUpdateFilters({
      ...thumbnailData.filters,
      saturation: values[0]
    });
  };
  
  const handleBlurChange = (values: number[]) => {
    onUpdateFilters({
      ...thumbnailData.filters,
      blur: values[0]
    });
  };

  return (
    <div className="space-y-6">
      {/* Text Customization Panel */}
      {selectedElement && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Text Customization</h2>
          
          {/* Text Content */}
          <div className="mb-4">
            <Label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </Label>
            <Textarea 
              id="text-content" 
              rows={2} 
              value={selectedElement.content}
              onChange={handleContentChange}
              className="w-full resize-none"
            />
          </div>
          
          {/* Font Selection */}
          <div className="mb-4">
            <Label htmlFor="font-select" className="block text-sm font-medium text-gray-700 mb-1">
              Font
            </Label>
            <Select 
              value={selectedElement.fontFamily}
              onValueChange={handleFontChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font">
                  {selectedElement.fontFamily && (
                    <span style={{ fontFamily: selectedElement.fontFamily }}>{selectedElement.fontFamily}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map(font => (
                  <SelectItem key={font} value={font}>
                    <span data-font={font} style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Font Style Controls */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </Label>
              <div className="flex">
                <Input 
                  type="number" 
                  id="font-size" 
                  value={selectedElement.fontSize}
                  onChange={handleFontSizeChange}
                  min={8}
                  max={72}
                  className="w-full rounded-r-none"
                />
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md">
                  px
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="font-weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </Label>
              <Select 
                value={selectedElement.fontWeight}
                onValueChange={handleFontWeightChange}
              >
                <SelectTrigger id="font-weight">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {fontWeightOptions.map(weight => (
                    <SelectItem key={weight} value={weight}>
                      {weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Text Styling Controls */}
          <div className="flex justify-between mb-4">
            <div className="flex space-x-1">
              <Button 
                variant={selectedElement.alignment === "left" ? "default" : "outline"}
                size="icon"
                className="p-2 h-9 w-9"
                onClick={() => handleAlignmentChange("left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.alignment === "center" ? "default" : "outline"}
                size="icon"
                className="p-2 h-9 w-9"
                onClick={() => handleAlignmentChange("center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.alignment === "right" ? "default" : "outline"}
                size="icon"
                className="p-2 h-9 w-9"
                onClick={() => handleAlignmentChange("right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant={selectedElement.bold ? "default" : "outline"}
                size="icon"
                className="p-2 h-9 w-9"
                onClick={() => toggleTextStyle("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.italic ? "default" : "outline"}
                size="icon"
                className="p-2 h-9 w-9"
                onClick={() => toggleTextStyle("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.underline ? "default" : "outline"}
                size="icon"
                className="p-2 h-9 w-9"
                onClick={() => toggleTextStyle("underline")}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Color Controls */}
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  className={`h-8 w-full rounded-md ${color === selectedElement.color ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color, border: color === "#FFFFFF" ? "1px solid #E5E7EB" : "none" }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </div>
          
          {/* Background Controls */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="block text-sm font-medium text-gray-700">
                Background
              </Label>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">
                  Opacity: {selectedElement.backgroundOpacity}%
                </span>
                <Slider 
                  value={[selectedElement.backgroundOpacity]} 
                  min={0} 
                  max={100} 
                  step={1}
                  onValueChange={handleOpacityChange}
                  className="w-20" 
                />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  className={`h-8 w-full rounded-md ${color === selectedElement.backgroundColor ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ 
                    backgroundColor: color, 
                    border: color === "#FFFFFF" ? "1px solid #E5E7EB" : "none",
                    opacity: color === "transparent" ? 0 : 1
                  }}
                  onClick={() => handleBgColorChange(color)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Image Adjustments Panel */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Image Adjustments</h2>
        
        {/* Filters */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Filters
          </Label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button 
              variant={thumbnailData.filters.filterName === 'Normal' || !thumbnailData.filters.filterName ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Normal')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Normal" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Normal</span>
            </Button>
            <Button 
              variant={thumbnailData.filters.filterName === 'Muted' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Muted')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Muted" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'saturate(50%)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Muted</span>
            </Button>
            <Button 
              variant={thumbnailData.filters.filterName === 'Vibrant' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Vibrant')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Vibrant" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'saturate(150%)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Vibrant</span>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button 
              variant={thumbnailData.filters.filterName === 'Dramatic' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Dramatic')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Dramatic" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'contrast(140%) brightness(110%) saturate(120%)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Dramatic</span>
            </Button>
            <Button 
              variant={thumbnailData.filters.filterName === 'Retro' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Retro')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Retro" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'sepia(60%) hue-rotate(320deg) saturate(120%)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Retro</span>
            </Button>
            <Button 
              variant={thumbnailData.filters.filterName === 'Neon' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Neon')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Neon" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(110%) contrast(120%) saturate(180%) hue-rotate(20deg)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Neon</span>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={thumbnailData.filters.filterName === 'Noir' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Noir')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Noir" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'grayscale(100%) contrast(120%) brightness(90%)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Noir</span>
            </Button>
            <Button 
              variant={thumbnailData.filters.filterName === 'Vintage' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Vintage')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Vintage" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'sepia(40%) brightness(90%) contrast(85%) saturate(110%) hue-rotate(350deg)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Vintage</span>
            </Button>
            <Button 
              variant={thumbnailData.filters.filterName === 'Blueprint' ? "default" : "outline"} 
              className="p-2 h-auto flex flex-col items-center"
              onClick={() => handleFilterChange('Blueprint')}
            >
              <div className="w-full h-12 bg-gray-200 rounded-md mb-1 overflow-hidden">
                {thumbnailData.imageUrl ? (
                  <img 
                    src={thumbnailData.imageUrl} 
                    alt="Blueprint" 
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(100%) contrast(100%) grayscale(100%) invert(90%) sepia(100%) hue-rotate(180deg)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-xs">Blueprint</span>
            </Button>
          </div>
        </div>
        
        {/* Adjustments */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            Adjustments
          </Label>
          
          {/* Brightness */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Brightness</span>
              <span>{thumbnailData.filters.brightness}</span>
            </div>
            <Slider 
              min={-100} 
              max={100} 
              step={1}
              value={[thumbnailData.filters.brightness]} 
              onValueChange={handleBrightnessChange}
              className="w-full" 
            />
          </div>
          
          {/* Contrast */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Contrast</span>
              <span>{thumbnailData.filters.contrast}</span>
            </div>
            <Slider 
              min={-100} 
              max={100} 
              step={1}
              value={[thumbnailData.filters.contrast]} 
              onValueChange={handleContrastChange}
              className="w-full" 
            />
          </div>
          
          {/* Saturation */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Saturation</span>
              <span>{thumbnailData.filters.saturation}</span>
            </div>
            <Slider 
              min={-100} 
              max={100} 
              step={1}
              value={[thumbnailData.filters.saturation]} 
              onValueChange={handleSaturationChange}
              className="w-full" 
            />
          </div>
          
          {/* Blur */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Blur Background</span>
              <span>{thumbnailData.filters.blur}</span>
            </div>
            <Slider 
              min={0} 
              max={20} 
              step={1}
              value={[thumbnailData.filters.blur]} 
              onValueChange={handleBlurChange}
              className="w-full" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
