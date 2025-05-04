-- migrations/0005_create_client_photos_table_and_storage.sql

-- Create the client_photos table to store metadata about uploaded photos
CREATE TABLE client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- For RLS
  
  photo_type TEXT NOT NULL, -- e.g., 'before', 'after'
  photo_url TEXT NOT NULL, -- URL from Supabase Storage
  storage_path TEXT NOT NULL UNIQUE, -- Path in Supabase Storage bucket
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Ensure client_id is linked to the correct user for RLS check
  FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE client_photos ENABLE ROW LEVEL SECURITY;

-- Policies for client_photos
CREATE POLICY "Allow users to view their own client photos" 
ON client_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own client photos" 
ON client_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users should likely not update photo records directly (maybe description only?)
-- CREATE POLICY "Allow users to update their own photo descriptions" 
-- ON client_photos 
-- FOR UPDATE 
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own client photos" 
ON client_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Add indexes
CREATE INDEX idx_client_photos_client_id ON client_photos(client_id);
CREATE INDEX idx_client_photos_user_id ON client_photos(user_id);

-- Supabase Storage Bucket and Policies (To be configured in Supabase Dashboard or via CLI)
-- Bucket Name: client_photos
-- Public: False (access controlled by policies)

-- Storage Policy: Allow authenticated users to view files in their own folder
-- Target roles: authenticated
-- Allowed operations: SELECT
-- Policy definition (example using user_id and client_id in path: user_id/client_id/filename.jpg):
-- (bucket_id = 'client_photos' AND
--  auth.uid()::text = (storage.foldername(name))[1] AND
--  -- Optional: Check if client_id in path belongs to user
--  EXISTS (SELECT 1 FROM clients WHERE id = (storage.foldername(name))[2]::uuid AND user_id = auth.uid())
-- )
-- Note: Simpler path like user_id/filename.jpg might be easier if client_id check is complex.
-- Let's assume path: user_id/client_id/filename.jpg for better organization.

-- Storage Policy: Allow authenticated users to upload files to their own client folders
-- Target roles: authenticated
-- Allowed operations: INSERT
-- Policy definition (example using user_id and client_id in path):
-- (bucket_id = 'client_photos' AND
--  auth.uid()::text = (storage.foldername(name))[1] AND
--  -- Check if client_id in path belongs to user
--  EXISTS (SELECT 1 FROM clients WHERE id = (storage.foldername(name))[2]::uuid AND user_id = auth.uid())
-- )

-- Storage Policy: Allow authenticated users to delete files they own (based on path)
-- Target roles: authenticated
-- Allowed operations: DELETE
-- Policy definition (example using user_id in path):
-- (bucket_id = 'client_photos' AND
--  auth.uid()::text = (storage.foldername(name))[1]
-- )

-- Note: The exact SQL for storage policies might differ slightly depending on the Supabase version and chosen path structure.
-- These policies need to be created in the Supabase dashboard under Storage > Policies.

