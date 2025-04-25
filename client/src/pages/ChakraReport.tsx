import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, ArrowLeft, MessageCircle } from "lucide-react";
import { chakras, getChakraStatus, getOverallChakraBalance, getChakraRecommendations } from "@/lib/chakras";
import { getCoachRecommendations } from "@/lib/chakraCoaching";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Helper function to format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export default function ChakraReport() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPdf, setLoadingPdf] = useState(false);
  
  // Reference to the report container
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Function to generate and download PDF report
  const generatePdfReport = async () => {
    setLoadingPdf(true);
    
    try {
      if (!reportRef.current) {
        throw new Error("Report element not found");
      }
      
      // Generate PDF from the report element
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm (210mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(`Page ${i} of ${pageCount} | © SoulSync ${new Date().getFullYear()}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {
          align: 'center'
        });
      }
      
      // Save the PDF
      pdf.save(`SoulSync-ChakraReport-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast({
        title: "Report Generated",
        description: "Your chakra report has been downloaded as a PDF file.",
      });
    } catch (error) {
      console.error("Error generating PDF report:", error);
      toast({
        title: "Error Generating Report",
        description: "There was a problem creating your PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPdf(false);
    }
  };
  
  // Fetch user's chakra profile
  const { data: chakraProfile, isLoading: isLoadingChakraProfile } = useQuery({
    queryKey: ['/api/users', user?.id, 'chakra-profile'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await fetch(`/api/users/${user.id}/chakra-profile`);
        if (!res.ok) {
          if (res.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch chakra profile');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching chakra profile:', error);
        return null;
      }
    },
    enabled: !!user,
  });
  
  // Prepare chakra values from the profile
  const chakraValues = chakraProfile ? {
    crown: chakraProfile.crownChakra,
    thirdEye: chakraProfile.thirdEyeChakra,
    throat: chakraProfile.throatChakra,
    heart: chakraProfile.heartChakra,
    solarPlexus: chakraProfile.solarPlexusChakra,
    sacral: chakraProfile.sacralChakra,
    root: chakraProfile.rootChakra
  } : {
    crown: 5,
    thirdEye: 5,
    throat: 5,
    heart: 5,
    solarPlexus: 5,
    sacral: 5,
    root: 5
  };

  type ChakraKey = keyof typeof chakraValues;

  // Get overall chakra balance assessment
  const overallBalance = getOverallChakraBalance(chakraValues);
  
  // Get personalized recommendations
  const recommendations = getChakraRecommendations(chakraValues);
  
  // Get coach recommendations based on chakra assessment
  const coachingRecommendations = getCoachRecommendations(chakraValues);

  // Create a function to generate text-based report as fallback
  const generateTextReport = () => {
    setLoadingPdf(true);
    
    setTimeout(() => {
      // Create a simple text report
      const reportText = `
# SOULSYNC CHAKRA ASSESSMENT REPORT
Generated for: ${user?.name || 'User'}
Date: ${formatDate(new Date())}

## OVERALL CHAKRA BALANCE
Current Balance Level: ${overallBalance.status}
Balance Score: ${overallBalance.score}/10

${overallBalance.description}

## INDIVIDUAL CHAKRA ANALYSIS

${chakras.map(chakra => {
  const key = chakra.key as ChakraKey;
  const status = getChakraStatus(chakraValues[key]);
  return `
### ${chakra.name.toUpperCase()} (${chakra.sanskritName})
Current Level: ${chakraValues[key]}/10 - ${status.status}

${status.description}
`;
}).join('\n')}

## PERSONALIZED CHAKRA HEALING RECOMMENDATIONS

${Object.entries(recommendations).map(([chakra, recs]) => {
  const chakraInfo = chakras.find(c => c.key === chakra);
  return `
### For ${chakraInfo?.name || chakra} Chakra:
${Array.isArray(recs) ? recs.join('\n') : String(recs || '')}
`;
}).join('\n')}

This report was generated by SoulSync's AI-powered chakra assessment system.

© SoulSync ${new Date().getFullYear()}
      `;
      
      // Create a blob and download link
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chakra-report-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Generated",
        description: "Your detailed chakra assessment report has been downloaded.",
      });
      
      setLoadingPdf(false);
    }, 2000);
  };
  
  if (!user) {
    return null;
  }
  
  if (isLoadingChakraProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
      </div>
    );
  }
  
  if (!chakraProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">No Chakra Assessment Found</h2>
              <p className="text-neutral-600 mb-6">
                You need to complete a chakra assessment first before generating a report.
              </p>
              <Button onClick={() => setLocation('/chakra-assessment')}>
                Go to Chakra Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        {/* PDF capture element */}
        <div ref={reportRef}>
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
              Your Chakra Assessment Report
            </h1>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Generated on {formatDate(new Date())}
            </p>
            <Separator className="my-6 max-w-md mx-auto" />
          </motion.div>
        
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">Overview</h2>
            <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-5 rounded-lg mb-6">
              <h3 className="text-xl font-medium mb-3 text-center">Overall Chakra Balance</h3>
              <div className="grid place-items-center mb-4">
                <div className="relative w-32 h-32 rounded-full bg-white shadow-inner flex items-center justify-center flex-col">
                  <div className="absolute inset-2 rounded-full border-4 border-[#483D8B] border-opacity-20"></div>
                  <div className="text-4xl font-bold text-[#483D8B]">{overallBalance.score}</div>
                  <div className="text-xs text-gray-500">out of 10</div>
                </div>
              </div>
              <p className="text-center font-medium text-lg mb-2 text-[#483D8B]">{overallBalance.status}</p>
              <p className="text-center text-neutral-600">{overallBalance.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <h3 className="text-lg font-medium mb-3 text-center">Strongest Energy</h3>
                {(() => {
                  const entries = Object.entries(chakraValues);
                  const [strongest] = [...entries].sort((a, b) => b[1] - a[1])[0];
                  const chakraInfo = chakras.find(c => c.key === strongest);
                  return (
                    <div className="text-center">
                      <div 
                        className="w-20 h-20 mx-auto rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: chakraInfo?.color }}
                      >
                        {chakraValues[strongest as keyof typeof chakraValues]}
                      </div>
                      <p className="text-xl font-semibold" style={{ color: chakraInfo?.color }}>{chakraInfo?.name}</p>
                      <p className="text-sm text-neutral-600">{chakraInfo?.sanskritName}</p>
                    </div>
                  );
                })()}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <h3 className="text-lg font-medium mb-3 text-center">Needs Attention</h3>
                {(() => {
                  const entries = Object.entries(chakraValues);
                  const [needsAttention] = [...entries].sort((a, b) => 
                    Math.abs(b[1] - 5) - Math.abs(a[1] - 5)
                  )[0];
                  const chakraInfo = chakras.find(c => c.key === needsAttention);
                  return (
                    <div className="text-center">
                      <div 
                        className="w-20 h-20 mx-auto rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: chakraInfo?.color }}
                      >
                        {chakraValues[needsAttention as keyof typeof chakraValues]}
                      </div>
                      <p className="text-xl font-semibold" style={{ color: chakraInfo?.color }}>{chakraInfo?.name}</p>
                      <p className="text-sm text-neutral-600">{chakraInfo?.sanskritName}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button 
                className="bg-[#483D8B] hover:bg-[#3D3276]"
                onClick={generatePdfReport} 
                disabled={loadingPdf}
              >
                {loadingPdf ? (
                  <>
                    <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download as PDF
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/chakra-assessment')}
              >
                Update Assessment
              </Button>
            </div>
          </div>
          
          {/* Tabs for detailed information */}
          <div className="mb-8">
            <Tabs defaultValue="chakras">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="chakras">Chakra Details</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="coaching">AI Coaching</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chakras" className="space-y-6">
                {chakras.map(chakra => {
                  const key = chakra.key as ChakraKey;
                  const status = getChakraStatus(chakraValues[key]);
                  return (
                    <Card key={chakra.key}>
                      <CardHeader className="pb-3 border-l-4" style={{ borderColor: chakra.color }}>
                        <CardTitle className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full mr-3"
                            style={{ backgroundColor: chakra.color }}
                          ></div>
                          {chakra.name} ({chakra.sanskritName})
                        </CardTitle>
                        <CardDescription>
                          Current Status: <span className="font-medium">{status.status}</span> - Value: {chakraValues[key]}/10
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-neutral-700 mb-3">{status.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Physical Associations</h4>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {Array.isArray(chakra.physicalAssociations) ? 
                                chakra.physicalAssociations.map((item, index) => (
                                  <span key={index} className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                                    {item}
                                  </span>
                                )) : (
                                  <span className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                                    {String(chakra.physicalAssociations || '')}
                                  </span>
                                )
                              }
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Characteristics</h4>
                            <div className="text-sm">
                              {status.level === "balanced" ? (
                                <p className="font-medium text-green-600">Balanced</p>
                              ) : status.level === "underactive" ? (
                                <p className="font-medium text-amber-600">Underactive</p>
                              ) : (
                                <p className="font-medium text-red-600">Overactive</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-6">
                {Object.entries(recommendations).map(([chakraKey, recs]) => {
                  const chakraInfo = chakras.find(c => c.key === chakraKey);
                  if (!chakraInfo || !Array.isArray(recs) || recs.length === 0) return null;
                  
                  return (
                    <Card key={chakraKey}>
                      <CardHeader className="pb-3 border-l-4" style={{ borderColor: chakraInfo.color }}>
                        <CardTitle className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full mr-3"
                            style={{ backgroundColor: chakraInfo.color }}
                          ></div>
                          Recommendations for {chakraInfo.name}
                        </CardTitle>
                        <CardDescription>
                          Personalized healing recommendations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-3">
                          {recs.map((rec, idx) => (
                            <li key={idx} className="p-3 bg-neutral-50 rounded-lg">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
              
              <TabsContent value="coaching" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">AI Coach Guidance</CardTitle>
                    <CardDescription>
                      Get personalized coaching based on your assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <h3 className="text-lg font-medium mb-3">Your Coaching Recommendation</h3>
                        <p className="mb-4">{coachingRecommendations.generalRecommendation}</p>
                        
                        <div className="flex items-center gap-4 p-3 bg-[#483D8B]/10 rounded-lg mb-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: "#483D8B" }}
                          >
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">Recommended Coach</p>
                            <p className="text-sm text-neutral-600">{coachingRecommendations.recommendedCoach} Coach</p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          onClick={() => setLocation(`/coach/${coachingRecommendations.recommendedCoach}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Start Coaching Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/chakra-assessment')}
          >
            Update Assessment
          </Button>
          <Button 
            onClick={generateTextReport} 
            disabled={loadingPdf}
          >
            {loadingPdf ? (
              <>
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-current animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Download Text Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}