'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QATAR_ZONES, ZONE_DISPLAY_NAMES, type QatarZone } from '@/types/intent';

const CATEGORIES = [
  { value: 'home_services.hvac.repair', label: 'AC Repair' },
  { value: 'home_services.hvac.installation', label: 'AC Installation' },
  { value: 'home_services.hvac.maintenance', label: 'AC Maintenance' },
  { value: 'home_services.plumbing.repair', label: 'Plumbing Repair' },
  { value: 'home_services.plumbing.emergency', label: 'Plumbing Emergency' },
  { value: 'home_services.electrical.repair', label: 'Electrical Repair' },
  { value: 'home_services.cleaning.deep_cleaning', label: 'Deep Cleaning' },
];

const URGENCY_OPTIONS = [
  { value: 'asap', label: 'ASAP (Emergency)' },
  { value: 'same_day', label: 'Same Day' },
  { value: 'next_day', label: 'Next Day' },
  { value: 'this_week', label: 'This Week' },
  { value: 'flexible', label: 'Flexible' },
];

export function TestIntentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const router = useRouter();

  // Manual mode state
  const [consumerPhone, setConsumerPhone] = useState('+974 5555 1234');
  const [consumerName, setConsumerName] = useState('Test Customer');
  const [category, setCategory] = useState('');
  const [zone, setZone] = useState('');
  const [urgency, setUrgency] = useState('this_week');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  // AI mode state
  const [message, setMessage] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumerPhone,
          consumerName,
          intentData: {
            category,
            location: { zone },
            urgency,
            budget: {
              min: budgetMin ? parseInt(budgetMin) : undefined,
              max: budgetMax ? parseInt(budgetMax) : undefined,
            },
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create intent');
      }

      const data = await response.json();
      setSuccess(`Intent created! ${data.matchCount} businesses matched.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create intent');
    } finally {
      setLoading(false);
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/intents/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumerPhone,
          consumerName,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process message');
      }

      const data = await response.json();

      if (data.complete) {
        setSuccess(`Intent created! ${data.matchCount} businesses matched.`);
        setMessage('');
        router.refresh();
      } else {
        setSuccess(`AI Response: ${data.clarifyingQuestion}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert>{success}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Consumer Info</CardTitle>
          <CardDescription>Simulated consumer details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consumerPhone">Phone</Label>
              <Input
                id="consumerPhone"
                value={consumerPhone}
                onChange={(e) => setConsumerPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumerName">Name</Label>
              <Input
                id="consumerName"
                value={consumerName}
                onChange={(e) => setConsumerName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'ai')}>
        <TabsList>
          <TabsTrigger value="manual">Manual Intent</TabsTrigger>
          <TabsTrigger value="ai">AI Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Intent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={(val) => val && setCategory(val)}>
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

                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select value={zone} onValueChange={(val) => val && setZone(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {QATAR_ZONES.map((z) => (
                        <SelectItem key={z} value={z}>
                          {ZONE_DISPLAY_NAMES[z as QatarZone]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Urgency *</Label>
                  <Select value={urgency} onValueChange={(val) => val && setUrgency(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Budget Min (QAR)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Budget Max (QAR)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={loading || !category || !zone}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Intent & Run DISCOVER'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <form onSubmit={handleAISubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulated Consumer Message</CardTitle>
                <CardDescription>
                  Enter a message as if from a consumer via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., My AC is not cooling, I'm in West Bay and need someone urgently"
                  rows={4}
                />
              </CardContent>
            </Card>

            <Button type="submit" disabled={loading || !message} className="w-full">
              {loading ? 'Processing...' : 'Process with AI'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
