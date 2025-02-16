import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Habit - HabitPledge',
  description: 'Edit your habit details and commitments',
};

export default function EditHabitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}