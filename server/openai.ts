import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" });

// Analyze journal entry for sentiment, emotions, and chakra connections
export async function analyzeJournalEntry(text: string): Promise<{
  sentimentScore: number;
  emotions: string[];
  chakras: string[];
  summary: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an expert in emotional analysis and chakra energy. Analyze the journal entry for emotional content, sentiment, and chakra associations. Return JSON with: sentimentScore (1-10), emotions (array of emotions detected), chakras (array of chakras that need attention), and summary (brief insights from the entry)."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      sentimentScore: result.sentimentScore || 5,
      emotions: result.emotions || [],
      chakras: result.chakras || [],
      summary: result.summary || "No insights detected."
    };
  } catch (error) {
    console.error("Failed to analyze journal entry:", error);
    return {
      sentimentScore: 5,
      emotions: ["neutral"],
      chakras: [],
      summary: "Unable to analyze entry. Please try again later."
    };
  }
}

// Generate chat response for AI coaches
export async function generateChatResponse(messages: any[], coachType: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: getCoachTemperature(coachType),
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    return "I'm having trouble connecting at the moment. Please try again in a little while.";
  }
}

// Generate personalized healing recommendations
export async function generateHealingRecommendations(chakraProfile: any, recentEmotions: string[]): Promise<{
  ritualTypes: string[];
  focusChakras: string[];
  primaryEmotion: string;
  customAdvice: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a spiritual healing expert. Based on the user's chakra profile and recent emotions, recommend healing practices. Return JSON with: ritualTypes (array of recommended practice types), focusChakras (array of chakras to focus on), primaryEmotion (the main emotion to address), and customAdvice (personalized guidance)."
        },
        {
          role: "user",
          content: JSON.stringify({
            chakraProfile: chakraProfile,
            recentEmotions: recentEmotions
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      ritualTypes: result.ritualTypes || ["meditation"],
      focusChakras: result.focusChakras || [],
      primaryEmotion: result.primaryEmotion || "neutral",
      customAdvice: result.customAdvice || "Take time for self-care today."
    };
  } catch (error) {
    console.error("Failed to generate healing recommendations:", error);
    return {
      ritualTypes: ["meditation"],
      focusChakras: [],
      primaryEmotion: "neutral",
      customAdvice: "Consider taking some quiet time for yourself today."
    };
  }
}

// Helper function to set temperature based on coach type
function getCoachTemperature(coachType: string): number {
  switch (coachType) {
    case 'inner_child':
      return 0.7; // Warmer, more nurturing
    case 'shadow_self':
      return 0.5; // More direct and precise
    case 'higher_self':
      return 0.8; // More creative and expansive
    case 'integration':
      return 0.6; // Balanced practical guidance
    default:
      return 0.7;
  }
}
