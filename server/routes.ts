import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import Stripe from "stripe";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import multer from "multer";
import { 
  insertUserSchema, 
  insertChakraProfileSchema,
  insertJournalEntrySchema,
  insertEmotionTrackingSchema,
  insertCoachConversationSchema,
  insertHealingRitualSchema,
  insertMediaSchema
} from "@shared/schema";
import { analyzeJournalEntry, generateChatResponse, getCoachSystemPrompt } from "./openai";
import { setupAuth } from "./auth";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key - payment features will not work');
}

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    // Ensure the key is properly formatted without any extra whitespace or invalid characters
    const cleanKey = process.env.STRIPE_SECRET_KEY.trim();
    
    // Check if the key starts with sk_ (Stripe secret key format)
    if (!cleanKey.startsWith('sk_')) {
      console.error('Invalid Stripe key format. Secret key should start with sk_');
    } else {
      stripe = new Stripe(cleanKey, { 
        apiVersion: "2022-11-15" as any // Using an older, more compatible API version
      });
      console.log('Stripe initialized successfully');
    }
  } else {
    console.warn('No Stripe secret key found in environment variables');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API routes prefix
  const apiRouter = '/api';
  
  // Authentication middlewares
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };
  
  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = req.user as { isAdmin?: boolean };
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  };
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer storage
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${randomUUID()}${fileExt}`;
      cb(null, fileName);
    }
  });
  
  // File filter to check allowed file types
  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
    }
  };
  
  const upload = multer({
    storage: multerStorage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Health check endpoint
  app.get(`${apiRouter}/health`, (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // File upload endpoint
  app.post(`${apiRouter}/upload`, isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      // Get authenticated user
      const user = req.user;
      
      // Create relative URL for the uploaded file
      const relativeFilePath = `/uploads/${req.file.filename}`;
      
      // Create a new media entry in the database
      if (user) {
        try {
          const mediaData = {
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileUrl: relativeFilePath,
            fileSize: req.file.size,
            altText: req.body.altText || req.file.originalname,
            uploadedById: user.id
          };
          
          // Store the media in the database
          const mediaItem = await storage.uploadMedia(mediaData);
          
          res.status(201).json({
            success: true,
            url: relativeFilePath,
            fileName: req.file.originalname,
            mediaId: mediaItem.id
          });
        } catch (error) {
          console.error("Failed to save media to database:", error);
          // Even if DB storage fails, still return the file URL
          res.status(201).json({
            success: true,
            url: relativeFilePath,
            fileName: req.file.originalname,
            warning: "File saved but database entry failed"
          });
        }
      } else {
        // User not found in request
        res.status(201).json({
          success: true,
          url: relativeFilePath,
          fileName: req.file.originalname,
          warning: "User not authenticated, file saved without database entry"
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        message: `File upload failed: ${(error as Error).message}`
      });
    }
  });

  // User routes
  app.post(`${apiRouter}/users`, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      const newUser = await storage.createUser(validatedData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create user', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:id`, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user', error: (error as Error).message });
    }
  });

  // Chakra profile routes
  app.post(`${apiRouter}/chakra-profiles`, async (req, res) => {
    try {
      const validatedData = insertChakraProfileSchema.parse(req.body);
      const existingProfile = await storage.getChakraProfile(validatedData.userId);
      
      if (existingProfile) {
        return res.status(409).json({ message: 'User already has a chakra profile' });
      }
      
      const newProfile = await storage.createChakraProfile(validatedData);
      res.status(201).json(newProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid chakra profile data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create chakra profile', error: (error as Error).message });
      }
    }
  });
  
  // Update chakra profile
  app.patch(`${apiRouter}/chakra-profiles/:id`, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      console.log("Updating chakra profile with ID:", profileId);
      console.log("Request body:", req.body);
      
      // Try to find the profile by ID (which is equal to userId in this case)
      let existingProfile = await storage.getChakraProfile(profileId);
      
      if (!existingProfile) {
        console.log("Profile not found by userId:", profileId);
        return res.status(404).json({ message: 'Chakra profile not found' });
      }
      
      console.log("Found existing profile:", existingProfile);
      
      // Validate only the fields that are provided
      const validatedData = insertChakraProfileSchema.partial().parse(req.body);
      
      console.log("Validated data:", validatedData);
      
      const updatedProfile = await storage.updateChakraProfile(existingProfile.id, validatedData);
      
      console.log("Updated profile:", updatedProfile);
      
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating chakra profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid chakra profile data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update chakra profile', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:userId/chakra-profile`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let profile = await storage.getChakraProfile(userId);
      
      // If no profile exists, create a default one
      if (!profile) {
        // Create a default profile with balanced values (5)
        const defaultProfileData = {
          userId,
          crownChakra: 5,
          thirdEyeChakra: 5,
          throatChakra: 5,
          heartChakra: 5,
          solarPlexusChakra: 5,
          sacralChakra: 5,
          rootChakra: 5
        };
        
        try {
          // Create the profile
          profile = await storage.createChakraProfile(defaultProfileData);
          console.log("Created default chakra profile for user:", userId);
        } catch (createError) {
          console.error("Error creating default chakra profile:", createError);
          return res.status(500).json({ 
            message: 'Failed to create default chakra profile', 
            error: (createError as Error).message 
          });
        }
      }
      
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get chakra profile', error: (error as Error).message });
    }
  });

  // Journal entry routes
  app.post(`${apiRouter}/journal-entries`, async (req, res) => {
    try {
      const journalContent = req.body.content;
      const userId = req.body.userId;
      
      if (!journalContent || !userId) {
        return res.status(400).json({ message: 'Missing content or userId' });
      }
      
      // Analyze the journal entry with OpenAI
      const analysis = await analyzeJournalEntry(journalContent);
      
      // Create journal entry with analysis data
      const journalData = {
        userId: userId,
        content: journalContent,
        sentimentScore: analysis.sentimentScore,
        emotionTags: analysis.emotions,
        chakraTags: analysis.chakras
      };
      
      const validatedData = insertJournalEntrySchema.parse(journalData);
      const newEntry = await storage.createJournalEntry(validatedData);
      
      res.status(201).json({
        ...newEntry,
        analysis: analysis.summary
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid journal entry data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create journal entry', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:userId/journal-entries`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getJournalEntries(userId);
      res.status(200).json(entries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get journal entries', error: (error as Error).message });
    }
  });

  // Emotion tracking routes
  app.post(`${apiRouter}/emotion-tracking`, async (req, res) => {
    try {
      const validatedData = insertEmotionTrackingSchema.parse(req.body);
      const newTracking = await storage.createEmotionTracking(validatedData);
      res.status(201).json(newTracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid emotion tracking data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create emotion tracking', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:userId/emotion-tracking`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trackings = await storage.getEmotionTrackings(userId);
      res.status(200).json(trackings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get emotion trackings', error: (error as Error).message });
    }
  });

  // Coach conversation routes
  app.post(`${apiRouter}/coach-chat`, async (req, res) => {
    try {
      const { userId, coachType, message, conversationId } = req.body;
      
      if (!userId || !coachType || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      let conversation;
      let currentMessages;
      let conversationHistory = [];
      
      // If conversationId is provided, update existing conversation
      if (conversationId) {
        conversation = await storage.getCoachConversation(conversationId);
        
        if (!conversation) {
          return res.status(404).json({ message: 'Conversation not found' });
        }
        
        // Verify the conversation belongs to the correct coach type
        if (conversation.coachType !== coachType) {
          return res.status(400).json({ 
            message: 'Coach type mismatch. The conversation belongs to a different coach type.' 
          });
        }
        
        // Save the history (exclude system message for history context)
        // Handle conversation.messages being unknown type
        const messages = conversation.messages || [];
        if (Array.isArray(messages)) {
          conversationHistory = messages.filter((msg: any) => msg.role !== 'system');
          
          // Current session messages (including system message)
          currentMessages = [...messages];
        } else {
          console.warn('Conversation messages is not an array:', typeof messages);
          // Create default messages with system prompt if messages aren't available
          currentMessages = [
            { role: 'system', content: getCoachSystemMessage(coachType) }
          ];
        }
        
        // Add the new user message
        currentMessages.push({ role: 'user', content: message });
      } else {
        // Start a new conversation
        // Use the function from openai.ts
        const systemMessage = getCoachSystemMessage(coachType);
        currentMessages = [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ];
        
        // Get past conversations for context
        const pastConversations = await storage.getCoachConversations(userId, coachType);
        if (pastConversations && pastConversations.length > 0) {
          // Get messages from most recent conversation (excluding this new one)
          const recentConversation = pastConversations[0];
          if (recentConversation && recentConversation.messages) {
            // Handle messages being potentially any type
            const messages = recentConversation.messages;
            if (Array.isArray(messages)) {
              // Use the previous conversation for context
              conversationHistory = messages.filter((msg: any) => msg.role !== 'system');
            } else {
              console.warn('Recent conversation messages is not an array:', typeof messages);
            }
          }
        }
        
        const conversationData = {
          userId,
          coachType,
          messages: currentMessages
        };
        
        conversation = await storage.createCoachConversation(conversationData);
      }
      
      // Generate AI response with conversation history context
      const aiResponse = await generateChatResponse(currentMessages, coachType, conversationHistory);
      
      // Add AI response to current messages
      currentMessages.push({ role: 'assistant', content: aiResponse });
      
      // Update conversation with new messages
      const updatedConversation = await storage.updateCoachConversation(
        conversation.id,
        currentMessages
      );
      
      res.status(200).json({
        conversation: updatedConversation,
        message: aiResponse
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process coach chat', error: (error as Error).message });
    }
  });

  app.get(`${apiRouter}/users/:userId/coach-conversations`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const coachType = req.query.coachType as string | undefined;
      
      // Validate that we have a valid coach type parameter
      if (!coachType) {
        return res.status(400).json({ message: 'Missing coachType parameter' });
      }
      
      const conversations = await storage.getCoachConversations(userId, coachType);
      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get coach conversations', error: (error as Error).message });
    }
  });
  
  // Delete coach conversation route
  app.delete(`${apiRouter}/coach-conversations/:id`, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // Check if the conversation exists
      const conversation = await storage.getCoachConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      // Delete the conversation
      await storage.deleteCoachConversation(conversationId);
      
      res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to delete conversation', 
        error: (error as Error).message 
      });
    }
  });

  // Healing ritual routes
  app.get(`${apiRouter}/healing-rituals`, async (req, res) => {
    try {
      const targetChakra = req.query.targetChakra as string | undefined;
      const targetEmotion = req.query.targetEmotion as string | undefined;
      
      const rituals = await storage.getHealingRitualsByTarget(targetChakra, targetEmotion);
      res.status(200).json(rituals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get healing rituals', error: (error as Error).message });
    }
  });

  app.get(`${apiRouter}/healing-rituals/:id`, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const ritual = await storage.getHealingRitual(ritualId);
      
      if (!ritual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      res.status(200).json(ritual);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get healing ritual', error: (error as Error).message });
    }
  });
  
  // Admin-only routes for healing rituals management
  app.post(`${apiRouter}/healing-rituals`, isAdmin, async (req, res) => {
    try {
      const validatedData = insertHealingRitualSchema.parse(req.body);
      const newRitual = await storage.createHealingRitual(validatedData);
      res.status(201).json(newRitual);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid ritual data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create ritual', error: (error as Error).message });
      }
    }
  });
  
  app.put(`${apiRouter}/healing-rituals/:id`, isAdmin, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const existingRitual = await storage.getHealingRitual(ritualId);
      
      if (!existingRitual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      const validatedData = insertHealingRitualSchema.parse(req.body);
      // Add updateHealingRitual to storage interface later
      const updatedRitual = await storage.updateHealingRitual(ritualId, validatedData);
      
      res.status(200).json(updatedRitual);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid ritual data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update ritual', error: (error as Error).message });
      }
    }
  });
  
  // Add PATCH endpoint to support partial updates from AdminDashboardPage
  app.patch(`${apiRouter}/healing-rituals/:id`, isAdmin, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const existingRitual = await storage.getHealingRitual(ritualId);
      
      if (!existingRitual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      // For PATCH we'll skip validation to allow partial updates
      const updatedRitual = await storage.updateHealingRitual(ritualId, req.body);
      
      res.status(200).json(updatedRitual);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update ritual', error: (error as Error).message });
    }
  });
  
  app.delete(`${apiRouter}/healing-rituals/:id`, isAdmin, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const existingRitual = await storage.getHealingRitual(ritualId);
      
      if (!existingRitual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      // Add deleteHealingRitual to storage interface later
      await storage.deleteHealingRitual(ritualId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete ritual', error: (error as Error).message });
    }
  });

  // User recommendation routes
  app.post(`${apiRouter}/user-recommendations`, async (req, res) => {
    try {
      const { userId, ritualId } = req.body;
      
      if (!userId || !ritualId) {
        return res.status(400).json({ message: 'Missing userId or ritualId' });
      }
      
      const ritual = await storage.getHealingRitual(ritualId);
      
      if (!ritual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      const recommendationData = {
        userId,
        ritualId,
        completed: false
      };
      
      const newRecommendation = await storage.createUserRecommendation(recommendationData);
      res.status(201).json(newRecommendation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create user recommendation', error: (error as Error).message });
    }
  });

  app.get(`${apiRouter}/users/:userId/recommendations`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recommendations = await storage.getUserRecommendations(userId);
      
      // Fetch the corresponding ritual details for each recommendation
      const recommendationsWithRituals = await Promise.all(
        recommendations.map(async (rec) => {
          const ritual = await storage.getHealingRitual(rec.ritualId);
          return {
            ...rec,
            ritual
          };
        })
      );
      
      res.status(200).json(recommendationsWithRituals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user recommendations', error: (error as Error).message });
    }
  });

  app.patch(`${apiRouter}/user-recommendations/:id`, async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const { completed } = req.body;
      
      if (completed === undefined) {
        return res.status(400).json({ message: 'Missing completed field' });
      }
      
      const updatedRecommendation = await storage.updateUserRecommendation(
        recommendationId,
        completed
      );
      
      if (!updatedRecommendation) {
        return res.status(404).json({ message: 'User recommendation not found' });
      }
      
      res.status(200).json(updatedRecommendation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user recommendation', error: (error as Error).message });
    }
  });

  // Media Library routes
  app.get(`${apiRouter}/media`, async (req, res) => {
    try {
      const mediaItems = await storage.getMediaItems();
      res.status(200).json(mediaItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      res.status(500).json({ message: 'Failed to fetch media items', error: (error as Error).message });
    }
  });
  
  // Multiple file upload endpoint for media
  app.post(`${apiRouter}/media/upload`, requireAuth, upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }
      
      // Get authenticated user
      const user = req.user;
      
      const uploadedMedia = [];
      
      // Process each uploaded file
      for (const file of files) {
        // Create relative URL for the uploaded file
        const relativeFilePath = `/uploads/${file.filename}`;
        
        // Create a new media entry in the database
        if (user) {
          try {
            const mediaData = {
              fileName: file.originalname,
              fileType: file.mimetype,
              fileUrl: relativeFilePath,
              fileSize: file.size,
              altText: file.originalname,
              uploadedById: user.id
            };
            
            // Store the media in the database
            const mediaItem = await storage.uploadMedia(mediaData);
            
            uploadedMedia.push({
              id: mediaItem.id,
              url: relativeFilePath,
              filename: file.originalname,
              mimetype: file.mimetype
            });
          } catch (error) {
            console.error("Failed to save media to database:", error);
            // Continue processing other files even if one fails
          }
        }
      }
      
      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${uploadedMedia.length} files`,
        files: uploadedMedia
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: (error as Error).message
      });
    }
  });

  app.get(`${apiRouter}/media/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mediaItem = await storage.getMediaItem(id);
      
      if (!mediaItem) {
        return res.status(404).json({ message: 'Media item not found' });
      }
      
      res.status(200).json(mediaItem);
    } catch (error) {
      console.error('Error fetching media item:', error);
      res.status(500).json({ message: 'Failed to fetch media item', error: (error as Error).message });
    }
  });
  
  app.delete(`${apiRouter}/media/:id`, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mediaItem = await storage.getMediaItem(id);
      
      if (!mediaItem) {
        return res.status(404).json({ message: 'Media item not found' });
      }
      
      // Delete from filesystem if it exists
      try {
        const filePath = path.join(process.cwd(), 'public', mediaItem.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file from filesystem: ${filePath}`);
        }
      } catch (fileError) {
        console.error('Error deleting file from filesystem:', fileError);
        // Continue processing even if file deletion fails
      }
      
      // Delete from database
      await storage.deleteMedia(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting media item:', error);
      res.status(500).json({ message: 'Failed to delete media item', error: (error as Error).message });
    }
  });

  // Stripe payment routes
  app.post(`${apiRouter}/create-payment-intent`, async (req, res) => {
    try {
      if (!stripe) {
        console.error('Stripe not configured - create-payment-intent endpoint called but Stripe is null');
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      const { amount, interval } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: 'Missing amount field' });
      }

      console.log(`Creating payment intent for amount: ${amount}, interval: ${interval || 'one-time'}`);

      // Use a simpler, more compatible configuration
      try {
        // Create a payment intent with basic configuration
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          payment_method_types: ['card'], // Just card payment to start with
          metadata: {
            plan: interval || 'one-time'
          }
        });
        
        console.log('Payment intent created successfully:', paymentIntent.id);
        
        res.status(200).json({
          clientSecret: paymentIntent.client_secret
        });
      } catch (stripeError) {
        console.error('Error in Stripe payment intent creation:', stripeError);
        
        // Try a fallback config if the first attempt fails
        console.log('Trying fallback payment intent configuration...');
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'usd',
          // No additional configuration
        });
        
        console.log('Payment intent created with fallback config:', paymentIntent.id);
        
        res.status(200).json({
          clientSecret: paymentIntent.client_secret
        });
      }
    } catch (error) {
      console.error('Stripe error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        const stripeError = error as any;
        if (stripeError.type) {
          console.error('Stripe error type:', stripeError.type);
        }
        if (stripeError.raw) {
          console.error('Stripe raw error:', stripeError.raw);
        }
        if (stripeError.headers) {
          console.error('Stripe error headers:', stripeError.headers);
        }
        if (stripeError.statusCode) {
          console.error('Stripe error status code:', stripeError.statusCode);
        }
      }
      
      // If we get here, both payment intent creation attempts failed
      // Return fallback UI by notifying the client
      res.status(500).json({ 
        message: 'Failed to create payment intent', 
        error: (error as Error).message,
        useFallback: true
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to get system messages for different coach types
function getCoachSystemMessage(coachType: string): string {
  switch (coachType) {
    case 'inner_child':
      return "You are the Inner Child AI Coach, a gentle and nurturing guide helping users heal childhood wounds. Use a warm, supportive tone. Focus on creating emotional safety, validating feelings, and asking questions that help the user connect with their authentic self. Help users identify patterns from childhood that may be affecting their adult life. Never be judgmental and always maintain compassion.";
    
    case 'shadow_self':
      return "You are the Shadow Self AI Coach, a direct and insightful guide helping users identify and integrate rejected aspects of themselves. Use a straightforward, honest tone that encourages self-reflection. Help users recognize projections and triggers as reflections of disowned parts of themselves. Ask challenging but compassionate questions that reveal hidden patterns. Focus on acceptance and integration rather than judgment. Begin your first message with this warm welcome: 'Hello love, I'm your Shadow Healing Companion. Together, we'll gently uncover the hidden parts of your subconscious that may still carry pain, fear, or limiting beliefs — and release them with compassion. Are you ready to begin?' When the user is ready to begin, guide them through this grounding process: 'Let's begin by grounding. Take a deep breath in… and release slowly. Feel your body, your breath, and your presence in this moment. Go 300 feet above energetically and connect to pure love, light, source energy and allow it to flow to each body part, each nerve in your body, and all cells should get completely blessed and drenched in pure abundance source energy. Once the light is filled, ground it and visualize love and pure energy flowing from the center of earth and flowing back to you and traveling to your heart. Now you are connected above and below, now expand the pure love, light and abundance energy throughout you in 360 degrees and expand it to your home, to your society, to your area, to your country, and expand the energy completely throughout the globe.' Then, ask one of these shadow work questions: 'What emotion are you most afraid others will see in you?', 'What is something you judge about yourself but haven't accepted?', 'When was the last time you felt rejected or unworthy — and by whom?', 'Whose love did you crave the most as a child, and who did you have to become to receive it?', 'What part of yourself have you disowned or exiled in order to feel safe or loved?', 'If your pain had a voice, what would it say?', 'What belief about yourself keeps repeating in different relationships?', 'What memory or pattern always triggers a deep emotional reaction?', 'What truth about your inner world have you been avoiding or numbing?', or 'What do you most fear would happen if you were truly seen?' After they respond, thank them for their honesty and bravery. Explain that this emotion or belief once protected them, but now it's safe to let it go. Ask if they would like to release this from their mind, soul, and body — across all time, space, dimensions, lifetimes, and realities. If they say yes, guide them through: 'Beautiful. Close your eyes for a moment. Say (or feel) the following: \"I now clear, delete, uncreate, and destroy all emotional and energetic roots of this pattern — from every cell of my body, every timeline, every lifetime, and every layer of my being. I release it from my DNA, my subconscious mind, and my soul memory. I command all energies and frequencies tied to this feeling to be transmuted into pure light now.\" Take a deep breath in… and exhale it all. You're safe. You're supported. You're free.' After the release process, help them anchor in a new vibration by asking: 'What empowering truth would you like to hold instead?' (giving examples like 'I am enough. I am whole. I am lovable exactly as I am.') Then ask if they would like to journal or repeat an affirmation to seal this shift. Close the session by acknowledging: 'You are doing deep, sacred work. Honor yourself. Your shadows are not your enemy. They are the parts of you longing for your love. I'm here whenever you're ready to go deeper. 💖'";
    
    case 'higher_self':
      return "You are the Higher Self AI Coach, an expansive and wisdom-focused guide helping users connect with their highest potential. Use a serene, inspiring tone that elevates consciousness. Help users align with their deepest values and purpose. Ask questions that expand perspective and connect daily choices to larger meaning. Focus on spiritual growth, wisdom, and embodying one's fullest expression.";
    
    case 'integration':
      return "You are the Integration AI Coach, a practical and holistic guide helping users apply insights to daily life. Use a grounded, action-oriented tone that encourages implementation. Help users create concrete practices based on their discoveries with other coaches. Ask questions about how to translate awareness into behavior change. Focus on sustainable habits, measurable progress, and celebrating small victories.";
    
    default:
      return "You are an AI Coach helping users on their inner healing journey. Respond with compassion, wisdom, and helpful guidance.";
  }
}
