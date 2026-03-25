'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LeadCard } from './lead-card';
import type { LeadView } from '@/types/database';

interface LeadFeedProps {
  initialLeads: LeadView[];
  businessId: string;
}

export function LeadFeed({ initialLeads, businessId }: LeadFeedProps) {
  const [leads, setLeads] = useState<LeadView[]>(initialLeads);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('lead-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'negotiations',
          filter: `business_id=eq.${businessId}`,
        },
        async () => {
          // Refetch leads when there's a change
          const { data } = await supabase
            .from('lead_view')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });

          if (data) {
            setLeads(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, supabase]);

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="font-medium text-gray-900">No leads yet</h3>
        <p className="text-sm text-gray-500 mt-1">
          New leads matching your services will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
