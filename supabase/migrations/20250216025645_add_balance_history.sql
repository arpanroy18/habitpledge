
-- Create balance history view
CREATE OR REPLACE VIEW balance_history AS
(
  -- Deposits (positive transactions)
  SELECT
    id,
    user_id,
    amount,
    notes,
    created_at,
    'deposit' as type
  FROM deposits
)
UNION ALL
(
  -- Habit pledges (negative transactions)
  SELECT
    id,
    user_id,
    -pledge_amount as amount,
    'Pledged for habit: ' || title as notes,
    created_at,
    'pledge' as type
  FROM habits
  WHERE status = 'active'
)
ORDER BY created_at DESC;