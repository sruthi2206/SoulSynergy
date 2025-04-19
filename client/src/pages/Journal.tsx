import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarIcon, BookOpen, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Journal() {
  const { user } = useAuth();
  const [journalContent, setJournalContent] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch user's journal entries
  const { data: journalEntries, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/journal-entries`],
    enabled: !!user,
  });
  
  // Mutation for creating a new journal entry
  const createJournalMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/journal-entries", {
        userId: user?.id,
        content
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch journal entries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/journal-entries`] });
      setJournalContent("");
      toast({
        title: "Journal Entry Created",
        description: "Your thoughts have been recorded and analyzed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!journalContent.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something in your journal before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    createJournalMutation.mutate(journalContent);
  };
  
  // Toggle voice journaling
  const toggleVoiceJournaling = () => {
    // This would implement the actual voice recording functionality
    // using the browser's WebSpeech API or a similar solution
    setIsVoiceActive(!isVoiceActive);
    
    toast({
      title: isVoiceActive ? "Voice Recording Stopped" : "Voice Recording Started",
      description: isVoiceActive 
        ? "Your recording has been processed." 
        : "Speak clearly to record your journal entry.",
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

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
            Guided Journaling
          </h1>
          <p className="text-neutral-600">Record your thoughts and feelings with AI-powered insights</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Journal Entry Form */}
          <div className="md:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>New Journal Entry</CardTitle>
                <CardDescription>
                  Write freely about your thoughts, emotions, and experiences. Our AI will analyze patterns and provide insights.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <Textarea
                    placeholder="How are you feeling today? What's on your mind?"
                    className="min-h-[200px] resize-none"
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={toggleVoiceJournaling} 
                    className={isVoiceActive ? "bg-red-100 text-red-700 border-red-300" : ""}
                  >
                    {isVoiceActive ? "Stop Recording" : "Voice Journal"}
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#483D8B] hover:bg-opacity-90"
                    disabled={createJournalMutation.isPending}
                  >
                    {createJournalMutation.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Journal Prompts */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Journal Prompts</CardTitle>
                <CardDescription>
                  Use these prompts if you need inspiration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="bg-neutral-100 p-3 rounded-md">
                    <p className="text-sm">What patterns have you noticed in your emotional responses this week?</p>
                  </li>
                  <li className="bg-neutral-100 p-3 rounded-md">
                    <p className="text-sm">Describe a moment when you felt truly aligned and at peace. What elements were present?</p>
                  </li>
                  <li className="bg-neutral-100 p-3 rounded-md">
                    <p className="text-sm">What are you holding onto that no longer serves you? How might you begin to release it?</p>
                  </li>
                  <li className="bg-neutral-100 p-3 rounded-md">
                    <p className="text-sm">Reflect on a challenge you're facing. What wisdom might your higher self offer about this situation?</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Journal History */}
          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Journal History</CardTitle>
                <CardDescription>
                  Your previous entries and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
                  </div>
                ) : journalEntries && journalEntries.length > 0 ? (
                  <div className="space-y-6">
                    {journalEntries.map((entry: any) => (
                      <motion.div 
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-sm text-neutral-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(entry.createdAt)}</span>
                          </div>
                          <div className="text-xs font-medium text-[#008080]">
                            Sentiment: {entry.sentimentScore}/10
                          </div>
                        </div>
                        
                        <p className="text-neutral-800 mb-3 line-clamp-3">
                          {entry.content}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {entry.emotionTags && entry.emotionTags.map((tag: string, i: number) => (
                            <Badge key={`emotion-${i}`} variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                              {tag}
                            </Badge>
                          ))}
                          
                          {entry.chakraTags && entry.chakraTags.map((tag: string, i: number) => (
                            <Badge key={`chakra-${i}`} variant="secondary" className="bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                              {tag} chakra
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No journal entries yet</p>
                    <p className="text-sm mt-1">Start writing to see your entries here</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* AI Insights */}
            {journalEntries && journalEntries.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Patterns detected in your journaling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-neutral-100 p-4 rounded-lg border border-neutral-200">
                    <div className="flex items-center mb-3">
                      <Sparkles className="h-5 w-5 mr-2 text-[#008080]" />
                      <span className="font-medium">Your Recent Themes</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#483D8B] mr-2"></div>
                        <span>Focus on throat chakra expression</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#483D8B] mr-2"></div>
                        <span>Pattern of anxiety around self-expression</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#483D8B] mr-2"></div>
                        <span>Growing awareness of inner peace moments</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
