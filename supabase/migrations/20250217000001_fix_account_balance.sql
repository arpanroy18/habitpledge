-- Drop and recreate the account_balances view with correct calculation
DROP VIEW IF EXISTS account_balances CASCADE;

CREATE VIEW account_balances AS
WITH deposit_totals AS (
    SELECT user_id, COALESCE(SUM(amount), 0) as total_deposits
    FROM deposits
    GROUP BY user_id
),
pledge_totals AS (
    SELECT user_id, COALESCE(SUM(pledge_amount), 0) as total_pledged
    FROM habits
    GROUP BY user_id
)
SELECT 
    p.id as user_id,
    COALESCE(d.total_deposits, 0) as total_deposits,
    COALESCE(h.total_pledged, 0) as total_pledged,
    COALESCE(d.total_deposits, 0) - COALESCE(h.total_pledged, 0) as available_balance
FROM profiles p
LEFT JOIN deposit_totals d ON d.user_id = p.id
LEFT JOIN pledge_totals h ON h.user_id = p.id;