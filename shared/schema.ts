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
  isAdmin: boolean("is_admin").default(false),
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
  gratitude: text("gratitude").array(),
  affirmation: text("affirmation"),
  shortTermGoals: text("short_term_goals").array(),
  longTermVision: text("long_term_vision"),
  language: text("language").default("english"),
  sentimentScore: integer("sentiment_score"),
  emotionTags: text("emotion_tags").array(),
  chakraTags: text("chakra_tags").array(),
  aiInsights: text("ai_insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  content: true,
  gratitude: true,
  affirmation: true,
  shortTermGoals: true,
  longTermVision: true,
  language: true,
  sentimentScore: true,
  emotionTags: true,
  chakraTags: true,
  aiInsights: true,
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
  featuredImage: text("featured_image"),
  mainImageUrl: text("main_image_url"),
  thumbnailUrl: text("thumbnail_url"),
  courseUrl: text("course_url"),
  videoUrl: text("video_url"),
  duration: text("duration"),
  zoomLink: text("zoom_link"),
  eventDate: timestamp("event_date"),
  isFeatured: boolean("is_featured").default(false),
  status: text("status").default("published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHealingRitualSchema = createInsertSchema(healingRituals).pick({
  name: true,
  description: true,
  type: true,
  targetChakra: true,
  targetEmotion: true,
  instructions: true,
  featuredImage: true,
  mainImageUrl: true,
  thumbnailUrl: true,
  courseUrl: true,
  videoUrl: true,
  duration: true,
  zoomLink: true,
  eventDate: true,
  isFeatured: true,
  status: true,
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

// Community Events model
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  featuredImage: text("featured_image"),
  eventDate: timestamp("event_date").notNull(),
  eventTime: text("event_time").notNull(),
  duration: integer("duration"), // in minutes
  isVirtual: boolean("is_virtual").default(true),
  isFree: boolean("is_free").default(false),
  zoomLink: text("zoom_link"),
  videoUrl: text("video_url"),
  maxAttendees: integer("max_attendees"),
  status: text("status").default("upcoming"), // upcoming, ongoing, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityEventSchema = createInsertSchema(communityEvents).pick({
  title: true,
  description: true,
  featuredImage: true,
  eventDate: true,
  eventTime: true,
  duration: true,
  isVirtual: true,
  isFree: true,
  zoomLink: true,
  videoUrl: true,
  maxAttendees: true,
  status: true,
});

// Event Attendees model
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registrationDate: timestamp("registration_date").defaultNow(),
  attended: boolean("attended").default(false),
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).pick({
  eventId: true,
  userId: true,
  attended: true,
});

// Media Library model
export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image, video, document
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  altText: text("alt_text"),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(mediaLibrary).pick({
  fileName: true,
  fileType: true,
  fileUrl: true,
  fileSize: true,
  altText: true,
  uploadedById: true,
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

export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;

export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;

export type MediaItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaSchema>;
