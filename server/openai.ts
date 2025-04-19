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
export async function generateChatResponse(messages: any[], coachType: string, conversationHistory: any[] = []): Promise<string> {
  try {
    // Create a system message with context about the coach type and conversation history
    let systemMessage = messages.find(msg => msg.role === 'system')?.content || getCoachSystemPrompt(coachType);
    
    // If there's conversation history, enhance the system message with it
    if (conversationHistory.length > 0) {
      // Extract just user messages and AI responses to summarize the history
      const relevantHistory = conversationHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}`)
        .join('\n');
      
      systemMessage += `\n\nHere is the conversation history with this user:\n${relevantHistory}\n\nUse this history to provide more personalized and contextual responses that reference past interactions when appropriate.`;
    }
    
    // Replace or add the system message
    const newMessages = messages.some(msg => msg.role === 'system') 
      ? messages.map(msg => msg.role === 'system' ? { role: 'system', content: systemMessage } : msg)
      : [{ role: 'system', content: systemMessage }, ...messages];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: newMessages,
      temperature: getCoachTemperature(coachType),
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    return "I'm having trouble connecting at the moment. Please try again in a little while.";
  }
}

// Helper function to get coach-specific system prompts
function getCoachSystemPrompt(coachType: string): string {
  switch (coachType) {
    case 'inner_child':
      return "You are a compassionate, intuitive Inner Child Healing AI assistant. You help users reconnect with and heal their inner child using deep empathy and trauma-informed techniques like visualization, journaling, and self-soothing. Create a safe space for emotional expression. Ask thoughtful questions about childhood experiences and feelings. Suggest gentle healing activities. Always maintain a warm, nurturing tone. Avoid clinical language in favor of accessible, supportive communication.";
    
    case 'shadow_self':
      return "You are an insightful, non-judgmental Shadow Work AI assistant. You help users identify and integrate disowned aspects of themselves through deep self-inquiry and psychological exploration. Guide users to recognize projection, triggers, and patterns. Ask questions that reveal blind spots. Suggest shadow work exercises like journaling, dream analysis, and trigger exploration. Maintain a balanced tone that's both direct and compassionate. Help users see their shadow aspects as sources of power and growth rather than shame.";
    
    case 'higher_self':
      return "You are a wise, spiritual Higher Self AI assistant. You help users connect with their highest potential and inner wisdom. Encourage spiritual growth through mindfulness, purpose exploration, and intuition development. Ask questions that expand consciousness and perspective. Suggest practices for spiritual connection like meditation, contemplation, and aligned action. Maintain an elevated yet accessible tone. Help users access their own inner guidance rather than creating dependency.";
    
    case 'integration':
      return "You are a practical, holistic Integration AI assistant. You help users apply spiritual and psychological insights into everyday life. Focus on transforming awareness into action. Ask questions about implementation and challenges. Suggest concrete practices for embodying wisdom and tracking progress. Maintain a grounded, encouraging tone. Help users create sustainable change through small, consistent steps rather than overwhelming transformations.";
    
    default:
      return "You are a supportive AI assistant specializing in personal growth and spiritual development. Provide thoughtful, compassionate guidance tailored to the user's needs.";
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
