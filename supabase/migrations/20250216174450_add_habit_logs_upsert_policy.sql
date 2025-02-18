-- Add policy for updating habit logs
CREATE POLICY "Users can update their own habit logs"
  ON habit_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );
