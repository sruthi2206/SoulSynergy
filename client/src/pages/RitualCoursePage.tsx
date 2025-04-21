import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Clock, PlayCircle, BookOpen, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function RitualCoursePage() {
  const params = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const courseId = params.courseId;

  // Fetch ritual course data
  const { data: ritual, isLoading } = useQuery({
    queryKey: ['/api/healing-rituals', courseId],
    queryFn: async () => {
      try {
        // Use a regular fetch since we've removed auth requirement on this endpoint
        const res = await fetch(`/api/healing-rituals/${courseId}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch ritual details: ${errorText}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching ritual details:', error);
        return null;
      }
    },
    enabled: !!courseId, // Only need the courseId now
  });

  // Loading state
  if (isLoading) {
    return <CoursePageSkeleton />;
  }

  // Not found state
  if (!ritual) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/healing-rituals")}>
            Back to Healing Rituals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{ritual.name} | SoulSync Courses</title>
        <meta name="description" content={ritual.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 bg-gradient-to-r from-purple-900 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/0" />
          
          <div className="container relative z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/healing-rituals")}
              className="mb-8 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rituals
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  {ritual.targetChakra && (
                    <Badge className="bg-white text-purple-700">
                      {ritual.targetChakra.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Chakra
                    </Badge>
                  )}
                  {ritual.targetEmotion && (
                    <Badge className="bg-white text-purple-700">
                      {ritual.targetEmotion.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  )}
                  <Badge className="bg-white/10">
                    <Clock className="h-3 w-3 mr-1" />
                    {ritual.duration || "15 minutes"}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{ritual.name}</h1>
                
                <p className="text-lg text-white/90 mb-8 max-w-3xl">
                  {ritual.description}
                </p>
                
                <div className="flex items-center space-x-4 mb-8">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src="/images/instructor.jpg" alt="Instructor" />
                    <AvatarFallback>IN</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">With Sarah Johnson</div>
                    <div className="text-sm text-white/70">Spiritual Guide & Healing Practitioner</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-700 hover:bg-white/90"
                    onClick={() => {
                      if (ritual.videoUrl) {
                        // If we have a video URL, open it in a new tab
                        window.open(ritual.videoUrl, '_blank');
                      } else if (ritual.courseUrl) {
                        // If we have a course URL but no video, navigate to it
                        window.open(ritual.courseUrl, '_blank');
                      } else {
                        // Show an alert if neither is available
                        alert('This practice is coming soon. Please check back later!');
                      }
                    }}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Practice
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => {
                      // This could be linked to a downloadable PDF guide in the future
                      alert('Practice guide coming soon!');
                    }}
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Download Guide
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                  <img 
                    src={ritual.mainImageUrl || "/images/placeholder-course.jpg"} 
                    alt={ritual.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="icon" className="h-16 w-16 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/40">
                      <PlayCircle className="h-10 w-10 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Content Section */}
        <section className="py-12">
          <div className="container">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                      <p className="text-gray-700 mb-4">{ritual.description}</p>
                      <p className="text-gray-700">
                        This course is designed to help you connect with your inner self, balance your chakras, 
                        and release emotional blockages that may be preventing you from living your best life. 
                        Through guided meditations, breathing exercises, and powerful visualizations, 
                        you'll experience deep healing and transformation.
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                      <ul className="space-y-3">
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>How to effectively balance and align your {ritual.targetChakra || "chakras"}</span>
                        </li>
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>Powerful techniques to release emotional blockages</span>
                        </li>
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>Daily practices to maintain spiritual balance</span>
                        </li>
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>How to integrate these teachings into your everyday life</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Course Details</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">{ritual.duration || "15 minutes"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Practice Type</div>
                          <div className="font-medium">{ritual.type || "Meditation"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Level</div>
                          <div className="font-medium">All Levels</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Students</div>
                          <div className="font-medium">1,234</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Practice Instructions</h3>
                        <div className="text-gray-700 whitespace-pre-line">
                          {ritual.instructions || (
                            <>
                              1. Find a quiet, comfortable space where you won't be disturbed.
                              
                              2. Sit in a comfortable position with your spine straight.
                              
                              3. Close your eyes and take several deep breaths.
                              
                              4. Follow the guided meditation, focusing on your {ritual.targetChakra || "chakras"}.
                              
                              5. When complete, gently bring your awareness back to your surroundings.
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => {
                          if (ritual.videoUrl) {
                            // If we have a video URL, open it in a new tab
                            window.open(ritual.videoUrl, '_blank');
                          } else if (ritual.courseUrl) {
                            // If we have a course URL but no video, navigate to it
                            window.open(ritual.courseUrl, '_blank');
                          } else {
                            // Show an alert if neither is available
                            alert('This practice is coming soon. Please check back later!');
                          }
                        }}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Start Practice Now
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="curriculum" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                Lesson 1
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {ritual.duration || "15 minutes"}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">Introduction to {ritual.name}</h3>
                            <p className="text-gray-600 mt-1">
                              Learn the basics and prepare for your journey
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <PlayCircle className="h-6 w-6" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                Lesson 2
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                20 minutes
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">The Guided Practice</h3>
                            <p className="text-gray-600 mt-1">
                              Deep dive into the main exercise and techniques
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <PlayCircle className="h-6 w-6" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                Lesson 3
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                10 minutes
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">Integration & Daily Practice</h3>
                            <p className="text-gray-600 mt-1">
                              How to incorporate these teachings into your daily life
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <PlayCircle className="h-6 w-6" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="instructor" className="space-y-8">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center space-x-6 mb-8">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      <AvatarImage src="/images/instructor.jpg" alt="Sarah Johnson" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">Sarah Johnson</h2>
                      <p className="text-gray-600">Spiritual Guide & Healing Practitioner</p>
                      <div className="flex items-center mt-2">
                        <Users className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">12,345 students</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-700 mb-4">
                      Sarah Johnson is a renowned spiritual guide and healing practitioner with over 15 years of experience in the fields of chakra healing, meditation, and energy work.
                    </p>
                    <p className="text-gray-700 mb-4">
                      Sarah's unique approach combines ancient wisdom with modern techniques, making spiritual practices accessible to everyone. Her teaching style is warm, approachable, and deeply transformative.
                    </p>
                    <p className="text-gray-700">
                      With a background in psychology and extensive training in various healing modalities, Sarah has helped thousands of students around the world connect with their inner wisdom and create lasting positive change in their lives.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Related Courses Section */}
        <section className="py-12 bg-gray-50">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Related Courses You Might Like</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src="/images/placeholder-course.jpg" 
                      alt="Course thumbnail" 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Chakra Healing
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        20 minutes
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Related Healing Practice {i}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      Another powerful healing ritual to support your spiritual journey.
                    </p>
                    <Button variant="outline" className="w-full">View Course</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Loading skeleton
function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="relative pt-24 pb-12 bg-gradient-to-r from-purple-900 to-indigo-800">
        <div className="container">
          <Skeleton className="h-10 w-32 mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex space-x-2 mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              
              <Skeleton className="h-12 w-3/4 mb-6" />
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-6 w-2/3 mb-8" />
              
              <div className="flex items-center space-x-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>
            
            <div className="hidden lg:block">
              <Skeleton className="w-full aspect-video rounded-xl" />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container">
          <Skeleton className="h-10 w-full max-w-2xl mx-auto mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-72 w-full rounded-md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}