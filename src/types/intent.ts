// Intent types for AI intake processing

export interface AIIntakeResult {
  complete: boolean;
  intent_data: Partial<IntentDataForIntake>;
  clarifying_question?: string;
  confidence: number;
}

export interface IntentDataForIntake {
  category: string;
  location: {
    zone: string;
    text?: string;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  urgency: 'asap' | 'same_day' | 'next_day' | 'this_week' | 'flexible';
  specifics?: Record<string, unknown>;
}

// Qatar zones for service area matching
export const QATAR_ZONES = [
  'the_pearl',
  'west_bay',
  'lusail',
  'al_sadd',
  'al_wakra',
  'al_khor',
  'dafna',
  'bin_mahmoud',
  'musheireb',
  'old_airport',
  'industrial_area',
  'al_rayyan',
  'al_gharrafa',
  'umm_salal',
  'al_duhail',
] as const;

export type QatarZone = typeof QATAR_ZONES[number];

// Zone display names
export const ZONE_DISPLAY_NAMES: Record<QatarZone, string> = {
  the_pearl: 'The Pearl',
  west_bay: 'West Bay',
  lusail: 'Lusail',
  al_sadd: 'Al Sadd',
  al_wakra: 'Al Wakra',
  al_khor: 'Al Khor',
  dafna: 'Dafna',
  bin_mahmoud: 'Bin Mahmoud',
  musheireb: 'Musheireb',
  old_airport: 'Old Airport Area',
  industrial_area: 'Industrial Area',
  al_rayyan: 'Al Rayyan',
  al_gharrafa: 'Al Gharrafa',
  umm_salal: 'Umm Salal',
  al_duhail: 'Al Duhail',
};

// Urgency display
export const URGENCY_LABELS = {
  asap: 'ASAP (Emergency)',
  same_day: 'Today',
  next_day: 'Tomorrow',
  this_week: 'This Week',
  flexible: 'Flexible',
} as const;
