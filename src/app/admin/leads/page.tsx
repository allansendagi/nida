import { LeadsList } from '@/components/admin/leads-list';

export default function AdminLeadsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales Leads</h1>
        <p className="text-gray-500 mt-1">
          Manage business leads from scraped Google Places data
        </p>
      </div>

      <LeadsList />
    </div>
  );
}
