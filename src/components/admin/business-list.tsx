'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessDetailsModal } from './business-details-modal';
import type { Business } from '@/types/database';
import type { NomosContract } from '@/types/nomos';

interface BusinessListProps {
  businesses: Business[];
}

function ApprovalStatusBadge({ status }: { status: Business['approval_status'] }) {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Rejected
        </Badge>
      );
    default:
      return null;
  }
}

export function BusinessList({ businesses }: BusinessListProps) {
  if (businesses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No businesses registered yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => {
        const contract = business.nomos_contract as NomosContract;
        return (
          <Card key={business.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{business.display_name}</h3>
                    <ApprovalStatusBadge status={business.approval_status} />
                    <Badge variant="outline" className="capitalize">
                      {business.subscription_tier}
                    </Badge>
                    {contract.issuer.verified && (
                      <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{business.phone}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {business.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  {business.approval_status === 'rejected' && business.approval_notes && (
                    <p className="text-xs text-red-600 mt-2">
                      Rejection reason: {business.approval_notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <span className="text-gray-500">Trust Score: </span>
                    <span className="font-medium">{business.trust_score}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {business.service_zones.length} zones
                  </div>
                  {business.approved_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Approved: {new Date(business.approved_at).toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-2">
                    <BusinessDetailsModal business={business} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
