import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Mic, MicOff, RefreshCw, Trash2, AlertTriangle, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CoachChatProps {
  coachType: string;
  userId: number;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
}

// Coach configuration
const coachConfig: Record<string, {
  name: string;
  description: string;
  avatar: string;
  color: string;
  iconColor: string;
  greeting: string;
}> = {
  inner_child: {
    name: "Inner Child Coach",
    description: "Healing wounds from the past",
    avatar: "👶",
    color: "#7DF9FF",
    iconColor: "text-[#7DF9FF]",
    greeting: "Hello there! I'm your Inner Child Coach. I'm here to help you reconnect with your authentic self and heal childhood wounds. What would you like to explore today?"
  },
  shadow_self: {
    name: "Shadow Self Coach",
    description: "Embracing your whole self",
    avatar: "🌗",
    color: "#191970",
    iconColor: "text-[#191970]",
    greeting: "Hello love, I'm your Shadow Healing Companion. Together, we'll gently uncover the hidden parts of your subconscious that may still carry pain, fear, or limiting beliefs — and release them with compassion. Are you ready to begin?"
  },
  higher_self: {
    name: "Higher Self Coach",
    description: "Connecting to your essence",
    avatar: "✨",
    color: "#483D8B",
    iconColor: "text-[#483D8B]",
    greeting: "Greetings! I'm your Higher Self Coach. I'm here to help you connect with your highest potential and purpose. What's on your mind today that you'd like guidance with?"
  },
  integration: {
    name: "Integration Coach",
    description: "Unifying your journey",
    avatar: "🧩",
    color: "#008080",
    iconColor: "text-[#008080]",
    greeting: "Hi there! I'm your Integration Coach. I'm here to help you apply insights into practical actions and track your progress. What would you like to work on implementing today?"
  }
};

export default function CoachChat({ coachType, userId }: CoachChatProps) {
  const [message, setMessage] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Get coach config
  const coach = coachConfig[coachType] || coachConfig.integration;
  
  // Fetch previous conversations
  const { data: conversations, isLoading: isLoadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: [`/api/users/${userId}/coach-conversations`, { coachType }],
    queryFn: async ({ queryKey }) => {
      // Type assertion to help TypeScript understand the structure
      const baseUrl = queryKey[0] as string;
      const params = queryKey[1] as { coachType: string };
      const fullUrl = `${baseUrl}?coachType=${params.coachType}`;
      
      try {
        const response = await fetch(fullUrl, { credentials: "include" });
        if (!response.ok) {
          console.error(`Error fetching conversations: ${response.status}`);
          if (response.status === 400) {
            return []; // Return empty array if coachType parameter is missing
          }
          throw new Error(`Failed to fetch conversations: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error in conversation fetch:", error);
        throw error;
      }
    },
    // Sort conversations by creation date to ensure newest is first
    select: (data) => {
      if (!Array.isArray(data)) return [];
      
      // Double-check that we're only getting conversations for this coach type
      const filteredData = data.filter(conversation => 
        conversation.coachType === coachType
      );
      
      return [...filteredData].sort((a, b) => {
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - 
               new Date(a.updatedAt || a.createdAt || 0).getTime();
      });
    }
  });
  
  // Set up initial messages when component loads
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      // Get the most recent conversation
      const latestConversation = conversations[0];
      setConversationId(latestConversation.id);
      setMessages(latestConversation.messages);
    } else if (!isLoadingConversations) {
      // If no conversation exists, add greeting message
      setMessages([
        {
          role: "assistant",
          content: coach.greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [conversations, isLoadingConversations, coach.greeting]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/coach-chat", {
        userId,
        coachType,
        message: content,
        conversationId
      });
      
      if (!response.ok) {
        // Get the error message from the response if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update conversation ID if it's a new conversation
      if (!conversationId && data.conversation?.id) {
        setConversationId(data.conversation.id);
      }
      
      // Add AI response to messages
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          timestamp: new Date()
        }
      ]);
      
      // Refresh the conversations list to keep it up to date
      refetchConversations();
    },
    onError: (error) => {
      // Keep the UI clean by removing the failed user message
      setMessages(prev => prev.slice(0, prev.length - 1));
      
      // Check if the error is related to coach type mismatch
      const isMismatchError = error.message.includes('coach type mismatch');
      
      toast({
        title: isMismatchError ? "Coach Type Mismatch" : "Connection Error",
        description: isMismatchError 
          ? "The conversation you tried to continue belongs to a different coach. Starting a new conversation."
          : `Unable to connect with your coach: ${error.message}`,
        variant: "destructive",
      });
      
      // If it's a coach type mismatch, automatically start a new conversation
      if (isMismatchError) {
        startNewConversation();
      }
    }
  });
  
  // Handle send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate(message);
    
    // Clear input
    setMessage("");
  };
  
  // Toggle voice input
  const toggleVoiceInput = () => {
    setIsVoiceActive(!isVoiceActive);
    
    toast({
      title: isVoiceActive ? "Voice Input Stopped" : "Voice Input Started",
      description: isVoiceActive 
        ? "Your message has been captured." 
        : "Speak clearly to record your message.",
    });
    
    // Here you would implement WebSpeech API for voice recognition
  };
  
  // Start new conversation
  const startNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: coach.greeting,
        timestamp: new Date()
      }
    ]);
    
    toast({
      title: "New Conversation Started",
      description: `You're now in a fresh conversation with your ${coach.name}.`
    });
  };
  
  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/coach-conversations/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }
      return response.json();
    },
    onSuccess: () => {
      // Refresh conversation list
      refetchConversations();
      
      // Start a new conversation
      startNewConversation();
      
      toast({
        title: "Conversation History Deleted",
        description: "Your conversation history has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: `Unable to delete conversation: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle conversation deletion
  const handleDeleteConversation = () => {
    if (conversationId) {
      deleteConversationMutation.mutate(conversationId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback style={{ backgroundColor: coach.color }}>
              {coach.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{coach.name}</CardTitle>
            <CardDescription>{coach.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto pb-0">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-0.5 mx-2 flex-shrink-0">
                      <AvatarFallback style={{ backgroundColor: coach.color }}>
                        {coach.avatar}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {msg.role === "user" && (
                    <div className="h-8 w-8 mt-0.5 mx-2 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  
                  <div 
                    className={`p-3 rounded-lg ${
                      msg.role === 'assistant' 
                        ? `bg-${coach.color.replace('#', '')}/10` 
                        : 'bg-white border border-neutral-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <div className="text-xs text-neutral-400 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-start max-w-[75%]">
                <Avatar className="h-8 w-8 mt-0.5 mx-2 flex-shrink-0">
                  <AvatarFallback style={{ backgroundColor: coach.color }}>
                    {coach.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className={`p-3 rounded-lg bg-${coach.color.replace('#', '')}/10`}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-4">
        <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
          <Button
            type="button"
            size="icon"
            variant={isVoiceActive ? "destructive" : "outline"}
            onClick={toggleVoiceInput}
            className="flex-shrink-0"
            title="Voice input"
          >
            {isVoiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={startNewConversation}
            className="flex-shrink-0"
            title="Start new conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {conversationId && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="flex-shrink-0"
                  title="Delete conversation history"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Delete Conversation History
                  </DialogTitle>
                  <DialogDescription>
                    Deleting your conversation history may impact the coach's ability to provide
                    accurate healing guidance based on your past interactions. Your coach learns
                    about your specific healing needs through your conversations.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                  <p className="font-medium">Important:</p>
                  <p className="mt-1">Your healing journey is progressive, and past conversations help your coach provide personalized guidance. Deleting history may reduce the effectiveness of future healing insights.</p>
                </div>
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {}}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteConversation}
                    disabled={deleteConversationMutation.isPending}
                  >
                    {deleteConversationMutation.isPending ? (
                      <>
                        <span className="mr-2">Deleting...</span>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Delete History'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <div className="relative flex-grow">
            <Input
              placeholder={`Message your ${coach.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-10"
              disabled={chatMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-neutral-400"
              disabled={!message.trim() || chatMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </div>
  );
}
