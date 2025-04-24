import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThumbnailData } from "@/pages/EditorPage";
import { ExternalLink } from "lucide-react";

interface PreviewSectionProps {
  thumbnailData: ThumbnailData;
}

export default function PreviewSection({ thumbnailData }: PreviewSectionProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Preview</h2>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <div className="max-w-md mx-auto">
          {/* YouTube Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            {thumbnailData.imageUrl ? (
              <img 
                src={thumbnailData.imageUrl} 
                alt="Preview thumbnail" 
                className="absolute inset-0 w-full h-full object-cover" 
                style={getFilterStyle()}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <p className="text-gray-400">No image selected</p>
              </div>
            )}
            
            {/* Sticker Elements */}
            {thumbnailData.stickers.map(sticker => (
              <div 
                key={sticker.id}
                className="absolute sticker-element"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  width: `${sticker.width * 0.7}px`, // Scale down for preview
                  height: `${sticker.height * 0.7}px`, // Scale down for preview
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                  zIndex: sticker.zIndex,
                  position: 'relative', // For positioning the delete button
                }}
              >
                <img 
                  src={sticker.imageUrl} 
                  alt="Sticker" 
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
            
            {/* Text Elements */}
            {thumbnailData.elements.map(element => (
              <div 
                key={element.id}
                className="absolute"
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `${element.backgroundColor}${Math.round(element.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  textAlign: element.alignment as any,
                }}
              >
                <h3 
                  style={{
                    fontSize: `${element.fontSize * 0.7}px`, // Scale down for preview
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
                      : 'none',
                    ...(element.gradient?.enabled 
                      ? {
                          color: 'transparent',
                          backgroundImage: `linear-gradient(${element.gradient.direction}, ${element.gradient.startColor}, ${element.gradient.endColor})`,
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                        }
                      : { 
                          color: element.color 
                        }
                    ),
                  }}
                >
                  {element.content}
                </h3>
              </div>
            ))}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-10 bg-red-600 flex items-center justify-center rounded-lg cursor-pointer">
                <Play className="h-6 w-6 text-white" fill="white" />
              </div>
            </div>
            
            {/* Duration */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
              10:45
            </div>
          </div>
          
          {/* Video Title */}
          <div className="mt-2">
            <h3 className="text-white font-medium truncate">
              {thumbnailData.elements.length > 0 
                ? thumbnailData.elements[0].content 
                : "Add text to your thumbnail"}
            </h3>
            <p className="text-gray-400 text-sm">Your Channel • 1.5K views • 2 days ago</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
          <ExternalLink className="h-4 w-4 mr-1" /> Preview in YouTube Studio
        </Button>
        <Button size="sm" className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-md text-sm">
          Export for YouTube
        </Button>
      </div>
    </div>
  );
}
