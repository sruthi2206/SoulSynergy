import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { useLocation } from "wouter";
import ChakraVisualization from "@/components/ChakraVisualization";
import EmotionTracker from "@/components/EmotionTracker";
import JournalEntry from "@/components/JournalEntry";
import HealingRituals from "@/components/HealingRituals";
import DashboardOverview from "@/components/DashboardOverview";
import ProgressCharts from "@/components/ProgressCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to onboarding if no user
  useEffect(() => {
    if (!user) {
      setLocation("/onboarding");
    }
  }, [user, setLocation]);

  // Fetch user's chakra profile
  const { data: chakraProfile, isLoading: isLoadingChakraProfile } = useQuery({
    queryKey: [`/api/users/${user?.id}/chakra-profile`],
    enabled: !!user,
  });

  // Fetch user's journal entries
  const { data: journalEntries, isLoading: isLoadingJournalEntries } = useQuery({
    queryKey: [`/api/users/${user?.id}/journal-entries`],
    enabled: !!user,
  });

  // Fetch user's emotion tracking
  const { data: emotionTrackings, isLoading: isLoadingEmotionTrackings } = useQuery({
    queryKey: [`/api/users/${user?.id}/emotion-tracking`],
    enabled: !!user,
  });

  // Fetch user's recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: [`/api/users/${user?.id}/recommendations`],
    enabled: !!user,
  });

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  const isLoading = isLoadingChakraProfile || isLoadingJournalEntries || 
                    isLoadingEmotionTrackings || isLoadingRecommendations;

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
            Welcome, {user.name}
          </h1>
          <p className="text-neutral-600">Track your healing journey and discover personalized insights</p>
        </motion.div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-full justify-start overflow-x-auto rounded-none border-b border-neutral-200 bg-transparent p-0">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="chakra" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Chakra Balance
            </TabsTrigger>
            <TabsTrigger 
              value="emotions" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Emotional Map
            </TabsTrigger>
            <TabsTrigger 
              value="journal" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Journal Insights
            </TabsTrigger>
            <TabsTrigger 
              value="rituals" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Healing Rituals
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Progress
            </TabsTrigger>
          </TabsList>

          <div className="relative min-h-[60vh]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
              </div>
            ) : (
              <>
                <TabsContent value="overview" className="mt-0">
                  <DashboardOverview 
                    chakraProfile={chakraProfile} 
                    journalEntries={journalEntries} 
                    emotionTrackings={emotionTrackings}
                    recommendations={recommendations}
                  />
                </TabsContent>
                
                <TabsContent value="chakra" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <ChakraVisualization chakraProfile={chakraProfile} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="emotions" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <EmotionTracker emotionTrackings={emotionTrackings} userId={user.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="journal" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <JournalEntry entries={journalEntries} userId={user.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="rituals" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <HealingRituals 
                        recommendations={recommendations} 
                        chakraProfile={chakraProfile}
                        userId={user.id}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="progress" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <ProgressCharts 
                        journalEntries={journalEntries} 
                        emotionTrackings={emotionTrackings}
                        chakraProfile={chakraProfile}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
