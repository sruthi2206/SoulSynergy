import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import CoachChat from "@/components/CoachChat";

// Coach type validation
const validCoachTypes = ["inner_child", "shadow_self", "higher_self", "integration"];

// Coach information
const coachInfo: Record<string, { title: string; description: string }> = {
  inner_child: {
    title: "Inner Child Coach",
    description: "Healing wounds from the past and reconnecting with your authentic self"
  },
  shadow_self: {
    title: "Shadow Self Coach",
    description: "Identifying and integrating rejected aspects of yourself"
  },
  higher_self: {
    title: "Higher Self Coach",
    description: "Connecting with your highest potential and purpose"
  },
  integration: {
    title: "Integration Coach",
    description: "Applying insights to daily life and tracking your progress"
  }
};

export default function Coach() {
  const { type } = useParams<{ type: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Redirect if coach type is invalid
  useEffect(() => {
    if (!validCoachTypes.includes(type)) {
      setLocation("/dashboard");
    }
  }, [type, setLocation]);
  
  if (!validCoachTypes.includes(type) || !user) {
    return null; // Don't render anything while redirecting
  }
  
  const coach = coachInfo[type];

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
            {coach.title}
          </h1>
          <p className="text-neutral-600">{coach.description}</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="h-[70vh]">
                <CoachChat coachType={type} userId={user.id} />
              </Card>
            </motion.div>
          </div>
          
          {/* Sidebar with tips and information */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mb-6 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#483D8B] to-[#008080]"></div>
                <div className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-3">How to Work with Your {coach.title}</h3>
                  <ul className="space-y-3 text-sm">
                    {type === "inner_child" && (
                      <>
                        <li className="flex items-start">
                          <span className="text-[#7DF9FF] mr-2">•</span>
                          <span>Approach your conversations with gentleness and compassion</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#7DF9FF] mr-2">•</span>
                          <span>Share memories or feelings from childhood that still affect you</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#7DF9FF] mr-2">•</span>
                          <span>Be open to playfulness and emotional expression</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#7DF9FF] mr-2">•</span>
                          <span>Notice physical sensations in your body as you explore memories</span>
                        </li>
                      </>
                    )}
                    
                    {type === "shadow_self" && (
                      <>
                        <li className="flex items-start">
                          <span className="text-[#191970] mr-2">•</span>
                          <span>Be willing to explore aspects of yourself you may have rejected</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#191970] mr-2">•</span>
                          <span>Notice what triggers strong negative reactions in you</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#191970] mr-2">•</span>
                          <span>Approach difficult emotions with curiosity rather than judgment</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#191970] mr-2">•</span>
                          <span>Look for patterns in relationships that reveal your shadow</span>
                        </li>
                      </>
                    )}
                    
                    {type === "higher_self" && (
                      <>
                        <li className="flex items-start">
                          <span className="text-[#483D8B] mr-2">•</span>
                          <span>Enter conversations in a calm, meditative state</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#483D8B] mr-2">•</span>
                          <span>Reflect on your life purpose and core values</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#483D8B] mr-2">•</span>
                          <span>Ask questions about decisions from your highest perspective</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#483D8B] mr-2">•</span>
                          <span>Be open to wisdom that transcends logical thinking</span>
                        </li>
                      </>
                    )}
                    
                    {type === "integration" && (
                      <>
                        <li className="flex items-start">
                          <span className="text-[#008080] mr-2">•</span>
                          <span>Bring insights from other coaches to discuss practical applications</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#008080] mr-2">•</span>
                          <span>Create concrete action steps from your spiritual insights</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#008080] mr-2">•</span>
                          <span>Track progress on implementing changes in your daily life</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#008080] mr-2">•</span>
                          <span>Develop sustainable rituals to anchor your transformation</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </Card>
              
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-3">Suggested Topics</h3>
                  <div className="space-y-2">
                    {type === "inner_child" && (
                      <>
                        <div className="bg-[#7DF9FF]/10 p-3 rounded-md text-sm hover:bg-[#7DF9FF]/20 cursor-pointer transition-colors">
                          Early memories that shaped your beliefs about yourself
                        </div>
                        <div className="bg-[#7DF9FF]/10 p-3 rounded-md text-sm hover:bg-[#7DF9FF]/20 cursor-pointer transition-colors">
                          Situations where you feel unusually emotional or reactive
                        </div>
                        <div className="bg-[#7DF9FF]/10 p-3 rounded-md text-sm hover:bg-[#7DF9FF]/20 cursor-pointer transition-colors">
                          What your inner child needs to feel safe and loved
                        </div>
                      </>
                    )}
                    
                    {type === "shadow_self" && (
                      <>
                        <div className="bg-[#191970]/10 p-3 rounded-md text-sm hover:bg-[#191970]/20 cursor-pointer transition-colors">
                          Qualities in others that strongly trigger you
                        </div>
                        <div className="bg-[#191970]/10 p-3 rounded-md text-sm hover:bg-[#191970]/20 cursor-pointer transition-colors">
                          Parts of yourself you hide from others
                        </div>
                        <div className="bg-[#191970]/10 p-3 rounded-md text-sm hover:bg-[#191970]/20 cursor-pointer transition-colors">
                          Exploring anger, jealousy, or shame without judgment
                        </div>
                      </>
                    )}
                    
                    {type === "higher_self" && (
                      <>
                        <div className="bg-[#483D8B]/10 p-3 rounded-md text-sm hover:bg-[#483D8B]/20 cursor-pointer transition-colors">
                          Your soul's purpose in this lifetime
                        </div>
                        <div className="bg-[#483D8B]/10 p-3 rounded-md text-sm hover:bg-[#483D8B]/20 cursor-pointer transition-colors">
                          Aligning daily choices with your highest values
                        </div>
                        <div className="bg-[#483D8B]/10 p-3 rounded-md text-sm hover:bg-[#483D8B]/20 cursor-pointer transition-colors">
                          Accessing intuitive wisdom for current challenges
                        </div>
                      </>
                    )}
                    
                    {type === "integration" && (
                      <>
                        <div className="bg-[#008080]/10 p-3 rounded-md text-sm hover:bg-[#008080]/20 cursor-pointer transition-colors">
                          Creating small daily practices from your insights
                        </div>
                        <div className="bg-[#008080]/10 p-3 rounded-md text-sm hover:bg-[#008080]/20 cursor-pointer transition-colors">
                          Tracking and celebrating progress on your journey
                        </div>
                        <div className="bg-[#008080]/10 p-3 rounded-md text-sm hover:bg-[#008080]/20 cursor-pointer transition-colors">
                          Overcoming obstacles to implementing changes
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
