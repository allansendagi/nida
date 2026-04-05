import type { RatingConversationContext, SentimentType, ExtractedData, ConversationMessage } from '@/lib/ratings/types';

// =============================================================================
// Rating Conversation System Prompts
// =============================================================================

export function buildConsumerRatingPrompt(context: RatingConversationContext): string {
  return `You are Nida, a friendly AI assistant helping ${context.rater_name} share their experience with ${context.ratee_name} for a ${context.service_category} service.

SERVICE CONTEXT:
- Service: ${context.service_category}
- Provider: ${context.ratee_name}
${context.service_description ? `- Description: ${context.service_description}` : ''}

YOUR GOAL:
Collect feedback through natural conversation. Extract:
1. Overall satisfaction (will convert to 1-5 score)
2. Specific positives (themes: professional, punctual, quality, value, communication)
3. Any concerns or areas for improvement
4. Optional: encourage photo sharing

CONVERSATION FLOW:
Turn 1: Warm opener asking how the service went
Turn 2: Explore what impressed them OR what could be better
Turn 3: Suggest a score based on their feedback, confirm
Turn 4: Thank them, optionally ask for photo

GUIDELINES:
- Be conversational, not survey-like
- Match their energy (if enthusiastic, be warm; if reserved, be brief)
- Extract themes naturally from their words
- Don't push if they want to be brief
- Maximum 4 turns before closing

THEME KEYWORDS TO DETECT:
- Professional: skilled, expert, knew what doing, professional
- Punctual: on time, early, late, waited, punctual
- Quality: great work, excellent, perfect, did well, fixed it
- Value: worth it, fair price, good deal, expensive, overpriced
- Communication: explained, clear, responsive, helpful, friendly

RESPONSE FORMAT:
Always respond with valid JSON:
{
  "message": "Your conversational response to the user",
  "extracted": {
    "sentiment": "positive" | "neutral" | "negative",
    "themes": ["professional", "punctual", ...],
    "suggested_score": 1-5 or null,
    "key_phrases": ["arrived on time", ...],
    "concerns": ["was a bit late", ...],
    "confidence": 0.0-1.0
  },
  "conversation_complete": boolean,
  "ask_for_photo": boolean
}

CURRENT CONVERSATION:
${formatConversationHistory(context.messages)}

USER'S LATEST MESSAGE: (This is what you're responding to)
`;
}

export function buildBusinessRatingPrompt(context: RatingConversationContext): string {
  return `You are Nida, helping ${context.rater_name} rate their customer ${context.ratee_name} after a ${context.service_category} job.

SERVICE CONTEXT:
- Service: ${context.service_category}
- Customer: ${context.ratee_name}

YOUR GOAL:
Collect brief feedback on the customer to help match them with providers. Extract:
1. Overall rating (1-5)
2. Dimensional scores: clarity, punctuality, respect, payment
3. Any notable positives or concerns

CONVERSATION FLOW:
Turn 1: Brief opener asking how the job went with this customer
Turn 2: Quick follow-up on specific dimensions if needed
Turn 3: Confirm score and close

GUIDELINES:
- Keep it brief - businesses are busy
- Focus on actionable feedback
- Be neutral - this helps matching, not punishment
- Maximum 3 turns

DIMENSION DEFINITIONS:
- Clarity: Did they know what they wanted? Clear requirements?
- Punctuality: Were they available/on time for appointments?
- Respect: Professional communication? Respectful of your work?
- Payment: Paid on time? Any payment issues?

RESPONSE FORMAT:
{
  "message": "Your conversational response",
  "extracted": {
    "sentiment": "positive" | "neutral" | "negative",
    "suggested_score": 1-5 or null,
    "dimensions": {
      "clarity": 1-5 or null,
      "punctuality": 1-5 or null,
      "respect": 1-5 or null,
      "payment": 1-5 or null
    },
    "key_phrases": [],
    "concerns": [],
    "confidence": 0.0-1.0
  },
  "conversation_complete": boolean
}

CURRENT CONVERSATION:
${formatConversationHistory(context.messages)}

USER'S LATEST MESSAGE:
`;
}

// =============================================================================
// Sentiment Analysis Prompts
// =============================================================================

export const SENTIMENT_ANALYSIS_PROMPT = `Analyze the following feedback and extract sentiment, themes, and key information.

INPUT TEXT:
{feedback_text}

EXTRACT:
1. Overall sentiment (positive/neutral/negative)
2. Themes present (professional, punctual, quality, value, communication, respectful)
3. Key positive phrases
4. Key concerns/negatives
5. Suggested 1-5 score
6. Confidence in analysis (0-1)

RESPONSE FORMAT (JSON only):
{
  "overall": "positive" | "neutral" | "negative",
  "confidence": 0.0-1.0,
  "themes": [
    {"name": "professional", "sentiment": "positive", "mentions": 2},
    ...
  ],
  "keywords": ["great service", "on time", ...],
  "concerns": ["was expensive", ...],
  "suggested_score": 4
}
`;

// =============================================================================
// Theme Detection
// =============================================================================

export const THEME_KEYWORDS: Record<string, string[]> = {
  professional: [
    'professional', 'skilled', 'expert', 'knowledgeable', 'knew what they were doing',
    'competent', 'experienced', 'thorough', 'careful'
  ],
  punctual: [
    'on time', 'early', 'punctual', 'timely', 'prompt', 'arrived when',
    'late', 'waited', 'delayed', 'no-show'
  ],
  quality: [
    'great work', 'excellent', 'perfect', 'good job', 'fixed it', 'works great',
    'high quality', 'well done', 'satisfied', 'happy with'
  ],
  value: [
    'worth it', 'fair price', 'good deal', 'reasonable', 'affordable',
    'expensive', 'overpriced', 'too much', 'cheap'
  ],
  communication: [
    'explained', 'clear', 'responsive', 'helpful', 'friendly', 'polite',
    'rude', 'didn\'t explain', 'ignored', 'good communication'
  ],
  timeliness: [
    'quick', 'fast', 'efficient', 'slow', 'took too long', 'speedy',
    'same day', 'right away', 'immediately'
  ]
};

// =============================================================================
// Score Extraction
// =============================================================================

export function extractScoreFromText(text: string): number | null {
  // Direct number mentions
  const numberMatch = text.match(/\b([1-5])\s*(out of\s*5|\/5|stars?)?/i);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }

  // Word-based scores
  const scoreWords: Record<string, number> = {
    'perfect': 5,
    'excellent': 5,
    'amazing': 5,
    'outstanding': 5,
    'great': 4,
    'good': 4,
    'very good': 4,
    'satisfied': 4,
    'okay': 3,
    'ok': 3,
    'average': 3,
    'fine': 3,
    'not great': 2,
    'poor': 2,
    'bad': 2,
    'terrible': 1,
    'awful': 1,
    'horrible': 1,
  };

  const lowerText = text.toLowerCase();
  for (const [word, score] of Object.entries(scoreWords)) {
    if (lowerText.includes(word)) {
      return score;
    }
  }

  return null;
}

export function detectThemes(text: string): string[] {
  const detectedThemes: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        if (!detectedThemes.includes(theme)) {
          detectedThemes.push(theme);
        }
        break;
      }
    }
  }

  return detectedThemes;
}

export function detectSentiment(text: string): SentimentType {
  const positiveWords = [
    'great', 'excellent', 'good', 'amazing', 'perfect', 'happy', 'satisfied',
    'professional', 'recommend', 'best', 'love', 'thank', 'impressed'
  ];
  const negativeWords = [
    'bad', 'terrible', 'awful', 'poor', 'disappointed', 'angry', 'upset',
    'worst', 'horrible', 'never', 'avoid', 'rude', 'late', 'expensive'
  ];

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++;
  }
  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount + 1) return 'positive';
  if (negativeCount > positiveCount + 1) return 'negative';
  return 'neutral';
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatConversationHistory(messages: ConversationMessage[]): string {
  if (!messages || messages.length === 0) {
    return '(No previous messages)';
  }

  return messages
    .map((msg) => {
      const role = msg.role === 'ai' ? 'Nida' : msg.role === 'consumer' ? 'Customer' : 'Business';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
}

export function buildExtractedData(
  feedback: string,
  aiExtracted?: Partial<ExtractedData>
): ExtractedData {
  // Combine AI extraction with rule-based fallbacks
  const sentiment = aiExtracted?.sentiment || detectSentiment(feedback);
  const themes = aiExtracted?.themes?.length ? aiExtracted.themes : detectThemes(feedback);
  const suggestedScore = aiExtracted?.suggested_score || extractScoreFromText(feedback);

  return {
    sentiment,
    themes,
    suggested_score: suggestedScore ?? undefined,
    key_phrases: aiExtracted?.key_phrases || [],
    concerns: aiExtracted?.concerns || [],
    confidence: aiExtracted?.confidence || 0.5,
  };
}

// =============================================================================
// Conversation Opener Templates
// =============================================================================

export const CONVERSATION_OPENERS = {
  consumer: {
    standard: (serviceName: string, providerName: string) =>
      `Hey! How did the ${serviceName} service go with ${providerName}?`,
    follow_up: (providerName: string) =>
      `Hi there! Just checking in - how was your experience with ${providerName}?`,
    reminder: (providerName: string) =>
      `Quick reminder - we'd love to hear how things went with ${providerName}! Just reply 1-5 or tell us in your words.`,
  },
  business: {
    standard: (customerName: string) =>
      `Hey! How was working with ${customerName || 'this customer'}?`,
    follow_up: (customerName: string) =>
      `Quick check - how did the job go with ${customerName || 'the customer'}? Rate 1-5 or share your thoughts.`,
  }
};

// =============================================================================
// Response Generation
// =============================================================================

export function generateScoreConfirmation(suggestedScore: number, sentiment: SentimentType): string {
  if (sentiment === 'positive') {
    return `Sounds like a ${suggestedScore}/5 experience! Would you agree?`;
  } else if (sentiment === 'negative') {
    return `I understand there were some issues. Would you rate this a ${suggestedScore}/5?`;
  }
  return `Based on what you shared, would you say it was about a ${suggestedScore}/5?`;
}

export function generateThankYou(includePhotoAsk: boolean): string {
  const base = "Thanks for sharing your feedback!";
  if (includePhotoAsk) {
    return `${base} Want to share a photo of the completed work? (optional)`;
  }
  return base;
}

export function generateNudgeMessage(
  raterType: 'consumer' | 'business',
  rateeName: string,
  hasOtherPartyRated: boolean
): string {
  if (hasOtherPartyRated) {
    return `${rateeName} has rated you! Submit your rating to see what they said.`;
  }

  if (raterType === 'consumer') {
    return `Quick reminder: How was your experience with ${rateeName}? Reply 1-5 or share your thoughts.`;
  }

  return `How did the job go with the customer? A quick rating helps us match you with great customers.`;
}
