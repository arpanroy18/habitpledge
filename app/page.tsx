'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Target, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation Header */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Transform Your Habits with
          <span className="text-primary block">Real Accountability</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Put your money where your motivation is. Pledge to maintain your habits,
          or your contribution goes to charity. It's a win-win for personal growth.
        </p>
        <Button asChild size="lg" className="mr-4">
          <Link href="/register">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/about">Learn More</Link>
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Set Your Goals</CardTitle>
              <CardDescription>
                Define your habits and set achievable targets with flexible scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>Daily or weekly habits</li>
                <li>Customizable pledge amounts</li>
                <li>Progress tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Stay Accountable</CardTitle>
              <CardDescription>
                Put real stakes behind your commitments with charitable pledges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>Financial motivation</li>
                <li>Automated tracking</li>
                <li>Weekly progress reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Make an Impact</CardTitle>
              <CardDescription>
                Turn missed goals into positive change through charitable giving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>Vetted charity partners</li>
                <li>Transparent donations</li>
                <li>Impact tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Habits?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of others who are using HabitPledge to build better habits
          and make a positive impact in the world.
        </p>
        <Button asChild size="lg">
          <Link href="/register">Start Your Journey Today</Link>
        </Button>
      </section>
    </div>
  );
}