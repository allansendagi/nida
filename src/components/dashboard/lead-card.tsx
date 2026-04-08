'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, DollarSign, TrendingUp, Timer, X } from 'lucide-react';
import type { LeadView } from '@/types/database';
import { URGENCY_LABELS } from '@/types/intent';
import { formatDistanceToNow } from '@/lib/utils';

interface LeadCardProps {
  lead: LeadView;
  businessId: string;
  onDismiss?: (id: string) => void;
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
  cancelled: 'bg-red-100 text-red-700',
  dismissed: 'bg-gray-100 text-gray-400',
};

const offerStateLabels: Record<string, string> = {
  pending: 'Waiting',
  offered: 'Your Turn',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
  dismissed: 'Dismissed',
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
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function LeadCard({ lead, businessId, onDismiss }: LeadCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState(false);

  const categoryParts = lead.category?.split('.') || [];
  const displayCategory = categoryParts[categoryParts.length - 1]?.replace(/_/g, ' ') || 'Service';
  const mainCategory = categoryParts[0]?.replace(/_/g, ' ') || '';

  const isOffered = lead.offer_state === 'offered';
  const isActionable = isOffered && lead.state === 'discovered';
  const isCancelled = lead.offer_state === 'cancelled';
  const isTerminal = ['cancelled', 'expired', 'rejected'].includes(lead.offer_state);

  useEffect(() => {
    if (!isOffered || !lead.offer_expires_at) { setTimeRemaining(null); return; }
    const update = () => setTimeRemaining(formatTimeRemaining(lead.offer_expires_at));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOffered, lead.offer_expires_at]);

  const handleDismiss = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissing(true);
    try {
      await fetch(`/api/negotiations/${lead.id}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      onDismiss?.(lead.id);
    } catch {
      setDismissing(false);
    }
  };

  return (
    <Link href={`/dashboard/leads/${lead.id}`}>
      <Card className={`
        transition-all cursor-pointer relative overflow-hidden
        ${isActionable ? 'border-amber-300 border-2 hover:shadow-md' : ''}
        ${isCancelled ? 'border-red-200 bg-red-50/40' : ''}
        ${isTerminal && !isCancelled ? 'border-gray-200 bg-gray-50/60 opacity-75' : ''}
        ${!isActionable && !isTerminal ? 'hover:shadow-md' : ''}
      `}>
        {/* Cancelled banner */}
        {isCancelled && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs font-semibold text-center py-0.5 tracking-wide uppercase">
            Cancelled by customer
          </div>
        )}

        <CardContent className={`p-4 ${isCancelled ? 'pt-6' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className={`font-semibold capitalize ${isTerminal ? 'text-gray-500' : ''}`}>
                  {displayCategory}
                </h3>
                <Badge variant="outline" className="text-xs capitalize">
                  {mainCategory}
                </Badge>
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

            <div className="text-right flex flex-col items-end gap-1">
              {isActionable && timeRemaining && (
                <div className={`flex items-center gap-1 text-sm font-medium ${timeRemaining === 'Expired' ? 'text-red-600' : 'text-amber-600'}`}>
                  <Timer className="h-4 w-4" />
                  <span>{timeRemaining}</span>
                </div>
              )}
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(lead.created_at)}
              </div>
              {lead.match_rank && (
                <Badge variant="secondary">#{lead.match_rank}</Badge>
              )}
              {/* Dismiss button for terminal leads */}
              {isTerminal && onDismiss && (
                <button
                  onClick={handleDismiss}
                  disabled={dismissing}
                  className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                  title="Dismiss from feed"
                >
                  <X className="h-3 w-3" />
                  {dismissing ? 'Removing...' : 'Dismiss'}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
