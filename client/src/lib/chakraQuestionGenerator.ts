// This file contains utilities for dynamically generating chakra assessment questions

import { chakras } from "./chakras";

// Valid chakra keys
export type ChakraKey = "root" | "sacral" | "solarPlexus" | "heart" | "throat" | "thirdEye" | "crown" | "all";

// Question category types
export type QuestionCategory = "mind" | "emotional" | "physical" | "situational" | "reflection";

// Define the structure of a chakra assessment question
export interface ChakraQuestion {
  id: string;
  text: string;
  chakra: ChakraKey;
  inverseScoring: boolean;
  category: QuestionCategory;
}

// Define the structure of a response option
export interface QuestionOption {
  value: string;
  label: string;
  description: string;
}

// Template type with proper category
interface QuestionTemplate {
  template: string;
  inverseScoring: boolean;
  category: QuestionCategory;
}

// Common question templates for each chakra
const questionTemplates: Partial<Record<ChakraKey, QuestionTemplate[]>> = {
  root: [
    { template: "How often do you feel financially secure and stable?", inverseScoring: false, category: "mind" },
    { template: "How easily do you adjust to unexpected changes in your routine?", inverseScoring: false, category: "emotional" },
    { template: "How often do you feel physically safe and secure in your environment?", inverseScoring: false, category: "physical" },
    { template: "How comfortable would you feel if you had to completely relocate to a new area?", inverseScoring: false, category: "situational" },
    { template: "How confident do you feel about your ability to meet your basic needs?", inverseScoring: false, category: "reflection" }
  ],
  sacral: [
    { template: "How comfortable are you expressing your emotions to others?", inverseScoring: false, category: "mind" },
    { template: "How often do you engage in creative activities that bring you joy?", inverseScoring: false, category: "emotional" },
    { template: "How connected do you feel to your body's needs and desires?", inverseScoring: false, category: "physical" },
    { template: "How comfortable would you feel trying a completely new form of creative expression?", inverseScoring: false, category: "situational" },
    { template: "How balanced is your approach to work and pleasure in your life?", inverseScoring: false, category: "reflection" }
  ],
  solarPlexus: [
    { template: "How confident do you feel when making important decisions?", inverseScoring: false, category: "mind" },
    { template: "How comfortable are you with asserting your needs and boundaries?", inverseScoring: false, category: "emotional" },
    { template: "How often do you feel energized and motivated to achieve your goals?", inverseScoring: false, category: "physical" },
    { template: "How comfortable would you feel taking a leadership role in a group project?", inverseScoring: false, category: "situational" },
    { template: "How empowered do you feel in directing the course of your life?", inverseScoring: false, category: "reflection" }
  ],
  heart: [
    { template: "How easily can you forgive others who have hurt you?", inverseScoring: false, category: "mind" },
    { template: "How comfortable are you receiving love and care from others?", inverseScoring: false, category: "emotional" },
    { template: "How often do you practice self-compassion when you make mistakes?", inverseScoring: false, category: "physical" },
    { template: "How comfortable would you feel supporting a friend through an emotional crisis?", inverseScoring: false, category: "situational" },
    { template: "How balanced is your ability to give and receive love in relationships?", inverseScoring: false, category: "reflection" }
  ],
  throat: [
    { template: "How comfortable are you speaking your truth, even when it might be unpopular?", inverseScoring: false, category: "mind" },
    { template: "How well do you communicate your needs and boundaries to others?", inverseScoring: false, category: "emotional" },
    { template: "How easily can you express yourself through writing, speaking, or other forms?", inverseScoring: false, category: "physical" },
    { template: "How comfortable would you feel giving a presentation to a large group?", inverseScoring: false, category: "situational" },
    { template: "How authentic do you feel your self-expression is in daily life?", inverseScoring: false, category: "reflection" }
  ],
  thirdEye: [
    { template: "How often do you trust your intuition when making decisions?", inverseScoring: false, category: "mind" },
    { template: "How easily can you visualize future possibilities and outcomes?", inverseScoring: false, category: "emotional" },
    { template: "How often do you notice subtle patterns and connections in your life?", inverseScoring: false, category: "physical" },
    { template: "How confident would you feel solving a complex problem with limited information?", inverseScoring: false, category: "situational" },
    { template: "How clear is your vision for your future and life purpose?", inverseScoring: false, category: "reflection" }
  ],
  crown: [
    { template: "How connected do you feel to something greater than yourself?", inverseScoring: false, category: "mind" },
    { template: "How often do you experience a sense of peace and transcendence?", inverseScoring: false, category: "emotional" },
    { template: "How interested are you in exploring spiritual or philosophical questions?", inverseScoring: false, category: "physical" },
    { template: "How would you respond to a conversation about life's deeper meaning and purpose?", inverseScoring: false, category: "situational" },
    { template: "How integrated do you feel your spiritual beliefs are with your daily actions?", inverseScoring: false, category: "reflection" }
  ]
};

// Inverse question templates
const inverseQuestionTemplates: Partial<Record<ChakraKey, QuestionTemplate[]>> = {
  root: [
    { template: "How often do you feel anxious about financial security?", inverseScoring: true, category: "mind" },
    { template: "How easily do you become destabilized by unexpected changes?", inverseScoring: true, category: "emotional" },
    { template: "How frequently do you feel physically unsafe in your environment?", inverseScoring: true, category: "physical" }
  ],
  sacral: [
    { template: "How difficult is it for you to express your emotions freely?", inverseScoring: true, category: "mind" },
    { template: "How often do you feel disconnected from joy and pleasure?", inverseScoring: true, category: "emotional" },
    { template: "How frequently do you ignore your body's signals and needs?", inverseScoring: true, category: "physical" }
  ],
  solarPlexus: [
    { template: "How often do you doubt your abilities and decisions?", inverseScoring: true, category: "mind" },
    { template: "How difficult is it for you to assert your needs and boundaries?", inverseScoring: true, category: "emotional" },
    { template: "How frequently do you feel powerless in situations?", inverseScoring: true, category: "physical" }
  ],
  heart: [
    { template: "How difficult is it for you to open up emotionally to others?", inverseScoring: true, category: "mind" },
    { template: "How often do you hold grudges against those who have hurt you?", inverseScoring: true, category: "emotional" },
    { template: "How frequently do you criticize yourself harshly?", inverseScoring: true, category: "physical" }
  ],
  throat: [
    { template: "How often do you hold back from expressing your true thoughts?", inverseScoring: true, category: "mind" },
    { template: "How difficult is it for you to speak up in group settings?", inverseScoring: true, category: "emotional" },
    { template: "How frequently do others misunderstand your communication?", inverseScoring: true, category: "physical" }
  ],
  thirdEye: [
    { template: "How often do you doubt your intuition and inner guidance?", inverseScoring: true, category: "mind" },
    { template: "How difficult is it for you to see multiple perspectives on an issue?", inverseScoring: true, category: "emotional" },
    { template: "How frequently do you overlook patterns and synchronicities?", inverseScoring: true, category: "physical" }
  ],
  crown: [
    { template: "How often do you feel disconnected from any higher purpose?", inverseScoring: true, category: "mind" },
    { template: "How difficult is it for you to find meaning in challenging situations?", inverseScoring: true, category: "emotional" },
    { template: "How frequently do you feel a sense of isolation from the world?", inverseScoring: true, category: "physical" }
  ]
};

// Reflection question that includes chakra property
interface ReflectionQuestion {
  template: string;
  chakra: ChakraKey;
  inverseScoring: boolean;
  category: QuestionCategory;
}

// Additional reflection questions that apply to all chakras
const reflectionQuestions: ReflectionQuestion[] = [
  { template: "How balanced do you feel overall in your physical and material needs?", chakra: "root", inverseScoring: false, category: "reflection" },
  { template: "How would you rate your overall emotional and creative wellbeing?", chakra: "sacral", inverseScoring: false, category: "reflection" },
  { template: "How empowered do you feel in your life choices and personal authority?", chakra: "solarPlexus", inverseScoring: false, category: "reflection" },
  { template: "How fulfilled do you feel in your relationships and capacity to give/receive love?", chakra: "heart", inverseScoring: false, category: "reflection" },
  { template: "How authentic do you feel in expressing yourself and your truth to the world?", chakra: "throat", inverseScoring: false, category: "reflection" },
  { template: "How clear do you feel about your life purpose and direction?", chakra: "thirdEye", inverseScoring: false, category: "reflection" },
  { template: "How connected do you feel to a sense of meaning and spiritual wholeness?", chakra: "crown", inverseScoring: false, category: "reflection" }
];

// Generate a set of questions for each step of the assessment
export function generateQuestions(): ChakraQuestion[][] {
  const steps: ChakraQuestion[][] = [[], [], [], [], []];
  
  // Helper function to convert string to ChakraKey safely
  const toChakraKey = (key: string): ChakraKey => {
    if (
      key === "root" || 
      key === "sacral" || 
      key === "solarPlexus" || 
      key === "heart" || 
      key === "throat" || 
      key === "thirdEye" || 
      key === "crown" || 
      key === "all"
    ) {
      return key;
    }
    return "root"; // fallback
  };
  
  // Step 1: Mind Level Questions (Root, Sacral, Solar Plexus)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const mindQuestions = templates.filter(q => q.category === "mind");
    const question = mindQuestions[0]; // Take first mind question for each chakra
    
    if (question) {
      steps[0].push({
        id: `${chakraKey}_mind_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category
      });
    }
    
    // Add some inverse questions for variety
    if (inverseQuestionTemplates[chakraKey]) {
      const inverseQuestion = inverseQuestionTemplates[chakraKey].find(q => q.category === "mind");
      if (inverseQuestion) {
        steps[0].push({
          id: `${chakraKey}_mind_inverse_1`,
          text: inverseQuestion.template,
          chakra: chakraKey,
          inverseScoring: inverseQuestion.inverseScoring,
          category: inverseQuestion.category
        });
      }
    }
  });
  
  // Step 2: Emotional Level Questions (Heart, Throat)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const emotionalQuestions = templates.filter(q => q.category === "emotional");
    const question = emotionalQuestions[0]; // Take first emotional question for each chakra
    
    if (question) {
      steps[1].push({
        id: `${chakraKey}_emotional_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category
      });
    }
    
    // Add some inverse questions for variety
    if (inverseQuestionTemplates[chakraKey]) {
      const inverseQuestion = inverseQuestionTemplates[chakraKey].find(q => q.category === "emotional");
      if (inverseQuestion) {
        steps[1].push({
          id: `${chakraKey}_emotional_inverse_1`,
          text: inverseQuestion.template,
          chakra: chakraKey,
          inverseScoring: inverseQuestion.inverseScoring,
          category: inverseQuestion.category
        });
      }
    }
  });
  
  // Step 3: Physical Level Questions (All chakras)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const physicalQuestions = templates.filter(q => q.category === "physical");
    const question = physicalQuestions[0]; // Take first physical question for each chakra
    
    if (question) {
      steps[2].push({
        id: `${chakraKey}_physical_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category
      });
    }
  });
  
  // Step 4: Situational Questions (All chakras)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const situationalQuestions = templates.filter(q => q.category === "situational");
    const question = situationalQuestions[0]; // Take first situational question for each chakra
    
    if (question) {
      steps[3].push({
        id: `${chakraKey}_situational_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category
      });
    }
  });
  
  // Step 5: Reflection Questions (All chakras)
  reflectionQuestions.forEach((question, index) => {
    steps[4].push({
      id: `reflection_${index + 1}`,
      text: question.template,
      chakra: question.chakra,
      inverseScoring: question.inverseScoring,
      category: question.category
    });
  });
  
  return steps;
}

// Get appropriate response options based on question type
export function getOptionsForQuestion(question: ChakraQuestion): QuestionOption[] {
  // For situational questions
  if (question.category === "situational") {
    return [
      { value: "1", label: "Very uncomfortable", description: "I would avoid this completely" },
      { value: "2", label: "Somewhat uncomfortable", description: "I would feel anxious but try" },
      { value: "3", label: "Neutral", description: "I could manage this situation" },
      { value: "4", label: "Somewhat comfortable", description: "I would feel at ease" },
      { value: "5", label: "Very comfortable", description: "I would thrive in this situation" }
    ];
  }
  
  // For reflection questions
  if (question.category === "reflection") {
    return [
      { value: "1", label: "Not at all", description: "This is a significant challenge for me" },
      { value: "2", label: "Slightly", description: "I struggle with this frequently" },
      { value: "3", label: "Moderately", description: "I have mixed success with this" },
      { value: "4", label: "Considerably", description: "I do this well most of the time" },
      { value: "5", label: "Completely", description: "This is a consistent strength of mine" }
    ];
  }
  
  // For mind, emotional, physical questions
  if (question.inverseScoring) {
    return [
      { value: "1", label: "Never", description: "This doesn't apply to me at all" },
      { value: "2", label: "Rarely", description: "This applies to me occasionally" },
      { value: "3", label: "Sometimes", description: "This applies to me about half the time" },
      { value: "4", label: "Often", description: "This applies to me most of the time" },
      { value: "5", label: "Always", description: "This applies to me consistently" }
    ];
  } else {
    return [
      { value: "1", label: "Never", description: "This doesn't apply to me at all" },
      { value: "2", label: "Rarely", description: "This applies to me occasionally" },
      { value: "3", label: "Sometimes", description: "This applies to me about half the time" },
      { value: "4", label: "Often", description: "This applies to me most of the time" },
      { value: "5", label: "Always", description: "This applies to me consistently" }
    ];
  }
}

// Get step title based on step index
export function getStepTitle(step: number): string {
  switch (step) {
    case 0:
      return "Mind Level Assessment";
    case 1:
      return "Emotional Awareness";
    case 2:
      return "Physical Experience";
    case 3:
      return "Situational Response";
    case 4:
      return "Reflection & Integration";
    default:
      return "Chakra Assessment";
  }
}

// Get step description based on step index
export function getStepDescription(step: number): string {
  switch (step) {
    case 0:
      return "Explore your mental patterns and thought processes";
    case 1:
      return "Assess your emotional responses and feelings";
    case 2:
      return "Evaluate your physical sensations and experiences";
    case 3:
      return "Examine how you respond to specific situations";
    case 4:
      return "Integrate insights from all dimensions of experience";
    default:
      return "Discover your chakra energy patterns";
  }
}