/**
 * Nida Platform .nomos Contract
 *
 * Loads the platform's formal operational logic specification and converts it
 * into a governance block that is prepended to every AI intake system prompt.
 *
 * This ensures the AI operates within formally declared constraints — not
 * improvised behavior — making hallucination a .nomos violation, not just a bug.
 */

import platformContract from '@/config/nida.nomos.json';

interface PlatformContract {
  nomos_version: string;
  artifact_id: string;
  contract_type: string;
  issuer: {
    name: string;
    type: string;
    entity_id: string;
    jurisdiction: string;
  };
  agent_instructions: {
    role: string;
    identity: string;
    allowed_actions: string[];
    restricted_actions: string[];
    escalate_to_human: {
      triggers: string[];
      channel: string;
      message: string;
    };
    tone: string;
    language: string;
    constraint_violation_response: string;
  };
  consumer_rights: Record<string, boolean>;
  platform_rules: {
    offer_window_minutes: number;
    max_dispatch_rank: number;
    one_active_intent_per_consumer: boolean;
    consumer_notified_on: string[];
    [key: string]: unknown;
  };
  jurisdiction: {
    country: string;
    currency: string;
    primary_language: string;
  };
  metadata: {
    version: number;
    published_at: string;
  };
}

const contract = platformContract as PlatformContract;

/**
 * Generates a governance block derived from the platform .nomos contract.
 * This is prepended to every AI intake system prompt as a hard constraint layer.
 *
 * The structure mirrors the .nomos whitepaper's "Legal Physics" concept:
 * formally declared rules that the agent cannot override.
 */
export function buildGovernanceBlock(): string {
  const { agent_instructions, consumer_rights, platform_rules, jurisdiction, metadata } = contract;

  const restricted = agent_instructions.restricted_actions
    .map(a => `  • NEVER ${a.replace(/_/g, ' ')}`)
    .join('\n');

  const rights = Object.entries(consumer_rights)
    .filter(([, v]) => v === true)
    .map(([k]) => `  • ${k.replace(/_/g, ' ')}`)
    .join('\n');

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLATFORM GOVERNANCE — ${contract.artifact_id} v${metadata.version}
Jurisdiction: ${jurisdiction.country} | Currency: ${jurisdiction.currency} | Standard: NOMOS v${contract.nomos_version}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGENT IDENTITY
${agent_instructions.identity}

TONE & LANGUAGE
${agent_instructions.tone}. ${agent_instructions.language}.

STRICTLY FORBIDDEN — these are absolute constraints, not suggestions:
${restricted}

If a consumer asks you to do something in the restricted list, respond:
"${agent_instructions.constraint_violation_response}"

CONSUMER RIGHTS YOU MUST UPHOLD:
${rights}

PLATFORM RULES:
  • One active request per consumer at a time
  • Providers have ${platform_rules.offer_window_minutes} minutes to accept each offer
  • Consumer is notified when: ${platform_rules.consumer_notified_on.join(', ')}
  • Do NOT invent ETAs, provider names, or outcomes you cannot verify from actual data

ESCALATION — route to human support for:
  ${agent_instructions.escalate_to_human.triggers.join(', ')}
  Say: "${agent_instructions.escalate_to_human.message}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Returns the raw platform contract — useful for admin dashboards,
 * API exposure, or agent-to-agent communication.
 */
export function getPlatformContract(): PlatformContract {
  return contract;
}

/**
 * Returns the artifact ID and version for logging/audit purposes.
 */
export function getContractRef(): string {
  return `${contract.artifact_id} v${contract.metadata.version} (${contract.metadata.published_at})`;
}
