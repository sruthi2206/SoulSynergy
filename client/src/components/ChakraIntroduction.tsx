import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ChakraIntroductionProps {
  onStartTest: () => void;
}

export default function ChakraIntroduction({ onStartTest }: ChakraIntroductionProps) {
  const instructions = [
    {
      number: 1,
      title: "Answer Honestly",
      description: "It's important to answer the questions honestly. Try to be as honest as possible about yourself, as that will get you the most accurate results."
    },
    {
      number: 2,
      title: "Answer Wisely",
      description: "Try not to answer them in terms of how you would like to see yourself, but in terms of how you actually are or have tended to be in the past."
    },
    {
      number: 3,
      title: "Answer Comfortably",
      description: "This questionnaire is used to create self-awareness in the user. It is important to answer this questionnaire when you are in a relaxed state for better results."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold mb-3">Steps and Instructions</h2>
        <p className="text-neutral-600">
          The questionnaire consists of 35 multiple-choice questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {instructions.map((instruction) => (
          <Card key={instruction.number} className="overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6 relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#483D8B]/10 flex items-center justify-center mb-4 text-[#483D8B] font-bold">
                  {instruction.number}
                </div>
                <h3 className="font-medium text-lg mb-3">{instruction.title}</h3>
                <p className="text-neutral-600 text-sm">{instruction.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={onStartTest}
          className="bg-[#483D8B] hover:bg-opacity-90 px-8 py-6"
          size="lg"
        >
          Begin Assessment
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}