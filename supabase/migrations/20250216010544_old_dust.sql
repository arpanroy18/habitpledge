/*
  # Fix profiles table RLS policies

  1. Changes
    - Add INSERT policy for profiles table to allow authenticated users to create their own profile
    - Ensure policy uses auth.uid() for proper user identification

  2. Security
    - Maintains existing RLS policies
    - Adds missing INSERT policy with proper user verification
*/

-- Add INSERT policy for profiles
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);