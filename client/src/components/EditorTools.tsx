import { useState, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline,
  Type,
  Droplet,
  Palette,
  RotateCcw,
  BadgePercent,
  SlidersHorizontal
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
          
          {/* Advanced Text Effects */}
          <Tabs defaultValue="shadow" className="w-full mt-4">
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="shadow" className="text-xs flex gap-1 items-center">
                <Droplet className="h-3 w-3" /> Shadow
              </TabsTrigger>
              <TabsTrigger value="outline" className="text-xs flex gap-1 items-center">
                <Type className="h-3 w-3" /> Outline
              </TabsTrigger>
              <TabsTrigger value="gradient" className="text-xs flex gap-1 items-center">
                <Palette className="h-3 w-3" /> Gradient
              </TabsTrigger>
              <TabsTrigger value="transform" className="text-xs flex gap-1 items-center">
                <SlidersHorizontal className="h-3 w-3" /> More
              </TabsTrigger>
            </TabsList>
            
            {/* Shadow Tab */}
            <TabsContent value="shadow" className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Text Shadow</Label>
                <Switch 
                  checked={selectedElement.textShadow?.enabled || false}
                  onCheckedChange={(checked) => {
                    onElementUpdate({
                      ...selectedElement,
                      textShadow: {
                        ...(selectedElement.textShadow || { color: '#000000', blur: 4, offsetX: 2, offsetY: 2 }),
                        enabled: checked
                      }
                    });
                  }}
                />
              </div>
              {selectedElement.textShadow?.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Shadow Color</Label>
                      <div className="grid grid-cols-6 gap-1 mt-1">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            className={`h-6 w-full rounded-md ${color === selectedElement.textShadow?.color ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ backgroundColor: color, border: color === "#FFFFFF" ? "1px solid #E5E7EB" : "none" }}
                            onClick={() => onElementUpdate({
                              ...selectedElement,
                              textShadow: {
                                ...selectedElement.textShadow!,
                                color
                              }
                            })}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Blur: {selectedElement.textShadow?.blur}px</Label>
                      <Slider 
                        value={[selectedElement.textShadow?.blur || 4]} 
                        min={0} 
                        max={20} 
                        step={1}
                        onValueChange={(values) => onElementUpdate({
                          ...selectedElement,
                          textShadow: {
                            ...selectedElement.textShadow!,
                            blur: values[0]
                          }
                        })}
                        className="mt-1" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Offset X: {selectedElement.textShadow?.offsetX}px</Label>
                      <Slider 
                        value={[selectedElement.textShadow?.offsetX || 2]} 
                        min={-10} 
                        max={10} 
                        step={1}
                        onValueChange={(values) => onElementUpdate({
                          ...selectedElement,
                          textShadow: {
                            ...selectedElement.textShadow!,
                            offsetX: values[0]
                          }
                        })}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Offset Y: {selectedElement.textShadow?.offsetY}px</Label>
                      <Slider 
                        value={[selectedElement.textShadow?.offsetY || 2]} 
                        min={-10} 
                        max={10} 
                        step={1}
                        onValueChange={(values) => onElementUpdate({
                          ...selectedElement,
                          textShadow: {
                            ...selectedElement.textShadow!,
                            offsetY: values[0]
                          }
                        })}
                        className="mt-1" 
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Outline Tab */}
            <TabsContent value="outline" className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Text Outline</Label>
                <Switch 
                  checked={selectedElement.outline?.enabled || false}
                  onCheckedChange={(checked) => {
                    onElementUpdate({
                      ...selectedElement,
                      outline: {
                        ...(selectedElement.outline || { color: '#000000', width: 2 }),
                        enabled: checked
                      }
                    });
                  }}
                />
              </div>
              {selectedElement.outline?.enabled && (
                <>
                  <div>
                    <Label className="text-xs">Outline Color</Label>
                    <div className="grid grid-cols-6 gap-1 mt-1">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          className={`h-6 w-full rounded-md ${color === selectedElement.outline?.color ? 'ring-2 ring-blue-500' : ''}`}
                          style={{ backgroundColor: color, border: color === "#FFFFFF" ? "1px solid #E5E7EB" : "none" }}
                          onClick={() => onElementUpdate({
                            ...selectedElement,
                            outline: {
                              ...selectedElement.outline!,
                              color
                            }
                          })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Width: {selectedElement.outline?.width}px</Label>
                    <Slider 
                      value={[selectedElement.outline?.width || 2]} 
                      min={1} 
                      max={5} 
                      step={0.5}
                      onValueChange={(values) => onElementUpdate({
                        ...selectedElement,
                        outline: {
                          ...selectedElement.outline!,
                          width: values[0]
                        }
                      })}
                      className="mt-1" 
                    />
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Gradient Tab */}
            <TabsContent value="gradient" className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Text Gradient</Label>
                <Switch 
                  checked={selectedElement.gradient?.enabled || false}
                  onCheckedChange={(checked) => {
                    onElementUpdate({
                      ...selectedElement,
                      gradient: {
                        ...(selectedElement.gradient || { startColor: '#FF5F6D', endColor: '#FFC371', direction: 'to-bottom' }),
                        enabled: checked
                      }
                    });
                  }}
                />
              </div>
              {selectedElement.gradient?.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Start Color</Label>
                      <Input 
                        type="color" 
                        value={selectedElement.gradient?.startColor || '#FF5F6D'} 
                        onChange={(e) => onElementUpdate({
                          ...selectedElement,
                          gradient: {
                            ...selectedElement.gradient!,
                            startColor: e.target.value
                          }
                        })}
                        className="h-8 w-full p-1 mt-1" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Color</Label>
                      <Input 
                        type="color" 
                        value={selectedElement.gradient?.endColor || '#FFC371'} 
                        onChange={(e) => onElementUpdate({
                          ...selectedElement,
                          gradient: {
                            ...selectedElement.gradient!,
                            endColor: e.target.value
                          }
                        })}
                        className="h-8 w-full p-1 mt-1" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Direction</Label>
                    <Select 
                      value={selectedElement.gradient?.direction || 'to-bottom'}
                      onValueChange={(value: any) => onElementUpdate({
                        ...selectedElement,
                        gradient: {
                          ...selectedElement.gradient!,
                          direction: value
                        }
                      })}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to-bottom">Top to Bottom</SelectItem>
                        <SelectItem value="to-right">Left to Right</SelectItem>
                        <SelectItem value="to-top">Bottom to Top</SelectItem>
                        <SelectItem value="to-left">Right to Left</SelectItem>
                        <SelectItem value="to-bottom-right">Diagonal ↘</SelectItem>
                        <SelectItem value="to-top-right">Diagonal ↗</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Transform Tab */}
            <TabsContent value="transform" className="space-y-3">
              <div>
                <Label className="text-xs">Letter Spacing: {selectedElement.letterSpacing || 0}px</Label>
                <Slider 
                  value={[selectedElement.letterSpacing || 0]} 
                  min={-2} 
                  max={10} 
                  step={0.5}
                  onValueChange={(values) => onElementUpdate({
                    ...selectedElement,
                    letterSpacing: values[0]
                  })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label className="text-xs">Rotation: {selectedElement.rotateZ || 0}°</Label>
                <Slider 
                  value={[selectedElement.rotateZ || 0]} 
                  min={-30} 
                  max={30} 
                  step={1}
                  onValueChange={(values) => onElementUpdate({
                    ...selectedElement,
                    rotateZ: values[0]
                  })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label className="text-xs">Text Transform</Label>
                <Select 
                  value={selectedElement.transform || 'normal'}
                  onValueChange={(value: any) => onElementUpdate({
                    ...selectedElement,
                    transform: value
                  })}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue placeholder="Select transform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="capitalize">Capitalize</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
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
