import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import Journal from "@/pages/Journal";
import Coach from "@/pages/Coach";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function Router() {
  const [location] = useLocation();
  const isHome = location === "/";
  
  return (
    <>
      {!isHome && <Navigation />}
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/journal" component={Journal} />
          <Route path="/coach/:type" component={Coach} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </>
  );
}

function App() {
  // Simple user state management - would be replaced with more robust auth in production
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  
  useEffect(() => {
    // Check for user in localStorage (simplified demo)
    const savedUser = localStorage.getItem('soulsync_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('soulsync_user');
      }
    }
  }, []);
  
  // App context providers for user state management
  const userContextValue = {
    user,
    setUser: (userData: { id: number; name: string } | null) => {
      setUser(userData);
      if (userData) {
        localStorage.setItem('soulsync_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('soulsync_user');
      }
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={userContextValue}>
        <Router />
        <Toaster />
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

// User context for app-wide state
export const UserContext = React.createContext<{
  user: { id: number; name: string } | null;
  setUser: (user: { id: number; name: string } | null) => void;
}>({
  user: null,
  setUser: () => {}
});

export default App;

// Create React namespace for context
import * as React from 'react';
