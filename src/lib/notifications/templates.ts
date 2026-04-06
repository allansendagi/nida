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
  channel: 'whatsapp' | 'sms' | 'email' | 'telegram'
): { subject?: string; body: string } {
  const categoryDisplay = payload.category.split('.').pop()?.replace(/_/g, ' ') || 'service';
  const locationDisplay = payload.location.replace(/_/g, ' ');

  switch (template) {
    case TEMPLATES.NEW_LEAD: {
      const urgencyDisplay: Record<string, string> = {
        asap: '🚨 ASAP',
        same_day: '⚡ Same Day',
        next_day: '📅 Next Day',
        this_week: '📅 This Week',
        flexible: '🕐 Flexible',
      };
      const urgencyLabel = urgencyDisplay[payload.urgency] || payload.urgency;

      // Build specifics string if available
      const specificsLines = payload.specifics
        ? Object.entries(payload.specifics)
            .filter(([, v]) => v)
            .map(([k, v]) => `• ${k.replace(/_/g, ' ')}: ${v}`)
            .join('\n')
        : '';

      if (channel === 'email') {
        return {
          subject: `🔔 New ${categoryDisplay} lead in ${locationDisplay} — ${payload.matchScore}% match`,
          body: `Hi ${payload.businessName},

You have a new lead that matches your services!

━━━━━━━━━━━━━━━━━━━━
SERVICE REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━
🔧 Service: ${categoryDisplay}
📍 Location: ${locationDisplay}
${urgencyLabel}
${payload.budgetRange ? `💰 Budget: ${payload.budgetRange}` : '💰 Budget: Not specified'}
${specificsLines ? `\nDetails:\n${specificsLines}` : ''}

📊 Match Score: ${payload.matchScore}% (Rank #${payload.matchRank})
━━━━━━━━━━━━━━━━━━━━

⏱ You have a limited window to accept. First to respond wins the job.

👉 Claim this lead: ${payload.claimUrl}

— Nida`.trim(),
        };
      } else if (channel === 'telegram') {
        return {
          body: `🔔 <b>New Lead for You!</b>

🔧 <b>${categoryDisplay.toUpperCase()}</b>
📍 ${locationDisplay}
${urgencyLabel}
${payload.budgetRange ? `💰 ${payload.budgetRange}` : ''}${specificsLines ? `\n\n<b>Details:</b>\n${specificsLines}` : ''}

📊 Match: <b>${payload.matchScore}%</b> • Rank #${payload.matchRank}

⏱ <i>You have a limited window — respond now!</i>`,
        };
      } else {
        // WhatsApp / SMS
        return {
          body: `🔔 New Lead — Nida

${categoryDisplay.toUpperCase()} in ${locationDisplay}
${urgencyLabel}
${payload.budgetRange ? `💰 ${payload.budgetRange}` : ''}${specificsLines ? `\n\nDetails:\n${specificsLines}` : ''}

Match: ${payload.matchScore}% (#${payload.matchRank})

⏱ Respond quickly — window is limited!
👉 ${payload.claimUrl}`,
        };
      }
    }

    case TEMPLATES.LEAD_REMINDER:
      if (channel === 'telegram') {
        return {
          body: `⏰ <b>Reminder</b>

You have an unclaimed <b>${categoryDisplay}</b> lead in ${locationDisplay}.

Other providers may claim it first!`,
        };
      }
      return {
        subject: channel === 'email' ? `Reminder: Unclaimed lead in ${locationDisplay}` : undefined,
        body: `⏰ Reminder: You have an unclaimed ${categoryDisplay} lead in ${locationDisplay}.

Other providers may claim it first.

Claim: ${payload.claimUrl}`,
      };

    case TEMPLATES.LEAD_EXPIRING:
      if (channel === 'telegram') {
        return {
          body: `⚠️ <b>Lead Expiring!</b>

<b>${categoryDisplay}</b> in ${locationDisplay} will be reassigned soon.

Act now or lose it!`,
        };
      }
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
      } else if (channel === 'telegram') {
        return {
          body: `🚨 <b>ATTENTION NEEDED</b>

<b>${categoryDisplay.toUpperCase()}</b> in ${locationDisplay}
⚡ Urgency: ${payload.urgency}

⚠️ ${payload.escalationTriggers?.join(', ') || 'Needs your review'}

Please review and respond using the buttons below.`,
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
      } else if (channel === 'telegram') {
        return {
          body: `✅ <b>AUTO-ACCEPTED</b>

<b>${categoryDisplay.toUpperCase()}</b> in ${locationDisplay}
⚡ Urgency: ${payload.urgency}
${payload.budgetRange ? `💰 Budget: ${payload.budgetRange}` : ''}

This lead matched your auto-accept criteria and has been confirmed.`,
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
