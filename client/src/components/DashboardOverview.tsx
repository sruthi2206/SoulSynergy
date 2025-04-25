import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import ChakraWheel from "@/components/ChakraWheel";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Calendar, CheckCircle, Info, ExternalLink, Activity, Sparkles } from "lucide-react";

interface DashboardOverviewProps {
  chakraProfile?: any;
  journalEntries?: any[];
  emotionTrackings?: any[];
  recommendations?: any[];
}

export default function DashboardOverview({ 
  chakraProfile, 
  journalEntries = [], 
  emotionTrackings = [],
  recommendations = []
}: DashboardOverviewProps) {
  // Get chakra values for visualization
  const getChakraValues = () => {
    if (!chakraProfile) return undefined;
    
    return {
      crown: chakraProfile.crownChakra,
      thirdEye: chakraProfile.thirdEyeChakra,
      throat: chakraProfile.throatChakra,
      heart: chakraProfile.heartChakra,
      solarPlexus: chakraProfile.solarPlexusChakra,
      sacral: chakraProfile.sacralChakra,
      root: chakraProfile.rootChakra
    };
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Get the mood data for chart
  const getMoodData = () => {
    // Take up to 7 most recent entries
    const recent = [...emotionTrackings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7)
      .reverse();
    
    return recent.map(tracking => ({
      day: new Date(tracking.createdAt).toLocaleDateString(undefined, { weekday: 'short' }),
      intensity: tracking.intensity,
      emotion: tracking.emotion
    }));
  };
  
  // Get most recent emotion
  const getMostRecentEmotion = () => {
    if (emotionTrackings.length === 0) return null;
    
    return [...emotionTrackings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };
  
  // Get completed rituals count
  const getCompletedRitualsCount = () => {
    return recommendations.filter(rec => rec.completed).length;
  };
  
  // Get top emotion tags
  const getTopEmotionTags = () => {
    const tags: Record<string, number> = {};
    
    journalEntries.forEach(entry => {
      if (entry.emotionTags) {
        entry.emotionTags.forEach((tag: string) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Column - Chakra & Energy */}
      <div className="md:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Chakra Balance</CardTitle>
              <CardDescription>
                Your energy centers visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <ChakraWheel size={180} values={getChakraValues()} animated={true} />
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600">Overall Balance</span>
                  <span className="font-medium">
                    {chakraProfile ? "60%" : "Not assessed"}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.href = '/chakra-report'}
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Today's Energy</CardTitle>
              <CardDescription>
                Recent emotional state
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getMostRecentEmotion() ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-neutral-600">Current Emotion</div>
                      <div className="text-lg font-medium">{getMostRecentEmotion().emotion}</div>
                    </div>
                    <div className="text-4xl">
                      {getMostRecentEmotion().emotion === "Joy" && "😊"}
                      {getMostRecentEmotion().emotion === "Sadness" && "😔"}
                      {getMostRecentEmotion().emotion === "Anger" && "😠"}
                      {getMostRecentEmotion().emotion === "Fear" && "😨"}
                      {getMostRecentEmotion().emotion === "Disgust" && "🤢"}
                      {getMostRecentEmotion().emotion === "Surprise" && "😲"}
                      {(!["Joy", "Sadness", "Anger", "Fear", "Disgust", "Surprise"].includes(getMostRecentEmotion().emotion)) && "😐"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Intensity</span>
                      <span className="font-medium">{getMostRecentEmotion().intensity}/10</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#483D8B]"
                        style={{ width: `${getMostRecentEmotion().intensity * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Link href="/dashboard?tab=emotions">
                    <Button variant="outline" size="sm" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Emotional Tracking
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-neutral-500 mb-3">No emotion tracked yet</div>
                  <Link href="/dashboard?tab=emotions">
                    <Button size="sm" className="bg-[#483D8B] hover:bg-opacity-90">
                      Track Emotion
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Middle Column - Activity & Insights */}
      <div className="md:col-span-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Journey</CardTitle>
                  <CardDescription>
                    Recent activity and insights
                  </CardDescription>
                </div>
                <Link href="/journal">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Journal
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {journalEntries.length > 0 ? (
                <div className="space-y-4">
                  {journalEntries.slice(0, 2).map((entry) => (
                    <div 
                      key={entry.id}
                      className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center text-sm text-neutral-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(entry.createdAt)}</span>
                        </div>
                        <div className="text-xs">
                          Sentiment: <span className="font-medium">{entry.sentimentScore}/10</span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-2 line-clamp-2">
                        {entry.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {entry.emotionTags?.slice(0, 3).map((tag: string, i: number) => (
                          <Badge key={`emotion-${i}`} variant="secondary" className="text-xs bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                            {tag}
                          </Badge>
                        ))}
                        
                        {entry.chakraTags?.slice(0, 2).map((tag: string, i: number) => (
                          <Badge key={`chakra-${i}`} variant="secondary" className="text-xs bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {journalEntries.length > 2 && (
                    <div className="text-center">
                      <Link href="/journal">
                        <Button variant="link" className="text-[#483D8B]">
                          View all journal entries
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-neutral-500 mb-3">No journal entries yet</div>
                  <Link href="/journal">
                    <Button className="bg-[#483D8B] hover:bg-opacity-90">
                      Start Journaling
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Mood Tracking</CardTitle>
              <CardDescription>
                Your emotional patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emotionTrackings.length > 0 ? (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMoodData()}>
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 shadow-md rounded-md border border-neutral-200">
                                <p className="font-medium">{data.day}</p>
                                <p className="text-sm">
                                  {data.emotion}: <span className="font-medium">{data.intensity}/10</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="intensity" fill="#483D8B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-neutral-500 mb-3">No mood data available</div>
                  <Link href="/dashboard?tab=emotions">
                    <Button className="bg-[#483D8B] hover:bg-opacity-90">
                      Track Your Mood
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Right Column - Recommendations & Stats */}
      <div className="md:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Healing Practice</CardTitle>
              <CardDescription>
                Today's recommended ritual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div>
                  {(() => {
                    // Get first incomplete recommendation
                    const recommendation = recommendations.find(r => !r.completed);
                    if (!recommendation) {
                      return (
                        <div className="text-center py-4">
                          <div className="mb-2">
                            <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                          </div>
                          <div className="text-sm text-neutral-500 mb-3">
                            All practices completed!
                          </div>
                          <Link href="/dashboard?tab=rituals">
                            <Button size="sm" className="bg-[#483D8B] hover:bg-opacity-90">
                              Find More Practices
                            </Button>
                          </Link>
                        </div>
                      );
                    }
                    
                    const ritual = recommendation.ritual;
                    
                    return (
                      <div>
                        <h3 className="font-medium text-lg mb-1">{ritual.name}</h3>
                        <p className="text-sm text-neutral-600 mb-3">{ritual.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">
                            {ritual.type.replace('_', ' ')}
                          </Badge>
                          {ritual.targetChakra && (
                            <Badge variant="outline" className="bg-[#483D8B]/10 text-[#483D8B] border-[#483D8B]/20">
                              {ritual.targetChakra}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="bg-neutral-50 p-3 rounded-md text-sm mb-4">
                          {ritual.instructions.length > 150 
                            ? ritual.instructions.substring(0, 150) + '...' 
                            : ritual.instructions}
                        </div>
                        
                        <div className="space-y-2">
                          <Link href="/dashboard?tab=rituals">
                            <Button className="w-full bg-[#483D8B] hover:bg-opacity-90">
                              View Practice Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-neutral-500 mb-3">No practices added yet</div>
                  <Link href="/dashboard?tab=rituals">
                    <Button size="sm" className="bg-[#483D8B] hover:bg-opacity-90">
                      Discover Practices
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Journey Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-[#483D8B]">
                      {journalEntries.length}
                    </div>
                    <div className="text-xs text-neutral-600">Journal Entries</div>
                  </div>
                  
                  <div className="bg-neutral-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-[#008080]">
                      {emotionTrackings.length}
                    </div>
                    <div className="text-xs text-neutral-600">Emotions Tracked</div>
                  </div>
                  
                  <div className="bg-neutral-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-[#7DF9FF]">
                      {getCompletedRitualsCount()}
                    </div>
                    <div className="text-xs text-neutral-600">Rituals Completed</div>
                  </div>
                  
                  <div className="bg-neutral-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-[#FF69B4]">
                      {getTopEmotionTags().length}
                    </div>
                    <div className="text-xs text-neutral-600">Emotions Processed</div>
                  </div>
                </div>
                
                {getTopEmotionTags().length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Top Emotions</div>
                    <div className="flex flex-wrap gap-1">
                      {getTopEmotionTags().map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link href="/dashboard?tab=progress">
                  <Button variant="outline" size="sm" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    View Progress Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
