'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Edit, Trash } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';
import { useToast } from '@/hooks/use-toast';
import { EditHabitDialog } from '@/components/edit-habit-dialog';

type Habit = Database['public']['Tables']['habits']['Row'];

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: habitsData, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHabits(habitsData || []);
      } catch (error) {
        console.error('Error fetching habits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [router]);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleEditConfirmed = () => {
    if (editingHabit) {
      router.push(`/habits/edit/${editingHabit.id}`);
    }
  };

  const handleDelete = async (habit: Habit) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Use separate eq() conditions to ensure type matching and composite filtering
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habit.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Habit deleted successfully',
      });
      
      setHabits(habits.filter(h => h.id !== habit.id));
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete habit',
        variant: 'destructive',
      });
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Habits</h1>
          <Button onClick={() => router.push('/habits/new')}>Create New Habit</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <Card key={habit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">{habit.title}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(habit)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(habit)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{habit.description}</p>
                <div className="flex justify-between text-sm">
                  <span>Pledge: ${habit.pledge_amount}</span>
                  <div className="flex gap-4">
                    <span>{habit.target_days} {habit.frequency === 'daily' ? 'Days' : 
                          habit.frequency === 'weekly' || habit.frequency === 'weekly_custom' ? 'Weeks' : 'Months'}</span>
                    <span>
                      {habit.frequency === 'weekly_custom' 
                        ? `${habit.times_per_week}x per Week`
                        : habit.frequency === 'monthly_custom'
                          ? `${habit.times_per_month}x per Month`
                          : habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <EditHabitDialog 
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        onConfirm={handleEditConfirmed}
        habitTitle={editingHabit?.title || ''}
      />
    </div>
  );
}