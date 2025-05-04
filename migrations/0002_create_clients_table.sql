-- migrations/0002_create_clients_table.sql

-- Create the clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own clients
CREATE POLICY "Allow users to view their own clients" 
ON clients 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own clients
CREATE POLICY "Allow users to insert their own clients" 
ON clients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own clients
CREATE POLICY "Allow users to update their own clients" 
ON clients 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own clients
CREATE POLICY "Allow users to delete their own clients" 
ON clients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Add indexes for performance
CREATE INDEX idx_clients_user_id ON clients(user_id);

