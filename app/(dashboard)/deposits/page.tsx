'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Deposit = {
  id: string;
  amount: number;
  notes: string | null;
  created_at: string;
};

type Transaction = {
  id: string;
  amount: number;
  notes: string | null;
  created_at: string;
  type: 'deposit' | 'pledge';
};

export default function DepositsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('balance_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

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
  }, [transactions]); // Update balance when transactions change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('deposits').insert([
        {
          user_id: session.user.id,
          amount: parseFloat(amount),
          notes: notes || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deposit added successfully!',
      });

      setAmount('');
      setNotes('');
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add deposit',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Balance Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Balance
                <span className="text-2xl">${balance.toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          {/* Deposit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding Deposit...' : 'Add Deposit'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Balance History */}
          <Card>
            <CardHeader>
              <CardTitle>Balance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground">No transactions yet</p>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={cn(
                        "flex justify-between items-start p-4 border rounded-lg",
                        transaction.type === 'deposit' ? 'bg-green-50/50' : 'bg-red-50/50'
                      )}
                    >
                      <div>
                        <p className={cn(
                          "font-medium",
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {transaction.type === 'deposit' ? '+' : ''}{transaction.amount.toFixed(2)}
                        </p>
                        {transaction.notes && (
                          <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}