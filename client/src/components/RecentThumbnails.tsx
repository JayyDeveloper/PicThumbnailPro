import { useToast } from "@/hooks/use-toast";

interface Thumbnail {
  id: number;
  name: string;
  imageUrl: string;
}

interface RecentThumbnailsProps {
  thumbnails: Thumbnail[];
}

export default function RecentThumbnails({ thumbnails }: RecentThumbnailsProps) {
  const { toast } = useToast();
  
  const handleThumbnailClick = (thumbnail: Thumbnail) => {
    toast({
      title: "Thumbnail Selected",
      description: `You selected: ${thumbnail.name}`,
    });
    // This would normally load the thumbnail into the editor
  };
  
  // If no thumbnails, don't show the section
  if (thumbnails.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-8 hidden md:block">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Recent Thumbnails</h2>
        <button className="text-primary text-sm hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {thumbnails.map(thumbnail => (
          <div 
            key={thumbnail.id}
            className="cursor-pointer group"
            onClick={() => handleThumbnailClick(thumbnail)}
          >
            <div className="relative aspect-video rounded-md overflow-hidden border border-gray-200">
              <img 
                src={thumbnail.imageUrl}
                alt={thumbnail.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:opacity-75 transition-opacity"
              />
            </div>
            <p className="mt-1 text-xs text-gray-700 truncate">{thumbnail.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
