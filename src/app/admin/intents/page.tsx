import { createServiceClient } from '@/lib/supabase/server';
import { TestIntentForm } from '@/components/admin/test-intent-form';
import { IntentList } from '@/components/admin/intent-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AdminIntentsPage() {
  const supabase = createServiceClient();

  const { data: intents } = await supabase
    .from('intents')
    .select(`
      *,
      consumer:consumers (*),
      negotiations (
        id,
        business_id,
        state,
        match_score,
        match_rank
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Intent Testing</h1>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Test Intent</TabsTrigger>
          <TabsTrigger value="list">All Intents ({intents?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <TestIntentForm />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <IntentList intents={intents || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
