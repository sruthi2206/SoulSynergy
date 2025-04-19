import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HealingRitualCardProps {
  title: string;
  description: string;
  chakraTags?: string[];
  emotionTags?: string[];
  isCompleted?: boolean;
  onDetails?: () => void;
  onAdd?: () => void;
  onComplete?: () => void;
}

export function HealingRitualCard({
  title,
  description,
  chakraTags = [],
  emotionTags = [],
  isCompleted = false,
  onDetails,
  onAdd,
  onComplete
}: HealingRitualCardProps) {
  // Get chakra icon emoji based on chakra name
  const getChakraEmoji = (chakraName: string) => {
    const chakraName_lower = chakraName.toLowerCase();
    if (chakraName_lower.includes('crown')) return '👑';
    if (chakraName_lower.includes('third eye')) return '👁️';
    if (chakraName_lower.includes('throat')) return '🗣️';
    if (chakraName_lower.includes('heart')) return '💚';
    if (chakraName_lower.includes('solar plexus')) return '☀️';
    if (chakraName_lower.includes('sacral')) return '🧡';
    if (chakraName_lower.includes('root')) return '🔴';
    return '✨';
  };

  // Get first chakra tag if available
  const primaryChakra = chakraTags.length > 0 ? chakraTags[0] : '';
  const chakraEmoji = getChakraEmoji(primaryChakra);

  return (
    <div className="border border-gray-200 rounded-lg mb-4 bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className="text-xl mr-2">{chakraEmoji}</span>
          <h3 className="font-medium text-lg">{title}</h3>
          
          {isCompleted && (
            <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Completed
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {chakraTags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
            >
              {tag}
            </Badge>
          ))}
          
          {emotionTags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
            >
              {tag}
            </Badge>
          ))}
          
          <Badge 
            variant="outline" 
            className="bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
          >
            {primaryChakra.includes('crown') || primaryChakra.includes('third eye') ? 'meditation' : 'visualization'}
          </Badge>
        </div>
        
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={onDetails}>
            View Details
          </Button>
          
          {isCompleted ? (
            <Button variant="outline" size="sm" onClick={onComplete}>
              Mark Complete
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onAdd}>
              Add to Practices
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}