'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Phone,
  Globe,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react';

interface SalesLead {
  id: string;
  place_id: string;
  google_cid: string | null;
  title: string;
  category_name: string | null;
  categories: string[] | null;
  phone: string | null;
  phone_unformatted: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  total_score: number | null;
  reviews_count: number;
  opening_hours: Array<{ day: string; hours: string }> | null;
  nida_category: string | null;
  outreach_status: string;
  contacted_at: string | null;
  follow_up_at: string | null;
  notes: string | null;
  source_file: string | null;
  scraped_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadsStats {
  total: number;
  statusCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  cities: string[];
  followUpDue: number;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interested', label: 'Interested', color: 'bg-green-100 text-green-800' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-100 text-gray-800' },
  { value: 'converted', label: 'Converted', color: 'bg-purple-100 text-purple-800' },
  { value: 'invalid', label: 'Invalid', color: 'bg-red-100 text-red-800' },
];

const CATEGORY_LABELS: Record<string, string> = {
  'home_services.pest_control': 'Pest Control',
  'home_services.cleaning': 'Cleaning',
  'home_services.handyman': 'Handyman',
  'home_services.appliance_repair': 'Appliance Repair',
  'home_services.painting': 'Painting',
  'home_services.landscaping': 'Landscaping',
  'home_services.hvac': 'HVAC',
  'home_services.plumbing': 'Plumbing',
  'home_services.electrical': 'Electrical',
};

function StatusBadge({ status }: { status: string }) {
  const option = STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <Badge className={option?.color || 'bg-gray-100 text-gray-800'}>
      {option?.label || status}
    </Badge>
  );
}

function formatCategory(category: string | null): string {
  if (!category) return 'Uncategorized';
  return CATEGORY_LABELS[category] || category.split('.').pop() || category;
}

export function LeadsList() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [stats, setStats] = useState<LeadsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<SalesLead | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [saving, setSaving] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPhoneFilter, setHasPhoneFilter] = useState(false);

  // Pagination
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 25;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (cityFilter !== 'all') params.set('city', cityFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (hasPhoneFilter) params.set('hasPhone', 'true');
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());

      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setLeads(data.leads);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, cityFilter, searchQuery, hasPhoneFilter, offset]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLead = async (id: string, updates: Partial<SalesLead>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...data.lead } : l))
      );
      fetchStats();
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateLead(id, { outreach_status: newStatus } as Partial<SalesLead>);
  };

  const handleSaveNotes = async () => {
    if (!editingLead) return;

    await updateLead(editingLead.id, {
      notes: editNotes,
      follow_up_at: editFollowUp || null,
    } as Partial<SalesLead>);

    setEditingLead(null);
  };

  const openEditDialog = (lead: SalesLead) => {
    setEditingLead(lead);
    setEditNotes(lead.notes || '');
    setEditFollowUp(
      lead.follow_up_at
        ? new Date(lead.follow_up_at).toISOString().slice(0, 16)
        : ''
    );
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setCityFilter('all');
    setSearchQuery('');
    setHasPhoneFilter(false);
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Leads</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.statusCounts?.new || 0}
              </div>
              <div className="text-sm text-gray-500">New</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.statusCounts?.interested || 0}
              </div>
              <div className="text-sm text-gray-500">Interested</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {stats.statusCounts?.converted || 0}
              </div>
              <div className="text-sm text-gray-500">Converted</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-500 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Business name or phone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOffset(0);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-[150px]">
              <label className="text-sm text-gray-500 mb-1 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  if (v) setStatusFilter(v);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <label className="text-sm text-gray-500 mb-1 block">Category</label>
              <Select
                value={categoryFilter}
                onValueChange={(v) => {
                  if (v) setCategoryFilter(v);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {stats?.categoryCounts &&
                    Object.entries(stats.categoryCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, count]) => (
                        <SelectItem key={cat} value={cat}>
                          {formatCategory(cat)} ({count})
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[150px]">
              <label className="text-sm text-gray-500 mb-1 block">City</label>
              <Select
                value={cityFilter}
                onValueChange={(v) => {
                  if (v) setCityFilter(v);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {stats?.cities?.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHasPhoneFilter(!hasPhoneFilter);
                setOffset(0);
              }}
              className={hasPhoneFilter ? 'bg-blue-50' : ''}
            >
              <Phone className="h-4 w-4 mr-1" />
              Has Phone
            </Button>

            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {leads.length} of {total} leads
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading leads...</div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No leads found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const isExpanded = expandedId === lead.id;

            return (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  {/* Main row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{lead.title}</h3>
                        <StatusBadge status={lead.outreach_status} />
                        <Badge variant="outline" className="text-xs">
                          {formatCategory(lead.nida_category)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone_unformatted || lead.phone}`}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {lead.phone}
                          </a>
                        )}
                        {lead.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {lead.city}
                            {lead.neighborhood && ` - ${lead.neighborhood}`}
                          </span>
                        )}
                        {lead.total_score && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            {lead.total_score} ({lead.reviews_count} reviews)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={lead.outreach_status}
                        onValueChange={(v) => v && handleStatusChange(lead.id, v)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(lead)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : lead.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Address:</span>
                          <p>{lead.address || 'Not available'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Google Categories:</span>
                          <p>{lead.categories?.join(', ') || lead.category_name || 'N/A'}</p>
                        </div>
                        {lead.website && (
                          <div>
                            <span className="text-gray-500">Website:</span>
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              Visit website
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {lead.contacted_at && (
                          <div>
                            <span className="text-gray-500">Last Contacted:</span>
                            <p>{new Date(lead.contacted_at).toLocaleDateString()}</p>
                          </div>
                        )}
                        {lead.follow_up_at && (
                          <div>
                            <span className="text-gray-500">Follow-up:</span>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(lead.follow_up_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {lead.notes && (
                        <div className="text-sm">
                          <span className="text-gray-500">Notes:</span>
                          <p className="mt-1 p-2 bg-gray-50 rounded">
                            {lead.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {lead.lat && lead.lng && (
                          <a
                            href={`https://www.google.com/maps?q=${lead.lat},${lead.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-7 gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted transition-colors"
                          >
                            <MapPin className="h-4 w-4" />
                            View on Map
                          </a>
                        )}
                        {lead.google_cid && (
                          <a
                            href={`https://www.google.com/maps?cid=${lead.google_cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-7 gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Google Maps
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Notes Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead: {editingLead?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Follow-up Date
              </label>
              <Input
                type="datetime-local"
                value={editFollowUp}
                onChange={(e) => setEditFollowUp(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingLead(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNotes} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
