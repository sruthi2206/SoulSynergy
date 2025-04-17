import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Users, Share2, Bell, BellOff, Filter, MessageSquareHeart } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/App";
import { Link } from "wouter";

interface Post {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  content: string;
  date: string;
  likes: number;
  comments: number;
  likedByUser: boolean;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  isVirtual: boolean;
  isFree: boolean;
  attendees: number;
  isAttending: boolean;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "article" | "video" | "meditation" | "practice";
  author: string;
  thumbnail?: string;
  link: string;
}

// Mock data for the community page
const mockPosts: Post[] = [
  {
    id: 1,
    user: { id: 101, name: "Lotus Seeker", avatar: "" },
    content: "Just completed a 30-day chakra balancing journey! My energy is flowing so much better now. Anyone else experienced major shifts after consistent practice?",
    date: "2 hours ago",
    likes: 24,
    comments: 7,
    likedByUser: false
  },
  {
    id: 2,
    user: { id: 102, name: "Inner Light", avatar: "" },
    content: "Shadow work revelation: I've been avoiding confrontation my whole life because of childhood experiences. Working with the AI coach here has helped me recognize this pattern and start changing it. So grateful for this community!",
    date: "5 hours ago",
    likes: 42,
    comments: 13,
    likedByUser: true
  },
  {
    id: 3,
    user: { id: 103, name: "Peaceful Warrior", avatar: "" },
    content: "My heart chakra meditation this morning was so powerful. I literally felt warmth spreading through my chest. Has anyone else had physical sensations during energy work?",
    date: "1 day ago",
    likes: 31,
    comments: 9,
    likedByUser: false
  },
  {
    id: 4,
    user: { id: 104, name: "Spirit Journeyer", avatar: "" },
    content: "The healing rituals for the throat chakra have completely transformed my communication with my partner. We're having deeper conversations than ever before. Thank you for these practices!",
    date: "2 days ago",
    likes: 17,
    comments: 5,
    likedByUser: false
  }
];

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Full Moon Chakra Healing Circle",
    description: "Join us for a powerful group healing session where we'll work with the energy of the full moon to cleanse and activate all seven chakras.",
    date: "May 23, 2025",
    time: "8:00 PM EST",
    isVirtual: true,
    isFree: false,
    attendees: 28,
    isAttending: false
  },
  {
    id: 2,
    title: "Inner Child Healing Workshop",
    description: "Learn practical techniques to connect with and heal your inner child through guided meditation, journaling, and somatic experiencing.",
    date: "June 5, 2025",
    time: "1:00 PM EST",
    isVirtual: true,
    isFree: false,
    attendees: 42,
    isAttending: true
  },
  {
    id: 3,
    title: "Shadow Integration: Community Discussion",
    description: "A free community discussion about shadow work, integration techniques, and supporting each other through the process.",
    date: "May 18, 2025",
    time: "7:00 PM EST",
    isVirtual: true,
    isFree: true,
    attendees: 64,
    isAttending: false
  }
];

const mockResources: Resource[] = [
  {
    id: 1,
    title: "Understanding Your Chakra System",
    description: "A comprehensive guide to the seven main chakras, their functions, and how they affect your physical and emotional wellbeing.",
    type: "article",
    author: "SoulSync Team",
    thumbnail: "",
    link: "#"
  },
  {
    id: 2,
    title: "Shadow Work Guided Meditation",
    description: "A 20-minute guided meditation to help you safely explore and integrate shadow aspects of yourself.",
    type: "meditation",
    author: "Healing Journeys",
    thumbnail: "",
    link: "#"
  },
  {
    id: 3,
    title: "The Science of Energy Healing",
    description: "A fascinating exploration of the scientific research behind energy healing practices and their effects on the body and mind.",
    type: "video",
    author: "Dr. Emma Richards",
    thumbnail: "",
    link: "#"
  }
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const { user } = useContext(UserContext);
  
  // Handle liking a post
  const handleLikePost = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
          likedByUser: !post.likedByUser
        };
      }
      return post;
    }));
  };
  
  // Handle attending an event
  const handleAttendEvent = (eventId: number) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1,
          isAttending: !event.isAttending
        };
      }
      return event;
    }));
  };
  
  // Get avatar fallback (initials from name)
  const getAvatarFallback = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Get badge color based on post type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "article":
        return "bg-blue-100 text-blue-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "meditation":
        return "bg-indigo-100 text-indigo-800";
      case "practice":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            SoulSync Community
          </h1>
          <p className="text-neutral-600 max-w-3xl">
            Connect with fellow seekers on the spiritual healing journey. Share experiences, 
            learn from others, and grow together in this supportive community.
          </p>
        </motion.div>
        
        {/* Community Navigation */}
        <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="feed">Community Feed</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            {!user && (
              <Link href="/membership">
                <Button className="bg-[#483D8B] hover:bg-opacity-90">
                  Join Community
                </Button>
              </Link>
            )}
          </div>
          
          {/* Community Feed */}
          <TabsContent value="feed" className="mt-0">
            {user ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <div className="lg:col-span-3">
                  <div className="sticky top-24">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Your Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" />
                            <AvatarFallback>{getAvatarFallback(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-neutral-500">Member since April 2025</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Posts</span>
                            <span className="font-medium">3</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Connections</span>
                            <span className="font-medium">12</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Events Attended</span>
                            <span className="font-medium">2</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          Edit Profile
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="mt-4">
                      <CardHeader className="pb-3">
                        <CardTitle>Community Guidelines</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-[#483D8B] mr-2">•</span>
                            <span>Be respectful and supportive of others' journeys</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#483D8B] mr-2">•</span>
                            <span>Share experiences but avoid giving medical advice</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#483D8B] mr-2">•</span>
                            <span>Keep conversations focused on healing and growth</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#483D8B] mr-2">•</span>
                            <span>Respect privacy and confidentiality</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Create Post */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{getAvatarFallback(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <textarea 
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#483D8B] text-sm"
                            placeholder="Share your healing journey with the community..."
                            rows={3}
                          ></textarea>
                          <div className="flex justify-between mt-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Users className="h-4 w-4 mr-1" />
                                Tag People
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquareHeart className="h-4 w-4 mr-1" />
                                Add Reflection
                              </Button>
                            </div>
                            <Button size="sm" className="bg-[#483D8B] hover:bg-opacity-90">
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Posts */}
                  {posts.map(post => (
                    <Card key={post.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={post.user.avatar || ""} />
                              <AvatarFallback>{getAvatarFallback(post.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{post.user.name}</div>
                              <div className="text-xs text-neutral-500">{post.date}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <BellOff className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{post.content}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="flex space-x-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLikePost(post.id)}
                            className={post.likedByUser ? "text-[#E91E63]" : ""}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${post.likedByUser ? "fill-current" : ""}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {/* Right Sidebar */}
                <div className="lg:col-span-3">
                  <div className="sticky top-24 space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Upcoming Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {events.slice(0, 2).map(event => (
                            <div key={event.id} className="border-b pb-3 last:border-0 last:pb-0">
                              <div className="font-medium mb-1">{event.title}</div>
                              <div className="text-sm text-neutral-500 mb-2">
                                {event.date} • {event.time}
                              </div>
                              <div className="text-xs flex space-x-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {event.isVirtual ? "Virtual" : "In Person"}
                                </span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                  {event.isFree ? "Free" : "Members Only"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setActiveTab("events")}
                        >
                          View All Events
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Suggested Connections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>MS</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">Mindful Soul</div>
                                <div className="text-xs text-neutral-500">Heart Chakra Expert</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Connect</Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>HD</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">Healing Dawn</div>
                                <div className="text-xs text-neutral-500">Shadow Work Guide</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Connect</Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>EC</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">Energy Current</div>
                                <div className="text-xs text-neutral-500">Meditation Teacher</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Connect</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-medium mb-2">Join Our Community</h3>
                    <p className="text-neutral-600 mb-6">
                      Connect with like-minded individuals on their spiritual healing journey. 
                      Share experiences, attend exclusive events, and access premium resources 
                      with a SoulSync membership.
                    </p>
                    <Link href="/membership">
                      <Button className="bg-[#483D8B] hover:bg-opacity-90">
                        Learn More About Membership
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Events */}
          <TabsContent value="events" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 mb-4">
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1">Upcoming Spiritual Events</h3>
                        <p className="text-neutral-600">
                          Join live sessions, workshops, and discussions for your spiritual growth
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-1" />
                          Filter
                        </Button>
                        {user && (
                          <Button className="bg-[#483D8B] hover:bg-opacity-90" size="sm">
                            Create Event
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {events.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle>{event.title}</CardTitle>
                        </div>
                        <div className="flex space-x-2 mb-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {event.isVirtual ? "Virtual" : "In Person"}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            {event.isFree ? "Free" : "Members Only"}
                          </span>
                        </div>
                        <CardDescription>{event.date} • {event.time}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{event.description}</p>
                      <div className="flex items-center text-sm text-neutral-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      {user ? (
                        <Button
                          className={event.isAttending ? "bg-green-600 hover:bg-green-700" : "bg-[#483D8B] hover:bg-opacity-90"}
                          onClick={() => handleAttendEvent(event.id)}
                        >
                          {event.isAttending ? "Attending" : "Attend"}
                        </Button>
                      ) : (
                        <Link href="/membership">
                          <Button className="bg-[#483D8B] hover:bg-opacity-90">
                            {event.isFree ? "Sign Up" : "Join to Attend"}
                          </Button>
                        </Link>
                      )}
                      
                      <Button variant="outline">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          {/* Resources */}
          <TabsContent value="resources" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 mb-4">
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1">Community Resources</h3>
                        <p className="text-neutral-600">
                          Explore curated content to support your healing journey
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-1" />
                          Filter
                        </Button>
                        {user && (
                          <Button className="bg-[#483D8B] hover:bg-opacity-90" size="sm">
                            Submit Resource
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {mockResources.map(resource => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle>{resource.title}</CardTitle>
                        </div>
                        <div className="flex space-x-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${getTypeBadge(resource.type)}`}>
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </span>
                        </div>
                        <CardDescription>By {resource.author}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{resource.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      {user || resource.type !== "meditation" ? (
                        <a href={resource.link} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-[#483D8B] hover:bg-opacity-90">
                            View {resource.type === "article" ? "Article" : 
                                  resource.type === "video" ? "Video" : 
                                  resource.type === "meditation" ? "Meditation" : "Resource"}
                          </Button>
                        </a>
                      ) : (
                        <Link href="/membership">
                          <Button className="bg-[#483D8B] hover:bg-opacity-90">
                            Join to Access
                          </Button>
                        </Link>
                      )}
                      
                      <Button variant="outline">
                        Save
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}