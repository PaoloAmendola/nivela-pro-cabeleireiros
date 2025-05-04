-- migrations/0004_create_anamnesis_table.sql

-- Create the anamnesis table to store client hair analysis data
CREATE TABLE client_anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL UNIQUE, -- Each client has one anamnesis record
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- For RLS
  
  -- Hair Characteristics
  natural_color TEXT,
  has_coloration BOOLEAN,
  coloration_details TEXT, -- e.g., brand, color number, frequency
  has_highlights BOOLEAN,
  highlights_details TEXT, -- e.g., technique, frequency
  texture TEXT, -- e.g., Fine, Medium, Coarse
  density TEXT, -- e.g., Low, Medium, High
  elasticity TEXT, -- e.g., Good, Fair, Poor
  porosity TEXT, -- e.g., Low, Medium, High
  scalp_condition TEXT, -- e.g., Normal, Oily, Dry, Sensitive, Dandruff
  
  -- Chemical History
  previous_straightening TEXT, -- e.g., Formaldehyde, Guanidine, Thioglycolate, Other, None
  last_straightening_date DATE,
  other_chemicals TEXT, -- e.g., Perms, Relaxers
  
  -- Client Habits & Concerns
  hair_routine TEXT, -- e.g., Wash frequency, products used
  main_complaint TEXT,
  desired_result TEXT,
  allergies TEXT,
  medication TEXT,
  is_pregnant_or_lactating BOOLEAN,
  
  -- Professional Analysis
  strand_test_result TEXT, -- Description of strand test outcome
  professional_observations TEXT,
  recommended_procedure TEXT, -- e.g., Nivela Standard, Nivela Blond, Do Not Proceed
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Ensure client_id is linked to the correct user for RLS check
  FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE client_anamnesis ENABLE ROW LEVEL SECURITY;

-- Function to update the updated_at column (re-use from previous migration if needed)
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()... (if not already created)

-- Trigger for client_anamnesis update
CREATE TRIGGER set_client_anamnesis_timestamp
BEFORE UPDATE ON client_anamnesis
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Policies for client_anamnesis
CREATE POLICY "Allow users to view their own client anamnesis" 
ON client_anamnesis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own client anamnesis" 
ON client_anamnesis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own client anamnesis" 
ON client_anamnesis 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Delete is implicitly handled by CASCADE on client_id, but an explicit policy can be added if needed
-- CREATE POLICY "Allow users to delete their own client anamnesis" 
-- ON client_anamnesis 
-- FOR DELETE 
-- USING (auth.uid() = user_id);

-- Optional: Add indexes
CREATE INDEX idx_client_anamnesis_client_id ON client_anamnesis(client_id);
CREATE INDEX idx_client_anamnesis_user_id ON client_anamnesis(user_id);

