import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { chakras } from "@/lib/chakras";
import { emotions, emotionColors } from "@/lib/emotions";
import { format, subDays } from "date-fns";

interface ProgressChartsProps {
  journalEntries?: any[];
  emotionTrackings?: any[];
  chakraProfile?: any;
}

export default function ProgressCharts({ journalEntries = [], emotionTrackings = [], chakraProfile }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  
  // Generate dates for the selected time range
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    const daysToGoBack = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    
    for (let i = daysToGoBack - 1; i >= 0; i--) {
      const date = subDays(today, i);
      dates.push({
        date,
        formatted: format(date, timeRange === "year" ? "MMM" : "MMM dd"),
        key: format(date, "yyyy-MM-dd")
      });
    }
    
    return dates;
  };
  
  // Aggregate emotion data by date
  const getEmotionData = () => {
    const dates = getDates();
    const emotionsByDate: Record<string, { emotion: string; intensity: number }[]> = {};
    
    // Group emotions by date
    emotionTrackings.forEach(tracking => {
      const date = format(new Date(tracking.createdAt), "yyyy-MM-dd");
      if (!emotionsByDate[date]) {
        emotionsByDate[date] = [];
      }
      emotionsByDate[date].push({
        emotion: tracking.emotion,
        intensity: tracking.intensity
      });
    });
    
    // Map to expected data format
    return dates.map(date => {
      const dayEmotions = emotionsByDate[date.key] || [];
      const avgIntensity = dayEmotions.length > 0
        ? dayEmotions.reduce((sum, e) => sum + e.intensity, 0) / dayEmotions.length
        : 0;
      
      return {
        date: date.formatted,
        intensity: avgIntensity,
        // Most frequent emotion of the day
        primaryEmotion: dayEmotions.length > 0
          ? dayEmotions.reduce((acc, curr) => {
              const count = acc.emotions[curr.emotion] || 0;
              acc.emotions[curr.emotion] = count + 1;
              if (count + 1 > acc.maxCount) {
                acc.maxCount = count + 1;
                acc.maxEmotion = curr.emotion;
              }
              return acc;
            }, { emotions: {}, maxCount: 0, maxEmotion: "" }).maxEmotion
          : ""
      };
    });
  };
  
  // Get sentiment data from journal entries
  const getSentimentData = () => {
    const dates = getDates();
    const sentimentsByDate: Record<string, number[]> = {};
    
    // Group sentiments by date
    journalEntries.forEach(entry => {
      const date = format(new Date(entry.createdAt), "yyyy-MM-dd");
      if (!sentimentsByDate[date]) {
        sentimentsByDate[date] = [];
      }
      sentimentsByDate[date].push(entry.sentimentScore);
    });
    
    // Map to expected data format
    return dates.map(date => {
      const daySentiments = sentimentsByDate[date.key] || [];
      const avgSentiment = daySentiments.length > 0
        ? daySentiments.reduce((sum, score) => sum + score, 0) / daySentiments.length
        : 0;
      
      return {
        date: date.formatted,
        sentiment: avgSentiment
      };
    });
  };
  
  // Get emotion distribution
  const getEmotionDistribution = () => {
    const emotionCount: Record<string, number> = {};
    
    emotionTrackings.forEach(tracking => {
      emotionCount[tracking.emotion] = (emotionCount[tracking.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCount).map(([emotion, count]) => ({
      name: emotion,
      value: count
    }));
  };
  
  // Get chakra data for radar chart
  const getChakraData = () => {
    if (!chakraProfile) return [];
    
    return [
      { subject: "Root", value: chakraProfile.rootChakra, fullMark: 10 },
      { subject: "Sacral", value: chakraProfile.sacralChakra, fullMark: 10 },
      { subject: "Solar Plexus", value: chakraProfile.solarPlexusChakra, fullMark: 10 },
      { subject: "Heart", value: chakraProfile.heartChakra, fullMark: 10 },
      { subject: "Throat", value: chakraProfile.throatChakra, fullMark: 10 },
      { subject: "Third Eye", value: chakraProfile.thirdEyeChakra, fullMark: 10 },
      { subject: "Crown", value: chakraProfile.crownChakra, fullMark: 10 }
    ];
  };
  
  // Get tags from journal entries
  const getJournalTags = () => {
    const emotionTags: Record<string, number> = {};
    const chakraTags: Record<string, number> = {};
    
    journalEntries.forEach(entry => {
      // Process emotion tags
      if (entry.emotionTags) {
        entry.emotionTags.forEach((tag: string) => {
          emotionTags[tag] = (emotionTags[tag] || 0) + 1;
        });
      }
      
      // Process chakra tags
      if (entry.chakraTags) {
        entry.chakraTags.forEach((tag: string) => {
          chakraTags[tag] = (chakraTags[tag] || 0) + 1;
        });
      }
    });
    
    return {
      emotionTags: Object.entries(emotionTags)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value })),
      chakraTags: Object.entries(chakraTags)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    };
  };
  
  // Chart data
  const emotionData = getEmotionData();
  const sentimentData = getSentimentData();
  const emotionDistribution = getEmotionDistribution();
  const chakraData = getChakraData();
  const { emotionTags, chakraTags } = getJournalTags();
  
  // Get chakra color by name
  const getChakraColor = (chakraName: string) => {
    const chakraKey = chakraName.toLowerCase();
    const chakra = chakras.find(c => c.key === chakraKey || c.name.toLowerCase() === chakraName.toLowerCase());
    return chakra?.color || "#888";
  };
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!chakraProfile || journalEntries.length === 0 || emotionTrackings.length === 0) {
      return 0;
    }
    
    // Simple average of chakra values as one measure
    const chakraSum = [
      chakraProfile.rootChakra,
      chakraProfile.sacralChakra,
      chakraProfile.solarPlexusChakra,
      chakraProfile.heartChakra,
      chakraProfile.throatChakra,
      chakraProfile.thirdEyeChakra,
      chakraProfile.crownChakra
    ].reduce((sum, val) => sum + val, 0);
    
    const chakraAvg = chakraSum / 7;
    
    // Recent sentiment trend
    const recentSentiments = journalEntries
      .slice(0, 5)
      .map(entry => entry.sentimentScore)
      .reduce((sum, val) => sum + val, 0) / Math.min(5, journalEntries.length);
    
    // Combine for overall progress (simple algorithm)
    return Math.round(((chakraAvg / 10) * 0.5 + (recentSentiments / 10) * 0.5) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Your Healing Journey</h2>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Visualize your progress and discover patterns in your emotional and spiritual development.
        </p>
      </div>
      
      {/* Time Range Selection */}
      <div className="flex justify-center mb-4">
        <Tabs defaultValue="week" value={timeRange} onValueChange={(value) => setTimeRange(value as "week" | "month" | "year")}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Your healing journey at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#483D8B"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * calculateOverallProgress()) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{calculateOverallProgress()}%</span>
                  </div>
                </div>
                <p className="mt-4 text-neutral-600">Overall Healing Progress</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Your Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Journal Entries</span>
                    <span className="font-medium">{journalEntries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Emotions Tracked</span>
                    <span className="font-medium">{emotionTrackings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Avg Sentiment</span>
                    <span className="font-medium">
                      {journalEntries.length > 0 
                        ? (journalEntries.reduce((sum, entry) => sum + entry.sentimentScore, 0) / journalEntries.length).toFixed(1)
                        : "N/A"}
                      /10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Chakra Balance</span>
                    <span className="font-medium">
                      {chakraProfile
                        ? (([
                            chakraProfile.rootChakra,
                            chakraProfile.sacralChakra,
                            chakraProfile.solarPlexusChakra,
                            chakraProfile.heartChakra,
                            chakraProfile.throatChakra,
                            chakraProfile.thirdEyeChakra,
                            chakraProfile.crownChakra
                          ].reduce((sum, val) => sum + val, 0) / 7).toFixed(1))
                        : "N/A"}
                      /10
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Areas of Growth</h3>
                <div className="space-y-2">
                  {chakraProfile && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600">Self-Awareness</span>
                          <span className="font-medium">+15%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#483D8B] rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600">Emotional Balance</span>
                          <span className="font-medium">+8%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#008080] rounded-full" style={{ width: "58%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600">Inner Peace</span>
                          <span className="font-medium">+12%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#7DF9FF] rounded-full" style={{ width: "72%" }}></div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {!chakraProfile && (
                    <div className="text-sm text-neutral-500 text-center py-4">
                      Complete your chakra assessment to see growth areas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Intensity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Emotional Intensity</CardTitle>
              <CardDescription>
                How your emotional intensity has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {emotionTrackings.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 shadow-md rounded-md border border-neutral-200">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm">
                                Intensity: <span className="font-medium">{payload[0].value}</span>/10
                              </p>
                              {payload[0].payload.primaryEmotion && (
                                <p className="text-sm">
                                  Emotion: <span className="font-medium">{payload[0].payload.primaryEmotion}</span>
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="intensity"
                      stroke="#483D8B"
                      strokeWidth={2}
                      dot={{ stroke: '#483D8B', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#483D8B', strokeWidth: 2, r: 6, fill: '#483D8B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-neutral-500">No emotion data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Sentiment Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Journal Sentiment</CardTitle>
              <CardDescription>
                The emotional tone of your journal entries over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {journalEntries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 shadow-md rounded-md border border-neutral-200">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm">
                                Sentiment: <span className="font-medium">{payload[0].value}</span>/10
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="sentiment" fill="#008080" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-neutral-500">No journal entries available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Emotion Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>
                Breakdown of your tracked emotions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {emotionTrackings.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={emotionColors[entry.name] || "#888888"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} occurrences`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-neutral-500">No emotion data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Chakra Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Chakra Balance</CardTitle>
              <CardDescription>
                Visualization of your energy centers
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chakraProfile ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chakraData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name="Chakra Balance"
                      dataKey="value"
                      stroke="#483D8B"
                      fill="#483D8B"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const chakraName = payload[0].payload.subject;
                          return (
                            <div className="bg-white p-2 shadow-md rounded-md border border-neutral-200">
                              <p className="text-sm font-medium">{chakraName} Chakra</p>
                              <p className="text-sm">
                                Balance: <span className="font-medium">{payload[0].value}</span>/10
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-neutral-500">No chakra profile available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Journal Tag Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Journal Analysis</CardTitle>
            <CardDescription>
              Themes and patterns detected in your journaling
            </CardDescription>
          </CardHeader>
          <CardContent>
            {journalEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Emotional Themes</h3>
                  {emotionTags.length > 0 ? (
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={emotionTags.slice(0, 5)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#FF69B4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[240px] flex items-center justify-center">
                      <p className="text-neutral-500">No emotional themes detected yet</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Chakra Themes</h3>
                  {chakraTags.length > 0 ? (
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chakraTags.slice(0, 5)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={80} />
                          <Tooltip />
                          <Bar 
                            dataKey="value" 
                            fill="#483D8B"
                            shape={({ x, y, width, height, chakra, index }) => {
                              const chakraName = chakraTags[index]?.name || "";
                              const color = getChakraColor(chakraName.replace(" chakra", ""));
                              return (
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={width} 
                                  height={height} 
                                  fill={color} 
                                  radius={2}
                                />
                              );
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[240px] flex items-center justify-center">
                      <p className="text-neutral-500">No chakra themes detected yet</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[240px] flex items-center justify-center">
                <p className="text-neutral-500">No journal entries available for analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
