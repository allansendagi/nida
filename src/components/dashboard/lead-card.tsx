'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, DollarSign, TrendingUp, Timer } from 'lucide-react';
import type { LeadView } from '@/types/database';
import { URGENCY_LABELS } from '@/types/intent';
import { formatDistanceToNow } from '@/lib/utils';

interface LeadCardProps {
  lead: LeadView;
}

const urgencyColors: Record<string, string> = {
  asap: 'bg-red-100 text-red-800',
  same_day: 'bg-orange-100 text-orange-800',
  next_day: 'bg-yellow-100 text-yellow-800',
  this_week: 'bg-blue-100 text-blue-800',
  flexible: 'bg-gray-100 text-gray-800',
};

const stateColors: Record<string, string> = {
  discovered: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  executing: 'bg-purple-100 text-purple-800',
  settled: 'bg-gray-100 text-gray-800',
};

const offerStateColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  offered: 'bg-amber-100 text-amber-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-gray-200 text-gray-500',
};

const offerStateLabels: Record<string, string> = {
  pending: 'Waiting',
  offered: 'Your Turn',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

function formatTimeRemaining(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function LeadCard({ lead }: LeadCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  const categoryParts = lead.category?.split('.') || [];
  const displayCategory = categoryParts[categoryParts.length - 1]?.replace(/_/g, ' ') || 'Service';
  const mainCategory = categoryParts[0]?.replace(/_/g, ' ') || '';

  const isOffered = lead.offer_state === 'offered';
  const isActionable = isOffered && lead.state === 'discovered';

  // Update countdown timer every second when offer is active
  useEffect(() => {
    if (!isOffered || !lead.offer_expires_at) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(lead.offer_expires_at));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOffered, lead.offer_expires_at]);

  return (
    <Link href={`/dashboard/leads/${lead.id}`}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isActionable ? 'border-amber-300 border-2' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold capitalize">{displayCategory}</h3>
                <Badge variant="outline" className="text-xs capitalize">
                  {mainCategory}
                </Badge>
                {/* Show offer state badge */}
                <Badge className={offerStateColors[lead.offer_state] || 'bg-gray-100'}>
                  {offerStateLabels[lead.offer_state] || lead.offer_state}
                </Badge>
                {lead.state !== 'discovered' && (
                  <Badge className={stateColors[lead.state] || 'bg-gray-100'}>
                    {lead.state}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="capitalize">
                    {lead.location_zone?.replace(/_/g, ' ')}
                    {lead.location_text && ` - ${lead.location_text}`}
                  </span>
                </div>

                {(lead.budget_min || lead.budget_max) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {lead.budget_min && lead.budget_max
                        ? `${lead.budget_min} - ${lead.budget_max} QAR`
                        : lead.budget_max
                        ? `Up to ${lead.budget_max} QAR`
                        : `From ${lead.budget_min} QAR`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <Badge className={urgencyColors[lead.urgency] || 'bg-gray-100'}>
                    {URGENCY_LABELS[lead.urgency as keyof typeof URGENCY_LABELS] || lead.urgency}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Match: {lead.match_score}%</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {/* Show countdown timer for active offers */}
              {isActionable && timeRemaining && (
                <div className={`flex items-center gap-1 text-sm font-medium mb-1 ${timeRemaining === 'Expired' ? 'text-red-600' : 'text-amber-600'}`}>
                  <Timer className="h-4 w-4" />
                  <span>{timeRemaining}</span>
                </div>
              )}
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(lead.created_at)}
              </div>
              {lead.match_rank && (
                <Badge variant="secondary" className="mt-1">
                  #{lead.match_rank}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
