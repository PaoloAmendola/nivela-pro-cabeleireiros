-- migrations/0006_create_microcourses_tables.sql

-- Create courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT, -- Optional course cover image
  estimated_duration TEXT, -- e.g., '1 hora', '30 minutos'
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create lessons table
CREATE TYPE lesson_type AS ENUM (
  'text',
  'video',
  'quiz',
  'external_link'
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL, -- To define the sequence of lessons within a course
  title TEXT NOT NULL,
  type lesson_type NOT NULL,
  content TEXT, -- For text lessons or descriptions
  video_url TEXT, -- For video lessons
  quiz_data JSONB, -- For quiz questions/answers (structure TBD)
  external_url TEXT, -- For external links
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (course_id, order_index) -- Ensure unique order within a course
);

-- Create user lesson completion table
CREATE TABLE user_lesson_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, lesson_id) -- User completes a lesson only once
);

-- Function to update the updated_at column (re-use if exists)
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()... 

-- Triggers for courses and lessons update
CREATE TRIGGER set_courses_timestamp
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_lessons_timestamp
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_completion ENABLE ROW LEVEL SECURITY;

-- Policies for courses (assuming public read for published courses, admin write)
CREATE POLICY "Allow public read access to published courses" 
ON courses 
FOR SELECT 
USING (is_published = true);
-- Add policies for insert/update/delete for admins later

-- Policies for lessons (assuming users can read lessons of published courses)
CREATE POLICY "Allow read access to lessons of published courses" 
ON lessons 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND is_published = true));
-- Add policies for insert/update/delete for admins later

-- Policies for user_lesson_completion
CREATE POLICY "Allow users to view their own lesson completions" 
ON user_lesson_completion 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own lesson completions" 
ON user_lesson_completion 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users should likely not update/delete completion records directly
-- CREATE POLICY "Allow users to delete their own lesson completions" 
-- ON user_lesson_completion 
-- FOR DELETE 
-- USING (auth.uid() = user_id);

-- Optional: Add indexes
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_user_lesson_completion_user_id ON user_lesson_completion(user_id);
CREATE INDEX idx_user_lesson_completion_lesson_id ON user_lesson_completion(lesson_id);

-- Insert some example courses/lessons (optional, for testing)
-- Example Course 1
-- WITH new_course AS (
--   INSERT INTO courses (title, description, is_published) VALUES
--   ("Fundamentos da Aplicação Nivela", "Aprenda o passo a passo essencial para aplicar o Nivela com segurança e eficácia.", true)
--   RETURNING id
-- )
-- INSERT INTO lessons (course_id, order_index, title, type, content) VALUES
-- ((SELECT id FROM new_course), 1, "Introdução ao Nivela", 'text', 'Bem-vindo ao curso...'),
-- ((SELECT id FROM new_course), 2, "Preparação do Cabelo", 'video', 'https://youtu.be/example1'),
-- ((SELECT id FROM new_course), 3, "Aplicação Correta", 'text', 'Detalhes sobre a aplicação...'),
-- ((SELECT id FROM new_course), 4, "Quiz Rápido", 'quiz', '{"question": "Qual o tempo de pausa para cabelos finos?", "options": ["10-20 min", "30-40 min", "50-60 min"], "answer": 1}');

