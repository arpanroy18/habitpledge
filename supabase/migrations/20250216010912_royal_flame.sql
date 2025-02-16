/*
  # Add deposits table and related features

  1. New Tables
    - `deposits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (decimal)
      - `created_at` (timestamp)
      - `notes` (text, optional)

  2. Security
    - Enable RLS on deposits table
    - Add policies for authenticated users
*/

CREATE TABLE deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deposits"
  ON deposits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own deposits"
  ON deposits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());