import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from './db';
import {
  users,
  chakraProfiles,
  journalEntries,
  emotionTracking,
  coachConversations,
  healingRituals,
  userRecommendations,
  User, InsertUser,
  ChakraProfile, InsertChakraProfile,
  JournalEntry, InsertJournalEntry,
  EmotionTracking, InsertEmotionTracking,
  CoachConversation, InsertCoachConversation,
  HealingRitual, InsertHealingRitual,
  UserRecommendation, InsertUserRecommendation
} from "@shared/schema";
import { IStorage } from './storage';

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    // Use PostgreSQL for session storage in production
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize healing rituals if needed
    this.initializeHealingRituals();
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getChakraProfile(userId: number): Promise<ChakraProfile | undefined> {
    const [profile] = await db.select().from(chakraProfiles).where(eq(chakraProfiles.userId, userId));
    return profile;
  }

  async createChakraProfile(insertProfile: InsertChakraProfile): Promise<ChakraProfile> {
    const [profile] = await db.insert(chakraProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateChakraProfile(id: number, profileUpdate: Partial<InsertChakraProfile>): Promise<ChakraProfile | undefined> {
    const [updatedProfile] = await db
      .update(chakraProfiles)
      .set({ ...profileUpdate, updatedAt: new Date() })
      .where(eq(chakraProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    return entry;
  }

  async getEmotionTrackings(userId: number): Promise<EmotionTracking[]> {
    return await db
      .select()
      .from(emotionTracking)
      .where(eq(emotionTracking.userId, userId))
      .orderBy(desc(emotionTracking.createdAt));
  }

  async createEmotionTracking(insertTracking: InsertEmotionTracking): Promise<EmotionTracking> {
    const [tracking] = await db.insert(emotionTracking).values(insertTracking).returning();
    return tracking;
  }

  async getCoachConversations(userId: number, coachType?: string): Promise<CoachConversation[]> {
    let query = db.select().from(coachConversations).where(eq(coachConversations.userId, userId));
    
    if (coachType) {
      query = query.where(eq(coachConversations.coachType, coachType));
    }
    
    return await query.orderBy(desc(coachConversations.updatedAt));
  }

  async getCoachConversation(id: number): Promise<CoachConversation | undefined> {
    const [conversation] = await db.select().from(coachConversations).where(eq(coachConversations.id, id));
    return conversation;
  }

  async createCoachConversation(insertConversation: InsertCoachConversation): Promise<CoachConversation> {
    const [conversation] = await db.insert(coachConversations).values(insertConversation).returning();
    return conversation;
  }

  async updateCoachConversation(id: number, messages: any): Promise<CoachConversation | undefined> {
    const [updatedConversation] = await db
      .update(coachConversations)
      .set({ messages, updatedAt: new Date() })
      .where(eq(coachConversations.id, id))
      .returning();
    return updatedConversation;
  }

  async getHealingRituals(): Promise<HealingRitual[]> {
    return await db.select().from(healingRituals);
  }

  async getHealingRitual(id: number): Promise<HealingRitual | undefined> {
    const [ritual] = await db.select().from(healingRituals).where(eq(healingRituals.id, id));
    return ritual;
  }

  async getHealingRitualsByTarget(targetChakra?: string, targetEmotion?: string): Promise<HealingRitual[]> {
    // Get all rituals first
    const allRituals = await this.getHealingRituals();
    
    // Filter in memory (better implementation would use database JSON filtering)
    return allRituals.filter(ritual => {
      const matchesChakra = !targetChakra || ritual.targetChakra === targetChakra;
      const matchesEmotion = !targetEmotion || ritual.targetEmotion === targetEmotion;
      return matchesChakra && matchesEmotion;
    });
  }

  async createHealingRitual(insertRitual: InsertHealingRitual): Promise<HealingRitual> {
    const [ritual] = await db.insert(healingRituals).values(insertRitual).returning();
    return ritual;
  }

  async getUserRecommendations(userId: number): Promise<UserRecommendation[]> {
    return await db
      .select()
      .from(userRecommendations)
      .where(eq(userRecommendations.userId, userId))
      .orderBy(desc(userRecommendations.createdAt));
  }

  async createUserRecommendation(insertRecommendation: InsertUserRecommendation): Promise<UserRecommendation> {
    const [recommendation] = await db.insert(userRecommendations).values(insertRecommendation).returning();
    return recommendation;
  }

  async updateUserRecommendation(id: number, completed: boolean): Promise<UserRecommendation | undefined> {
    const [updatedRecommendation] = await db
      .update(userRecommendations)
      .set({ completed })
      .where(eq(userRecommendations.id, id))
      .returning();
    return updatedRecommendation;
  }

  // Initialize healing rituals - only called if table is empty
  async initializeHealingRituals() {
    try {
      // Check if we have any healing rituals
      const existingRituals = await db.select().from(healingRituals).limit(1);
      if (existingRituals.length > 0) {
        return; // Skip if we already have rituals
      }
      
      // Create some default healing rituals
      const rituals: InsertHealingRitual[] = [
        {
          name: "Crown Chakra Visualization",
          description: "Connect with universal consciousness and expand your spiritual awareness",
          type: "visualization",
          targetChakra: "crown",
          targetEmotion: "confusion",
          instructions: "Find a quiet space, close your eyes, and visualize a violet light at the crown of your head. As you breathe deeply, imagine this light expanding and connecting you to universal wisdom."
        },
        {
          name: "Third Eye Meditation",
          description: "Enhance intuition and inner vision",
          type: "meditation",
          targetChakra: "third_eye",
          targetEmotion: "doubt",
          instructions: "Sit comfortably with eyes closed. Focus attention on the area between your eyebrows. Visualize an indigo light growing brighter with each breath, opening your inner eye to deeper insights."
        },
        {
          name: "Throat Chakra Sound Healing",
          description: "Release blocked expression and find your authentic voice",
          type: "sound_healing",
          targetChakra: "throat",
          targetEmotion: "fear",
          instructions: "Sit in a comfortable position and take deep breaths. Begin making the sound 'HAM' while focusing on your throat area. Feel the vibration releasing any blocks to your self-expression."
        },
        {
          name: "Heart-Opening Affirmations",
          description: "Nurture compassion and self-love",
          type: "affirmation",
          targetChakra: "heart",
          targetEmotion: "grief",
          instructions: "Place your hands over your heart. Breathe deeply and repeat: 'I am open to giving and receiving love. I deeply and completely love and accept myself.' Feel your heart space expanding with each repetition."
        },
        {
          name: "Solar Plexus Empowerment",
          description: "Build confidence and personal power",
          type: "visualization",
          targetChakra: "solar_plexus",
          targetEmotion: "shame",
          instructions: "Lie down comfortably. Place hands over your solar plexus (above navel). Visualize a bright yellow sun growing in this area with each breath, filling you with confidence and personal power."
        },
        {
          name: "Sacral Chakra Creativity Flow",
          description: "Unlock creative energy and emotional fluidity",
          type: "movement",
          targetChakra: "sacral",
          targetEmotion: "guilt",
          instructions: "Put on flowing music and allow your hips to sway gently. Focus on the area below your navel. Let movements become intuitive, expressing emotional release through free-form dance."
        },
        {
          name: "Root Chakra Grounding",
          description: "Establish safety and security within yourself",
          type: "somatic",
          targetChakra: "root",
          targetEmotion: "anxiety",
          instructions: "Stand barefoot on the earth if possible. Feel your feet connecting to the ground. Visualize roots growing from your feet deep into the earth, drawing up stability and security into your body."
        },
        {
          name: "Emotional Release Journaling",
          description: "Process and release difficult emotions through writing",
          type: "journaling",
          targetEmotion: "anger",
          instructions: "Take a blank page and write continuously without editing or judgment. Begin with 'I feel...' and allow all emotions to flow onto the page without restriction. When complete, you may destroy the page as a symbol of release."
        },
        {
          name: "Joy Activation Practice",
          description: "Cultivate and amplify feelings of joy and gratitude",
          type: "mindfulness",
          targetEmotion: "depression",
          instructions: "Recall a memory when you felt pure joy. Relive this moment with all your senses - what you saw, heard, felt. Allow the feeling to expand throughout your body. Place your hand on your heart and set an intention to carry this joy forward."
        },
        {
          name: "Full Chakra Balancing Meditation",
          description: "Harmonize all energy centers for complete alignment",
          type: "meditation",
          instructions: "Sit comfortably with spine straight. Visualize each chakra from root to crown, spending 1-2 minutes at each center. See each chakra as a spinning wheel of light in its respective color, clearing and balancing each one before moving upward."
        }
      ];
      
      for (const ritual of rituals) {
        await this.createHealingRitual(ritual);
      }
      
      console.log("Created default healing rituals");
    } catch (error) {
      console.error("Error initializing healing rituals:", error);
    }
  }
}