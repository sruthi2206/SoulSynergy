import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Bookmark, ChevronRight, ChevronDown, Mic, MicOff } from "lucide-react";

interface JournalEntryProps {
  entries?: any[];
  userId: number;
}

export default function JournalEntry({ entries = [], userId }: JournalEntryProps) {
  const [journalContent, setJournalContent] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mutation for creating a new journal entry
  const createJournalMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/journal-entries", {
        userId,
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/journal-entries`] });
      setJournalContent("");
      toast({
        title: "Journal Entry Created",
        description: "Your thoughts have been recorded and analyzed.",
      });
    },
    onError: () => {
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
  
  // Toggle entry expansion
  const toggleExpandEntry = (id: number) => {
    if (expandedEntry === id) {
      setExpandedEntry(null);
    } else {
      setExpandedEntry(id);
    }
  };
  
  // Journal prompts
  const journalPrompts = [
    "What emotions have been most present for you today?",
    "Describe a moment when you felt truly connected to yourself recently.",
    "What patterns have you noticed in your reactions this week?",
    "If your body could speak, what would it tell you right now?",
    "What's one thing you're holding onto that you could release?",
    "Describe a quality you admire in someone else. How might you cultivate this in yourself?",
    "What aspect of your shadow self emerged today? What might it be trying to teach you?",
    "What would your higher self advise you about your current situation?"
  ];
  
  // Random journal prompt
  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    setJournalContent(journalPrompts[randomIndex]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Guided Journaling</h2>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Express your thoughts and feelings with AI-powered insights to deepen your self-awareness.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Journal Entry Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>New Journal Entry</CardTitle>
                  <CardDescription>
                    Write or speak about your thoughts, emotions, and experiences
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={getRandomPrompt}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span>Prompt</span>
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Textarea
                  placeholder="How are you feeling today? What insights or challenges are you experiencing?"
                  className="min-h-[200px] resize-none"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant={isVoiceActive ? "destructive" : "outline"}
                  onClick={toggleVoiceJournaling}
                >
                  {isVoiceActive ? (
                    <>
                      <MicOff className="h-4 w-4 mr-1" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1" />
                      <span>Voice Journal</span>
                    </>
                  )}
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
        </div>
        
        {/* Journal Prompts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reflective Prompts</CardTitle>
              <CardDescription>
                Deep questions to spark insight and awareness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {journalPrompts.slice(0, 5).map((prompt, index) => (
                  <li 
                    key={index} 
                    className="bg-neutral-50 p-3 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                    onClick={() => setJournalContent(prompt)}
                  >
                    <div className="flex items-start">
                      <Bookmark className="h-4 w-4 mt-0.5 mr-2 text-[#483D8B]" />
                      <p className="text-sm">{prompt}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Journal Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Your Journal Entries</CardTitle>
          <CardDescription>
            Past reflections and the patterns they reveal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-neutral-400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.5 12.5L12 5L4.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium mt-4 mb-2">No Journal Entries Yet</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                Your journal entries will appear here once you start writing. Begin your reflective journey above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-neutral-500">
                      {formatDate(entry.createdAt)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-neutral-100 px-2 py-1 rounded text-xs">
                        Sentiment: {entry.sentimentScore}/10
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleExpandEntry(entry.id)}
                      >
                        {expandedEntry === entry.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className={expandedEntry === entry.id ? "" : "line-clamp-3"}>
                    {entry.content}
                  </p>
                  
                  {(entry.emotionTags?.length > 0 || entry.chakraTags?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.emotionTags?.map((tag: string, i: number) => (
                        <Badge key={`emotion-${i}`} variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                          {tag}
                        </Badge>
                      ))}
                      
                      {entry.chakraTags?.map((tag: string, i: number) => (
                        <Badge key={`chakra-${i}`} variant="secondary" className="bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                          {tag} chakra
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
