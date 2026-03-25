'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Business } from '@/types/database';
import type { NomosContract } from '@/types/nomos';

interface ApprovalQueueProps {
  businesses: Business[];
}

export function ApprovalQueue({ businesses }: ApprovalQueueProps) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [verifyCR, setVerifyCR] = useState<Record<string, boolean>>({});

  const handleApprove = async (businessId: string) => {
    setLoadingStates((prev) => ({ ...prev, [businessId]: true }));
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve');
      }

      // If CR verification checkbox is checked, verify CR as well
      if (verifyCR[businessId]) {
        await fetch(`/api/admin/businesses/${businessId}/verify-cr`, {
          method: 'POST',
        });
      }

      router.refresh();
    } catch (error) {
      console.error('Error approving business:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve business');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [businessId]: false }));
    }
  };

  const handleReject = async (businessId: string) => {
    const notes = rejectNotes[businessId];
    if (!notes?.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [businessId]: true }));
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject');
      }

      setShowRejectForm((prev) => ({ ...prev, [businessId]: false }));
      setRejectNotes((prev) => ({ ...prev, [businessId]: '' }));
      router.refresh();
    } catch (error) {
      console.error('Error rejecting business:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject business');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [businessId]: false }));
    }
  };

  const toggleDetails = (businessId: string) => {
    setExpandedDetails((prev) => ({ ...prev, [businessId]: !prev[businessId] }));
  };

  if (businesses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No pending applications to review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => {
        const contract = business.nomos_contract as NomosContract;
        const isLoading = loadingStates[business.id];
        const isShowingRejectForm = showRejectForm[business.id];
        const isExpanded = expandedDetails[business.id];

        return (
          <Card key={business.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{business.display_name}</h3>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending Review
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{business.phone}</p>
                  {business.email && (
                    <p className="text-sm text-gray-500">{business.email}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {business.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Service Zones: {business.service_zones.join(', ')}
                  </div>
                  {business.submitted_at && (
                    <div className="mt-1 text-xs text-gray-400">
                      Submitted: {new Date(business.submitted_at).toLocaleDateString()}
                    </div>
                  )}

                  {/* CR Number Display */}
                  {business.cr_number && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-800">CR Number:</span>
                        <span className="font-mono text-sm">{business.cr_number}</span>
                        {business.cr_verified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-700 border-yellow-300">Unverified</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm">
                    <span className="text-gray-500">Trust Score: </span>
                    <span className="font-medium">{business.trust_score}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDetails(business.id)}
                    className="mt-2 text-xs"
                  >
                    {isExpanded ? 'Hide Details' : 'View NOMOS Details'}
                  </Button>
                </div>
              </div>

              {/* Expandable NOMOS Details */}
              {isExpanded && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <h4 className="font-medium text-gray-900">NOMOS Contract Details</h4>

                  {/* Issuer */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Entity ID:</span>
                      <span className="ml-2 font-mono text-xs">{contract.issuer.entity_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Verified:</span>
                      <Badge variant={contract.issuer.verified ? 'default' : 'secondary'} className="ml-2">
                        {contract.issuer.verified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <span className="text-sm text-gray-500">Service Category:</span>
                    <span className="ml-2 text-sm">{contract.service.category}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contract.service.capabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs capitalize">
                          {cap.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <span className="text-sm text-gray-500">Pricing ({contract.pricing.model}):</span>
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {contract.pricing.rules.slice(0, 2).map((rule, idx) => (
                        <div key={idx} className="text-xs bg-white p-2 rounded border">
                          <span className="capitalize font-medium">{rule.capability.replace(/_/g, ' ')}</span>:
                          Base {contract.pricing.currency} {rule.base}, Range {rule.range[0]}-{rule.range[1]}
                          {rule.negotiable && <Badge variant="secondary" className="ml-2 text-xs">Negotiable</Badge>}
                        </div>
                      ))}
                      {contract.pricing.rules.length > 2 && (
                        <span className="text-xs text-gray-400">+{contract.pricing.rules.length - 2} more rules</span>
                      )}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Lead Time:</span>
                      <span className="ml-1">{contract.availability.lead_time_hours}h</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Jobs/Day:</span>
                      <span className="ml-1">{contract.availability.capacity.max_daily_jobs}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Load:</span>
                      <span className="ml-1">{(contract.availability.capacity.current_load * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Warranty:</span>
                      <span className="ml-1">{contract.terms.warranty_days} days</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cancellation:</span>
                      <span className="ml-1">Free within {contract.terms.cancellation_policy.free_cancellation_hours}h, then {contract.terms.cancellation_policy.fee_percentage}%</span>
                    </div>
                  </div>

                  {/* Agent Instructions */}
                  <div className="text-sm">
                    <span className="text-gray-500">Auto-Accept:</span>
                    <Badge variant={contract.agent_instructions.auto_accept.enabled ? 'default' : 'secondary'} className="ml-2">
                      {contract.agent_instructions.auto_accept.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <span className="text-gray-500 ml-4">Max Rounds:</span>
                    <span className="ml-1">{contract.agent_instructions.max_negotiation_rounds || 3}</span>
                  </div>
                </div>
              )}

              {isShowingRejectForm ? (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <Textarea
                    value={rejectNotes[business.id] || ''}
                    onChange={(e) =>
                      setRejectNotes((prev) => ({ ...prev, [business.id]: e.target.value }))
                    }
                    placeholder="Please explain why this application is being rejected..."
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(business.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowRejectForm((prev) => ({ ...prev, [business.id]: false }))
                      }
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t">
                  {/* CR Verification checkbox */}
                  {business.cr_number && !business.cr_verified && (
                    <label className="flex items-center gap-2 mb-3 text-sm">
                      <input
                        type="checkbox"
                        checked={verifyCR[business.id] || false}
                        onChange={(e) =>
                          setVerifyCR((prev) => ({ ...prev, [business.id]: e.target.checked }))
                        }
                        className="rounded border-gray-300"
                      />
                      <span>Verify CR number on approval</span>
                    </label>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(business.id)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowRejectForm((prev) => ({ ...prev, [business.id]: true }))
                      }
                      disabled={isLoading}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
