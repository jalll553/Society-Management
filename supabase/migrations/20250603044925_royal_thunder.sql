/*
  # Initial Schema for Society Management System

  1. New Tables
    - `users` - Stores authentication information and role
    - `members` - Stores detailed information about society members
    - `maintenance_bills` - Tracks monthly maintenance bills
    - `notices` - Stores society announcements
    - `complaints` - Tracks member complaints
    - `payments` - Records payment transactions for bills
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate security policies
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create maintenance_bills table
CREATE TABLE IF NOT EXISTS maintenance_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ DEFAULT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES maintenance_bills(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Members policies
CREATE POLICY "Admins can manage all members"
  ON members
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Members can view their own data"
  ON members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Maintenance bills policies
CREATE POLICY "Admins can manage all bills"
  ON maintenance_bills
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Members can view their own bills"
  ON maintenance_bills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = maintenance_bills.member_id
      AND members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Notices policies
CREATE POLICY "Admins can manage notices"
  ON notices
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view notices"
  ON notices
  FOR SELECT
  TO authenticated
  USING (true);

-- Complaints policies
CREATE POLICY "Admins can manage all complaints"
  ON complaints
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Members can manage their own complaints"
  ON complaints
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = complaints.member_id
      AND members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Admins can manage all payments"
  ON payments
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Members can view their own payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maintenance_bills
      JOIN members ON maintenance_bills.member_id = members.id
      WHERE maintenance_bills.id = payments.bill_id
      AND members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );