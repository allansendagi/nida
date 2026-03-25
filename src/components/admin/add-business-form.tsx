'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { QATAR_ZONES, ZONE_DISPLAY_NAMES, type QatarZone } from '@/types/intent';

interface ServiceCategory {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  keywords: string[];
  common_phrases: string[];
  specifics_to_collect: string[];
  is_active: boolean;
  display_order: number;
}

export function AddBusinessForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Categories state
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState('350');
  const [minPrice, setMinPrice] = useState('200');
  const [maxPrice, setMaxPrice] = useState('600');
  const [leadTimeHours, setLeadTimeHours] = useState('2');
  const [warrantyDays, setWarrantyDays] = useState('30');

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Derive parent categories (subcategories like home_services.hvac)
  const parentCategories = categories
    .filter((c) => c.parent_id && !c.specifics_to_collect?.length)
    .map((c) => ({ value: c.id, label: c.name }));

  // Derive capabilities for selected category
  const getCapabilitiesForCategory = (categoryId: string): string[] => {
    // Get leaf categories that are children of this category
    const leafCategories = categories.filter(
      (c) => c.parent_id === categoryId && c.specifics_to_collect?.length > 0
    );
    // Return just the last part of the id (e.g., 'repair' from 'home_services.hvac.repair')
    return leafCategories.map((c) => c.id.split('.').pop() || c.id);
  };

  const capabilities = category ? getCapabilitiesForCategory(category) : [];

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
      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          phone,
          email: email || null,
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
        throw new Error(data.error || 'Failed to create business');
      }

      setSuccess(true);
      setDisplayName('');
      setPhone('');
      setEmail('');
      setCategory('');
      setSelectedCapabilities([]);
      setSelectedZones([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Loading categories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert>Business created successfully!</Alert>}

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
                {parentCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && capabilities.length > 0 && (
            <div className="space-y-2">
              <Label>Capabilities *</Label>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((cap) => (
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
        disabled={loading || !displayName || !phone || !category || selectedCapabilities.length === 0 || selectedZones.length === 0}
        className="w-full"
      >
        {loading ? 'Creating...' : 'Create Business'}
      </Button>
    </form>
  );
}
