import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, CheckCircle, Clock, Play, Plus, Flame, Droplets, Music, Brain, BookOpen, Heart } from "lucide-react";
import { chakras } from "@/lib/chakras";

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
  
  // Get rituals by type
  const getRitualsByType = (type: string) => {
    return allRituals.filter((ritual: any) => ritual.type === type);
  };
  
  // Get ritual by ID
  const getRitualById = (id: number) => {
    return allRituals.find((ritual: any) => ritual.id === id);
  };
  
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
    const exists = recommendations.some(rec => rec.ritualId === ritualId);
    
    if (exists) {
      toast({
        title: "Already Added",
        description: "This ritual is already in your recommendations.",
      });
      return;
    }
    
    addRecommendationMutation.mutate(ritualId);
  };
  
  // Get ritual icon based on type
  const getRitualIcon = (type: string) => {
    switch (type) {
      case "meditation":
        return <Brain className="h-5 w-5" />;
      case "visualization":
        return <Flame className="h-5 w-5" />;
      case "sound_healing":
        return <Music className="h-5 w-5" />;
      case "affirmation":
        return <Heart className="h-5 w-5" />;
      case "movement":
        return <Play className="h-5 w-5" />;
      case "somatic":
        return <Droplets className="h-5 w-5" />;
      case "journaling":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Flame className="h-5 w-5" />;
    }
  };
  
  // Find chakra color by name
  const getChakraColor = (chakraName: string) => {
    const chakraKey = chakraName.toLowerCase().replace(' chakra', '').replace(' ', '_');
    const chakra = chakras.find(c => c.key === chakraKey || c.name.toLowerCase() === chakraName.toLowerCase());
    return chakra?.color || "#888";
  };
  
  // Extract YouTube video ID and return thumbnail URL
  const getYoutubeThumbnail = (videoUrl: string | null) => {
    if (!videoUrl) return null;
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    
    if (match && match[2].length === 11) {
      // Return high-quality thumbnail
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Healing Rituals</h2>
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
            <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
          </div>
        )}
        
        {/* User's Recommended Rituals */}
        <TabsContent value="recommended" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation) => {
                const ritual = recommendation.ritual;
                if (!ritual) return null;
                
                return (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`overflow-hidden ${recommendation.completed ? "bg-neutral-50/50" : ""}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Left side: image/thumbnail */}
                        <div className="md:w-1/3 relative">
                          {(() => {
                            const thumbnailUrl = getYoutubeThumbnail(ritual.videoUrl);
                            
                            if (thumbnailUrl) {
                              return (
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                  <img 
                                    src={thumbnailUrl} 
                                    alt={ritual.name} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Play className="h-10 w-10 text-white" />
                                  </div>
                                  
                                  {recommendation.completed && (
                                    <div className="absolute top-2 right-2">
                                      <Badge className="bg-green-500 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              );
                            } else if (ritual.featuredImage) {
                              return (
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                  <img 
                                    src={ritual.featuredImage} 
                                    alt={ritual.name} 
                                    className="w-full h-full object-cover"
                                  />
                                  
                                  {recommendation.completed && (
                                    <div className="absolute top-2 right-2">
                                      <Badge className="bg-green-500 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              return (
                                <div 
                                  className="relative aspect-[4/3] w-full flex items-center justify-center"
                                  style={{ 
                                    backgroundColor: ritual.targetChakra 
                                      ? `${getChakraColor(ritual.targetChakra)}20` 
                                      : "#E6E6FA20" 
                                  }}
                                >
                                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/90">
                                    {getRitualIcon(ritual.type)}
                                  </div>
                                  
                                  {recommendation.completed && (
                                    <div className="absolute top-2 right-2">
                                      <Badge className="bg-green-500 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          })()}
                        </div>
                        
                        {/* Right side: content */}
                        <div className="md:w-2/3 p-6">
                          <div className="mb-4">
                            <h3 className="text-xl font-medium mb-1">{ritual.name}</h3>
                            <p className="text-neutral-500 mb-3">{ritual.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline">
                                {ritual.type.replace('_', ' ')}
                              </Badge>
                              {ritual.targetChakra && (
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    color: getChakraColor(ritual.targetChakra),
                                    borderColor: `${getChakraColor(ritual.targetChakra)}40`
                                  }}
                                >
                                  {ritual.targetChakra}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            {!recommendation.completed ? (
                              <Button 
                                onClick={() => handleCompleteRitual(recommendation.id)} 
                                className="bg-[#483D8B] hover:bg-opacity-90"
                                disabled={completeRecommendationMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Practice Again
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline"
                            >
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-2">
                <Card className="bg-neutral-50 border-dashed">
                  <CardContent className="pt-6 pb-6 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-neutral-200 flex items-center justify-center mb-4">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-neutral-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.5 12.5L12 5L4.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                    <p className="text-neutral-600 max-w-md mx-auto mb-6">
                      Your personalized healing recommendations will appear here. Explore the other tabs to find practices to add.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("all")} 
                      className="bg-[#483D8B] hover:bg-opacity-90"
                    >
                      Browse All Practices
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Chakra-Focused Rituals */}
        <TabsContent value="chakra" className="mt-0">
          {chakraProfile ? (
            <div className="space-y-6">
              <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-2">Your Chakra Focus</h3>
                {(() => {
                  const weakestChakra = findWeakestChakra();
                  if (!weakestChakra) return null;
                  
                  const chakraInfo = chakras.find(c => c.key === weakestChakra.key);
                  if (!chakraInfo) return null;
                  
                  return (
                    <div>
                      <div className="flex items-center mb-3">
                        <div 
                          className="w-8 h-8 rounded-full mr-3"
                          style={{ backgroundColor: chakraInfo.color }}
                        ></div>
                        <div>
                          <p className="font-medium">{chakraInfo.name}</p>
                          <p className="text-sm text-neutral-600">
                            Value: {weakestChakra.value}/10 - Needs attention
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mb-3">
                        Based on your chakra profile, your {chakraInfo.name.toLowerCase()} could benefit from healing practices.
                      </p>
                      <div 
                        className="h-1 w-full rounded-full bg-neutral-200 overflow-hidden"
                      >
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${weakestChakra.value * 10}%`,
                            backgroundColor: chakraInfo.color
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getWeakestChakraRituals().map((ritual: any) => (
                  <motion.div
                    key={ritual.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Left side: image/thumbnail */}
                        <div className="md:w-1/3 relative">
                          {(() => {
                            const thumbnailUrl = getYoutubeThumbnail(ritual.videoUrl);
                            
                            if (thumbnailUrl) {
                              return (
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                  <img 
                                    src={thumbnailUrl} 
                                    alt={ritual.name} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Play className="h-10 w-10 text-white" />
                                  </div>
                                </div>
                              );
                            } else if (ritual.featuredImage) {
                              return (
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                  <img 
                                    src={ritual.featuredImage} 
                                    alt={ritual.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              );
                            } else {
                              return (
                                <div 
                                  className="relative aspect-[4/3] w-full flex items-center justify-center"
                                  style={{ 
                                    backgroundColor: ritual.targetChakra 
                                      ? `${getChakraColor(ritual.targetChakra)}20` 
                                      : "#E6E6FA20" 
                                  }}
                                >
                                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/90">
                                    {getRitualIcon(ritual.type)}
                                  </div>
                                </div>
                              );
                            }
                          })()}
                        </div>
                        
                        {/* Right side: content */}
                        <div className="md:w-2/3 p-6">
                          <div className="mb-4">
                            <h3 className="text-xl font-medium mb-1">{ritual.name}</h3>
                            <p className="text-neutral-500 mb-3">{ritual.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline">
                                {ritual.type.replace('_', ' ')}
                              </Badge>
                              {ritual.targetChakra && (
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    color: getChakraColor(ritual.targetChakra),
                                    borderColor: `${getChakraColor(ritual.targetChakra)}40`
                                  }}
                                >
                                  {ritual.targetChakra}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <Button 
                              onClick={() => handleAddRitual(ritual.id)} 
                              className="bg-[#483D8B] hover:bg-opacity-90"
                              disabled={addRecommendationMutation.isPending}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to My Practices
                            </Button>
                            
                            <Button variant="outline">
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                
                {getWeakestChakraRituals().length === 0 && (
                  <div className="col-span-2 text-center py-12 text-neutral-500">
                    No specific rituals found for your chakra focus. Try exploring all rituals.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="bg-neutral-50 border-dashed">
              <CardContent className="pt-6 pb-6 text-center">
                <h3 className="text-lg font-medium mb-2">No Chakra Profile Found</h3>
                <p className="text-neutral-600 max-w-md mx-auto mb-6">
                  Complete your chakra assessment to get personalized recommendations based on your energy centers.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* All Rituals */}
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card 
              className="bg-[#483D8B]/5 hover:bg-[#483D8B]/10 cursor-pointer transition-colors"
              onClick={() => setActiveTab("recommended")}
            >
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium text-[#483D8B]">Recommended</h3>
                <p className="text-sm text-neutral-600">Your personal selections</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-[#008080]/5 hover:bg-[#008080]/10 cursor-pointer transition-colors"
              onClick={() => setActiveTab("chakra")}
            >
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium text-[#008080]">Chakra Focus</h3>
                <p className="text-sm text-neutral-600">Balance your energy centers</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#FF69B4]/5 hover:bg-[#FF69B4]/10 cursor-pointer transition-colors">
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium text-[#FF69B4]">Emotional Healing</h3>
                <p className="text-sm text-neutral-600">Process specific feelings</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {["meditation", "visualization", "sound_healing", "affirmation", "somatic"].map((type) => {
              const rituals = getRitualsByType(type);
              if (rituals.length === 0) return null;
              
              return (
                <div key={type} className="space-y-4">
                  <h3 className="text-xl font-heading font-medium border-b pb-2">
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Practices
                  </h3>
                  
                  <div className="space-y-6">
                    {rituals.map((ritual: any) => {
                      const thumbnailUrl = getYoutubeThumbnail(ritual.videoUrl);
                      
                      return (
                        <motion.div
                          key={ritual.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="hover:shadow-md transition-shadow overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              {/* Left side - thumbnail or placeholder */}
                              <div className="md:w-1/3 relative">
                                {thumbnailUrl ? (
                                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <img 
                                      src={thumbnailUrl} 
                                      alt={ritual.name} 
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <Play className="h-10 w-10 text-white" />
                                    </div>
                                  </div>
                                ) : ritual.featuredImage ? (
                                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <img 
                                      src={ritual.featuredImage} 
                                      alt={ritual.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div 
                                    className="aspect-[4/3] w-full flex items-center justify-center"
                                    style={{ 
                                      backgroundColor: ritual.targetChakra 
                                        ? `${getChakraColor(ritual.targetChakra)}20` 
                                        : "#E6E6FA20" 
                                    }}
                                  >
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/90">
                                      {getRitualIcon(ritual.type)}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Right side - content */}
                              <div className="md:w-2/3 p-6">
                                <div className="mb-4">
                                  <h3 className="text-xl font-medium mb-1">{ritual.name}</h3>
                                  <p className="text-neutral-500 mb-3">{ritual.description}</p>
                                  
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge variant="outline">
                                      {ritual.type.replace('_', ' ')}
                                    </Badge>
                                    {ritual.targetChakra && (
                                      <Badge 
                                        variant="outline"
                                        style={{ 
                                          color: getChakraColor(ritual.targetChakra),
                                          borderColor: `${getChakraColor(ritual.targetChakra)}40`
                                        }}
                                      >
                                        {ritual.targetChakra}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between">
                                  <Button 
                                    onClick={() => handleAddRitual(ritual.id)}
                                    className="bg-[#483D8B] hover:bg-opacity-90"
                                    disabled={addRecommendationMutation.isPending}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to My Practices
                                  </Button>
                                  
                                  <Button variant="outline">
                                    Learn More
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
