import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's chakra profile
  const { data: chakraProfile, isLoading: isLoadingChakraProfile } = useQuery({
    queryKey: ['/api/users', user?.id, 'chakra-profile'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await fetch(`/api/users/${user.id}/chakra-profile`);
        if (!res.ok) {
          if (res.status === 404) {
            // If profile not found, return null instead of throwing an error
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

  // Fetch user's journal entries
  const { data: journalEntries, isLoading: isLoadingJournalEntries } = useQuery({
    queryKey: ['/api/users', user?.id, 'journal-entries'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/journal-entries`);
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch user's emotion tracking
  const { data: emotionTrackings, isLoading: isLoadingEmotionTrackings } = useQuery({
    queryKey: ['/api/users', user?.id, 'emotion-tracking'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/emotion-tracking`);
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching emotion tracking:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch user's recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/users', user?.id, 'recommendations'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/recommendations`);
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
    },
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
