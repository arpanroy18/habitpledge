'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function NewHabitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    target_days: '',
    pledge_amount: '',
  });

  const fetchBalance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('account_balances')
        .select('current_balance')
        .eq('user_id', session.user.id)
        .single();
      if (error) throw error;
      setBalance(data?.current_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('habits').insert([
        {
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          frequency: formData.frequency,
          target_days: parseInt(formData.target_days),
          pledge_amount: parseFloat(formData.pledge_amount),
          status: 'active',
        },
      ]);

      if (error) {
        // Handle insufficient balance error specifically
        if (error.message.includes('Insufficient balance')) {
          toast({
            title: 'Insufficient Balance',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Habit created successfully!',
      });

      router.push('/habits');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create habit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Habit</CardTitle>
          <p className="text-sm text-muted-foreground">Current Balance: ${balance.toFixed(2)}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Habit Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_days">Target Days</Label>
                <Input
                  id="target_days"
                  type="number"
                  min="1"
                  value={formData.target_days}
                  onChange={(e) => setFormData({ ...formData, target_days: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pledge_amount">Pledge Amount ($)</Label>
                <Input
                  id="pledge_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pledge_amount}
                  onChange={(e) => setFormData({ ...formData, pledge_amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Habit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}