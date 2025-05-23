import React, { useState, useEffect } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Languages } from "lucide-react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { language, setLanguage, t, LANGUAGES } = useLanguage();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);
  
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
      confirmPassword: "",
    },
  });
  
  // Handle login submit
  const handleLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
      onError: (error) => {
        if (error.message.includes("401")) {
          loginForm.setError("password", { 
            type: "manual", 
            message: "Invalid username or password" 
          });
        }
      }
    });
  };
  
  // Handle register submit
  const handleRegisterSubmit = (values: RegisterFormValues) => {
    // Note: we need to remove confirmPassword before sending to the API
    // as it's not part of the user schema in the backend
    const { confirmPassword, ...userData } = values;
    
    registerMutation.mutate(userData as any, {
      onSuccess: () => {
        setLocation("/onboarding");
      },
      onError: (error) => {
        if (error.message.includes("409") || error.message.includes("already exists")) {
          registerForm.setError("username", { 
            type: "manual", 
            message: "This username is already taken" 
          });
        }
      }
    });
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
                {t('welcomeTitle') || "Welcome to SoulSync"}
              </h1>
              <p className="text-neutral-600">
                {t('welcomeSubtitle') || "Your journey to inner healing and spiritual growth begins here"}
              </p>
              
              {/* Language Selection */}
              <div className="mt-4 mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('selectLanguage') || "Select Your Language"}
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang: { code: string, name: string }) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {t('languageHint') || "Choose your preferred language. This will be applied throughout the entire application."}
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t('login') || "Login"}</TabsTrigger>
                <TabsTrigger value="register">{t('register') || "Create Account"}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('loginTitle') || "Login to Your Account"}</CardTitle>
                    <CardDescription>
                      {t('loginDescription') || "Enter your credentials to access your dashboard"}
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
                              <FormLabel>{t('username') || "Username"}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('usernamePlaceholder') || "Your username"} {...field} />
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
                              <FormLabel>{t('password') || "Password"}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder={t('passwordPlaceholder') || "Your password"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('loggingIn') || "Logging in..."}
                            </>
                          ) : (
                            t('login') || "Login"
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
                    <CardTitle>{t('registerTitle') || "Create New Account"}</CardTitle>
                    <CardDescription>
                      {t('registerDescription') || "Join SoulSync to begin your healing journey"}
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
                              <FormLabel>{t('name') || "Name"}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('namePlaceholder') || "Your name"} {...field} />
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
                              <FormLabel>{t('username') || "Username"}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('usernamePlaceholder2') || "Choose a username"} {...field} />
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
                              <FormLabel>{t('email') || "Email"}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder={t('emailPlaceholder') || "Your email address"} {...field} />
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
                              <FormLabel>{t('password') || "Password"}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder={t('passwordPlaceholder2') || "Create a password"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('confirmPassword') || "Confirm Password"}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder={t('confirmPasswordPlaceholder') || "Confirm your password"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('creatingAccount') || "Creating account..."}
                            </>
                          ) : (
                            t('register') || "Create Account"
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
              <h2 className="text-3xl font-heading font-bold mb-6">{t('transformTitle') || "Transform Your Inner World"}</h2>
              <p className="mb-8 opacity-90">
                {t('transformDescription') || "SoulSync uses advanced AI to guide you through a personalized journey of healing, self-discovery, and spiritual growth. Unlock your full potential and find balance in your chakras, emotions, and consciousness."}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('feature1Title') || "Personalized Chakra Analysis"}</h3>
                    <p className="opacity-80 text-sm">{t('feature1Description') || "Discover your unique energy balance and areas for healing"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('feature2Title') || "AI-Guided Healing Rituals"}</h3>
                    <p className="opacity-80 text-sm">{t('feature2Description') || "Follow customized practices to release blockages and restore balance"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('feature3Title') || "Track Your Progress"}</h3>
                    <p className="opacity-80 text-sm">{t('feature3Description') || "Visualize your spiritual growth and emotional evolution over time"}</p>
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