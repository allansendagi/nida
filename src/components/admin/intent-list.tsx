'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from '@/lib/utils';
import { URGENCY_LABELS, ZONE_DISPLAY_NAMES, type QatarZone } from '@/types/intent';
import type { Intent, Consumer, Negotiation } from '@/types/database';

interface IntentListProps {
  intents: (Intent & {
    consumer: Consumer;
    negotiations: Pick<Negotiation, 'id' | 'business_id' | 'state' | 'match_score' | 'match_rank'>[];
  })[];
}

const statusColors: Record<string, string> = {
  intake: 'bg-gray-100 text-gray-800',
  structured: 'bg-blue-100 text-blue-800',
  matching: 'bg-yellow-100 text-yellow-800',
  negotiating: 'bg-purple-100 text-purple-800',
  executing: 'bg-green-100 text-green-800',
  settled: 'bg-gray-100 text-gray-800',
};

export function IntentList({ intents }: IntentListProps) {
  if (intents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No intents created yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {intents.map((intent) => {
        const { intent_data } = intent;
        const categoryParts = intent_data.category?.split('.') || [];
        const displayCategory = categoryParts[categoryParts.length - 1]?.replace(/_/g, ' ');
        const zone = intent_data.location?.zone as QatarZone;

        return (
          <Card key={intent.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold capitalize">{displayCategory}</h3>
                    <Badge className={statusColors[intent.status] || 'bg-gray-100'}>
                      {intent.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {intent.consumer?.name || 'Unknown'} • {intent.consumer?.phone}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>{ZONE_DISPLAY_NAMES[zone] || zone}</span>
                    <Badge variant="outline">
                      {URGENCY_LABELS[intent_data.urgency as keyof typeof URGENCY_LABELS] || intent_data.urgency}
                    </Badge>
                    {intent.negotiations?.length > 0 && (
                      <span className="text-gray-500">
                        {intent.negotiations.length} matches
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {formatDistanceToNow(intent.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
