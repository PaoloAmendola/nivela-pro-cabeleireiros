-- migrations/0003_create_knowledge_center_tables.sql

-- Create content categories table
CREATE TABLE content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create content items table
CREATE TYPE content_type AS ENUM (
  'article', 
  'video_link', 
  'pdf_link', 
  'quick_tip', 
  'external_link'
);

CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
  type content_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- For articles or descriptions
  url TEXT, -- For links (video, pdf, external)
  image_url TEXT, -- Optional preview image
  tags TEXT[], -- For search filtering
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user favorites table
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, content_item_id) -- Prevent duplicate favorites
);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for content_items update
CREATE TRIGGER set_content_items_timestamp
BEFORE UPDATE ON content_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for all tables
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for content_categories (assuming public read, admin write)
-- Adjust as needed if categories should be restricted
CREATE POLICY "Allow public read access to categories" 
ON content_categories 
FOR SELECT 
USING (true);
-- Add policies for insert/update/delete for admins later

-- Policies for content_items (assuming public read, admin write)
CREATE POLICY "Allow public read access to content items" 
ON content_items 
FOR SELECT 
USING (true);
-- Add policies for insert/update/delete for admins later

-- Policies for user_favorites
CREATE POLICY "Allow users to view their own favorites" 
ON user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own favorites" 
ON user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own favorites" 
ON user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Add indexes
CREATE INDEX idx_content_items_category_id ON content_items(category_id);
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_content_item_id ON user_favorites(content_item_id);

-- Add Full-Text Search index (example on title and content)
-- This requires enabling the pg_trgm extension if not already enabled
-- CREATE INDEX idx_content_items_fts ON content_items USING gin (to_tsvector('portuguese', title || ' ' || coalesce(content, '')));

-- Insert some initial categories (example)
INSERT INTO content_categories (name, description) VALUES
('Aplicação Nivela', 'Guias e dicas sobre a aplicação do produto Nivela'),
('Química Capilar', 'Informações técnicas sobre estrutura do fio, pH, etc.'),
('Marketing e Vendas', 'Dicas e scripts para vender serviços no salão'),
('Saúde do Fio', 'Cuidados e tratamentos capilares');

