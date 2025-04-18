import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Download, Check } from "lucide-react";
import { chakras, getChakraStatus } from "@/lib/chakras";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ChakraWheel from "@/components/ChakraWheel";
import OnboardingQuiz from "@/components/OnboardingQuiz";

export default function ChakraAssessment() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("manual");
  const [completeStep, setCompleteStep] = useState(false);
  
  // Fetch user's chakra profile
  const { data: chakraProfile, isLoading: isLoadingChakraProfile } = useQuery({
    queryKey: ['/api/users', user?.id, 'chakra-profile'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await fetch(`/api/users/${user.id}/chakra-profile`);
        if (!res.ok) {
          if (res.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch chakra profile');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching chakra profile:', error);
        return null;
      }
    },
    enabled: !!user,
  });
  
  // Create state for chakra values (initialize from profile or default)
  const [chakraValues, setChakraValues] = useState<Record<string, number>>(() => {
    if (!chakraProfile) return {
      crown: 5,
      thirdEye: 5,
      throat: 5,
      heart: 5,
      solarPlexus: 5,
      sacral: 5,
      root: 5
    };
    
    return {
      crown: chakraProfile.crownChakra,
      thirdEye: chakraProfile.thirdEyeChakra,
      throat: chakraProfile.throatChakra,
      heart: chakraProfile.heartChakra,
      solarPlexus: chakraProfile.solarPlexusChakra,
      sacral: chakraProfile.sacralChakra,
      root: chakraProfile.rootChakra
    };
  });
  
  // Handle chakra value changes in manual adjustment
  const handleChakraChange = (chakra: string, value: number[]) => {
    setChakraValues(prev => ({ ...prev, [chakra]: value[0] }));
  };
  
  // Handle quiz completion
  const handleQuizComplete = (quizValues: Record<string, number>) => {
    setChakraValues(quizValues);
    setCompleteStep(true);
  };
  
  // Mutation for saving chakra profile
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        if (chakraProfile) {
          // Update existing profile
          console.log("Updating existing profile:", chakraProfile.id);
          console.log("With values:", chakraValues);
          
          const response = await apiRequest("PATCH", `/api/chakra-profiles/${chakraProfile.id}`, {
            crownChakra: chakraValues.crown,
            thirdEyeChakra: chakraValues.thirdEye,
            throatChakra: chakraValues.throat,
            heartChakra: chakraValues.heart,
            solarPlexusChakra: chakraValues.solarPlexus,
            sacralChakra: chakraValues.sacral,
            rootChakra: chakraValues.root
          });
          
          return await response.json();
        } else {
          // Create new profile
          console.log("Creating new profile for user:", user.id);
          console.log("With values:", chakraValues);
          
          const response = await apiRequest("POST", "/api/chakra-profiles", {
            userId: user.id,
            crownChakra: chakraValues.crown,
            thirdEyeChakra: chakraValues.thirdEye,
            throatChakra: chakraValues.throat,
            heartChakra: chakraValues.heart,
            solarPlexusChakra: chakraValues.solarPlexus,
            sacralChakra: chakraValues.sacral,
            rootChakra: chakraValues.root
          });
          
          return await response.json();
        }
      } catch (err) {
        console.error("Error in mutation function:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Profile saved successfully:", data);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/chakra-profile`] });
      toast({
        title: "Chakra Profile Saved",
        description: "Your chakra assessment has been successfully saved.",
      });
      setTimeout(() => {
        window.location.href = "/chakra-report";
      }, 500);
    },
    onError: (error) => {
      console.error("Error in saveProfileMutation:", error);
      toast({
        title: "Error Saving Profile",
        description: `There was a problem saving your chakra assessment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle save button click
  const handleSave = () => {
    saveProfileMutation.mutate();
  };
  
  if (!user) {
    return null; // Don't render anything if not authenticated
  }
  
  if (isLoadingChakraProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
            Chakra Assessment
          </h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Evaluate your energy centers to receive personalized insights and healing recommendations
          </p>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="manual">Manual Adjustment</TabsTrigger>
            <TabsTrigger value="quiz">Guided Assessment Quiz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chakra Wheel Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Chakra Visualization</CardTitle>
                  <CardDescription>
                    A visual representation of your energy centers
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6">
                  <ChakraWheel 
                    size={300} 
                    animated={true} 
                    values={chakraValues}
                  />
                </CardContent>
              </Card>
              
              {/* Chakra Sliders */}
              <Card>
                <CardHeader>
                  <CardTitle>Adjust Your Chakras</CardTitle>
                  <CardDescription>
                    Slide to match your current energy state for each chakra
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {chakras.map((chakra) => {
                      const status = getChakraStatus(chakraValues[chakra.key]);
                      return (
                        <div key={chakra.key}>
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: chakra.color }}
                              ></div>
                              <span className="font-medium">{chakra.name}</span>
                            </div>
                            <span 
                              className="text-sm" 
                              style={{ color: chakra.color }}
                            >
                              {status.status}
                            </span>
                          </div>
                          <Slider
                            value={[chakraValues[chakra.key]]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={(value) => handleChakraChange(chakra.key, value)}
                            className="mb-1"
                          />
                          <div className="text-xs text-neutral-500 flex justify-between">
                            <span>Blocked</span>
                            <span>Balanced</span>
                            <span>Overactive</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSave} 
                    className="w-full bg-[#483D8B] hover:bg-opacity-90"
                    disabled={saveProfileMutation.isPending}
                  >
                    {saveProfileMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save and Continue to Report
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Chakra Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Understanding Your Chakras</CardTitle>
                <CardDescription>
                  Learn about each energy center and what its balance means for your well-being
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {chakras.map((chakra) => (
                    <div 
                      key={chakra.key} 
                      className="p-4 border rounded-lg"
                      style={{ borderLeftWidth: '4px', borderLeftColor: chakra.color }}
                    >
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-6 h-6 rounded-full mr-3"
                          style={{ backgroundColor: chakra.color }}
                        ></div>
                        <h3 className="font-medium text-lg">{chakra.name} ({chakra.sanskritName})</h3>
                      </div>
                      
                      <p className="text-neutral-700 mb-3">{chakra.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-1">Physical Associations</h4>
                          <div className="flex flex-wrap gap-1">
                            {chakra.physicalAssociations.map((item, index) => (
                              <span key={index} className="bg-neutral-100 px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-1">Psychological Associations</h4>
                          <div className="flex flex-wrap gap-1">
                            {chakra.psychologicalAssociations.map((item, index) => (
                              <span key={index} className="bg-neutral-100 px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quiz" className="space-y-6">
            {completeStep ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Check className="w-6 h-6 mr-2 text-green-500" />
                    Assessment Completed
                  </CardTitle>
                  <CardDescription>
                    Your chakra profile has been calculated based on your responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-center">
                      <ChakraWheel 
                        size={250} 
                        animated={true} 
                        values={chakraValues}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Your Chakra Results</h3>
                      <div className="space-y-3">
                        {chakras.map((chakra) => {
                          const status = getChakraStatus(chakraValues[chakra.key]);
                          return (
                            <div key={chakra.key} className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: chakra.color }}
                              ></div>
                              <span className="font-medium w-24">{chakra.name}:</span>
                              <div className="relative flex-1 h-3 bg-neutral-100 rounded">
                                <div 
                                  className="absolute top-0 left-0 h-full rounded"
                                  style={{ 
                                    width: `${chakraValues[chakra.key] * 10}%`,
                                    backgroundColor: chakra.color 
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium" style={{ color: chakra.color }}>
                                {chakraValues[chakra.key]}/10
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSave} 
                    className="w-full bg-[#483D8B] hover:bg-opacity-90"
                    disabled={saveProfileMutation.isPending}
                  >
                    {saveProfileMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save and Continue to Report
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <OnboardingQuiz 
                onComplete={handleQuizComplete} 
                isSubmitting={false}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}