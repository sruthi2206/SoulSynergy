import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { chakras } from "@/lib/chakras";
import { HealingRitualCard } from "./HealingRitualCard";

interface HealingRitualsProps {
  recommendations?: any[];
  chakraProfile?: any;
  userId: number;
}

export default function HealingRituals({ recommendations = [], chakraProfile, userId }: HealingRitualsProps) {
  const [activeTab, setActiveTab] = useState("recommended");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all healing rituals
  const { data: allRituals = [], isLoading } = useQuery({
    queryKey: ["/api/healing-rituals"],
  });
  
  // Find most underactive chakra
  const findWeakestChakra = () => {
    if (!chakraProfile) return null;
    
    let weakestChakra = "root";
    let lowestValue = 10;
    
    const chakraMap = {
      crownChakra: "crown",
      thirdEyeChakra: "thirdEye",
      throatChakra: "throat",
      heartChakra: "heart",
      solarPlexusChakra: "solarPlexus",
      sacralChakra: "sacral",
      rootChakra: "root"
    };
    
    Object.entries(chakraMap).forEach(([key, value]) => {
      const chakraValue = chakraProfile[key];
      if (chakraValue < lowestValue) {
        lowestValue = chakraValue;
        weakestChakra = value;
      }
    });
    
    return {
      key: weakestChakra,
      value: lowestValue
    };
  };
  
  // Get rituals for weakest chakra
  const getWeakestChakraRituals = () => {
    const weakestChakra = findWeakestChakra();
    if (!weakestChakra) return [];
    
    const chakraKey = weakestChakra.key;
    const chakraInfo = chakras.find(c => c.key === chakraKey);
    
    return allRituals.filter((ritual: any) => {
      return ritual.targetChakra === chakraInfo?.name.toLowerCase();
    });
  };
  
  // Mark recommendation as completed
  const completeRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: number) => {
      const response = await apiRequest("PATCH", `/api/user-recommendations/${recommendationId}`, {
        completed: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/recommendations`] });
      toast({
        title: "Ritual Completed",
        description: "Your progress has been recorded. Great job!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark ritual as completed. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Add new recommendation
  const addRecommendationMutation = useMutation({
    mutationFn: async (ritualId: number) => {
      const response = await apiRequest("POST", "/api/user-recommendations", {
        userId,
        ritualId,
        completed: false
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/recommendations`] });
      toast({
        title: "Ritual Added",
        description: "The healing ritual has been added to your recommendations.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add the ritual to your recommendations. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle marking a ritual as complete
  const handleCompleteRitual = (recommendationId: number) => {
    completeRecommendationMutation.mutate(recommendationId);
  };
  
  // Handle adding a ritual to recommendations
  const handleAddRitual = (ritualId: number) => {
    // Check if ritual is already recommended
    const exists = recommendations.some((rec: any) => rec.ritualId === ritualId);
    
    if (exists) {
      toast({
        title: "Already Added",
        description: "This ritual is already in your recommendations.",
      });
      return;
    }
    
    addRecommendationMutation.mutate(ritualId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Explore Healing Rituals</h2>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Personalized practices to balance your chakras and support your emotional well-being.
        </p>
      </div>
      
      <Tabs defaultValue="recommended" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="chakra">Chakra Focus</TabsTrigger>
          <TabsTrigger value="all">All Rituals</TabsTrigger>
        </TabsList>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#6366f1] animate-spin"></div>
          </div>
        )}
        
        {/* User's Recommended Rituals */}
        <TabsContent value="recommended" className="mt-0">
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation: any) => {
                const ritual = recommendation.ritual;
                if (!ritual) return null;
                
                return (
                  <HealingRitualCard
                    key={recommendation.id}
                    title={ritual.name}
                    description={ritual.description}
                    chakraTags={ritual.targetChakra ? [ritual.targetChakra] : []}
                    emotionTags={ritual.targetEmotion ? [ritual.targetEmotion] : []}
                    isCompleted={recommendation.completed}
                    onDetails={() => {}}
                    onAdd={() => handleCompleteRitual(recommendation.id)}
                  />
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">No recommended rituals yet. Explore the "All Rituals" tab to discover practices.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Chakra-Focused Rituals */}
        <TabsContent value="chakra" className="mt-0">
          <div className="space-y-4">
            {chakraProfile ? (
              getWeakestChakraRituals().length > 0 ? (
                getWeakestChakraRituals().map((ritual: any) => {
                  const isRecommended = recommendations.some((rec: any) => rec.ritualId === ritual.id);
                  const recommendation = recommendations.find((rec: any) => rec.ritualId === ritual.id);
                  
                  return (
                    <HealingRitualCard
                      key={ritual.id}
                      title={ritual.name}
                      description={ritual.description}
                      chakraTags={ritual.targetChakra ? [ritual.targetChakra] : []}
                      emotionTags={ritual.targetEmotion ? [ritual.targetEmotion] : []}
                      isCompleted={recommendation?.completed}
                      onDetails={() => {}}
                      onAdd={() => handleAddRitual(ritual.id)}
                    />
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-500">No specific chakra-focused rituals found. Complete your chakra assessment to get personalized recommendations.</p>
                </div>
              )
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">Complete your chakra assessment to see focused healing rituals for your weakest chakras.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* All Available Rituals */}
        <TabsContent value="all" className="mt-0">
          <div className="space-y-4">
            {Array.isArray(allRituals) && allRituals.length > 0 ? (
              allRituals.map((ritual: any) => {
                const isRecommended = recommendations.some((rec: any) => rec.ritualId === ritual.id);
                const recommendation = recommendations.find((rec: any) => rec.ritualId === ritual.id);
                
                return (
                  <HealingRitualCard
                    key={ritual.id}
                    title={ritual.name}
                    description={ritual.description}
                    chakraTags={ritual.targetChakra ? [ritual.targetChakra] : []}
                    emotionTags={ritual.targetEmotion ? [ritual.targetEmotion] : []}
                    isCompleted={recommendation?.completed}
                    onDetails={() => {}}
                    onAdd={() => handleAddRitual(ritual.id)}
                  />
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">No healing rituals available at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}