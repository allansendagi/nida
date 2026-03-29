export type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'push';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface NotificationPayload {
  businessId: string;
  businessName: string;
  businessPhone: string;
  businessEmail?: string;
  negotiationId: string;
  intentId: string;
  category: string;
  location: string;
  urgency: string;
  matchScore: number;
  matchRank: number;
  budgetRange?: string;
  claimUrl: string;
  // Escalation-specific fields
  escalationTriggers?: string[];
  escalationReason?: string;
  // Auto-accept fields
  autoAccepted?: boolean;
}

export interface NotificationResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface ChannelAdapter {
  channel: NotificationChannel;
  send(payload: NotificationPayload, template: string): Promise<NotificationResult>;
  checkDelivery?(externalId: string): Promise<NotificationStatus>;
}

export interface NotificationPreferences {
  channels: NotificationChannel[];
  quiet_hours?: { start: string; end: string };
  instant_alerts: boolean;
}

export interface Notification {
  id: string;
  negotiation_id: string;
  business_id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  external_id?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_at?: string;
  failure_reason?: string;
  attempts: number;
  next_retry_at?: string;
  template: string;
  payload: NotificationPayload;
  created_at: string;
}
