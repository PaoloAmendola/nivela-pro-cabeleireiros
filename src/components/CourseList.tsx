
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

// Interfaces based on DB
interface Course {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  estimated_duration?: string | null;
  lesson_count?: number; // Added to store lesson count
  completed_count?: number; // Added to store completed lesson count
}

const CourseList = () => {
  const { supabase, session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch published courses and aggregate lesson/completion counts
      // This requires a more complex query, potentially using RPC or multiple queries
      // For simplicity, let's fetch courses first, then counts separately (less efficient)

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('title');

      if (courseError) throw courseError;

      // Fetch lesson counts and completion counts for each course
      const coursesWithCounts = await Promise.all(
        (courseData || []).map(async (course) => {
          // Count total lessons
          const { count: lessonCount, error: lessonCountError } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);
          if (lessonCountError) console.error(`Error counting lessons for ${course.id}:`, lessonCountError);

          // Count completed lessons by the user
          const { count: completedCount, error: completedCountError } = await supabase
            .from('user_lesson_completion')
            .select('lesson_id', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .in('lesson_id', (await supabase.from('lessons').select('id').eq('course_id', course.id)).data?.map(l => l.id) || []); // Get lesson IDs for the course
          if (completedCountError) console.error(`Error counting completions for ${course.id}:`, completedCountError);

          return {
            ...course,
            lesson_count: lessonCount ?? 0,
            completed_count: completedCount ?? 0,
          };
        })
      );

      setCourses(coursesWithCounts);

    } catch (err: unknown) { // Changed any to unknown
      console.error('Error fetching courses:', err);
      setError(`Erro ao carregar cursos: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [supabase, session]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) {
    return <div>Carregando lista de cursos...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-full">
      {courses.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          Nenhum curso disponível no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => {
            const progress = course.lesson_count && course.lesson_count > 0
              ? (course.completed_count ?? 0) / course.lesson_count * 100
              : 0;
            return (
              <Link href={`/cursos/${course.id}`} key={course.id} passHref>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                  <CardHeader className="relative p-0">
                    {course.image_url ? (
                      <Image 
                        src={course.image_url} 
                        alt={course.title} 
                        width={400} 
                        height={150} 
                        className="w-full h-36 object-cover rounded-t-lg" 
                        unoptimized // Add if images are external/not optimized by Next.js
                      />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-primary to-blue-600 dark:from-secondary dark:to-orange-700 rounded-t-lg flex items-center justify-center">
                        {/* Placeholder Icon or Gradient */}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{course.title}</CardTitle>
                        {course.description && (
                        <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {course.description}
                        </CardDescription>
                        )}
                    </div>
                    <div>
                        {course.lesson_count !== undefined && course.lesson_count > 0 && (
                            <div className="mt-2">
                                <Progress value={progress} className="h-1.5" />
                                <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(progress)}% concluído</p>
                            </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseList;

