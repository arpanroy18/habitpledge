'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target, TrendingUp, Calendar, Award, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Habit = Database['public']['Tables']['habits']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const defaultXAxisProps = {
  padding: { left: 10, right: 10 }
};

const defaultYAxisProps = {
  width: 30,
  padding: { top: 20, bottom: 20 }
};

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeHabits: 0,
    completedHabits: 0,
    totalPledged: 0,
    streakDays: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        // If no profile exists, create one
        if (!profileData) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                email: session.user.email!,
                full_name: '',
              }
            ])
            .select()
            .single();

          if (!createError && newProfile) {
            setProfile(newProfile);
          }
        } else {
          setProfile(profileData);
        }

        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (habitsError) {
          console.error('Error fetching habits:', habitsError);
        } else if (habitsData) {
          setHabits(habitsData);
          
          // Calculate stats
          const activeHabits = habitsData.filter(h => h.status === 'active').length;
          const completedHabits = habitsData.filter(h => h.status === 'completed').length;
          const totalPledged = habitsData.reduce((sum, habit) => sum + Number(habit.pledge_amount), 0);
          
          setStats({
            activeHabits,
            completedHabits,
            totalPledged,
            streakDays: calculateLongestStreak(habitsData),
          });
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const calculateLongestStreak = (habits: Habit[]) => {
    // This is a placeholder - in a real app, you'd calculate this from habit_logs
    return habits.length > 0 ? Math.floor(Math.random() * 10) + 1 : 0;
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const mockChartData = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 3 },
    { name: 'Wed', completed: 5 },
    { name: 'Thu', completed: 2 },
    { name: 'Fri', completed: 4 },
    { name: 'Sat', completed: 6 },
    { name: 'Sun', completed: 4 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold">
              Good {getTimeOfDay()}, {profile?.full_name || 'there'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Track your progress and stay committed to your goals.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeHabits}</div>
              <p className="text-xs text-muted-foreground">
                Habits in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Habits</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedHabits}</div>
              <p className="text-xs text-muted-foreground">
                Successfully formed habits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalPledged}</div>
              <p className="text-xs text-muted-foreground">
                Amount at stake
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streakDays} days</div>
              <p className="text-xs text-muted-foreground">
                Your best streak
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Activity Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Your habit completion over the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" {...defaultXAxisProps} />
                <YAxis {...defaultYAxisProps} />
                <Tooltip />
                <Bar dataKey="completed" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Habits List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-dashed cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => router.push('/habits/new')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <CardTitle className="text-sm font-medium">Create New Habit</CardTitle>
              <Plus className="h-4 w-4" />
            </CardHeader>
          </Card>

          {habits.map((habit) => (
            <Card key={habit.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{habit.title}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{habit.target_days} days/{habit.period}</div>
                <p className="text-xs text-muted-foreground">
                  ${habit.pledge_amount} pledged
                </p>
                <div className="mt-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Status: <span className="capitalize">{habit.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}