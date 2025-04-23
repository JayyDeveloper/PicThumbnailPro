import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThumbnailData } from "@/pages/EditorPage";
import { ExternalLink } from "lucide-react";

interface PreviewSectionProps {
  thumbnailData: ThumbnailData;
}

export default function PreviewSection({ thumbnailData }: PreviewSectionProps) {
  // Generate filter styles 
  const getFilterStyle = () => {
    const { brightness, contrast, saturation, blur } = thumbnailData.filters;
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
                    color: element.color,
                    fontSize: `${element.fontSize * 0.7}px`, // Scale down for preview
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
