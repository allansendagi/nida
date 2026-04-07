'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, MapPin, Clock, DollarSign, Phone, User, CheckCircle, Timer, X } from 'lucide-react';
import { URGENCY_LABELS, ZONE_DISPLAY_NAMES, type QatarZone } from '@/types/intent';
import { formatDistanceToNow } from '@/lib/utils';
import type { Negotiation, Intent, Consumer, Execution, OfferState } from '@/types/database';

interface LeadDetailProps {
  negotiation: Negotiation & {
    intent: Intent & { consumer: Consumer };
  };
  execution: Execution | null;
  businessId: string;
}

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

const offerStateMessages: Record<OfferState, string> = {
  pending: 'This lead is currently being offered to another provider.',
  offered: 'This lead is offered to you. Respond before the timer expires.',
  accepted: 'You accepted this lead.',
  rejected: 'You rejected this lead.',
  expired: 'Your offer window expired.',
  cancelled: 'This lead was cancelled.',
};

const urgencyColors: Record<string, string> = {
  asap: 'bg-red-100 text-red-800',
  same_day: 'bg-orange-100 text-orange-800',
  next_day: 'bg-yellow-100 text-yellow-800',
  this_week: 'bg-blue-100 text-blue-800',
  flexible: 'bg-gray-100 text-gray-800',
};

export function LeadDetail({ negotiation, execution, businessId }: LeadDetailProps) {
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [completed, setCompleted] = useState(execution?.status === 'completed' || execution?.status === 'cancelled');
  const router = useRouter();

  const { intent } = negotiation;
  const { intent_data } = intent;
  const isClaimed = negotiation.state === 'accepted' || negotiation.state === 'executing' || negotiation.state === 'settled';
  const isOffered = negotiation.offer_state === 'offered';
  const canRespond = isOffered && !isClaimed;

  // Update countdown timer every second when offer is active
  useEffect(() => {
    if (!isOffered || !intent.offer_expires_at) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(intent.offer_expires_at));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOffered, intent.offer_expires_at]);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/negotiations/${negotiation.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept lead');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept lead');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this lead? It will be offered to the next provider.')) {
      return;
    }

    setRejectLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/negotiations/${negotiation.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject lead');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject lead');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!execution) return;
    if (!confirm('Mark this job as complete? This will send a rating request to the customer.')) {
      return;
    }

    setCompleteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/executions/${execution.id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mark job complete');
      }

      setCompleted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark job complete');
    } finally {
      setCompleteLoading(false);
    }
  };

  const categoryParts = intent_data.category?.split('.') || [];
  const displayCategory = categoryParts[categoryParts.length - 1]?.replace(/_/g, ' ') || 'Service';
  const zone = intent_data.location?.zone as QatarZone;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize">{displayCategory}</h1>
          <p className="text-gray-500">
            {formatDistanceToNow(negotiation.created_at)}
          </p>
        </div>
        <Badge
          className={
            isClaimed
              ? 'bg-green-100 text-green-800'
              : urgencyColors[intent_data.urgency] || 'bg-gray-100'
          }
        >
          {isClaimed
            ? 'Claimed'
            : URGENCY_LABELS[intent_data.urgency as keyof typeof URGENCY_LABELS] || intent_data.urgency}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      {/* Offer Status Card */}
      {!isClaimed && (
        <Card className={canRespond ? 'border-amber-300 border-2 bg-amber-50' : 'bg-gray-50'}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {offerStateMessages[negotiation.offer_state]}
                </p>
              </div>
              {canRespond && timeRemaining && (
                <div className={`flex items-center gap-2 text-lg font-bold ${timeRemaining === 'Expired' ? 'text-red-600' : 'text-amber-600'}`}>
                  <Timer className="h-5 w-5" />
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consumer Contact - Only shown after claim */}
      {isClaimed && execution?.consumer_contact && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{execution.consumer_contact.name || 'Customer'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <a
                href={`tel:${execution.consumer_contact.phone}`}
                className="text-primary hover:underline"
              >
                {execution.consumer_contact.phone}
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {ZONE_DISPLAY_NAMES[zone] || zone?.replace(/_/g, ' ')}
                  {intent_data.location?.text && (
                    <span className="text-gray-500"> - {intent_data.location.text}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Urgency</p>
                <p className="font-medium capitalize">
                  {URGENCY_LABELS[intent_data.urgency as keyof typeof URGENCY_LABELS] || intent_data.urgency}
                </p>
              </div>
            </div>

            {intent_data.budget && (intent_data.budget.min || intent_data.budget.max) && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">
                    {intent_data.budget.min && intent_data.budget.max
                      ? `${intent_data.budget.min} - ${intent_data.budget.max} QAR`
                      : intent_data.budget.max
                      ? `Up to ${intent_data.budget.max} QAR`
                      : `From ${intent_data.budget.min} QAR`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {intent_data.specifics && Object.keys(intent_data.specifics).length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">Additional Details</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  {Object.entries(intent_data.specifics).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {intent.original_message && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">Original Message</p>
                <p className="bg-gray-50 rounded-lg p-3 text-sm">
                  {intent.original_message}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Match Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">
              {negotiation.match_score}%
            </div>
            {negotiation.match_rank && (
              <Badge variant="secondary">
                Ranked #{negotiation.match_rank}
              </Badge>
            )}
          </div>

          {negotiation.score_breakdown && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(negotiation.score_breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span>{typeof value === 'number' ? `${Math.round(value)}%` : value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept/Reject Buttons */}
      {canRespond && (
        <div className="flex gap-3">
          <Button
            onClick={handleAccept}
            disabled={loading || rejectLoading || timeRemaining === 'Expired'}
            className="flex-1"
            size="lg"
          >
            {loading ? 'Accepting...' : 'Accept Lead'}
          </Button>
          <Button
            onClick={handleReject}
            disabled={loading || rejectLoading}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <X className="h-4 w-4 mr-2" />
            {rejectLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      )}

      {/* Show message for non-actionable states */}
      {!isClaimed && !canRespond && negotiation.offer_state !== 'pending' && (
        <Alert>
          {offerStateMessages[negotiation.offer_state]}
        </Alert>
      )}

      {/* Customer Rating — shown after job is rated */}
      {execution?.consumer_rating && (
        <div className="flex items-center gap-3 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
          <span className="text-yellow-600 font-medium">Customer Rating:</span>
          <span className="text-yellow-500 text-lg">{'⭐'.repeat(execution.consumer_rating)}</span>
          <span className="text-yellow-700 font-semibold">{execution.consumer_rating}/5</span>
        </div>
      )}

      {/* Cancelled by customer */}
      {execution?.status === 'cancelled' && isClaimed && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <X className="h-5 w-5" />
          <span className="font-medium">This job was cancelled by the customer.</span>
        </div>
      )}

      {/* Mark Complete Button */}
      {execution?.status === 'confirmed' && isClaimed && (
        <div>
          {completed ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Job marked as complete — rating request sent to customer</span>
            </div>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={completeLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {completeLoading ? 'Marking complete...' : 'Mark Job as Complete'}
            </Button>
          )}
        </div>
      )}

      {/* Execution Details */}
      {execution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Execution ID:</span>
                <span className="font-mono">{execution.execution_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge>{execution.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Agreed Price:</span>
                <span>{execution.agreed_terms.price} {execution.agreed_terms.currency}</span>
              </div>
              {execution.agreed_terms.warranty_days && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Warranty:</span>
                  <span>{execution.agreed_terms.warranty_days} days</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
