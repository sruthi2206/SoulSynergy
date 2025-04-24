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

// Define translations for UI elements in different languages
const TRANSLATIONS: Record<string, Record<string, string>> = {
  english: {
    title: "Daily Alignment Journal",
    subtitle: "Record your thoughts, emotions, and goals with AI-powered insights to guide your healing journey",
    newEntry: "New Journal Entry",
    newEntryDescription: "Express your thoughts, emotions, and aspirations in this structured journal",
    general: "General",
    gratitude: "Gratitude",
    affirmation: "Affirmation",
    shortTerm: "Short-Term",
    longTerm: "Long-Term",
    insightsTitle: "Journal Insights",
    insightsDescription: "AI-generated insights from your journal entries",
    generalTitle: "💭 General Reflections",
    generalDescription: "Write freely about your thoughts, emotions, and experiences",
    generalPlaceholder: "How are you feeling today? What's on your mind?",
    gratitudeTitle: "✨ I am grateful for...",
    gratitudeDescription: "List things that brought you joy, peace, or inspiration today",
    gratitudePlaceholder: "Gratitude",
    affirmationTitle: "🌟 Today's Affirmation",
    affirmationDescription: "Write a positive I AM statement to align your energy",
    affirmationPlaceholder: "I am...",
    shortTermTitle: "🎯 Steps I will take today",
    shortTermDescription: "What key actions will move you forward today?",
    shortTermPlaceholder: "Step",
    longTermTitle: "🚀 Steps toward my long-term goals",
    longTermDescription: "What aligned actions or habits will move you toward your vision?",
    longTermPlaceholder: "My long-term vision includes...",
    saveButton: "Save Entry",
    addAnother: "Add Another",
    emotionPatterns: "Emotion Patterns",
    chakraBalance: "Chakra Balance",
    goalProgress: "Goal Progress",
    personalizedWisdom: "Personalized Wisdom",
    noEntries: "No journal entries yet",
    startWriting: "Start writing to see your insights here"
  },
  hindi: {
    title: "दैनिक संरेखण जर्नल",
    subtitle: "अपने उपचार यात्रा को मार्गदर्शन करने के लिए AI-संचालित अंतर्दृष्टि के साथ अपने विचारों, भावनाओं और लक्ष्यों को रिकॉर्ड करें",
    newEntry: "नई जर्नल एंट्री",
    newEntryDescription: "इस संरचित जर्नल में अपने विचारों, भावनाओं और आकांक्षाओं को व्यक्त करें",
    general: "सामान्य",
    gratitude: "कृतज्ञता",
    affirmation: "दृढ़ीकरण",
    shortTerm: "अल्पकालिक",
    longTerm: "दीर्घकालिक",
    insightsTitle: "जर्नल अंतर्दृष्टि",
    insightsDescription: "आपकी जर्नल प्रविष्टियों से AI-निर्मित अंतर्दृष्टि",
    generalTitle: "💭 सामान्य चिंतन",
    generalDescription: "अपने विचारों, भावनाओं और अनुभवों के बारे में स्वतंत्र रूप से लिखें",
    generalPlaceholder: "आज आप कैसा महसूस कर रहे हैं? आपके मन में क्या है?",
    gratitudeTitle: "✨ मैं इसके लिए आभारी हूँ...",
    gratitudeDescription: "उन चीजों की सूची बनाएं जिन्होंने आपको आज खुशी, शांति या प्रेरणा दी",
    gratitudePlaceholder: "कृतज्ञता",
    affirmationTitle: "🌟 आज का दृढ़ीकरण",
    affirmationDescription: "अपनी ऊर्जा को संरेखित करने के लिए एक सकारात्मक मैं हूँ कथन लिखें",
    affirmationPlaceholder: "मैं हूँ...",
    shortTermTitle: "🎯 आज मैं जो कदम उठाऊंगा",
    shortTermDescription: "कौन से प्रमुख कार्य आपको आज आगे बढ़ाएंगे?",
    shortTermPlaceholder: "कदम",
    longTermTitle: "🚀 मेरे दीर्घकालिक लक्ष्यों की ओर कदम",
    longTermDescription: "कौन से संरेखित कार्य या आदतें आपको अपनी दृष्टि की ओर ले जाएंगी?",
    longTermPlaceholder: "मेरी दीर्घकालिक दृष्टि में शामिल है...",
    saveButton: "प्रविष्टि सहेजें",
    addAnother: "एक और जोड़ें",
    emotionPatterns: "भावना पैटर्न",
    chakraBalance: "चक्र संतुलन",
    goalProgress: "लक्ष्य प्रगति",
    personalizedWisdom: "व्यक्तिगत ज्ञान",
    noEntries: "अभी तक कोई जर्नल प्रविष्टियाँ नहीं हैं",
    startWriting: "अपनी अंतर्दृष्टि यहां देखने के लिए लिखना शुरू करें"
  },
  tamil: {
    title: "தினசரி சீரமைப்பு பதிவேடு",
    subtitle: "உங்கள் குணமாக்கல் பயணத்தை வழிநடத்த AI-உருவாக்கிய நுண்ணறிவுகளுடன் உங்கள் எண்ணங்கள், உணர்வுகள் மற்றும் இலக்குகளைப் பதிவு செய்யுங்கள்",
    newEntry: "புதிய பதிவேடு உள்ளீடு",
    newEntryDescription: "இந்த கட்டமைக்கப்பட்ட பதிவேட்டில் உங்கள் எண்ணங்கள், உணர்வுகள் மற்றும் விருப்பங்களை வெளிப்படுத்துங்கள்",
    general: "பொது",
    gratitude: "நன்றி",
    affirmation: "உறுதிமொழி",
    shortTerm: "குறுகிய கால",
    longTerm: "நீண்ட கால",
    insightsTitle: "பதிவேடு நுண்ணறிவுகள்",
    insightsDescription: "உங்கள் பதிவுகளில் இருந்து AI உருவாக்கிய நுண்ணறிவுகள்",
    generalTitle: "💭 பொது சிந்தனைகள்",
    generalDescription: "உங்கள் எண்ணங்கள், உணர்வுகள் மற்றும் அனுபவங்களை சுதந்திரமாக எழுதுங்கள்",
    generalPlaceholder: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்? உங்கள் மனதில் என்ன உள்ளது?",
    gratitudeTitle: "✨ நான் இதற்கு நன்றியுள்ளவன்...",
    gratitudeDescription: "இன்று உங்களுக்கு மகிழ்ச்சி, அமைதி அல்லது ஊக்கத்தை அளித்த விஷயங்களை பட்டியலிடுங்கள்",
    gratitudePlaceholder: "நன்றி",
    affirmationTitle: "🌟 இன்றைய உறுதிமொழி",
    affirmationDescription: "உங்கள் சக்தியை சீரமைக்க ஒரு நேர்மறையான நான் இருக்கிறேன் அறிக்கையை எழுதுங்கள்",
    affirmationPlaceholder: "நான் இருக்கிறேன்...",
    shortTermTitle: "🎯 இன்று நான் எடுக்கும் நடவடிக்கைகள்",
    shortTermDescription: "எந்த முக்கிய செயல்கள் உங்களை இன்று முன்னேற்றும்?",
    shortTermPlaceholder: "படி",
    longTermTitle: "🚀 என் நீண்ட கால இலக்குகளை நோக்கிய படிகள்",
    longTermDescription: "எந்த சீரமைக்கப்பட்ட செயல்கள் அல்லது பழக்கங்கள் உங்களை உங்கள் தொலைநோக்கை நோக்கி நகர்த்தும்?",
    longTermPlaceholder: "என் நீண்ட கால தொலைநோக்கில் உள்ளவை...",
    saveButton: "பதிவை சேமி",
    addAnother: "மற்றொன்றை சேர்",
    emotionPatterns: "உணர்வு முறைகள்",
    chakraBalance: "சக்கர சமநிலை",
    goalProgress: "இலக்கு முன்னேற்றம்",
    personalizedWisdom: "தனிப்பயனாக்கப்பட்ட அறிவு",
    noEntries: "இதுவரை பதிவேடு உள்ளீடுகள் இல்லை",
    startWriting: "உங்கள் நுண்ணறிவுகளை இங்கே பார்க்க எழுத தொடங்குங்கள்"
  }
};

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
      
      // No toast notification - save silently for better user experience
    },
    onError: (error) => {
      // Only show notification on errors
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
            {TRANSLATIONS[language]?.title || "Daily Alignment Journal"}
          </h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            {TRANSLATIONS[language]?.subtitle || "Record your thoughts, emotions, and goals with AI-powered insights to guide your healing journey"}
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
                <CardTitle>{TRANSLATIONS[language]?.newEntry || "New Journal Entry"}</CardTitle>
                <CardDescription>
                  {TRANSLATIONS[language]?.newEntryDescription || "Express your thoughts, emotions, and aspirations in this structured journal"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-5 mb-6">
                      <TabsTrigger value="general" className="flex items-center">
                        <MessageSquareText className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{TRANSLATIONS[language]?.general || "General"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="gratitude" className="flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{TRANSLATIONS[language]?.gratitude || "Gratitude"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="affirmation" className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{TRANSLATIONS[language]?.affirmation || "Affirmation"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="shortterm" className="flex items-center">
                        <ListTodo className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{TRANSLATIONS[language]?.shortTerm || "Short-Term"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="longterm" className="flex items-center">
                        <Rocket className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{TRANSLATIONS[language]?.longTerm || "Long-Term"}</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{TRANSLATIONS[language]?.generalTitle || "💭 General Reflections"}</h3>
                        <p className="text-sm text-neutral-600">
                          {TRANSLATIONS[language]?.generalDescription || "Write freely about your thoughts, emotions, and experiences"}
                        </p>
                        <Textarea
                          placeholder={TRANSLATIONS[language]?.generalPlaceholder || "How are you feeling today? What's on your mind?"}
                          className="min-h-[200px] resize-none"
                          value={journalContent}
                          onChange={(e) => setJournalContent(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="gratitude">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{TRANSLATIONS[language]?.gratitudeTitle || "✨ I am grateful for..."}</h3>
                        <p className="text-sm text-neutral-600">
                          {TRANSLATIONS[language]?.gratitudeDescription || "List things that brought you joy, peace, or inspiration today"}
                        </p>
                        
                        <div className="space-y-2">
                          {gratitude.map((item, index) => (
                            <div key={`gratitude-${index}`} className="flex gap-2">
                              <Input
                                placeholder={`${TRANSLATIONS[language]?.gratitudePlaceholder || "Gratitude"} ${index + 1}`}
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
                            {TRANSLATIONS[language]?.addAnother || "Add Another"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="affirmation">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{TRANSLATIONS[language]?.affirmationTitle || "🌟 Today's Affirmation"}</h3>
                        <p className="text-sm text-neutral-600">
                          {TRANSLATIONS[language]?.affirmationDescription || "Write a positive I AM statement to align your energy"}
                        </p>
                        <Input
                          placeholder={TRANSLATIONS[language]?.affirmationPlaceholder || "I am..."}
                          value={affirmation}
                          onChange={(e) => setAffirmation(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="shortterm">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{TRANSLATIONS[language]?.shortTermTitle || "🎯 Steps I will take today"}</h3>
                        <p className="text-sm text-neutral-600">
                          {TRANSLATIONS[language]?.shortTermDescription || "What key actions will move you forward today?"}
                        </p>
                        
                        <div className="space-y-2">
                          {shortTermGoals.map((goal, index) => (
                            <div key={`goal-${index}`} className="flex gap-2">
                              <Input
                                placeholder={`${TRANSLATIONS[language]?.shortTermPlaceholder || "Step"} ${index + 1}`}
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
                            {TRANSLATIONS[language]?.addAnother || "Add Another"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="longterm">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{TRANSLATIONS[language]?.longTermTitle || "🚀 Steps toward my long-term goals"}</h3>
                        <p className="text-sm text-neutral-600">
                          {TRANSLATIONS[language]?.longTermDescription || "What aligned actions or habits will move you toward your vision?"}
                        </p>
                        <Textarea
                          placeholder={TRANSLATIONS[language]?.longTermPlaceholder || "My long-term vision includes..."}
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
                    {createJournalMutation.isPending ? "Saving..." : TRANSLATIONS[language]?.saveButton || "Save Entry"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
          
          {/* Journal Insights Panel */}
          <motion.div 
            className="md:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>{TRANSLATIONS[language]?.insightsTitle || "Journal Insights"}</CardTitle>
                <CardDescription>
                  {TRANSLATIONS[language]?.insightsDescription || "AI-generated insights from your journal entries"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
                  </div>
                ) : journalEntries && Array.isArray(journalEntries) && journalEntries.length > 0 ? (
                  <div className="space-y-6">
                    {/* Emotion Tracking */}
                    <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-rose-600" />
                        <span className="font-medium text-rose-800">{TRANSLATIONS[language]?.emotionPatterns || "Emotion Patterns"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                          {language === "english" ? "joy" : language === "hindi" ? "आनंद" : language === "tamil" ? "மகிழ்ச்சி" : "joy"}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                          {language === "english" ? "gratitude" : language === "hindi" ? "कृतज्ञता" : language === "tamil" ? "நன்றி" : "gratitude"}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                          {language === "english" ? "reflection" : language === "hindi" ? "चिंतन" : language === "tamil" ? "பிரதிபலிப்பு" : "reflection"}
                        </Badge>
                      </div>
                      <p className="text-sm text-rose-700">
                        {language === "english" 
                          ? "Your emotional state has been positive recently, with a focus on reflection and gratitude."
                          : language === "hindi" 
                            ? "आपकी भावनात्मक स्थिति हाल ही में सकारात्मक रही है, जिसमें चिंतन और कृतज्ञता पर ध्यान केंद्रित है।"
                            : language === "tamil"
                              ? "உங்கள் உணர்ச்சி நிலை சமீபத்தில் நேர்மறையாக இருந்துள்ளது, பிரதிபலிப்பு மற்றும் நன்றியுணர்வை மையமாகக் கொண்டது."
                              : "Your emotional state has been positive recently, with a focus on reflection and gratitude."}
                      </p>
                    </div>
                    
                    {/* Chakra Focus */}
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                        <span className="font-medium text-indigo-800">{TRANSLATIONS[language]?.chakraBalance || "Chakra Balance"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary" className="bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                          {language === "english" ? "throat chakra" : language === "hindi" ? "कंठ चक्र" : language === "tamil" ? "தொண்டை சக்கரம்" : "throat chakra"}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                          {language === "english" ? "heart chakra" : language === "hindi" ? "हृदय चक्र" : language === "tamil" ? "இதய சக்கரம்" : "heart chakra"}
                        </Badge>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {language === "english" 
                          ? "Your journal entries show focus on expressing yourself (throat chakra) and processing emotions (heart chakra)."
                          : language === "hindi" 
                            ? "आपकी जर्नल प्रविष्टियां स्वयं को व्यक्त करने (कंठ चक्र) और भावनाओं को संसाधित करने (हृदय चक्र) पर ध्यान केंद्रित करती हैं।"
                            : language === "tamil"
                              ? "உங்கள் பதிவேடு உள்ளீடுகள் உங்களை வெளிப்படுத்துவதில் (தொண்டை சக்கரம்) மற்றும் உணர்வுகளை செயலாக்குவதில் (இதய சக்கரம்) கவனம் செலுத்துகின்றன."
                              : "Your journal entries show focus on expressing yourself (throat chakra) and processing emotions (heart chakra)."}
                      </p>
                    </div>
                    
                    {/* Goal Progress */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <Target className="h-5 w-5 mr-2 text-emerald-600" />
                        <span className="font-medium text-emerald-800">{TRANSLATIONS[language]?.goalProgress || "Goal Progress"}</span>
                      </div>
                      <ul className="space-y-2 text-sm text-emerald-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-emerald-600 mr-2 mt-1.5"></div>
                          <span>
                            {language === "english" 
                              ? "You're making steady progress on your meditation practice consistency"
                              : language === "hindi" 
                                ? "आप अपने ध्यान अभ्यास की निरंतरता पर स्थिर प्रगति कर रहे हैं"
                                : language === "tamil"
                                  ? "நீங்கள் உங்கள் தியான பயிற்சி நிலைத்தன்மையில் நிலையான முன்னேற்றம் அடைகிறீர்கள்"
                                  : "You're making steady progress on your meditation practice consistency"}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-emerald-600 mr-2 mt-1.5"></div>
                          <span>
                            {language === "english" 
                              ? "Focus on completing one short-term goal each day for better results"
                              : language === "hindi" 
                                ? "बेहतर परिणामों के लिए प्रतिदिन एक अल्पकालिक लक्ष्य को पूरा करने पर ध्यान दें"
                                : language === "tamil"
                                  ? "சிறந்த முடிவுகளுக்கு ஒவ்வொரு நாளும் ஒரு குறுகிய கால இலக்கை நிறைவு செய்வதில் கவனம் செலுத்துங்கள்"
                                  : "Focus on completing one short-term goal each day for better results"}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Wisdom & Advice */}
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-amber-600" />
                        <span className="font-medium text-amber-800">{TRANSLATIONS[language]?.personalizedWisdom || "Personalized Wisdom"}</span>
                      </div>
                      <p className="text-sm text-amber-700 mb-2 italic">
                        {language === "english" 
                          ? "\"Your consistent journaling practice is building self-awareness. Consider adding a 5-minute meditation before journaling to deepen insights.\""
                          : language === "hindi" 
                            ? "\"आपका निरंतर जर्नलिंग अभ्यास आत्म-जागरूकता का निर्माण कर रहा है। अंतर्दृष्टि को गहरा करने के लिए जर्नलिंग से पहले 5-मिनट का ध्यान जोड़ने पर विचार करें।\""
                            : language === "tamil"
                              ? "\"உங்கள் தொடர்ச்சியான பதிவு செய்யும் பயிற்சி சுய விழிப்புணர்வை உருவாக்குகிறது. பதிவு செய்வதற்கு முன் 5-நிமிட தியானத்தைச் சேர்த்து நுண்ணறிவுகளை ஆழப்படுத்த முயற்சிக்கவும்.\""
                              : "\"Your consistent journaling practice is building self-awareness. Consider adding a 5-minute meditation before journaling to deepen insights.\""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No journal entries yet</p>
                    <p className="text-sm mt-1">Start writing to see your insights here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
