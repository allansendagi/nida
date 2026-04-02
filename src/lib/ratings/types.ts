// =============================================================================
// NIDA Rating System v2 Types
// =============================================================================

// =============================================================================
// Enums and Constants
// =============================================================================

export type RaterType = 'consumer' | 'business';

export type RatingConversationState =
  | 'pending'     // Not yet initiated
  | 'initiated'   // First message sent, awaiting response
  | 'collecting'  // Actively collecting feedback (multi-turn)
  | 'complete'    // Rating successfully collected
  | 'expired'     // No response after reminders
  | 'skipped';    // User opted out

export type RatingStatus =
  | 'pending'         // No ratings requested yet
  | 'requested'       // Rating request sent
  | 'consumer_rated'  // Only consumer has rated
  | 'business_rated'  // Only business has rated
  | 'both_rated'      // Both have rated, awaiting reveal
  | 'revealed'        // Mutual reveal complete
  | 'expired';        // Rating window closed

export type CompletionSignalType =
  | 'business_marked_complete'
  | 'consumer_confirmed'
  | 'time_elapsed'
  | 'payment_detected'
  | 'follow_up_silence';

export type ConsumerPriorityTier = 'standard' | 'preferred' | 'premium';

export type InsightPeriodType = 'weekly' | 'monthly' | 'quarterly';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export type InsightType = 'strength' | 'improvement' | 'trend' | 'alert';

export type InsightPriority = 'high' | 'medium' | 'low';

// =============================================================================
// Rating Conversation Types
// =============================================================================

export interface ConversationMessage {
  role: 'system' | 'consumer' | 'business' | 'ai';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: 'greeting' | 'score' | 'feedback' | 'media' | 'close';
    extracted_score?: number;
    extracted_themes?: string[];
  };
}

export interface ExtractedData {
  sentiment?: SentimentType;
  themes?: string[];
  suggested_score?: number;
  key_phrases?: string[];
  concerns?: string[];
  confidence?: number;
}

export interface MediaAttachment {
  type: 'photo' | 'voice';
  url: string;
  whatsapp_media_id?: string;
  analysis?: {
    description?: string;
    quality_indicators?: string[];
    concerns?: string[];
  };
  transcription?: string; // For voice notes
}

// =============================================================================
// Rating Dimension Types
// =============================================================================

// Dimensions when consumer rates business
export interface BusinessRatingDimensions {
  quality?: number;        // Quality of work (1-5)
  professionalism?: number; // Professional conduct (1-5)
  value?: number;          // Value for money (1-5)
  communication?: number;  // Communication quality (1-5)
  timeliness?: number;     // On-time arrival/completion (1-5)
}

// Dimensions when business rates consumer
export interface ConsumerRatingDimensions {
  clarity?: number;      // Clarity of requirements (1-5)
  punctuality?: number;  // Was available/on time (1-5)
  respect?: number;      // Respectful communication (1-5)
  payment?: number;      // Prompt payment (1-5)
}

export type RatingDimensions = BusinessRatingDimensions | ConsumerRatingDimensions;

// =============================================================================
// Sentiment Analysis Types
// =============================================================================

export interface ThemeSentiment {
  name: string;
  sentiment: SentimentType;
  mentions: number;
}

export interface SentimentData {
  overall: SentimentType;
  confidence: number;
  themes: ThemeSentiment[];
  keywords: string[];
}

// =============================================================================
// Badge Types
// =============================================================================

export type BadgeType =
  | 'first_job'
  | 'five_star'
  | 'repeat_customer'
  | 'top_rated'
  | 'quick_responder'
  | 'reliable';

export interface Badge {
  type: BadgeType;
  earned_at: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Insight Types
// =============================================================================

export interface ThemeTrend {
  theme: string;
  count: number;
  trend: 'up' | 'stable' | 'down';
}

export interface BusinessInsight {
  type: InsightType;
  message: string;
  priority: InsightPriority;
  actionable: boolean;
  data?: Record<string, unknown>;
}

export interface RatingSummary {
  v2_count: number;
  v2_average: number;
  recent_themes: string[];
  last_rating_at: string | null;
}

// =============================================================================
// Smart Timing Types
// =============================================================================

export interface TimingConfig {
  // Category-specific delays before requesting rating (in minutes)
  category_delays: Record<string, number>;
  // Default delay if category not specified
  default_delay: number;
  // Reminder intervals (in hours)
  reminder_intervals: number[];
  // Maximum reminders before expiring
  max_reminders: number;
  // Rating window duration (in hours)
  rating_window_hours: number;
}

export const DEFAULT_TIMING_CONFIG: TimingConfig = {
  category_delays: {
    'home_services.hvac': 60,           // 1 hour - verify AC is working
    'home_services.plumbing': 30,       // 30 min
    'home_services.electrical': 30,     // 30 min
    'home_services.cleaning': 15,       // 15 min
    'automotive.repair': 120,           // 2 hours - verify car is working
    'automotive.wash': 5,               // 5 min
    'professional_services': 60,        // 1 hour
    'delivery': 5,                      // 5 min
  },
  default_delay: 30, // 30 minutes
  reminder_intervals: [2, 24, 48],  // 2 hours, 24 hours, 48 hours
  max_reminders: 3,
  rating_window_hours: 72,  // 3 days
};

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface InitiateRatingRequest {
  execution_id: string;
  force?: boolean; // Skip timing check
}

export interface InitiateRatingResponse {
  success: boolean;
  consumer_conversation_id?: string;
  business_conversation_id?: string;
  scheduled_at?: string;
  error?: string;
}

export interface SubmitRatingRequest {
  execution_id: string;
  rater_type: RaterType;
  overall_score: number;
  dimensions?: RatingDimensions;
  raw_feedback?: string;
  photos?: string[];
  voice_note_url?: string;
}

export interface SubmitRatingResponse {
  success: boolean;
  rating_id?: string;
  both_rated?: boolean;
  revealed?: boolean;
  error?: string;
}

export interface RevealResponse {
  success: boolean;
  consumer_rating?: {
    score: number;
    feedback?: string;
    themes?: string[];
  };
  business_rating?: {
    score: number;
    dimensions?: ConsumerRatingDimensions;
  };
  error?: string;
}

export interface RecordSignalRequest {
  execution_id: string;
  signal_type: CompletionSignalType;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// WhatsApp Conversation Context
// =============================================================================

export interface RatingConversationContext {
  execution_id: string;
  rater_type: RaterType;
  rater_name: string;
  ratee_name: string;
  service_category: string;
  service_description?: string;
  conversation_state: RatingConversationState;
  messages: ConversationMessage[];
  extracted_data: ExtractedData;
  turn_count: number;
}

// =============================================================================
// Consumer Reputation Types
// =============================================================================

export interface ConsumerReputationData {
  trust_score: number;
  clarity_score: number;
  punctuality_score: number;
  respect_score: number;
  payment_score: number;
  total_jobs: number;
  rating_count: number;
  average_rating: number;
  cancellation_count: number;
  cancellation_rate: number;
  badges: Badge[];
  priority_tier: ConsumerPriorityTier;
}

// =============================================================================
// Priority Tier Boost Configuration
// =============================================================================

export const PRIORITY_TIER_BOOSTS: Record<ConsumerPriorityTier, number> = {
  standard: 0,
  preferred: 0.05,  // 5% boost
  premium: 0.15,    // 15% boost
};
