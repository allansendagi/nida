import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from '@/lib/utils';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get business for current user
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">History</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">Business profile not found.</p>
        </div>
      </div>
    );
  }

  // Get executions for this business
  const { data: executions } = await supabase
    .from('executions')
    .select(`
      *,
      negotiation:negotiations (
        *,
        intent:intents (
          *,
          consumer:consumers (*)
        )
      )
    `)
    .eq('negotiation.business_id', business.id)
    .order('created_at', { ascending: false });

  const statusColors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    disputed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">History</h1>

      {!executions || executions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No completed jobs yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {executions.map((execution) => {
            const intent = execution.negotiation?.intent;
            const category = intent?.intent_data?.category || 'Unknown';
            const categoryParts = category.split('.');
            const displayCategory = categoryParts[categoryParts.length - 1]?.replace(/_/g, ' ');

            return (
              <Card key={execution.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold capitalize">{displayCategory}</h3>
                        <Badge className={statusColors[execution.status] || 'bg-gray-100'}>
                          {execution.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {execution.consumer_contact?.name || 'Customer'} • {execution.consumer_contact?.phone}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        {execution.agreed_terms.price} {execution.agreed_terms.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(execution.created_at)}
                      </p>
                      <p className="text-xs font-mono text-gray-400 mt-1">
                        {execution.execution_id}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
