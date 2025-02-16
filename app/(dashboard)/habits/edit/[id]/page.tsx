'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';
import { use } from 'react';

type Habit = Database['public']['Tables']['habits']['Row'];

export default function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (error) throw error;
        if (!data) {
          toast({
            title: 'Error',
            description: 'Habit not found',
            variant: 'destructive',
          });
          router.push('/habits');
          return;
        }

        // Verify ownership
        if (data.user_id !== session.user.id) {
          toast({
            title: 'Error',
            description: 'You do not have permission to edit this habit',
            variant: 'destructive',
          });
          router.push('/habits');
          return;
        }

        setHabit(data);
      } catch (error) {
        console.error('Error fetching habit:', error);
        toast({
          title: 'Error',
          description: 'Failed to load habit details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [resolvedParams.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          title: habit.title,
          description: habit.description,
          frequency: habit.frequency,
          target_days: Number(habit.target_days),
          pledge_amount: Number(habit.pledge_amount),
          updated_at: new Date().toISOString(),
        })
        .eq('id', habit.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Habit updated successfully',
      });
      router.push('/habits');
    } catch (error) {
      console.error('Error updating habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!habit) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habit.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Habit deleted successfully',
      });
      router.push('/habits');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete habit',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!habit) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Habit</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Title</label>
                <Input
                  id="title"
                  value={habit.title}
                  onChange={(e) => setHabit({ ...habit, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  value={habit.description || ''}
                  onChange={(e) => setHabit({ ...habit, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="target_days">Target Days</label>
                  <Input
                    id="target_days"
                    type="number"
                    value={habit.target_days?.toString() || ''}
                    onChange={(e) => setHabit({ ...habit, target_days: parseInt(e.target.value) || 0 })}
                    required
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="pledge_amount">Pledge Amount ($)</label>
                  <Input
                    id="pledge_amount"
                    type="number"
                    value={habit.pledge_amount?.toString() || ''}
                    onChange={(e) => setHabit({ ...habit, pledge_amount: parseInt(e.target.value) || 0 })}
                    required
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-4">
                <Button onClick={() => router.push('/habits')} type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button">Delete Habit</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this habit and all its history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button onClick={() => handleDelete()} variant="destructive" disabled={deleting}>
                      {deleting ? 'Deleting...' : 'Delete Habit'}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}