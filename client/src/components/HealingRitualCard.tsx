import { Button } from "@/components/ui/button";

interface HealingRitualCardProps {
  title: string;
  description: string;
  chakraType?: string;
  authorName?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  isCompleted?: boolean;
  onDetails?: () => void;
  onAdd?: () => void;
  onComplete?: () => void;
}

export function HealingRitualCard({
  title,
  description,
  chakraType = "",
  authorName = "",
  imageUrl = "/images/crown_chakra.jpg",
  thumbnailUrl = "/images/root_chakra.jpg",
  isCompleted = false,
  onDetails,
  onAdd
}: HealingRitualCardProps) {
  // Truncate description if too long
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-xl font-medium text-gray-900 mb-1">{title}</h3>
        {authorName && (
          <p className="text-sm text-gray-500 mb-3">{authorName}</p>
        )}
        
        <p className="text-gray-700 mb-4 line-clamp-3">
          {truncateText(description, 180)}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <Button 
            variant="outline" 
            className="rounded-full px-6" 
            onClick={onDetails}
          >
            Learn More
          </Button>
          
          {isCompleted ? (
            <span className="text-green-600 text-sm font-medium">
              Completed
            </span>
          ) : null}
        </div>
      </div>
      
      <div className="flex mt-1 pr-6 pb-6 justify-end">
        <div className="flex space-x-2">
          <div className="w-24 h-32 rounded-md overflow-hidden shadow-sm">
            <img 
              src={thumbnailUrl} 
              alt="Instructor" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-60 h-32 rounded-md overflow-hidden shadow-sm">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}