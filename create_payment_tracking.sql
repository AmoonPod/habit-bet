-- Add status column to habits table if it doesn't exist
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add payment_status column to habit_stakes table
ALTER TABLE habit_stakes 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT NULL;

-- Create a new table for payment tracking
CREATE TABLE IF NOT EXISTS habit_payments (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_uuid UUID NOT NULL REFERENCES habit_stakes(uuid),
  habit_uuid UUID NOT NULL REFERENCES habits(uuid),
  amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_habit_payments_stake_uuid ON habit_payments(stake_uuid);
CREATE INDEX IF NOT EXISTS idx_habit_payments_habit_uuid ON habit_payments(habit_uuid);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_habit_payments_updated_at
BEFORE UPDATE ON habit_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 