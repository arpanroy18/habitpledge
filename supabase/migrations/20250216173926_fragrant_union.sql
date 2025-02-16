-- Add function to check balance during updates
CREATE OR REPLACE FUNCTION check_sufficient_balance_for_update()
RETURNS TRIGGER AS $$
DECLARE
  available_balance DECIMAL;
  current_pledge DECIMAL;
BEGIN
  -- Get the current balance including all pledges
  SELECT ab.current_balance INTO available_balance
  FROM account_balances ab
  WHERE ab.user_id = NEW.user_id;

  -- Get the current pledge amount for this habit
  SELECT pledge_amount INTO current_pledge
  FROM habits
  WHERE id = NEW.id;

  -- Add back the current pledge to get the true available balance
  available_balance := available_balance + COALESCE(current_pledge, 0);

  -- Check if the new pledge amount exceeds the available balance
  IF NEW.pledge_amount > available_balance THEN
    RAISE EXCEPTION 'Insufficient balance. Available balance (including current pledge): $%', available_balance;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to check balance before habit update
CREATE TRIGGER check_balance_before_habit_update
  BEFORE UPDATE OF pledge_amount ON habits
  FOR EACH ROW
  EXECUTE FUNCTION check_sufficient_balance_for_update();