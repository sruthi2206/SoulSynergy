import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, ChevronDown, LayoutDashboard, BookOpen, MessageSquare, Sparkles, LogOut, Users, CreditCard, ShieldCheck } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [inTrialPeriod, setInTrialPeriod] = useState(true);
  const [visibleItems, setVisibleItems] = useState<string[]>([
    "Dashboard", "Journal", "AI Coaches", "Chakra Assessment", "Membership"
  ]);
  
  // Check if user is in trial period
  useEffect(() => {
    if (user && user.createdAt) {
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const differenceInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // If within 7 days trial or user is admin, show all menu items
      const withinTrial = differenceInDays <= 7;
      setInTrialPeriod(withinTrial);
      
      if (user.isAdmin || withinTrial) {
        setVisibleItems([
          "Dashboard", "Journal", "AI Coaches", "Chakra Assessment", 
          "Healing Rituals", "Community", "Membership"
        ]);
      } else {
        // Outside trial period, only show essential items plus membership
        setVisibleItems([
          "Dashboard", "Journal", "AI Coaches", "Chakra Assessment", "Membership"
        ]);
      }
    }
  }, [user]);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  // Define a type for navigation items
  interface NavItem {
    name: string;
    path: string;
    icon: JSX.Element;
    dropdownItems?: Array<{
      name: string;
      path: string;
    }>;
  }

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: "Journal",
      path: "/journal",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      name: "AI Coaches",
      path: "#",
      icon: <MessageSquare className="h-5 w-5" />,
      dropdownItems: [
        { name: "Inner Child Coach", path: "/coach/inner_child" },
        { name: "Shadow Self Coach", path: "/coach/shadow_self" },
        { name: "Higher Self Coach", path: "/coach/higher_self" },
        { name: "Integration Coach", path: "/coach/integration" }
      ]
    },
    {
      name: "Chakra Assessment",
      path: "/chakra-assessment",
      icon: <ShieldCheck className="h-5 w-5" />
    },
    {
      name: "Healing Rituals",
      path: "/healing-rituals",
      icon: <Sparkles className="h-5 w-5" />
    },
    {
      name: "Community",
      path: "/community",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Membership",
      path: "/membership",
      icon: <CreditCard className="h-5 w-5" />
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center" onClick={closeMenu}>
              <span className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
                SoulSync
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.filter(item => visibleItems.includes(item.name)).map((item, index) => {
                if (item.dropdownItems) {
                  return (
                    <div key={index} className="relative group">
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-1"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="py-1">
                          {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                            <Link
                              key={dropdownIndex}
                              href={dropdownItem.path}
                              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                              onClick={closeMenu}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Link key={index} href={item.path} onClick={closeMenu}>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 ${isActive(item.path) ? "bg-neutral-100" : ""}`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
            
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">Hi, {user.username}</div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/onboarding">
                  <Button className="bg-[#483D8B] text-white hover:bg-opacity-90">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
            
            <button 
              className="md:hidden flex items-center p-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-neutral-900" />
              ) : (
                <Menu className="h-6 w-6 text-neutral-900" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 bg-white z-40 shadow-lg md:hidden overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                {navItems.filter(item => visibleItems.includes(item.name)).map((item, index) => {
                  if (item.dropdownItems) {
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center px-3 py-2 text-neutral-700 font-medium">
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                            <Link
                              key={dropdownIndex}
                              href={dropdownItem.path}
                              onClick={closeMenu}
                            >
                              <div className="px-3 py-2 rounded-md hover:bg-neutral-100 text-neutral-700">
                                {dropdownItem.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <Link key={index} href={item.path} onClick={closeMenu}>
                      <div className={`flex items-center px-3 py-2 rounded-md text-neutral-700 ${
                        isActive(item.path) ? "bg-neutral-100 font-medium" : ""
                      }`}>
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
                
                <div className="pt-4 border-t border-neutral-200 mt-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-3 py-2 text-neutral-700">Signed in as: <span className="font-medium">{user.username}</span></div>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Link href="/onboarding" onClick={closeMenu}>
                      <Button className="w-full bg-[#483D8B] text-white hover:bg-opacity-90">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
