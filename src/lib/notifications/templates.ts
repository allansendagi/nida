import type { NotificationPayload } from './types';

export const TEMPLATES = {
  NEW_LEAD: 'new_lead',
  LEAD_REMINDER: 'lead_reminder',
  LEAD_EXPIRING: 'lead_expiring',
  ESCALATION: 'escalation',
  AUTO_ACCEPTED: 'auto_accepted',
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

    case TEMPLATES.ESCALATION:
      if (channel === 'email') {
        return {
          subject: `🚨 Action Required: Lead needs your review`,
          body: `
Hi ${payload.businessName},

A lead requires your manual review before proceeding.

📍 Location: ${locationDisplay}
🔧 Service: ${categoryDisplay}
⚡ Urgency: ${payload.urgency}
${payload.budgetRange ? `💰 Budget: ${payload.budgetRange}` : ''}

⚠️ Escalation Reason:
${payload.escalationTriggers?.join(', ') || payload.escalationReason || 'Requires human decision'}

Review and respond: ${payload.claimUrl}

This lead has been flagged for your attention based on your agent settings.

- Nida
          `.trim(),
        };
      } else {
        return {
          body: `🚨 ATTENTION NEEDED

${categoryDisplay.toUpperCase()} in ${locationDisplay}
⚡ ${payload.urgency}

⚠️ ${payload.escalationTriggers?.join(', ') || 'Needs your review'}

Review: ${payload.claimUrl}`,
        };
      }

    case TEMPLATES.AUTO_ACCEPTED:
      if (channel === 'email') {
        return {
          subject: `✅ Lead Auto-Accepted: ${categoryDisplay} in ${locationDisplay}`,
          body: `
Hi ${payload.businessName},

Good news! A lead has been automatically accepted on your behalf.

📍 Location: ${locationDisplay}
🔧 Service: ${categoryDisplay}
⚡ Urgency: ${payload.urgency}
${payload.budgetRange ? `💰 Budget: ${payload.budgetRange}` : ''}

This lead matched your auto-accept criteria and has been confirmed.

View details: ${payload.claimUrl}

- Nida
          `.trim(),
        };
      } else {
        return {
          body: `✅ AUTO-ACCEPTED

${categoryDisplay.toUpperCase()} in ${locationDisplay}
⚡ ${payload.urgency}
${payload.budgetRange ? `💰 ${payload.budgetRange}` : ''}

View: ${payload.claimUrl}`,
        };
      }

    default:
      return { body: '' };
  }
}

// WhatsApp template IDs (for Business API approved templates)
export const WHATSAPP_TEMPLATES = {
  [TEMPLATES.NEW_LEAD]: 'nida_new_lead_v1',
  [TEMPLATES.LEAD_REMINDER]: 'nida_lead_reminder_v1',
  [TEMPLATES.LEAD_EXPIRING]: 'nida_lead_expiring_v1',
  [TEMPLATES.ESCALATION]: 'nida_escalation_v1',
  [TEMPLATES.AUTO_ACCEPTED]: 'nida_auto_accepted_v1',
} as const;
