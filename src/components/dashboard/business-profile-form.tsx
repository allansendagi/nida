'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { QATAR_ZONES, ZONE_DISPLAY_NAMES, type QatarZone } from '@/types/intent';

const CATEGORIES = [
  { value: 'home_services.hvac', label: 'HVAC / AC Services' },
  { value: 'home_services.plumbing', label: 'Plumbing' },
  { value: 'home_services.electrical', label: 'Electrical' },
  { value: 'home_services.cleaning', label: 'Cleaning' },
  { value: 'home_services.pest_control', label: 'Pest Control' },
  { value: 'home_services.appliance_repair', label: 'Appliance Repair' },
];

const CAPABILITIES: Record<string, string[]> = {
  'home_services.hvac': ['repair', 'installation', 'maintenance', 'cleaning'],
  'home_services.plumbing': ['repair', 'installation', 'emergency', 'drain_cleaning'],
  'home_services.electrical': ['repair', 'installation', 'wiring', 'emergency'],
  'home_services.cleaning': ['deep_cleaning', 'regular', 'move_in_out', 'carpet'],
  'home_services.pest_control': ['general', 'termites', 'rodents', 'insects'],
  'home_services.appliance_repair': ['washing_machine', 'refrigerator', 'oven', 'dishwasher'],
};

interface BusinessProfileFormProps {
  existingBusiness?: {
    id: string;
    display_name: string;
    phone: string;
    email: string | null;
    categories: string[];
    service_zones: string[];
    approval_notes: string | null;
    cr_number: string | null;
  } | null;
}

export function BusinessProfileForm({ existingBusiness }: BusinessProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Extract category from existing business if editing
  const existingCategory = existingBusiness?.categories[0]?.split('.').slice(0, 2).join('.') || '';
  const existingCapabilities = existingBusiness?.categories.map(cat => cat.split('.')[2]).filter(Boolean) || [];

  // Form state
  const [displayName, setDisplayName] = useState(existingBusiness?.display_name || '');
  const [phone, setPhone] = useState(existingBusiness?.phone || '');
  const [email, setEmail] = useState(existingBusiness?.email || '');
  const [crNumber, setCrNumber] = useState(existingBusiness?.cr_number || '');
  const [category, setCategory] = useState(existingCategory);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(existingCapabilities);
  const [selectedZones, setSelectedZones] = useState<string[]>(existingBusiness?.service_zones || []);
  const [basePrice, setBasePrice] = useState('350');
  const [minPrice, setMinPrice] = useState('200');
  const [maxPrice, setMaxPrice] = useState('600');
  const [leadTimeHours, setLeadTimeHours] = useState('2');
  const [warrantyDays, setWarrantyDays] = useState('30');

  const toggleCapability = (cap: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/businesses/apply', {
        method: existingBusiness ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: existingBusiness?.id,
          displayName,
          phone,
          email: email || null,
          crNumber,
          category,
          capabilities: selectedCapabilities,
          zones: selectedZones,
          pricing: {
            base: parseInt(basePrice),
            min: parseInt(minPrice),
            max: parseInt(maxPrice),
          },
          leadTimeHours: parseInt(leadTimeHours),
          warrantyDays: parseInt(warrantyDays),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!existingBusiness;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && (
        <Alert>
          {isEditing
            ? 'Application resubmitted successfully! We will review your updated profile.'
            : 'Application submitted successfully! We will review your profile and get back to you soon.'}
        </Alert>
      )}

      {existingBusiness?.approval_notes && (
        <Alert variant="destructive">
          <strong>Feedback from reviewer:</strong> {existingBusiness.approval_notes}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Business Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Al Falah AC Services"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+974 5555 5555"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="business@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crNumber">Commercial Registration (CR) Number *</Label>
            <Input
              id="crNumber"
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              placeholder="123456789"
              required
            />
            <p className="text-xs text-gray-500">
              Your official Commercial Registration number from the Ministry of Commerce
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(val) => {
              if (val) setCategory(val);
              setSelectedCapabilities([]);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && CAPABILITIES[category] && (
            <div className="space-y-2">
              <Label>Capabilities *</Label>
              <div className="flex flex-wrap gap-2">
                {CAPABILITIES[category].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors capitalize ${
                      selectedCapabilities.includes(cap)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    {cap.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Areas</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price (QAR)</Label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability & Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time (hours)</Label>
              <Input
                id="leadTime"
                type="number"
                value={leadTimeHours}
                onChange={(e) => setLeadTimeHours(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty (days)</Label>
              <Input
                id="warranty"
                type="number"
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading || !displayName || !phone || !crNumber || !category || selectedCapabilities.length === 0 || selectedZones.length === 0}
        className="w-full"
      >
        {loading
          ? (isEditing ? 'Resubmitting...' : 'Submitting...')
          : (isEditing ? 'Resubmit Application' : 'Submit Application')}
      </Button>
    </form>
  );
}
