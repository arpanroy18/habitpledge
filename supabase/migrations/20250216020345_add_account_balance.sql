-- Drop existing view and function if they exist
DROP VIEW IF EXISTS account_balances;
DROP FUNCTION IF EXISTS check_sufficient_balance CASCADE;

-- Add balance view
CREATE VIEW account_balances AS
SELECT 
  p.id as user_id,
  COALESCE(d.total_deposits, 0) - COALESCE(h.total_pledged, 0) as current_balance
FROM profiles p
LEFT JOIN (
  SELECT user_id, SUM(amount) as total_deposits
  FROM deposits
  GROUP BY user_id
) d ON p.id = d.user_id
LEFT JOIN (
  SELECT user_id, SUM(pledge_amount) as total_pledged
  FROM habits
  WHERE status = 'active'
  GROUP BY user_id
) h ON p.id = h.user_id;

-- Add function to check balance
CREATE OR REPLACE FUNCTION check_sufficient_balance()
RETURNS TRIGGER AS $$
DECLARE
  available_balance DECIMAL;
BEGIN
  SELECT ab.current_balance INTO available_balance
  FROM account_balances ab
  WHERE ab.user_id = NEW.user_id;

  IF NEW.pledge_amount > COALESCE(available_balance, 0) THEN
    RAISE EXCEPTION 'Insufficient balance. Current balance: $%', COALESCE(available_balance, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to check balance before habit creation
CREATE TRIGGER check_balance_before_habit
  BEFORE INSERT ON habits
  FOR EACH ROW
  EXECUTE FUNCTION check_sufficient_balance();