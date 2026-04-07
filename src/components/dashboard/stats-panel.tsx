'use client';

import { useEffect, useState } from 'react';

interface Stats {
  leadsReceived: number;
  acceptanceRate: number;
  jobsCompleted: number;
  avgRating: number | null;
  ratingCount: number;
  trustScore: number;
  leadsThisMonth: number;
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-card border rounded-xl px-5 py-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent || 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export function StatsPanel({ businessId }: { businessId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/business/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border rounded-xl px-5 py-4 animate-pulse">
            <div className="h-3 bg-muted rounded w-2/3 mb-2" />
            <div className="h-7 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatTile
        label="Leads received"
        value={String(stats.leadsReceived)}
        sub={stats.leadsThisMonth > 0 ? `+${stats.leadsThisMonth} this month` : 'No leads yet'}
      />
      <StatTile
        label="Acceptance rate"
        value={stats.leadsReceived > 0 ? `${stats.acceptanceRate}%` : '—'}
        sub={stats.leadsReceived > 0 ? `${stats.leadsReceived} total offers` : 'No offers yet'}
        accent={stats.acceptanceRate >= 70 ? 'text-green-600' : stats.acceptanceRate > 0 ? 'text-yellow-600' : undefined}
      />
      <StatTile
        label="Jobs completed"
        value={String(stats.jobsCompleted)}
        sub={stats.jobsCompleted === 0 ? 'Mark jobs done to track' : undefined}
      />
      <StatTile
        label="Avg rating"
        value={stats.avgRating ? `${stats.avgRating.toFixed(1)} ⭐` : '—'}
        sub={stats.ratingCount > 0 ? `${stats.ratingCount} review${stats.ratingCount !== 1 ? 's' : ''}` : 'No ratings yet'}
        accent={stats.avgRating && stats.avgRating >= 4.5 ? 'text-green-600' : undefined}
      />
    </div>
  );
}
