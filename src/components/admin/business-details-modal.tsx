'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Business } from '@/types/database';
import type { NomosContract } from '@/types/nomos';

interface BusinessDetailsModalProps {
  business: Business;
  trigger?: React.ReactNode;
}

export function BusinessDetailsModal({ business, trigger }: BusinessDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contract = business.nomos_contract as NomosContract;

  const formatOperatingHours = (hours: NomosContract['availability']['operating_hours']) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.map(day => {
      const schedule = hours[day];
      if (schedule === 'closed') return { day, hours: 'Closed' };
      if (typeof schedule === 'object') return { day, hours: `${schedule.open} - ${schedule.close}` };
      return { day, hours: 'N/A' };
    });
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          View Details
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{business.display_name}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Issuer Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Issuer</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entity ID</span>
                    <span className="font-mono text-sm">{contract.issuer.entity_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Display Name</span>
                    <span>{contract.issuer.display_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trust Score</span>
                    <span className="font-medium">{business.trust_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified</span>
                    <Badge variant={contract.issuer.verified ? 'default' : 'secondary'}>
                      {contract.issuer.verified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {business.cr_number && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">CR Number</span>
                        <span className="font-mono">{business.cr_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">CR Verified</span>
                        <Badge variant={business.cr_verified ? 'default' : 'secondary'}>
                          {business.cr_verified ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Service Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Service</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span>{contract.service.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Capabilities</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contract.service.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary" className="capitalize">
                          {cap.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {contract.service.constraints && Object.keys(contract.service.constraints).length > 0 && (
                    <div>
                      <span className="text-gray-500">Constraints</span>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(contract.service.constraints, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </section>

              {/* Pricing Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Pricing</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model</span>
                    <Badge variant="outline" className="capitalize">{contract.pricing.model}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Currency</span>
                    <span>{contract.pricing.currency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-2">Pricing Rules</span>
                    <div className="space-y-2">
                      {contract.pricing.rules.map((rule, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium capitalize">{rule.capability.replace(/_/g, ' ')}</span>
                            <Badge variant={rule.negotiable ? 'default' : 'secondary'}>
                              {rule.negotiable ? 'Negotiable' : 'Fixed'}
                            </Badge>
                          </div>
                          <div className="text-gray-600">
                            Base: {contract.pricing.currency} {rule.base} |
                            Range: {rule.range[0]} - {rule.range[1]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {contract.pricing.urgency_multiplier && (
                    <div>
                      <span className="text-gray-500 block mb-1">Urgency Multipliers</span>
                      <div className="flex gap-2">
                        {contract.pricing.urgency_multiplier.same_day && (
                          <Badge variant="outline">Same Day: {contract.pricing.urgency_multiplier.same_day}x</Badge>
                        )}
                        {contract.pricing.urgency_multiplier.next_day && (
                          <Badge variant="outline">Next Day: {contract.pricing.urgency_multiplier.next_day}x</Badge>
                        )}
                        {contract.pricing.urgency_multiplier.this_week && (
                          <Badge variant="outline">This Week: {contract.pricing.urgency_multiplier.this_week}x</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Availability Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Availability</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-500 block mb-2">Operating Hours</span>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {formatOperatingHours(contract.availability.operating_hours).map(({ day, hours }) => (
                        <div key={day} className="flex justify-between bg-white px-3 py-2 rounded">
                          <span className="capitalize">{day}</span>
                          <span className={hours === 'Closed' ? 'text-red-500' : ''}>{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lead Time</span>
                    <span>{contract.availability.lead_time_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Daily Jobs</span>
                    <span>{contract.availability.capacity.max_daily_jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Load</span>
                    <span>{(contract.availability.capacity.current_load * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </section>

              {/* Service Area Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Service Area</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-500 block mb-1">Zones</span>
                    <div className="flex flex-wrap gap-1">
                      {contract.service_area.zones.map((zone) => (
                        <Badge key={zone} variant="secondary">{zone}</Badge>
                      ))}
                    </div>
                  </div>
                  {contract.service_area.surcharge_zones && contract.service_area.surcharge_zones.length > 0 && (
                    <div>
                      <span className="text-gray-500 block mb-1">Surcharge Zones</span>
                      <div className="flex flex-wrap gap-1">
                        {contract.service_area.surcharge_zones.map((sz) => (
                          <Badge key={sz.zone} variant="outline">
                            {sz.zone}: +{sz.percentage}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Terms Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Terms</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warranty</span>
                    <span>{contract.terms.warranty_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Free Cancellation</span>
                    <span>{contract.terms.cancellation_policy.free_cancellation_hours} hours before</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cancellation Fee</span>
                    <span>{contract.terms.cancellation_policy.fee_percentage}%</span>
                  </div>
                </div>
              </section>

              {/* Agent Instructions Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Agent Instructions</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auto-Accept</span>
                    <Badge variant={contract.agent_instructions.auto_accept.enabled ? 'default' : 'secondary'}>
                      {contract.agent_instructions.auto_accept.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {contract.agent_instructions.auto_accept.enabled && contract.agent_instructions.auto_accept.conditions && (
                    <div>
                      <span className="text-gray-500 block mb-1">Auto-Accept Conditions</span>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(contract.agent_instructions.auto_accept.conditions, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 block mb-1">Escalation Triggers</span>
                    <div className="flex flex-wrap gap-1">
                      {contract.agent_instructions.escalate_to_human.triggers.map((trigger) => (
                        <Badge key={trigger} variant="outline">{trigger.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                  {contract.agent_instructions.max_negotiation_rounds && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max Negotiation Rounds</span>
                      <span>{contract.agent_instructions.max_negotiation_rounds}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Metadata Section */}
              <section>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Contract Metadata</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">NOMOS Version</span>
                    <span className="font-mono">{contract.nomos_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contract Type</span>
                    <span>{contract.contract_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Published At</span>
                    <span>{new Date(contract.metadata.published_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version</span>
                    <span>{contract.metadata.version}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
