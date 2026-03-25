import type { NotificationPayload } from './types';

export const TEMPLATES = {
  NEW_LEAD: 'new_lead',
  LEAD_REMINDER: 'lead_reminder',
  LEAD_EXPIRING: 'lead_expiring',
} as const;

export type TemplateName = typeof TEMPLATES[keyof typeof TEMPLATES];

// Format for different channels
export function formatMessage(
  template: TemplateName,
  payload: NotificationPayload,
  channel: 'whatsapp' | 'sms' | 'email'
): { subject?: string; body: string } {
  const categoryDisplay = payload.category.split('.').pop()?.replace(/_/g, ' ') || 'service';
  const locationDisplay = payload.location.replace(/_/g, ' ');

  switch (template) {
    case TEMPLATES.NEW_LEAD:
      if (channel === 'email') {
        return {
          subject: `New ${categoryDisplay} lead in ${locationDisplay} - Match ${payload.matchScore}%`,
          body: `
Hi ${payload.businessName},

You have a new lead matching your services!

📍 Location: ${locationDisplay}
🔧 Service: ${categoryDisplay}
⚡ Urgency: ${payload.urgency}
📊 Match Score: ${payload.matchScore}% (Rank #${payload.matchRank})
${payload.budgetRange ? `💰 Budget: ${payload.budgetRange}` : ''}

Claim this lead now: ${payload.claimUrl}

First to claim gets the customer contact.

- Nida
          `.trim(),
        };
      } else {
        // WhatsApp / SMS - keep it short
        return {
          body: `🔔 New lead!

${categoryDisplay.toUpperCase()} in ${locationDisplay}
⚡ ${payload.urgency}
📊 ${payload.matchScore}% match (#${payload.matchRank})
${payload.budgetRange ? `💰 ${payload.budgetRange}` : ''}

Claim now: ${payload.claimUrl}`,
        };
      }

    case TEMPLATES.LEAD_REMINDER:
      return {
        subject: channel === 'email' ? `Reminder: Unclaimed lead in ${locationDisplay}` : undefined,
        body: `⏰ Reminder: You have an unclaimed ${categoryDisplay} lead in ${locationDisplay}.

Other providers may claim it first.

Claim: ${payload.claimUrl}`,
      };

    case TEMPLATES.LEAD_EXPIRING:
      return {
        subject: channel === 'email' ? `Last chance: Lead expiring soon` : undefined,
        body: `⚠️ Lead expiring!

${categoryDisplay} in ${locationDisplay} will be reassigned soon.

Claim now or lose it: ${payload.claimUrl}`,
      };

    default:
      return { body: '' };
  }
}

// WhatsApp template IDs (for Business API approved templates)
export const WHATSAPP_TEMPLATES = {
  [TEMPLATES.NEW_LEAD]: 'nida_new_lead_v1',
  [TEMPLATES.LEAD_REMINDER]: 'nida_lead_reminder_v1',
  [TEMPLATES.LEAD_EXPIRING]: 'nida_lead_expiring_v1',
} as const;
