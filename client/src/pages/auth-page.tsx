import React, { useState, useContext } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserContext } from "@/App";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register form schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setUser } = useContext(UserContext);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });
  
  // Handle login submit
  const handleLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid username or password");
        } else {
          throw new Error("Login failed. Please try again.");
        }
      }
      
      const userData = await response.json();
      
      // Update user context
      setUser({
        id: userData.id,
        name: userData.name,
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle register submit
  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    
    try {
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!userResponse.ok) {
        // Handle HTTP error responses
        const errorData = await userResponse.json();
        if (userResponse.status === 409) {
          throw new Error(`Username "${values.username}" already exists. Please choose a different username.`);
        } else {
          throw new Error(errorData.message || "Failed to create account");
        }
      }
      
      const userData = await userResponse.json();
      
      // Set user in context
      setUser({
        id: userData.id,
        name: userData.name,
      });
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You will be redirected to complete your onboarding.",
      });
      
      // Redirect to onboarding to complete chakra profile
      setLocation("/onboarding");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      
      // If it's a username conflict, set field error
      if (error instanceof Error && error.message.includes("already exists")) {
        registerForm.setError("username", { 
          type: "manual", 
          message: "This username is already taken" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
                Welcome to SoulSync
              </h1>
              <p className="text-neutral-600">
                Your journey to inner healing and spiritual growth begins here
              </p>
            </div>
            
            <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to Your Account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Account</CardTitle>
                    <CardDescription>
                      Join SoulSync to begin your healing journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block bg-gradient-to-br from-[#483D8B] to-[#008080] p-8 text-white flex items-center"
          >
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">Transform Your Inner World</h2>
              <p className="mb-8 opacity-90">
                SoulSync uses advanced AI to guide you through a personalized journey of healing, 
                self-discovery, and spiritual growth. Unlock your full potential and find balance 
                in your chakras, emotions, and consciousness.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Personalized Chakra Analysis</h3>
                    <p className="opacity-80 text-sm">Discover your unique energy balance and areas for healing</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">AI-Guided Healing Rituals</h3>
                    <p className="opacity-80 text-sm">Follow customized practices to release blockages and restore balance</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Track Your Progress</h3>
                    <p className="opacity-80 text-sm">Visualize your spiritual growth and emotional evolution over time</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}