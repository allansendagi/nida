import { createServiceClient } from '@/lib/supabase/server';
import { BusinessList } from '@/components/admin/business-list';
import { AddBusinessForm } from '@/components/admin/add-business-form';
import { ApprovalQueue } from '@/components/admin/approval-queue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AdminBusinessesPage() {
  const supabase = createServiceClient();

  const { data: allBusinesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  const businesses = allBusinesses || [];
  const pendingBusinesses = businesses.filter((b) => b.approval_status === 'pending');
  const approvedBusinesses = businesses.filter((b) => b.approval_status === 'approved');

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Business Management</h1>

      <Tabs defaultValue={pendingBusinesses.length > 0 ? 'pending' : 'list'}>
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Approval
            {pendingBusinesses.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                {pendingBusinesses.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="list">All Businesses ({approvedBusinesses.length})</TabsTrigger>
          <TabsTrigger value="add">Add Business</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <ApprovalQueue businesses={pendingBusinesses} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <BusinessList businesses={businesses} />
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <AddBusinessForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
