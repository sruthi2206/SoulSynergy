import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  return (
    <div className="border rounded-md overflow-hidden shadow-sm bg-white">
      <div className="flex flex-col md:flex-row">
        {/* Left side - image */}
        <div className="md:w-1/3 bg-gray-100 h-32 md:h-auto flex items-center justify-center">
          <img 
            src="/images/crown_chakra.jpg" 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right side - content */}
        <div className="md:w-2/3 p-4">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {chakraTags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-3 pt-3 border-t">
            <Button variant="ghost" size="sm" className="text-indigo-600" onClick={onDetails}>
              View Details
            </Button>
            
            {isCompleted ? (
              <Badge className="bg-green-500">Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-1" /> Add to Practices
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}