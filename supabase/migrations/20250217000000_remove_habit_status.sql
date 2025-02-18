-- Remove habit status tracking features

-- First drop dependent views
DROP VIEW IF EXISTS balance_history CASCADE;
DROP VIEW IF EXISTS account_balances CASCADE;

-- Drop habit_logs table and its policies
DROP TABLE IF EXISTS "public"."habit_logs" CASCADE;

-- Remove status column from habits table
ALTER TABLE "public"."habits" DROP COLUMN IF EXISTS "status";

-- Remove any related functions or triggers
DROP FUNCTION IF EXISTS check_habit_status() CASCADE;
DROP FUNCTION IF EXISTS update_habit_status() CASCADE;

-- Recreate the views without the status dependency
CREATE VIEW account_balances AS
SELECT 
    p.id as user_id,
    COALESCE(SUM(d.amount), 0) as total_deposits,
    COALESCE(SUM(h.pledge_amount), 0) as total_pledged,
    COALESCE(SUM(d.amount), 0) - COALESCE(SUM(h.pledge_amount), 0) as available_balance
FROM profiles p
LEFT JOIN deposits d ON d.user_id = p.id
LEFT JOIN habits h ON h.user_id = p.id
GROUP BY p.id;

CREATE VIEW balance_history AS
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
    UNION ALL
    -- Pledges (negative transactions)
    SELECT
        h.id,
        h.user_id,
        -h.pledge_amount as amount,
        h.title as notes,
        h.created_at,
        'pledge' as type
    FROM habits h
);
