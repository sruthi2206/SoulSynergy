import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  BookOpen, 
  Sparkles, 
  MicOff, 
  Mic, 
  Bookmark, 
  Star, 
  ListTodo, 
  Rocket, 
  Target, 
  Languages, 
  MessageSquareText,
  XCircle,
  PlusCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Indian languages supported in the journal
const LANGUAGES = [
  { name: "English", code: "english" },
  { name: "Hindi", code: "hindi" },
  { name: "Bengali", code: "bengali" },
  { name: "Tamil", code: "tamil" },
  { name: "Telugu", code: "telugu" },
  { name: "Marathi", code: "marathi" },
  { name: "Gujarati", code: "gujarati" },
  { name: "Kannada", code: "kannada" },
  { name: "Malayalam", code: "malayalam" },
  { name: "Punjabi", code: "punjabi" },
  { name: "Urdu", code: "urdu" }
];

export default function Journal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [journalContent, setJournalContent] = useState("");
  const [gratitude, setGratitude] = useState<string[]>(["", "", ""]);
  const [affirmation, setAffirmation] = useState("");
  const [shortTermGoals, setShortTermGoals] = useState<string[]>(["", "", ""]);
  const [longTermVision, setLongTermVision] = useState("");
  const [language, setLanguage] = useState("english");
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
    mutationFn: async () => {
      // Filter out empty strings from arrays
      const filteredGratitude = gratitude.filter(item => item.trim() !== "");
      const filteredShortTermGoals = shortTermGoals.filter(item => item.trim() !== "");
      
      const response = await apiRequest("POST", "/api/journal-entries", {
        userId: user?.id,
        content: journalContent,
        gratitude: filteredGratitude,
        affirmation,
        shortTermGoals: filteredShortTermGoals,
        longTermVision,
        language
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch journal entries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/journal-entries`] });
      
      // Reset all fields
      setJournalContent("");
      setGratitude(["", "", ""]);
      setAffirmation("");
      setShortTermGoals(["", "", ""]);
      setLongTermVision("");
      
      toast({
        title: "Journal Entry Saved",
        description: "Your reflection has been recorded and insights generated.",
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
    
    // Check if any field has content
    const hasContent = 
      journalContent.trim() !== "" || 
      gratitude.some(g => g.trim() !== "") ||
      affirmation.trim() !== "" ||
      shortTermGoals.some(g => g.trim() !== "") ||
      longTermVision.trim() !== "";
    
    if (!hasContent) {
      toast({
        title: "Empty Journal",
        description: "Please fill at least one section of your journal before saving.",
        variant: "destructive",
      });
      return;
    }
    
    createJournalMutation.mutate();
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
  
  // Update gratitude list items
  const updateGratitude = (index: number, value: string) => {
    const newGratitude = [...gratitude];
    newGratitude[index] = value;
    setGratitude(newGratitude);
  };
  
  // Update short-term goals list items
  const updateShortTermGoal = (index: number, value: string) => {
    const newGoals = [...shortTermGoals];
    newGoals[index] = value;
    setShortTermGoals(newGoals);
  };
  
  // Add new gratitude item
  const addGratitudeItem = () => {
    setGratitude([...gratitude, ""]);
  };
  
  // Remove gratitude item
  const removeGratitudeItem = (index: number) => {
    const newGratitude = [...gratitude];
    newGratitude.splice(index, 1);
    setGratitude(newGratitude);
  };
  
  // Add new short-term goal
  const addShortTermGoal = () => {
    setShortTermGoals([...shortTermGoals, ""]);
  };
  
  // Remove short-term goal
  const removeShortTermGoal = (index: number) => {
    const newGoals = [...shortTermGoals];
    newGoals.splice(index, 1);
    setShortTermGoals(newGoals);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
            Daily Alignment Journal
          </h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Record your thoughts, emotions, and goals with AI-powered insights to guide your healing journey
          </p>
          
          {/* Language Selection */}
          <div className="mt-4 flex justify-center">
            <div className="max-w-xs w-full">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center">
                        <Languages className="h-4 w-4 mr-2" />
                        {lang.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Journal Entry Form */}
          <motion.div 
            className="md:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>New Journal Entry</CardTitle>
                <CardDescription>
                  Express your thoughts, emotions, and aspirations in this structured journal
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-5 mb-6">
                      <TabsTrigger value="general" className="flex items-center">
                        <MessageSquareText className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">General</span>
                      </TabsTrigger>
                      <TabsTrigger value="gratitude" className="flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Gratitude</span>
                      </TabsTrigger>
                      <TabsTrigger value="affirmation" className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Affirmation</span>
                      </TabsTrigger>
                      <TabsTrigger value="shortterm" className="flex items-center">
                        <ListTodo className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Short-Term</span>
                      </TabsTrigger>
                      <TabsTrigger value="longterm" className="flex items-center">
                        <Rocket className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Long-Term</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">💭 General Reflections</h3>
                        <p className="text-sm text-neutral-600">
                          Write freely about your thoughts, emotions, and experiences
                        </p>
                        <Textarea
                          placeholder="How are you feeling today? What's on your mind?"
                          className="min-h-[200px] resize-none"
                          value={journalContent}
                          onChange={(e) => setJournalContent(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="gratitude">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">✨ I am grateful for...</h3>
                        <p className="text-sm text-neutral-600">
                          List things that brought you joy, peace, or inspiration today
                        </p>
                        
                        <div className="space-y-2">
                          {gratitude.map((item, index) => (
                            <div key={`gratitude-${index}`} className="flex gap-2">
                              <Input
                                placeholder={`Gratitude ${index + 1}`}
                                value={item}
                                onChange={(e) => updateGratitude(index, e.target.value)}
                                className="flex-grow"
                              />
                              {gratitude.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeGratitudeItem(index)}
                                >
                                  <XCircle className="h-4 w-4 text-neutral-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addGratitudeItem}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Another
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="affirmation">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">🌟 Today's Affirmation</h3>
                        <p className="text-sm text-neutral-600">
                          Write a positive I AM statement to align your energy
                        </p>
                        <Input
                          placeholder="I am..."
                          value={affirmation}
                          onChange={(e) => setAffirmation(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="shortterm">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">🎯 Steps I will take today</h3>
                        <p className="text-sm text-neutral-600">
                          What key actions will move you forward today?
                        </p>
                        
                        <div className="space-y-2">
                          {shortTermGoals.map((goal, index) => (
                            <div key={`goal-${index}`} className="flex gap-2">
                              <Input
                                placeholder={`Step ${index + 1}`}
                                value={goal}
                                onChange={(e) => updateShortTermGoal(index, e.target.value)}
                                className="flex-grow"
                              />
                              {shortTermGoals.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeShortTermGoal(index)}
                                >
                                  <XCircle className="h-4 w-4 text-neutral-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addShortTermGoal}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Another
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="longterm">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">🛤 Steps toward my long-term goals</h3>
                        <p className="text-sm text-neutral-600">
                          What aligned actions or habits will move you toward your vision?
                        </p>
                        <Textarea
                          placeholder="My long-term vision includes..."
                          className="min-h-[150px] resize-none"
                          value={longTermVision}
                          onChange={(e) => setLongTermVision(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
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
                    className="bg-gradient-to-r from-[#483D8B] to-[#008080] text-white hover:opacity-90"
                    disabled={createJournalMutation.isPending}
                  >
                    {createJournalMutation.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
          
          {/* Journal History and Insights */}
          <motion.div 
            className="md:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-md border-0">
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
                        
                        {/* Show different content based on what's available */}
                        {entry.content && (
                          <p className="text-neutral-800 mb-3 line-clamp-2">
                            {entry.content}
                          </p>
                        )}
                        
                        {/* Show gratitude if available */}
                        {entry.gratitude && entry.gratitude.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-neutral-500 mb-1">Grateful for:</p>
                            <ul className="text-xs text-neutral-600 pl-3">
                              {entry.gratitude.slice(0, 2).map((item: string, i: number) => (
                                <li key={`gratitude-${i}`} className="list-disc">{item}</li>
                              ))}
                              {entry.gratitude.length > 2 && <li className="list-none text-xs">...</li>}
                            </ul>
                          </div>
                        )}
                        
                        {/* Show affirmation if available */}
                        {entry.affirmation && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-neutral-500 mb-1">Affirmation:</p>
                            <p className="text-xs text-neutral-600 italic">"{entry.affirmation}"</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
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
              <Card className="mt-6 shadow-md border-0">
                <CardHeader>
                  <CardTitle>AI Growth Assistant</CardTitle>
                  <CardDescription>
                    Personalized insights from your journal entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="font-medium text-blue-800">Recent Patterns</span>
                      </div>
                      <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-1.5"></div>
                          <span>Developing stronger throat chakra expression</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-1.5"></div>
                          <span>Working through anxiety around creative expression</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center mb-3">
                        <Target className="h-5 w-5 mr-2 text-purple-600" />
                        <span className="font-medium text-purple-800">Goal Progress</span>
                      </div>
                      <p className="text-sm text-purple-700 mb-2">
                        You're making steady progress on your meditation practice consistency. 
                        Consider adding one more session per week to accelerate results.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
