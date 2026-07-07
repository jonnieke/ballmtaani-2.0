-- ═══════════════════════════════════════════════════════════════════════════
-- BallMtaani Redeem Engine — run once in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add value_kes to reward_items (the KES amount passed to Credofaster)
ALTER TABLE reward_items ADD COLUMN IF NOT EXISTS value_kes integer;

-- Populate from existing seeded airtime items
UPDATE reward_items SET value_kes = 50  WHERE name ILIKE '%50%'  AND category IN ('airtime', 'data');
UPDATE reward_items SET value_kes = 100 WHERE name ILIKE '%100%' AND category IN ('airtime', 'data');
UPDATE reward_items SET value_kes = 200 WHERE name ILIKE '%200%' AND category IN ('airtime', 'data');

-- For data bundles the amount sent to Credofaster may be in KES, not GB.
-- Update these manually after confirming Credofaster's data bundle API:
-- UPDATE reward_items SET value_kes = 100 WHERE name ILIKE '%1GB%' AND category = 'data';
-- UPDATE reward_items SET value_kes = 200 WHERE name ILIKE '%2GB%' AND category = 'data';
-- UPDATE reward_items SET value_kes = 500 WHERE name ILIKE '%5GB%' AND category = 'data';

-- 2. Add Credofaster transaction ID column to redemptions
ALTER TABLE reward_redemptions ADD COLUMN IF NOT EXISTS credofaster_txn_id text;

-- 3. Atomic coin deduction (prevents double-spend under concurrent requests)
CREATE OR REPLACE FUNCTION deduct_coins(p_user_id uuid, p_amount int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins integer;
BEGIN
  SELECT coins INTO v_coins FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_coins IS NULL OR v_coins < p_amount THEN
    RETURN false;
  END IF;
  UPDATE profiles SET coins = coins - p_amount WHERE id = p_user_id;
  RETURN true;
END;
$$;

-- 4. Coin refund (used when Credofaster fails after coins were deducted)
CREATE OR REPLACE FUNCTION refund_coins(p_user_id uuid, p_amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles SET coins = coins + p_amount WHERE id = p_user_id;
END;
$$;

-- 5. Grant execute to authenticated users (RLS-style control via SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION deduct_coins(uuid, int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION refund_coins(uuid, int) TO authenticated, service_role;
