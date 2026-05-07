export type Role = 'student' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  dark_mode: boolean
  is_banned: boolean
  created_at: string
}

export interface InviteToken {
  id: string
  token: string
  label: string | null
  used_by: string | null
  used_at: string | null
  expires_at: string | null
  max_uses: number
  use_count: number
  created_by: string | null
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  is_published: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  bunny_video_id: string | null
  bunny_library_id: string | null
  duration_seconds: number | null
  sort_order: number
  is_published: boolean
  created_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
}


export interface Branding {
  id: string
  platform_name: string
  logo_url: string | null
  primary_color: string
  accent_color: string
  updated_at: string
}

// Erweiterte Typen mit Joins
export interface CourseWithProgress extends Course {
  modules: (Module & { lessons: Lesson[] })[]
  completedLessons: number
  totalLessons: number
}
