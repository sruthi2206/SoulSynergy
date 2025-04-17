import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

// Chakra Profile model
export const chakraProfiles = pgTable("chakra_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  crownChakra: integer("crown_chakra").notNull(),
  thirdEyeChakra: integer("third_eye_chakra").notNull(),
  throatChakra: integer("throat_chakra").notNull(),
  heartChakra: integer("heart_chakra").notNull(),
  solarPlexusChakra: integer("solar_plexus_chakra").notNull(),
  sacralChakra: integer("sacral_chakra").notNull(),
  rootChakra: integer("root_chakra").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChakraProfileSchema = createInsertSchema(chakraProfiles).pick({
  userId: true,
  crownChakra: true,
  thirdEyeChakra: true,
  throatChakra: true,
  heartChakra: true,
  solarPlexusChakra: true,
  sacralChakra: true,
  rootChakra: true,
});

// Journal Entries model
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  sentimentScore: integer("sentiment_score"),
  emotionTags: text("emotion_tags").array(),
  chakraTags: text("chakra_tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  content: true,
  sentimentScore: true,
  emotionTags: true,
  chakraTags: true,
});

// Emotion Tracking model
export const emotionTracking = pgTable("emotion_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  emotion: text("emotion").notNull(),
  intensity: integer("intensity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmotionTrackingSchema = createInsertSchema(emotionTracking).pick({
  userId: true,
  emotion: true,
  intensity: true,
  note: true,
});

// Coach Conversations model
export const coachConversations = pgTable("coach_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coachType: text("coach_type").notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCoachConversationSchema = createInsertSchema(coachConversations).pick({
  userId: true,
  coachType: true,
  messages: true,
});

// Healing Rituals model
export const healingRituals = pgTable("healing_rituals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  targetChakra: text("target_chakra"),
  targetEmotion: text("target_emotion"),
  instructions: text("instructions").notNull(),
});

export const insertHealingRitualSchema = createInsertSchema(healingRituals).pick({
  name: true,
  description: true,
  type: true,
  targetChakra: true,
  targetEmotion: true,
  instructions: true,
});

// User Recommendations model
export const userRecommendations = pgTable("user_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ritualId: integer("ritual_id").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserRecommendationSchema = createInsertSchema(userRecommendations).pick({
  userId: true,
  ritualId: true,
  completed: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChakraProfile = typeof chakraProfiles.$inferSelect;
export type InsertChakraProfile = z.infer<typeof insertChakraProfileSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type EmotionTracking = typeof emotionTracking.$inferSelect;
export type InsertEmotionTracking = z.infer<typeof insertEmotionTrackingSchema>;

export type CoachConversation = typeof coachConversations.$inferSelect;
export type InsertCoachConversation = z.infer<typeof insertCoachConversationSchema>;

export type HealingRitual = typeof healingRituals.$inferSelect;
export type InsertHealingRitual = z.infer<typeof insertHealingRitualSchema>;

export type UserRecommendation = typeof userRecommendations.$inferSelect;
export type InsertUserRecommendation = z.infer<typeof insertUserRecommendationSchema>;
