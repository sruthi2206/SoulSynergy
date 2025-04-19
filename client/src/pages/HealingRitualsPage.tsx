import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Filter, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Chakra colors for visual association
const chakraColors: Record<string, { color: string, bg: string, icon: string }> = {
  crown: { color: "#7B68EE", bg: "#7B68EE20", icon: "👑" },
  third_eye: { color: "#9370DB", bg: "#9370DB20", icon: "👁️" },
  throat: { color: "#00BFFF", bg: "#00BFFF20", icon: "🗣️" },
  heart: { color: "#3CB371", bg: "#3CB37120", icon: "💚" },
  solar_plexus: { color: "#FFD700", bg: "#FFD70020", icon: "☀️" },
  sacral: { color: "#FF7F50", bg: "#FF7F5020", icon: "🧡" },
  root: { color: "#DC143C", bg: "#DC143C20", icon: "🔴" },
  all: { color: "#9C27B0", bg: "#9C27B020", icon: "✨" }
};

// Emotion categories
const emotionColors: Record<string, { color: string, bg: string }> = {
  anxiety: { color: "#E91E63", bg: "#E91E6320" },
  depression: { color: "#673AB7", bg: "#673AB720" },
  anger: { color: "#F44336", bg: "#F4433620" },
  fear: { color: "#9C27B0", bg: "#9C27B020" },
  grief: { color: "#607D8B", bg: "#607D8B20" },
  shame: { color: "#795548", bg: "#79554820" },
  guilt: { color: "#FF5722", bg: "#FF572220" },
  confusion: { color: "#FF9800", bg: "#FF980020" },
  doubt: { color: "#9E9E9E", bg: "#9E9E9E20" },
  joy: { color: "#4CAF50", bg: "#4CAF5020" },
  all: { color: "#2196F3", bg: "#2196F320" }
};

// Type definitions
type HealingRitual = {
  id: number;
  name: string;
  type: string;
  description: string;
  instructions: string;
  targetChakra: string | null;
  targetEmotion: string | null;
};

type UserRecommendation = {
  id: number;
  userId: number;
  ritualId: number;
  completed: boolean;
  createdAt: string;
  ritual?: HealingRitual;
};

export default function HealingRitualsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("recommended");
  const [selectedRitual, setSelectedRitual] = useState<HealingRitual | null>(null);
  const [filterChakra, setFilterChakra] = useState<string | null>(null);
  const [filterEmotion, setFilterEmotion] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all healing rituals
  const { data: healingRituals = [], isLoading: isLoadingRituals } = useQuery({
    queryKey: ['/api/healing-rituals', filterChakra, filterEmotion],
    queryFn: async ({ queryKey }) => {
      if (!user) return [];
      
      const baseUrl = '/api/healing-rituals';
      let url = baseUrl;
      const params = new URLSearchParams();
      
      if (filterChakra) {
        params.append('targetChakra', filterChakra);
      }
      
      if (filterEmotion) {
        params.append('targetEmotion', filterEmotion);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch healing rituals');
        return await res.json();
      } catch (error) {
        console.error('Error fetching healing rituals:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch user recommendations
  const { data: recommendations = [], isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/users', user?.id, 'recommendations'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/recommendations`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        return await res.json();
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Create recommendation mutation
  const createRecommendationMutation = useMutation({
    mutationFn: async (ritualId: number) => {
      const response = await apiRequest("POST", "/api/user-recommendations", {
        userId: user?.id,
        ritualId
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to add to your practices');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Added to your practices",
      });
      // Invalidate recommendations cache
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'recommendations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete recommendation mutation
  const completeRecommendationMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/user-recommendations/${id}`, {
        completed
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update practice');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Practice status updated",
      });
      // Invalidate recommendations cache
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'recommendations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle add to practices
  const handleAddToPractices = (ritual: HealingRitual) => {
    createRecommendationMutation.mutate(ritual.id);
  };

  // Handle complete practice
  const handleCompletePractice = (recommendation: UserRecommendation) => {
    completeRecommendationMutation.mutate({
      id: recommendation.id,
      completed: !recommendation.completed
    });
  };

  // Handle opening ritual details
  const handleOpenRitual = (ritual: HealingRitual) => {
    setSelectedRitual(ritual);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilterChakra(null);
    setFilterEmotion(null);
  };

  // Determine if ritual is already in user's recommendations
  const isInRecommendations = (ritualId: number) => {
    return recommendations.some(rec => rec.ritualId === ritualId);
  };

  // Get recommendation for a ritual if it exists
  const getRecommendation = (ritualId: number) => {
    return recommendations.find(rec => rec.ritualId === ritualId);
  };

  // Loading state
  const isLoading = isLoadingRituals || isLoadingRecommendations;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white py-3 shadow-sm">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Healing Rituals</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                  {(filterChakra || filterEmotion) && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                      <span className="sr-only">Active filters</span>
                      {(filterChakra && filterEmotion) ? 2 : 1}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Chakra Focus</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries({ all: { name: "All Chakras" }, ...{
                  crown: { name: "Crown Chakra" },
                  third_eye: { name: "Third Eye Chakra" },
                  throat: { name: "Throat Chakra" },
                  heart: { name: "Heart Chakra" },
                  solar_plexus: { name: "Solar Plexus Chakra" },
                  sacral: { name: "Sacral Chakra" },
                  root: { name: "Root Chakra" }
                }}).map(([key, { name }]) => (
                  <DropdownMenuItem 
                    key={key}
                    onClick={() => setFilterChakra(key === 'all' ? null : key)}
                    className="flex items-center gap-2"
                  >
                    {key !== 'all' && (
                      <span 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: chakraColors[key]?.color || '#ccc' }}
                      />
                    )}
                    <span>{name}</span>
                    {filterChakra === key || (key === 'all' && !filterChakra) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Emotional Support</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries({ all: { name: "All Emotions" }, ...{
                  anxiety: { name: "Anxiety" },
                  depression: { name: "Depression" },
                  anger: { name: "Anger" },
                  fear: { name: "Fear" },
                  grief: { name: "Grief" },
                  shame: { name: "Shame" },
                  guilt: { name: "Guilt" },
                  confusion: { name: "Confusion" },
                  doubt: { name: "Doubt" },
                  joy: { name: "Joy" }
                }}).map(([key, { name }]) => (
                  <DropdownMenuItem 
                    key={key}
                    onClick={() => setFilterEmotion(key === 'all' ? null : key)}
                    className="flex items-center gap-2"
                  >
                    {key !== 'all' && (
                      <span 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: emotionColors[key]?.color || '#ccc' }}
                      />
                    )}
                    <span>{name}</span>
                    {filterEmotion === key || (key === 'all' && !filterEmotion) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
                
                {(filterChakra || filterEmotion) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleClearFilters}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear All Filters</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Filter indicators */}
        {(filterChakra || filterEmotion) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filterChakra && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <span 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chakraColors[filterChakra]?.color || '#ccc' }}
                />
                {filterChakra.replace('_', ' ')} Chakra
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setFilterChakra(null)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )}
            
            {filterEmotion && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <span 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: emotionColors[filterEmotion]?.color || '#ccc' }}
                />
                {filterEmotion} support
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setFilterEmotion(null)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Tabs for different ritual lists */}
        <Tabs
          defaultValue="recommended"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommended">Your Practices</TabsTrigger>
            <TabsTrigger value="all">All Rituals</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Your Recommendations Tab */}
              <TabsContent value="recommended" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Your Healing Practices</h2>
                {recommendations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
                    <h3 className="font-medium mb-2">No practices yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Explore the rituals tab to add healing practices to your journey
                    </p>
                    <Button 
                      onClick={() => setActiveTab("all")} 
                      variant="outline"
                    >
                      Explore Rituals
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((recommendation) => (
                      <motion.div
                        key={recommendation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={`h-full overflow-hidden transition-all ${recommendation.completed ? 'bg-neutral-50' : 'hover:shadow-md'}`}>
                          <CardHeader className="p-4 pb-0">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                {recommendation.ritual?.targetChakra && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback
                                      style={{
                                        backgroundColor: chakraColors[recommendation.ritual.targetChakra]?.bg || '#f5f5f5',
                                        color: chakraColors[recommendation.ritual.targetChakra]?.color || '#999'
                                      }}
                                    >
                                      {chakraColors[recommendation.ritual.targetChakra]?.icon}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <CardTitle className="text-base">{recommendation.ritual?.name}</CardTitle>
                              </div>
                              <Button
                                variant={recommendation.completed ? "outline" : "ghost"}
                                size="icon"
                                className={`h-7 w-7 rounded-full ${
                                  recommendation.completed ? 'border-green-500 bg-green-50 text-green-500' : 'text-muted-foreground'
                                }`}
                                onClick={() => handleCompletePractice(recommendation)}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">
                                  {recommendation.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                </span>
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {recommendation.ritual?.targetChakra && (
                                <Badge 
                                  variant="outline"
                                  style={{
                                    borderColor: chakraColors[recommendation.ritual.targetChakra]?.color + '50',
                                    backgroundColor: chakraColors[recommendation.ritual.targetChakra]?.bg,
                                    color: chakraColors[recommendation.ritual.targetChakra]?.color
                                  }}
                                  className="font-normal text-xs"
                                >
                                  {recommendation.ritual.targetChakra.replace('_', ' ')} chakra
                                </Badge>
                              )}
                              {recommendation.ritual?.targetEmotion && (
                                <Badge 
                                  variant="outline"
                                  style={{
                                    borderColor: emotionColors[recommendation.ritual.targetEmotion]?.color + '50',
                                    backgroundColor: emotionColors[recommendation.ritual.targetEmotion]?.bg,
                                    color: emotionColors[recommendation.ritual.targetEmotion]?.color
                                  }}
                                  className="font-normal text-xs"
                                >
                                  {recommendation.ritual.targetEmotion}
                                </Badge>
                              )}
                              <Badge variant="outline" className="font-normal text-xs">
                                {recommendation.ritual?.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <CardDescription className="line-clamp-2">
                              {recommendation.ritual?.description}
                            </CardDescription>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => recommendation.ritual && handleOpenRitual(recommendation.ritual)}
                            >
                              View Details
                            </Button>
                            {recommendation.completed && (
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                Completed
                              </Badge>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* All Rituals Tab */}
              <TabsContent value="all" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Explore Healing Rituals</h2>
                {healingRituals.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
                    <h3 className="font-medium mb-2">No rituals found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or check back later
                    </p>
                    <Button onClick={handleClearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {healingRituals.map((ritual) => {
                      const recommendation = getRecommendation(ritual.id);
                      const isAdded = !!recommendation;
                      
                      return (
                        <motion.div
                          key={ritual.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="p-4 pb-0">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  {ritual.targetChakra && (
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback
                                        style={{
                                          backgroundColor: chakraColors[ritual.targetChakra]?.bg || '#f5f5f5',
                                          color: chakraColors[ritual.targetChakra]?.color || '#999'
                                        }}
                                      >
                                        {chakraColors[ritual.targetChakra]?.icon}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <CardTitle className="text-base">{ritual.name}</CardTitle>
                                </div>
                                {isAdded && recommendation?.completed && (
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {ritual.targetChakra && (
                                  <Badge 
                                    variant="outline"
                                    style={{
                                      borderColor: chakraColors[ritual.targetChakra]?.color + '50',
                                      backgroundColor: chakraColors[ritual.targetChakra]?.bg,
                                      color: chakraColors[ritual.targetChakra]?.color
                                    }}
                                    className="font-normal text-xs"
                                  >
                                    {ritual.targetChakra.replace('_', ' ')} chakra
                                  </Badge>
                                )}
                                {ritual.targetEmotion && (
                                  <Badge 
                                    variant="outline"
                                    style={{
                                      borderColor: emotionColors[ritual.targetEmotion]?.color + '50',
                                      backgroundColor: emotionColors[ritual.targetEmotion]?.bg,
                                      color: emotionColors[ritual.targetEmotion]?.color
                                    }}
                                    className="font-normal text-xs"
                                  >
                                    {ritual.targetEmotion}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="font-normal text-xs">
                                  {ritual.type.replace('_', ' ')}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <CardDescription className="line-clamp-2">
                                {ritual.description}
                              </CardDescription>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between">
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => handleOpenRitual(ritual)}
                              >
                                View Details
                              </Button>
                              {isAdded ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => recommendation && handleCompletePractice(recommendation)}
                                  className={`${recommendation?.completed ? 'border-green-500 bg-green-50 text-green-500 hover:bg-green-100' : ''}`}
                                >
                                  {recommendation?.completed ? 'Completed' : 'Mark Complete'}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddToPractices(ritual)}
                                  disabled={createRecommendationMutation.isPending}
                                >
                                  Add to Practices
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Ritual Details Dialog */}
        <Dialog open={!!selectedRitual} onOpenChange={(open) => !open && setSelectedRitual(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRitual?.targetChakra && (
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{
                      backgroundColor: chakraColors[selectedRitual.targetChakra]?.color || '#ccc'
                    }}
                  />
                )}
                {selectedRitual?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedRitual?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRitual?.targetChakra && (
                <Badge 
                  variant="outline"
                  style={{
                    borderColor: chakraColors[selectedRitual.targetChakra]?.color + '50',
                    backgroundColor: chakraColors[selectedRitual.targetChakra]?.bg,
                    color: chakraColors[selectedRitual.targetChakra]?.color
                  }}
                >
                  {selectedRitual.targetChakra.replace('_', ' ')} chakra
                </Badge>
              )}
              {selectedRitual?.targetEmotion && (
                <Badge 
                  variant="outline"
                  style={{
                    borderColor: emotionColors[selectedRitual.targetEmotion]?.color + '50',
                    backgroundColor: emotionColors[selectedRitual.targetEmotion]?.bg,
                    color: emotionColors[selectedRitual.targetEmotion]?.color
                  }}
                >
                  {selectedRitual.targetEmotion} support
                </Badge>
              )}
              <Badge variant="outline">
                {selectedRitual?.type.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="rounded-lg bg-neutral-50 p-4 text-sm">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <p className="whitespace-pre-wrap">{selectedRitual?.instructions}</p>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedRitual(null)}
              >
                Close
              </Button>
              
              {selectedRitual && (
                <>
                  {isInRecommendations(selectedRitual.id) ? (
                    <Button
                      variant="default"
                      onClick={() => {
                        const recommendation = getRecommendation(selectedRitual.id);
                        if (recommendation) {
                          handleCompletePractice(recommendation);
                        }
                        setSelectedRitual(null);
                      }}
                    >
                      {getRecommendation(selectedRitual.id)?.completed 
                        ? 'Mark as Incomplete' 
                        : 'Mark as Complete'}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => {
                        handleAddToPractices(selectedRitual);
                        setSelectedRitual(null);
                      }}
                      disabled={createRecommendationMutation.isPending}
                    >
                      Add to Your Practices
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}