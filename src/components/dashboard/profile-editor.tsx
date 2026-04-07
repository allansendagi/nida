'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { Business } from '@/types/database';
import type { NomosContract, EscalationTrigger } from '@/types/nomos';
import { ESCALATION_TRIGGER_LABELS, ESCALATION_TRIGGER_DESCRIPTIONS } from '@/types/nomos';
import { QATAR_ZONES, ZONE_DISPLAY_NAMES, type QatarZone } from '@/types/intent';
import { createClient } from '@/lib/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

// Escalation triggers available for configuration
const CONFIGURABLE_TRIGGERS: EscalationTrigger[] = [
  'price_below_min',
  'custom_request',
  'out_of_zone',
  'high_value',
  'first_time_customer',
];

// Lead time options in hours
const LEAD_TIME_OPTIONS = [
  { value: 0, label: 'No minimum' },
  { value: 2, label: '2 hours' },
  { value: 4, label: '4 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours (1 day)' },
  { value: 48, label: '48 hours (2 days)' },
  { value: 72, label: '72 hours (3 days)' },
];

interface ProfileEditorProps {
  business: Business;
}

export function ProfileEditor({ business }: ProfileEditorProps) {
  const contract = business.nomos_contract as NomosContract;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Blocked dates state
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [datesSaving, setDatesSaving] = useState(false);

  useEffect(() => {
    setDatesLoading(true);
    fetch('/api/business/blocked-dates')
      .then(r => r.json())
      .then(data => setBlockedDates(data.dates ?? []))
      .catch(() => {})
      .finally(() => setDatesLoading(false));
  }, []);

  const toggleBlockedDate = (dateStr: string) => {
    setBlockedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const saveBlockedDates = async () => {
    setDatesSaving(true);
    try {
      await fetch('/api/business/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: blockedDates }),
      });
    } catch (_) {
      // ignore
    } finally {
      setDatesSaving(false);
    }
  };

  // Generate next 30 days for the date picker
  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Form state - Basic info
  const [displayName, setDisplayName] = useState(contract.issuer.display_name);
  const [selectedZones, setSelectedZones] = useState<string[]>(contract.service_area.zones);
  const [leadTimeHours, setLeadTimeHours] = useState(contract.availability.lead_time_hours);
  const [warrantyDays, setWarrantyDays] = useState(contract.terms.warranty_days);

  // Form state - Agent Instructions (Beta)
  const [autoAccept, setAutoAccept] = useState(contract.agent_instructions.auto_accept.enabled);
  const [autoAcceptMaxPrice, setAutoAcceptMaxPrice] = useState<number | undefined>(
    contract.agent_instructions.auto_accept.conditions?.max_price
  );
  const [autoAcceptMinLeadTime, setAutoAcceptMinLeadTime] = useState<number>(
    contract.agent_instructions.auto_accept.conditions?.min_lead_time_hours ?? 0
  );
  const [autoAcceptZones, setAutoAcceptZones] = useState<string[]>(
    contract.agent_instructions.auto_accept.conditions?.zones ?? []
  );
  const [escalationTriggers, setEscalationTriggers] = useState<string[]>(
    contract.agent_instructions.escalate_to_human.triggers
  );
  const [maxNegotiationRounds, setMaxNegotiationRounds] = useState<number>(
    contract.agent_instructions.max_negotiation_rounds ?? 3
  );

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone)
        ? prev.filter((z) => z !== zone)
        : [...prev, zone]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      // Build auto-accept conditions (only include if enabled)
      const autoAcceptConditions = autoAccept
        ? {
            ...(autoAcceptMaxPrice !== undefined && { max_price: autoAcceptMaxPrice }),
            ...(autoAcceptMinLeadTime > 0 && { min_lead_time_hours: autoAcceptMinLeadTime }),
            ...(autoAcceptZones.length > 0 && { zones: autoAcceptZones }),
          }
        : undefined;

      // Update the contract
      const updatedContract: NomosContract = {
        ...contract,
        issuer: { ...contract.issuer, display_name: displayName },
        service_area: { ...contract.service_area, zones: selectedZones },
        availability: { ...contract.availability, lead_time_hours: leadTimeHours },
        terms: { ...contract.terms, warranty_days: warrantyDays },
        agent_instructions: {
          auto_accept: {
            enabled: autoAccept,
            conditions: autoAcceptConditions,
          },
          escalate_to_human: {
            triggers: escalationTriggers,
          },
          max_negotiation_rounds: maxNegotiationRounds,
        },
        metadata: { ...contract.metadata, version: contract.metadata.version + 1 },
      };

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          nomos_contract: updatedContract,
          display_name: displayName,
          service_zones: selectedZones,
        })
        .eq('id', business.id);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert>Profile saved successfully!</Alert>}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Your public business profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Business Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <p className="text-sm text-gray-600">{business.phone}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{business.email || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <Label>Trust Score</Label>
              <Badge variant="secondary" className="ml-2">{business.trust_score}/100</Badge>
            </div>
            <div>
              <Label>Plan</Label>
              <Badge className="ml-2 capitalize">{business.subscription_tier}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Categories and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {contract.service.capabilities.map((cap) => (
              <Badge key={cap} variant="outline" className="capitalize">
                {cap.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Category: {contract.service.category}
          </p>
        </CardContent>
      </Card>

      {/* Service Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Service Areas</CardTitle>
          <CardDescription>Select the zones you serve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {QATAR_ZONES.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => toggleZone(zone)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  selectedZones.includes(zone)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                {ZONE_DISPLAY_NAMES[zone as QatarZone]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Lead time and capacity settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leadTime">Minimum Lead Time (hours)</Label>
            <Input
              id="leadTime"
              type="number"
              value={leadTimeHours}
              onChange={(e) => setLeadTimeHours(parseInt(e.target.value) || 0)}
              min={0}
              max={72}
            />
            <p className="text-xs text-gray-500">
              Minimum notice required before accepting a job
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
          <CardDescription>Mark dates when you&apos;re unavailable — you won&apos;t receive leads on these days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {datesLoading ? (
            <div className="flex gap-1 flex-wrap">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-10 w-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {next30Days.map(dateStr => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const isBlocked = blockedDates.includes(dateStr);
                  const dayLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => toggleBlockedDate(dateStr)}
                      className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-xs transition-colors ${
                        isBlocked
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{dayLabel}</span>
                      <span className="text-gray-400">{weekday}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
                  Blocked
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block" />
                  Available
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={saveBlockedDates}
                disabled={datesSaving}
              >
                {datesSaving ? 'Saving...' : 'Save blocked dates'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
          <CardDescription>Warranty and policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warranty">Warranty (days)</Label>
            <Input
              id="warranty"
              type="number"
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(parseInt(e.target.value) || 0)}
              min={0}
              max={365}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Agent Settings</CardTitle>
            <Badge variant="secondary" className="text-xs">BETA</Badge>
          </div>
          <CardDescription>Automation preferences for your AI agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Accept Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-Accept Leads</Label>
                <p className="text-xs text-gray-500">
                  Automatically accept leads that match your criteria
                </p>
              </div>
              <Switch
                checked={autoAccept}
                onCheckedChange={setAutoAccept}
              />
            </div>

            {/* Auto-Accept Conditions (shown when enabled) */}
            {autoAccept && (
              <div className="ml-4 p-4 border rounded-lg bg-gray-50 space-y-4">
                <p className="text-sm font-medium text-gray-700">
                  Auto-accept conditions (all must match):
                </p>

                {/* Max Price */}
                <div className="space-y-2">
                  <Label htmlFor="autoAcceptMaxPrice">Max Price (QAR)</Label>
                  <Input
                    id="autoAcceptMaxPrice"
                    type="number"
                    placeholder="Leave empty for no limit"
                    value={autoAcceptMaxPrice ?? ''}
                    onChange={(e) =>
                      setAutoAcceptMaxPrice(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    min={0}
                  />
                  <p className="text-xs text-gray-500">
                    Only auto-accept if the calculated price is below this amount
                  </p>
                </div>

                {/* Min Lead Time */}
                <div className="space-y-2">
                  <Label htmlFor="autoAcceptMinLeadTime">Minimum Lead Time</Label>
                  <Select
                    value={autoAcceptMinLeadTime.toString()}
                    onValueChange={(v) => v && setAutoAcceptMinLeadTime(parseInt(v))}
                  >
                    <SelectTrigger id="autoAcceptMinLeadTime">
                      <SelectValue placeholder="Select minimum lead time" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_TIME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Only auto-accept if the job is scheduled at least this far in advance
                  </p>
                </div>

                {/* Zones */}
                <div className="space-y-2">
                  <Label>Zones for Auto-Accept</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedZones.map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() =>
                          setAutoAcceptZones((prev) =>
                            prev.includes(zone)
                              ? prev.filter((z) => z !== zone)
                              : [...prev, zone]
                          )
                        }
                        className={`p-2 text-xs rounded-lg border transition-colors ${
                          autoAcceptZones.includes(zone)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-white hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {ZONE_DISPLAY_NAMES[zone as QatarZone]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {autoAcceptZones.length === 0
                      ? 'Auto-accept for all your service zones'
                      : `Only auto-accept in: ${autoAcceptZones.length} zone(s)`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Escalation Triggers Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Escalation Triggers</Label>
              <p className="text-xs text-gray-500">
                Alert you for manual review in these situations
              </p>
            </div>

            <div className="space-y-3">
              <TooltipProvider>
                {CONFIGURABLE_TRIGGERS.map((trigger) => (
                  <div key={trigger} className="flex items-center gap-3">
                    <Checkbox
                      id={`trigger-${trigger}`}
                      checked={escalationTriggers.includes(trigger)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEscalationTriggers((prev) => [...prev, trigger]);
                        } else {
                          setEscalationTriggers((prev) =>
                            prev.filter((t) => t !== trigger)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`trigger-${trigger}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-1"
                    >
                      {ESCALATION_TRIGGER_LABELS[trigger]}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {ESCALATION_TRIGGER_DESCRIPTIONS[trigger]}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <Separator />

          {/* Max Negotiation Rounds */}
          <div className="space-y-2">
            <Label htmlFor="maxRounds" className="text-base">
              Max Negotiation Rounds
            </Label>
            <Input
              id="maxRounds"
              type="number"
              value={maxNegotiationRounds}
              onChange={(e) =>
                setMaxNegotiationRounds(
                  Math.min(10, Math.max(1, parseInt(e.target.value) || 3))
                )
              }
              min={1}
              max={10}
              className="w-24"
            />
            <p className="text-xs text-gray-500">
              Auto-escalate to you after this many counter-offers (1-10)
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
