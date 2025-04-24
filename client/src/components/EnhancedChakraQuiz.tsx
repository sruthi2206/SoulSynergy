import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { chakras } from "@/lib/chakras";

interface EnhancedChakraQuizProps {
  onComplete: (values: Record<string, number>) => void;
  isSubmitting: boolean;
}

// Questions for the 5-step chakra assessment
const questionsByStep = [
  // Step 1: Mind Level Questions
  [
    {
      id: "q1",
      text: "Do you prefer being planned and organized over being spontaneous and free-flowing?",
      chakra: "root",
      inverseScoring: false
    },
    {
      id: "q2",
      text: "Do you find it difficult to market yourself in a work setting and social gatherings?",
      chakra: "solarPlexus",
      inverseScoring: true
    },
    {
      id: "q3",
      text: "Are you often told to speak loudly and clearly?",
      chakra: "throat", 
      inverseScoring: true
    },
    {
      id: "q4",
      text: "Do you tend to hide your emotions, keeping a poker face?",
      chakra: "heart",
      inverseScoring: true
    },
    {
      id: "q5",
      text: "Are you often curious to know higher purposes of life such as enlightenment, super-consciousness, etc.?",
      chakra: "crown",
      inverseScoring: false
    },
    {
      id: "q6",
      text: "Do you like to ideate or brainstorm a lot to have creative solutions?",
      chakra: "thirdEye",
      inverseScoring: false
    },
    {
      id: "q7",
      text: "Do you feel that it's you against the world?",
      chakra: "root",
      inverseScoring: true
    },
  ],
  // Step 2: Thought Process Questions
  [
    {
      id: "q8",
      text: "Do you feel like thinking analytically comes to you naturally?",
      chakra: "thirdEye",
      inverseScoring: false
    },
    {
      id: "q9",
      text: "Do you like to follow instructions to a tee?",
      chakra: "root",
      inverseScoring: false
    },
    {
      id: "q10",
      text: "Do you feel that all events are meaningful and intended?",
      chakra: "crown",
      inverseScoring: false
    },
    {
      id: "q11",
      text: "Do you feel that the universe is a safe place?",
      chakra: "root",
      inverseScoring: false
    },
    {
      id: "q12",
      text: "Are you comfortable carrying out routine activities such as daily chores, paying bills, etc.?",
      chakra: "root",
      inverseScoring: false
    },
    {
      id: "q13",
      text: "Are you mostly able to be assertive when necessary?",
      chakra: "solarPlexus",
      inverseScoring: false
    },
    {
      id: "q14",
      text: "Do you tend to keep people at a distance?",
      chakra: "heart",
      inverseScoring: true
    },
  ],
  // Step 3: Practical Implementation Questions
  [
    {
      id: "q15",
      text: "Do you dislike engaging with abstract topics like philosophy and spirituality?",
      chakra: "crown",
      inverseScoring: true
    },
    {
      id: "q16",
      text: "Do you feel good about expressing yourself through any type of media eg. public speaking, singing, fine art, writing, etc.?",
      chakra: "throat",
      inverseScoring: false
    },
    {
      id: "q17",
      text: "Do you feel guilty when it comes to indulging in pleasurable activities e.g. self-care, and recreation?",
      chakra: "sacral",
      inverseScoring: true
    },
    {
      id: "q18",
      text: "Do you frequently rely on your own intuition and logical frameworks to make decisions?",
      chakra: "thirdEye",
      inverseScoring: false
    },
    {
      id: "q19",
      text: "Do you find it easy to introduce yourself socially like in school, work, social gatherings, etc.?",
      chakra: "throat",
      inverseScoring: false
    },
    {
      id: "q20",
      text: "Do you express your feelings freely, letting them flow without holding back?",
      chakra: "heart",
      inverseScoring: false
    },
  ],
  // Step 4: Hypothetical Scenarios
  [
    {
      id: "hs1",
      text: "Imagine you're in a room full of strangers at an important networking event. How likely are you to approach people and introduce yourself?",
      chakra: "throat",
      inverseScoring: false
    },
    {
      id: "hs2",
      text: "Your friend is going through a difficult emotional time. How comfortable are you providing emotional support and expressing empathy?",
      chakra: "heart",
      inverseScoring: false
    },
    {
      id: "hs3",
      text: "You're given a complex problem to solve at work with little guidance. How confident are you in your ability to find a creative solution?",
      chakra: "thirdEye",
      inverseScoring: false
    },
    {
      id: "hs4",
      text: "You suddenly need to relocate to a new city for work. How secure do you feel about this major life change?",
      chakra: "root",
      inverseScoring: false
    },
    {
      id: "hs5",
      text: "You're asked to lead a project and make important decisions. How comfortable are you in this position of authority?",
      chakra: "solarPlexus",
      inverseScoring: false
    },
  ],
  // Step 5: Reflection and Integration
  [
    {
      id: "r1",
      text: "How consistently do you practice what you consider important for your personal growth?",
      chakra: "all",
      inverseScoring: false
    },
    {
      id: "r2",
      text: "When faced with challenges, how often do you reflect on lessons rather than feeling victimized?",
      chakra: "crown",
      inverseScoring: false
    },
    {
      id: "r3",
      text: "How effectively do you balance your practical responsibilities with your need for joy and creativity?",
      chakra: "sacral",
      inverseScoring: false
    },
    {
      id: "r4",
      text: "How well do you maintain your personal boundaries while remaining open to others?",
      chakra: "heart",
      inverseScoring: false
    },
    {
      id: "r5",
      text: "How connected do you feel to a sense of purpose or deeper meaning in your life?",
      chakra: "crown",
      inverseScoring: false
    },
  ]
];

// Options for the Likert scale
const options = [
  { value: "1", label: "Never" },
  { value: "2", label: "Rarely" },
  { value: "3", label: "Sometimes" },
  { value: "4", label: "Often" },
  { value: "5", label: "Always" }
];

export default function EnhancedChakraQuiz({ onComplete, isSubmitting }: EnhancedChakraQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepComplete, setStepComplete] = useState<boolean[]>(Array(questionsByStep.length).fill(false));
  
  // Determine if current question has been answered
  const currentQuestion = questionsByStep[currentStep][currentQuestionIndex];
  const currentQuestionAnswered = !!answers[currentQuestion?.id];
  
  // Calculate total questions and progress
  const totalQuestionsInStep = questionsByStep[currentStep].length;
  const currentProgress = ((currentQuestionIndex + 1) / totalQuestionsInStep) * 100;
  
  // Calculate overall progress across all steps
  const totalQuestions = questionsByStep.reduce((acc, step) => acc + step.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const overallProgress = (answeredQuestions / totalQuestions) * 100;
  
  // Handle answer selection
  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Auto-advance to next question after short delay
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestionsInStep - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setStepComplete(prev => {
          const newStepComplete = [...prev];
          newStepComplete[currentStep] = true;
          return newStepComplete;
        });
        
        // If there are more steps, advance to next step
        if (currentStep < questionsByStep.length - 1) {
          setCurrentStep(currentStep + 1);
          setCurrentQuestionIndex(0);
        }
      }
    }, 300);
  };
  
  // Handle previous question/step navigation
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentQuestionIndex(questionsByStep[currentStep - 1].length - 1);
    }
  };
  
  // Calculate chakra values from answers
  const calculateChakraValues = () => {
    const chakraScores: Record<string, number[]> = {
      root: [],
      sacral: [],
      solarPlexus: [],
      heart: [],
      throat: [],
      thirdEye: [],
      crown: []
    };
    
    // Process all answers
    Object.entries(answers).forEach(([questionId, value]) => {
      // Find the question
      for (const step of questionsByStep) {
        const question = step.find(q => q.id === questionId);
        if (question) {
          // Specific chakra or all chakras
          const numerical = parseInt(value, 10);
          const score = question.inverseScoring ? 6 - numerical : numerical;
          
          if (question.chakra === 'all') {
            // Apply to all chakras
            Object.keys(chakraScores).forEach(chakra => {
              chakraScores[chakra].push(score);
            });
          } else {
            // Apply to specific chakra
            chakraScores[question.chakra].push(score);
          }
          break;
        }
      }
    });
    
    // Calculate average for each chakra and scale to 1-10
    const result: Record<string, number> = {};
    Object.entries(chakraScores).forEach(([chakra, scores]) => {
      if (scores.length === 0) {
        result[chakra] = 5; // Default if no scores
      } else {
        const avg = scores.reduce((sum, curr) => sum + curr, 0) / scores.length;
        // Scale from 1-5 to 1-10
        result[chakra] = Math.round((avg * 2) * 10) / 10;
      }
    });
    
    return result;
  };
  
  // Handle completion of assessment
  const handleComplete = () => {
    const chakraValues = calculateChakraValues();
    onComplete(chakraValues);
  };
  
  // Check if assessment is complete
  const isAssessmentComplete = stepComplete.every(step => step);
  
  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return "Mind Level Assessment";
      case 1:
        return "Thought Process Assessment";
      case 2:
        return "Practical Implementation";
      case 3:
        return "Situational Response";
      case 4:
        return "Reflection & Integration";
      default:
        return "Chakra Assessment";
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-500">
            Step {currentStep + 1} of {questionsByStep.length}
          </span>
          <span className="text-sm text-neutral-500">
            Question {currentQuestionIndex + 1} of {totalQuestionsInStep}
          </span>
        </div>
        <Progress value={currentProgress} className="h-2" />
        
        <div className="flex justify-between mt-2">
          {questionsByStep.map((_, index) => (
            <div 
              key={index}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                index < currentStep 
                  ? "bg-green-100 text-green-600 border border-green-300" 
                  : index === currentStep 
                    ? "bg-[#483D8B] text-white"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Current question card */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle>{getStepTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-6">{currentQuestion.text}</h3>
              
              <RadioGroup 
                value={answers[currentQuestion.id] || ""}
                className="space-y-3"
                onValueChange={handleAnswer}
              >
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`${currentQuestion.id}-${option.value}`}
                    />
                    <Label 
                      htmlFor={`${currentQuestion.id}-${option.value}`}
                      className="flex-1 py-2 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0 && currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {(currentStep === questionsByStep.length - 1 && 
             currentQuestionIndex === totalQuestionsInStep - 1 && 
             currentQuestionAnswered) && (
            <Button 
              onClick={handleComplete}
              className="bg-[#483D8B] hover:bg-opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Complete Assessment
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Assessment summary card (visible when complete) */}
      {isAssessmentComplete && (
        <Card className="bg-neutral-50 border-dashed">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Assessment Progress</h3>
            <Progress value={overallProgress} className="h-3 mb-4" />
            <p className="text-neutral-600 text-sm">
              You've completed {Math.round(overallProgress)}% of the assessment. Review your answers or complete any remaining questions to receive your chakra profile.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}