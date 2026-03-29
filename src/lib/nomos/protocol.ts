import type {
  ProtocolMessage,
  ProtocolMessageType,
  NegotiationState,
  DiscoverMessageData,
  ProposeMessageData,
  CounterMessageData,
  AcceptMessageData,
  EscalateMessageData,
  AgreedTerms,
  ScoreBreakdown,
} from '@/types/nomos';

// State machine transitions
const STATE_TRANSITIONS: Record<NegotiationState, NegotiationState[]> = {
  discovered: ['proposed', 'accepted', 'escalated'], // V1 allows direct accept
  proposed: ['negotiating', 'accepted', 'escalated'],
  negotiating: ['negotiating', 'accepted', 'escalated'],
  accepted: ['executing'],
  executing: ['settled'],
  settled: [], // Terminal state
  escalated: ['accepted'], // Can resume after human review
};

export function canTransition(from: NegotiationState, to: NegotiationState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function createDiscoverMessage(
  score: number,
  rank: number,
  scoreBreakdown: ScoreBreakdown
): ProtocolMessage<DiscoverMessageData> {
  return {
    type: 'DISCOVER',
    timestamp: new Date().toISOString(),
    data: {
      score,
      rank,
      score_breakdown: scoreBreakdown,
    },
  };
}

export function createProposeMessage(
  price: number,
  date: string,
  notes?: string
): ProtocolMessage<ProposeMessageData> {
  return {
    type: 'PROPOSE',
    timestamp: new Date().toISOString(),
    data: {
      price,
      date,
      notes,
    },
  };
}

export function createCounterMessage(
  price: number,
  reason: string,
  round: number
): ProtocolMessage<CounterMessageData> {
  return {
    type: 'COUNTER',
    timestamp: new Date().toISOString(),
    data: {
      price,
      reason,
      round,
    },
  };
}

export function createAcceptMessage(
  executionId: string,
  agreedTerms: AgreedTerms
): ProtocolMessage<AcceptMessageData> {
  return {
    type: 'ACCEPT',
    timestamp: new Date().toISOString(),
    data: {
      execution_id: executionId,
      agreed_terms: agreedTerms,
    },
  };
}

export function createEscalateMessage(
  trigger: string,
  context: Record<string, unknown>
): ProtocolMessage<EscalateMessageData> {
  return {
    type: 'ESCALATE',
    timestamp: new Date().toISOString(),
    data: {
      trigger,
      context,
    },
  };
}

export function getNextState(
  currentState: NegotiationState,
  messageType: ProtocolMessageType
): NegotiationState {
  switch (messageType) {
    case 'DISCOVER':
      return 'discovered';
    case 'PROPOSE':
      return currentState === 'discovered' ? 'proposed' : 'negotiating';
    case 'COUNTER':
      return 'negotiating';
    case 'ACCEPT':
      return 'accepted';
    case 'ESCALATE':
      return 'escalated';
    default:
      return currentState;
  }
}

export function appendMessage(
  messages: ProtocolMessage[],
  newMessage: ProtocolMessage
): ProtocolMessage[] {
  return [...messages, newMessage];
}

/**
 * Count the number of COUNTER messages in a negotiation.
 * Used for enforcing max_negotiation_rounds limit.
 */
export function countNegotiationRounds(messages: ProtocolMessage[]): number {
  return messages.filter((m) => m.type === 'COUNTER').length;
}

/**
 * Check if the maximum negotiation rounds have been exceeded.
 * Returns true if max is defined and current rounds >= max.
 */
export function isMaxRoundsExceeded(
  messages: ProtocolMessage[],
  maxRounds?: number
): boolean {
  if (maxRounds === undefined || maxRounds === null) {
    return false;
  }
  return countNegotiationRounds(messages) >= maxRounds;
}
