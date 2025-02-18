ALTER TABLE habits DROP CONSTRAINT IF EXISTS valid_frequency;

ALTER TABLE habits 
ALTER COLUMN frequency TYPE text;

ALTER TABLE habits
ADD CONSTRAINT valid_frequency 
CHECK (
  (frequency = 'daily') OR
  (frequency = 'weekly') OR
  (frequency = 'monthly') OR
  (frequency = 'weekly_custom' AND times_per_week IS NOT NULL AND times_per_week BETWEEN 1 AND 7) OR
  (frequency = 'monthly_custom' AND times_per_month IS NOT NULL AND times_per_month BETWEEN 1 AND 31)
);