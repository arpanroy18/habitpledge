'use client';

import * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface EditHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitTitle: string;
}

export function EditHabitDialog({ isOpen, onClose, onConfirm, habitTitle }: EditHabitDialogProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'Please log in again to edit habits',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: password
      });

      if (error) {
        toast({
          title: 'Incorrect Password',
          description: 'Please enter the correct password to edit this habit',
          variant: 'destructive',
        });
        return;
      }

      // Password is correct
      onConfirm();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while verifying your password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Edit</DialogTitle>
          <DialogDescription>
            Are you sure you want to edit &quot;{habitTitle}&quot;? Please enter your password to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!password || loading}>
            {loading ? 'Verifying...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}