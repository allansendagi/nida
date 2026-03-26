import type { NomosContract, IntentData, IntentStatus, ProtocolMessage, NegotiationState, AgreedTerms, ConsumerContact, ScoreBreakdown } from './nomos';

// =============================================================================
// Service Category Types
// =============================================================================

export interface ServiceCategory {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  keywords: string[];
  common_phrases: string[];
  specifics_to_collect: string[];
  is_active: boolean;
  display_order: number;
}

// =============================================================================
// Sequential Dispatch Types
// =============================================================================

export type OfferState = 'pending' | 'offered' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

// =============================================================================
// Database Row Types
// =============================================================================

export interface NotificationPreferences {
  channels: ('whatsapp' | 'sms' | 'email' | 'push')[];
  quiet_hours?: { start: string; end: string };
  instant_alerts: boolean;
}

export interface Business {
  id: string;
  user_id: string | null;
  nomos_contract: NomosContract;
  phone: string;
  email: string | null;
  display_name: string;
  categories: string[];
  service_zones: string[];
  trust_score: number;
  subscription_tier: 'trial' | 'basic' | 'premium';
  notification_preferences: NotificationPreferences;
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
  submitted_at: string | null;
  cr_number: string | null;
  cr_verified: boolean;
  cr_verified_at: string | null;
  cr_verified_by: string | null;
}

export interface Consumer {
  id: string;
  phone: string;
  name: string | null;
  created_at: string;
}

export interface Intent {
  id: string;
  consumer_id: string;
  status: IntentStatus;
  intent_data: IntentData;
  original_message: string | null;
  created_at: string;
  // Sequential dispatch fields
  current_offer_rank: number | null;
  offer_expires_at: string | null;
  dispatch_started_at: string | null;
}

export interface Negotiation {
  id: string;
  intent_id: string;
  business_id: string;
  state: NegotiationState;
  messages: ProtocolMessage[];
  match_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  match_rank: number | null;
  notified_at: string | null;
  claimed_at: string | null;
  created_at: string;
  // Sequential dispatch fields
  offer_state: OfferState;
  offered_at: string | null;
  responded_at: string | null;
  rejection_reason: string | null;
}

export interface Execution {
  id: string;
  execution_id: string;
  negotiation_id: string;
  agreed_terms: AgreedTerms;
  status: 'confirmed' | 'completed' | 'disputed';
  consumer_contact: ConsumerContact | null;
  created_at: string;
  completed_at: string | null;
}

export interface Conversation {
  id: string;
  consumer_id: string;
  phone: string;
  state: 'greeting' | 'clarifying' | 'complete';
  partial_intent: Partial<IntentData>;
  messages: ConversationMessage[];
  intent_id: string | null;
  created_at: string;
}

export interface ConversationMessage {
  role: 'consumer' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Rating {
  id: string;
  execution_id: string;
  business_id: string;
  consumer_id: string;
  score: number;
  comment: string | null;
  created_at: string;
}

// =============================================================================
// Insert Types (without auto-generated fields)
// =============================================================================

export type BusinessInsert = Omit<Business, 'id' | 'created_at' | 'trust_score'> & {
  id?: string;
  trust_score?: number;
};

export type ConsumerInsert = Omit<Consumer, 'id' | 'created_at'> & {
  id?: string;
};

export type IntentInsert = Omit<Intent, 'id' | 'created_at' | 'status'> & {
  id?: string;
  status?: IntentStatus;
};

export type NegotiationInsert = Omit<Negotiation, 'id' | 'created_at' | 'state' | 'messages' | 'offer_state' | 'offered_at' | 'responded_at' | 'rejection_reason'> & {
  id?: string;
  state?: NegotiationState;
  messages?: ProtocolMessage[];
  offer_state?: OfferState;
  offered_at?: string;
  responded_at?: string;
  rejection_reason?: string;
};

export type ExecutionInsert = Omit<Execution, 'id' | 'created_at' | 'status' | 'completed_at'> & {
  id?: string;
  status?: 'confirmed' | 'completed' | 'disputed';
};

export type ConversationInsert = Omit<Conversation, 'id' | 'created_at' | 'state' | 'partial_intent' | 'messages'> & {
  id?: string;
  state?: 'greeting' | 'clarifying' | 'complete';
  partial_intent?: Partial<IntentData>;
  messages?: ConversationMessage[];
};

export type RatingInsert = Omit<Rating, 'id' | 'created_at'> & {
  id?: string;
};

// =============================================================================
// Join Types
// =============================================================================

export interface NegotiationWithBusiness extends Negotiation {
  business: Business;
}

export interface NegotiationWithIntent extends Negotiation {
  intent: Intent;
}

export interface NegotiationFull extends Negotiation {
  business: Business;
  intent: Intent & { consumer: Consumer };
}

export interface ExecutionWithDetails extends Execution {
  negotiation: NegotiationWithBusiness & { intent: Intent & { consumer: Consumer } };
}

// =============================================================================
// Dashboard Views
// =============================================================================

export interface LeadView {
  id: string; // negotiation id
  intent_id: string;
  category: string;
  location_zone: string;
  location_text: string | null;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string;
  match_score: number;
  match_rank: number;
  state: NegotiationState;
  offer_state: OfferState;
  offered_at: string | null;
  responded_at: string | null;
  offer_expires_at: string | null;
  created_at: string;
  notified_at: string | null;
  claimed_at: string | null;
  consumer_name: string | null;
}

export interface LeadDetailView extends LeadView {
  intent_specifics: Record<string, unknown> | null;
  original_message: string | null;
  messages: ProtocolMessage[];
  consumer_phone: string | null; // only revealed after claim
}
