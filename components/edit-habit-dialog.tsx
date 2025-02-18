'use client';

import * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EditHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitTitle: string;
}

export function EditHabitDialog({ isOpen, onClose, onConfirm, habitTitle }: EditHabitDialogProps) {
  const [titleInput, setTitleInput] = useState('');
  const { toast } = useToast();

  const handleConfirm = () => {
    if (titleInput.trim().toLowerCase() !== habitTitle.trim().toLowerCase()) {
      toast({
        title: 'Incorrect Title',
        description: 'Please enter the exact habit title to confirm',
        variant: 'destructive',
      });
      return;
    }

    onConfirm();
    onClose();
    setTitleInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setTitleInput('');
      }
      onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Edit</DialogTitle>
          <DialogDescription>
            To edit &quot;{habitTitle}&quot;, please enter the habit title to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="text"
            placeholder="Enter habit title"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!titleInput}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}