'use client';

import { useState } from 'react';
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
import type { NomosContract } from '@/types/nomos';
import { QATAR_ZONES, ZONE_DISPLAY_NAMES, type QatarZone } from '@/types/intent';
import { createClient } from '@/lib/supabase/client';

interface ProfileEditorProps {
  business: Business;
}

export function ProfileEditor({ business }: ProfileEditorProps) {
  const contract = business.nomos_contract as NomosContract;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [displayName, setDisplayName] = useState(contract.issuer.display_name);
  const [selectedZones, setSelectedZones] = useState<string[]>(contract.service_area.zones);
  const [leadTimeHours, setLeadTimeHours] = useState(contract.availability.lead_time_hours);
  const [warrantyDays, setWarrantyDays] = useState(contract.terms.warranty_days);
  const [autoAccept, setAutoAccept] = useState(contract.agent_instructions.auto_accept.enabled);

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

      // Update the contract
      const updatedContract: NomosContract = {
        ...contract,
        issuer: { ...contract.issuer, display_name: displayName },
        service_area: { ...contract.service_area, zones: selectedZones },
        availability: { ...contract.availability, lead_time_hours: leadTimeHours },
        terms: { ...contract.terms, warranty_days: warrantyDays },
        agent_instructions: {
          ...contract.agent_instructions,
          auto_accept: { ...contract.agent_instructions.auto_accept, enabled: autoAccept },
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
          <CardTitle>Agent Settings</CardTitle>
          <CardDescription>Automation preferences (V2)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Accept Leads</Label>
              <p className="text-xs text-gray-500">
                Automatically accept leads that match your criteria (coming soon)
              </p>
            </div>
            <Switch
              checked={autoAccept}
              onCheckedChange={setAutoAccept}
              disabled
            />
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
