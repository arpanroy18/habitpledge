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
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [visibleTransactions, setVisibleTransactions] = useState<number>(5);

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
        .select('available_balance')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setBalance(data?.available_balance || 0);
    } catch (error: any) {
      console.error('Error fetching balance:', error.message || error);
      toast({
        title: 'Error',
        description: 'Failed to fetch balance. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [transactions]); // Update balance when transactions change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseFloat(amount) <= 0 || !amount) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter an amount greater than $0',
        variant: 'destructive',
      });
      return;
    }

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
                    step="1"
                    value={Number(amount).toFixed(2)}
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
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground">No transactions yet</p>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={cn(
                          "flex justify-between items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-all",
                          transaction.type === 'deposit' 
                            ? 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900' 
                            : 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900'
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium text-lg",
                              transaction.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            )}>
                              {transaction.type === 'deposit' ? '+$' : '-$'}{Math.abs(transaction.amount).toFixed(2)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                              {transaction.type === 'deposit' ? 'Deposit' : 'Pledge'}
                            </span>
                          </div>
                          {transaction.notes && (
                            <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}