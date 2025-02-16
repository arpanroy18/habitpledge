/*
  # Add habit tracking system
  
  1. Changes
    - Add start_date to habits table
    - Add progress tracking view
    - Add function to check habit status
    - Add function to handle habit failure
*/

-- Add start_date to habits
ALTER TABLE habits ADD COLUMN IF NOT EXISTS start_date date DEFAULT CURRENT_DATE;

-- Create view for habit progress
CREATE OR REPLACE VIEW habit_progress AS
WITH habit_dates AS (
  SELECT 
    h.id,
    h.user_id,
    h.title,
    h.frequency,
    h.target_days,
    h.start_date,
    h.status,
    CASE 
      WHEN h.frequency = 'daily' THEN 
        generate_series(h.start_date, h.start_date + (h.target_days - 1) * INTERVAL '1 day', INTERVAL '1 day')::date
      WHEN h.frequency = 'weekly' THEN
        generate_series(h.start_date, h.start_date + (h.target_days - 1) * INTERVAL '1 week', INTERVAL '1 week')::date
    END AS expected_date
  FROM habits h
  WHERE h.status = 'active'
)
SELECT 
  hd.id as habit_id,
  hd.user_id,
  hd.title,
  hd.frequency,
  hd.target_days,
  hd.expected_date,
  COALESCE(hl.completed, false) as completed,
  hl.notes,
  CASE 
    WHEN hd.expected_date < CURRENT_DATE AND NOT COALESCE(hl.completed, false) THEN true 
    ELSE false 
  END as is_overdue
FROM habit_dates hd
LEFT JOIN habit_logs hl ON hd.id = hl.habit_id AND hd.expected_date = hl.date;

-- Function to check and update failed habits
CREATE OR REPLACE FUNCTION check_failed_habits()
RETURNS void AS $$
BEGIN
  -- Update habits to failed status if they have missed any days
  UPDATE habits
  SET 
    status = 'failed',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    id IN (
      SELECT DISTINCT habit_id 
      FROM habit_progress 
      WHERE is_overdue = true
    )
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run check_failed_habits daily
SELECT cron.schedule(
  'check-failed-habits',
  '0 0 * * *', -- Run at midnight every day
  $$SELECT check_failed_habits();$$
);