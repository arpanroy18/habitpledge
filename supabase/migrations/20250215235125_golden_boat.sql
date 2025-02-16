/*
  # Initial Schema Setup for HabitPledge

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text) - user's email
      - `full_name` (text) - user's full name
      - `avatar_url` (text) - profile picture URL
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references profiles
      - `title` (text) - habit name
      - `description` (text) - detailed description
      - `frequency` (text) - daily, weekly, etc.
      - `target_days` (int) - number of days needed per period
      - `pledge_amount` (decimal) - money amount to risk
      - `charity_id` (uuid) - selected charity
      - `status` (text) - active, paused, completed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `habit_logs`
      - `id` (uuid, primary key)
      - `habit_id` (uuid) - references habits
      - `date` (date) - log date
      - `completed` (boolean)
      - `notes` (text) - optional notes
      - `created_at` (timestamp)
    
    - `charities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `website` (text)
      - `logo_url` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access to sensitive data
*/

-- Create tables
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  website text,
  logo_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text,
  frequency text NOT NULL,
  target_days integer NOT NULL,
  pledge_amount decimal(10,2) NOT NULL,
  charity_id uuid REFERENCES charities(id),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed'))
);

CREATE TABLE habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) NOT NULL,
  date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own habit logs"
  ON habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view active charities"
  ON charities FOR SELECT
  USING (active = true);

-- Create functions
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_habits
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_charities
  BEFORE UPDATE ON charities
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();