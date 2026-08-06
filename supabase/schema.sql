-- =================================================================
-- MEDSKILL PRAXIS SUPABASE DATABASE SCHEMA (FULL DDL SCRIPT)
-- Project: MedSkill LMS (ref: djigelqahkzfmwvpncvr)
-- =================================================================

-- -----------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------
CREATE TYPE public.booking_status AS ENUM (
  'pending_payment',
  'payment_unverified',
  'confirmed',
  'active',
  'completed',
  'cancelled',
  'rejected'
);

CREATE TYPE public.delivery_type AS ENUM (
  'self_pickup',
  'instant_driver',
  'scheduled_delivery'
);

CREATE TYPE public.delivery_task_status AS ENUM (
  'assigned',
  'picking_up',
  'delivering',
  'completed',
  'failed'
);

CREATE TYPE public.deposit_status AS ENUM (
  'held',
  'refunded',
  'partially_refunded',
  'forfeited'
);

CREATE TYPE public.identity_type AS ENUM (
  'ktp',
  'sim',
  'passport',
  'student_card'
);

CREATE TYPE public.refund_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'processed'
);

-- -----------------------------------------------------------------
-- 1. USERS & PROFILES
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'participant', -- 'admin', 'examiner', 'participant', 'mentor'
  is_admin BOOLEAN DEFAULT FALSE,
  university TEXT,
  university_email TEXT,
  mentor_id UUID,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  password TEXT NOT NULL,
  university TEXT,
  verify_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  position TEXT NOT NULL,
  university TEXT,
  bio TEXT,
  img_url TEXT,
  specialty TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- 2. CORE OSCE SYSTEM TABLES
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.osce_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  session_date DATE,
  start_time TIME,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'ongoing', 'finished', 'published'
  total_stations INT DEFAULT 8,
  station_duration_minutes INT DEFAULT 10,
  break_duration_minutes INT DEFAULT 3,
  break_after_rotation INT DEFAULT 3,
  max_participants INT DEFAULT 50,
  current_rotation INT DEFAULT 1,
  current_station INT DEFAULT 1,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.osce_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.osce_sessions(id) ON DELETE CASCADE,
  station_number INT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.osce_stage_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.osce_stages(id) ON DELETE CASCADE,
  scenario TEXT,
  participant_instruction TEXT,
  examiner_instruction TEXT,
  duration_minutes INT DEFAULT 15,
  checklist JSONB, -- Rubric items score 0-3, weight, descriptors, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.osce_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.osce_case_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.osce_cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.osce_case_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.osce_case_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  result_type TEXT,
  result_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.osce_session_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.osce_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT, -- 'examiner', 'participant'
  station_number INT,
  participant_order INT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.osce_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.osce_sessions(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.osce_cases(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.osce_case_items(id) ON DELETE CASCADE,
  participant_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.osce_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.osce_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.osce_case_items(id) ON DELETE CASCADE,
  participant_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  examiner_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- 3. SIMULATION & LMS SYSTEM TABLES
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.simulation_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  price NUMERIC,
  total_questions INT,
  total_duration_minutes INT,
  img_url TEXT,
  gform_link TEXT,
  module_pdf_url TEXT,
  is_hot BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.simulation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID REFERENCES public.simulation_sets(id) ON DELETE CASCADE,
  station TEXT,
  question_number INT,
  segment INT,
  text TEXT,
  image_url TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_option TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.simulation_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  simulation_id UUID NOT NULL REFERENCES public.simulation_sets(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.simulation_questions(id) ON DELETE CASCADE,
  segment INT NOT NULL,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.simulation_results (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  simulation_id UUID REFERENCES public.simulation_sets(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  total_wrong INT NOT NULL DEFAULT 0,
  start_time TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, simulation_id)
);

CREATE TABLE IF NOT EXISTS public.simulation_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  simulation_id UUID NOT NULL REFERENCES public.simulation_sets(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT FALSE,
  module_access BOOLEAN DEFAULT FALSE,
  gform_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.simulation_segment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  simulation_id UUID NOT NULL REFERENCES public.simulation_sets(id) ON DELETE CASCADE,
  segment INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  name TEXT,
  description TEXT,
  mentor_id UUID REFERENCES public.mentors(id),
  trailer_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT,
  type TEXT,
  drive_file_id TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration_days INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  class_id UUID REFERENCES public.classes(id),
  plan_id UUID REFERENCES public.plans(id),
  payment_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  order_id TEXT,
  class_id UUID REFERENCES public.classes(id),
  plan_id UUID REFERENCES public.plans(id),
  amount NUMERIC,
  currency TEXT DEFAULT 'IDR',
  payment_method TEXT,
  snap_token TEXT,
  redirect_url TEXT,
  midtrans_transaction_id TEXT,
  status TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- 4. MANNEQUIN & RENTAL E-COMMERCE TABLES
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.mannequins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  description TEXT,
  price_per_billing_unit NUMERIC NOT NULL,
  billing_unit_hours INT DEFAULT 3,
  stock INT DEFAULT 1,
  max_stock INT DEFAULT 1,
  image_urls TEXT[],
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mannequin_id UUID NOT NULL REFERENCES public.mannequins(id) ON DELETE CASCADE,
  rental_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INT NOT NULL,
  billing_units INT NOT NULL,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  is_overnight BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending_payment',
  subtotal NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  delivery_type public.delivery_type NOT NULL,
  delivery_address_id UUID,
  delivery_distance_km NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  mannequin_id UUID NOT NULL REFERENCES public.mannequins(id),
  rental_date DATE NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  duration_hours INT NOT NULL,
  billing_units INT NOT NULL,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  is_overnight BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mannequin_id UUID NOT NULL REFERENCES public.mannequins(id),
  rental_date DATE NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  buffer_end_at TIMESTAMPTZ NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending_payment',
  is_overnight BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- END OF SCHEMA SCRIPT
-- =================================================================
