import * as React from 'react';
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
import Community from "@/pages/Community";
import Membership from "@/pages/Membership";
import AdminDashboard from "@/pages/AdminDashboard";
import ChakraAssessment from "@/pages/ChakraAssessment";
import ChakraReport from "@/pages/ChakraReport";
import HealingRitualsPage from "@/pages/HealingRitualsPage";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  const isHome = location === "/";
  
  return (
    <>
      {!isHome && <Navigation />}
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={Home} />
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/onboarding" component={Onboarding} />
          <ProtectedRoute path="/journal" component={Journal} />
          <ProtectedRoute path="/coach/:type" component={Coach} />
          <ProtectedRoute path="/community" component={Community} />
          <ProtectedRoute path="/membership" component={Membership} />
          <ProtectedRoute path="/admin" component={AdminDashboard} />
          <ProtectedRoute path="/chakra-assessment" component={ChakraAssessment} />
          <ProtectedRoute path="/chakra-report" component={ChakraReport} />
          <ProtectedRoute path="/healing-rituals" component={HealingRitualsPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;