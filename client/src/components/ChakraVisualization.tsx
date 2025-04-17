import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { chakras } from "@/lib/chakras";

interface ChakraVisualizationProps {
  chakraProfile?: any;
}

export default function ChakraVisualization({ chakraProfile }: ChakraVisualizationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Mutation for updating chakra profile
  const updateChakraMutation = useMutation({
    mutationFn: async (values: Record<string, number>) => {
      const response = await apiRequest("PATCH", `/api/chakra-profiles/${chakraProfile?.id}`, {
        crownChakra: values.crown,
        thirdEyeChakra: values.thirdEye,
        throatChakra: values.throat,
        heartChakra: values.heart,
        solarPlexusChakra: values.solarPlexus,
        sacralChakra: values.sacral,
        rootChakra: values.root
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${chakraProfile?.userId}/chakra-profile`] });
      toast({
        title: "Chakra Profile Updated",
        description: "Your energy balance has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your chakra profile.",
        variant: "destructive",
      });
    }
  });
  
  // Handle chakra value changes
  const handleChakraChange = (chakra: string, value: number[]) => {
    setChakraValues(prev => ({ ...prev, [chakra]: value[0] }));
  };
  
  // Handle save button click
  const handleSave = () => {
    if (chakraProfile?.id) {
      updateChakraMutation.mutate(chakraValues);
    }
  };

  // Get chakra status text based on value
  const getChakraStatus = (value: number) => {
    if (value <= 3) return "Blocked";
    if (value <= 5) return "Underactive";
    if (value <= 7) return "Balanced";
    return "Overactive";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Your Chakra Balance</h2>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Visualize and adjust your energy centers. Your chakra profile helps us recommend personalized healing practices.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Energy Visualization</CardTitle>
            <CardDescription>
              A visual representation of your chakra balance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="relative">
              {/* Human body silhouette */}
              <div className="absolute inset-0 flex justify-center pointer-events-none">
                <div className="h-full w-1 bg-neutral-200"></div>
              </div>
              
              {/* Chakra points on body */}
              {chakras.map((chakra, index) => (
                <motion.div
                  key={chakra.key}
                  className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
                  style={{ 
                    top: `${(index * 14) + 5}%`, 
                    zIndex: 10 
                  }}
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ 
                    scale: [0.8, 1, 0.8], 
                    opacity: [0.7, chakraValues[chakra.key] / 10, 0.7] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div 
                    className="rounded-full shadow-md border-2 border-white"
                    style={{ 
                      width: `${(chakraValues[chakra.key] * 5) + 20}px`, 
                      height: `${(chakraValues[chakra.key] * 5) + 20}px`,
                      backgroundColor: chakra.color,
                    }}
                  ></div>
                </motion.div>
              ))}
              
              {/* Human figure outline - simplified */}
              <svg 
                className="h-[500px] w-auto opacity-20 pointer-events-none"
                viewBox="0 0 100 300"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d="M50,10 C60,10 70,20 70,35 C70,50 60,60 50,60 C40,60 30,50 30,35 C30,20 40,10 50,10 Z" fill="#888" /> {/* Head */}
                <path d="M50,60 L50,130 M30,70 L70,70" fill="none" stroke="#888" strokeWidth="4" /> {/* Torso and shoulders */}
                <path d="M30,70 L20,110 L25,110" fill="none" stroke="#888" strokeWidth="3" /> {/* Left arm */}
                <path d="M70,70 L80,110 L75,110" fill="none" stroke="#888" strokeWidth="3" /> {/* Right arm */}
                <path d="M50,130 L40,200 L40,270" fill="none" stroke="#888" strokeWidth="3" /> {/* Left leg */}
                <path d="M50,130 L60,200 L60,270" fill="none" stroke="#888" strokeWidth="3" /> {/* Right leg */}
              </svg>
            </div>
          </CardContent>
        </Card>
        
        {/* Chakra Sliders */}
        <Card>
          <CardHeader>
            <CardTitle>Adjust Your Chakras</CardTitle>
            <CardDescription>
              Slide to match your current energy state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {chakras.map((chakra) => (
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
                      {getChakraStatus(chakraValues[chakra.key])}
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
              ))}
              
              <Button 
                onClick={handleSave} 
                className="w-full bg-[#483D8B] hover:bg-opacity-90 mt-4"
                disabled={updateChakraMutation.isPending}
              >
                {updateChakraMutation.isPending ? "Saving..." : "Save Chakra Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Chakra Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {chakras.map((chakra) => (
          <Card key={chakra.key} className="overflow-hidden">
            <div 
              className="h-2"
              style={{ backgroundColor: chakra.color }}
            ></div>
            <CardContent className="pt-6">
              <h3 className="font-heading font-semibold text-lg mb-1">{chakra.name}</h3>
              <p className="text-xs text-neutral-500 mb-3">{chakra.location}</p>
              <p className="text-sm">{chakra.description}</p>
              
              <div className="mt-4">
                <div className="text-xs text-neutral-500 mb-1">Current State</div>
                <div 
                  className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden"
                >
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${chakraValues[chakra.key] * 10}%`,
                      backgroundColor: chakra.color
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
