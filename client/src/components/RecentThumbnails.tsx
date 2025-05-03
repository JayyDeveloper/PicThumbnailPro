import { useToast } from "@/hooks/use-toast";
import { Thumbnail } from "@shared/schema";

export interface RecentThumbnailsProps {
  thumbnails: Thumbnail[];
  onThumbnailSelect?: (thumbnail: Thumbnail) => void;
}

export default function RecentThumbnails({ thumbnails, onThumbnailSelect }: RecentThumbnailsProps) {
  const { toast } = useToast();
  
  const handleThumbnailClick = (thumbnail: Thumbnail) => {
    if (onThumbnailSelect) {
      onThumbnailSelect(thumbnail);
    }
    toast({
      title: "Thumbnail Selected",
      description: `You selected: ${thumbnail.name}`,
    });
  };
  
  // If no thumbnails, don't show the section
  if (thumbnails.length === 0) return null;
  
  return (
    <div className="bg-card rounded-lg shadow-sm p-4 mt-8 hidden md:block border dark:border-border">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-foreground">Recent Thumbnails</h2>
        <button className="text-primary text-sm hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {thumbnails.map(thumbnail => (
          <div 
            key={thumbnail.id}
            className="cursor-pointer group"
            onClick={() => handleThumbnailClick(thumbnail)}
          >
            <div className="relative aspect-video rounded-md overflow-hidden border border-border">
              <img 
                src={thumbnail.imageUrl}
                alt={thumbnail.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:opacity-75 transition-opacity"
              />
            </div>
            <p className="mt-1 text-xs text-foreground truncate">{thumbnail.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
