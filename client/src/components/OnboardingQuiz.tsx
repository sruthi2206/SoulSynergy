import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { chakras } from "@/lib/chakras";

interface OnboardingQuizProps {
  onComplete: (chakraValues: Record<string, number>) => void;
  isSubmitting: boolean;
}

interface Question {
  id: number;
  text: string;
  chakra: string;
  reverse?: boolean;
}

// Questions for chakra assessment
const questions: Question[] = [
  // Root Chakra
  { id: 1, text: "I feel grounded and secure in my daily life.", chakra: "root" },
  { id: 2, text: "I often worry about my basic needs (food, shelter, finances).", chakra: "root", reverse: true },
  
  // Sacral Chakra
  { id: 3, text: "I feel comfortable expressing my emotions and creativity.", chakra: "sacral" },
  { id: 4, text: "I struggle with guilt or shame around pleasure and enjoyment.", chakra: "sacral", reverse: true },
  
  // Solar Plexus Chakra
  { id: 5, text: "I feel confident in my personal power and decision-making.", chakra: "solarPlexus" },
  { id: 6, text: "I often let others make decisions for me or doubt my abilities.", chakra: "solarPlexus", reverse: true },
  
  // Heart Chakra
  { id: 7, text: "I can give and receive love with ease.", chakra: "heart" },
  { id: 8, text: "I hold onto past hurts and find it difficult to forgive.", chakra: "heart", reverse: true },
  
  // Throat Chakra
  { id: 9, text: "I express my truth freely and communicate clearly.", chakra: "throat" },
  { id: 10, text: "I often feel unheard or struggle to speak up for myself.", chakra: "throat", reverse: true },
  
  // Third Eye Chakra
  { id: 11, text: "I trust my intuition and inner wisdom.", chakra: "thirdEye" },
  { id: 12, text: "I find it difficult to see the bigger picture or trust my insights.", chakra: "thirdEye", reverse: true },
  
  // Crown Chakra
  { id: 13, text: "I feel connected to something greater than myself.", chakra: "crown" },
  { id: 14, text: "I often feel disconnected from meaning or purpose in life.", chakra: "crown", reverse: true }
];

export default function OnboardingQuiz({ onComplete, isSubmitting }: OnboardingQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [chakraValues, setChakraValues] = useState<Record<string, number>>({
    root: 5,
    sacral: 5,
    solarPlexus: 5,
    heart: 5,
    throat: 5,
    thirdEye: 5,
    crown: 5
  });
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Handle answer selection
  const handleAnswer = (value: number[]) => {
    const selectedValue = value[0];
    
    // Update answers
    setAnswers({
      ...answers,
      [currentQuestion.id]: selectedValue
    });
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate chakra values and complete
      calculateChakraValues();
    }
  };
  
  // Calculate chakra values from answers
  const calculateChakraValues = () => {
    const chakraTotals: Record<string, { sum: number; count: number }> = {
      root: { sum: 0, count: 0 },
      sacral: { sum: 0, count: 0 },
      solarPlexus: { sum: 0, count: 0 },
      heart: { sum: 0, count: 0 },
      throat: { sum: 0, count: 0 },
      thirdEye: { sum: 0, count: 0 },
      crown: { sum: 0, count: 0 }
    };
    
    // Sum up answers by chakra
    questions.forEach(question => {
      if (answers[question.id] !== undefined) {
        const value = question.reverse ? 11 - answers[question.id] : answers[question.id];
        chakraTotals[question.chakra].sum += value;
        chakraTotals[question.chakra].count++;
      }
    });
    
    // Calculate averages
    const result: Record<string, number> = {};
    Object.entries(chakraTotals).forEach(([chakra, { sum, count }]) => {
      result[chakra] = count > 0 ? Math.round(sum / count) : 5;
    });
    
    setChakraValues(result);
    onComplete(result);
  };
  
  // Go back to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Get chakra color
  const getChakraColor = (chakraKey: string) => {
    const chakra = chakras.find(c => c.key === chakraKey);
    return chakra ? chakra.color : "#888";
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#483D8B]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>Start</span>
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Complete</span>
        </div>
      </div>
      
      {/* Question card */}
      <div className="mb-6">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center mb-4">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getChakraColor(currentQuestion.chakra) }}
                ></div>
                <div className="text-xs text-neutral-500">
                  {chakras.find(c => c.key === currentQuestion.chakra)?.name} Chakra
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-6">{currentQuestion.text}</h3>
              
              <Slider
                defaultValue={[5]}
                min={1}
                max={10}
                step={1}
                onValueCommit={handleAnswer}
                className="mb-2"
              />
              
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Strongly Disagree</span>
                <span>Neutral</span>
                <span>Strongly Agree</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          Previous
        </Button>
        {currentQuestionIndex === questions.length - 1 && (
          <Button 
            onClick={calculateChakraValues}
            className="bg-[#483D8B] hover:bg-opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Complete Assessment"}
          </Button>
        )}
      </div>
    </div>
  );
}
