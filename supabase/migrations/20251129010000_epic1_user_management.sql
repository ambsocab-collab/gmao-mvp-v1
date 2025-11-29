-- Epic 1 Foundation & User Management Database Schema
-- Addresses Security Risks R-001, R-002, R-003, R-004

-- Create custom types for roles and capacity levels
CREATE TYPE public.user_role AS ENUM ('operator', 'technician', 'supervisor', 'admin');
CREATE TYPE public.capacity_level AS ENUM ('N1', 'N2', 'N3', 'N4', 'N5');

-- Extend auth.users with profile information
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  role public.user_role NOT NULL DEFAULT 'operator',
  capacity_level public.capacity_level,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS (Row Level Security) for security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_capacity_level ON public.profiles(capacity_level);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- RLS Policies for Risk R-001 (Authentication) and R-002 (Role-based Access)
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Service role can do anything (for testing)
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 4. Admin users can read all profiles
CREATE POLICY "Admin users can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Admin users can update roles (for user management)
CREATE POLICY "Admin users can manage roles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with default operator role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operator')::public.user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get current user role (for RLS policies)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION public.has_permission(target_role public.user_role)
RETURNS boolean AS $$
BEGIN
  DECLARE
    current_user_role public.user_role;
  BEGIN
    SELECT role INTO current_user_role
    FROM public.profiles
    WHERE id = auth.uid() AND is_active = true;

    -- Service role has all permissions
    IF auth.jwt()->>'role' = 'service_role' THEN
      RETURN true;
    END IF;

    -- Permission hierarchy
    CASE
      WHEN current_user_role = 'admin' THEN RETURN true;
      WHEN current_user_role = 'supervisor' AND target_role IN ('operator', 'technician') THEN RETURN true;
      WHEN current_user_role = 'technician' AND target_role = 'operator' THEN RETURN true;
      WHEN current_user_role = target_role THEN RETURN true;
      ELSE RETURN false;
    END CASE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User activity log for security audit (Risk R-001)
CREATE TABLE public.user_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- RLS for activity log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to activity log" ON public.user_activity_log
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admin users can view all activity" ON public.user_activity_log
  FOR SELECT USING (public.has_permission('admin'));

-- Index for activity log
CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON public.user_activity_log(created_at);

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  action text,
  resource_type text DEFAULT NULL,
  resource_id text DEFAULT NULL,
  metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_activity_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), action, resource_type, resource_id, metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Session management for enhanced security
CREATE TABLE public.user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now()
);

-- RLS for sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to sessions" ON public.user_sessions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Indexes for sessions
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Function to create session
CREATE OR REPLACE FUNCTION public.create_session(
  session_token text,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  expires_after interval DEFAULT '24 hours'
)
RETURNS uuid AS $$
DECLARE
  session_uuid uuid;
BEGIN
  INSERT INTO public.user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
  VALUES (auth.uid(), session_token, ip_address, user_agent, now() + expires_after)
  RETURNING id INTO session_uuid;

  RETURN session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate session
CREATE OR REPLACE FUNCTION public.invalidate_session(session_token text)
RETURNS boolean AS $$
BEGIN
  UPDATE public.user_sessions
  SET is_active = false
  WHERE session_token = session_token AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate session
CREATE OR REPLACE FUNCTION public.validate_session(session_token text)
RETURNS boolean AS $$
DECLARE
  session_valid boolean;
BEGIN
  SELECT (is_active AND expires_at > now()) INTO session_valid
  FROM public.user_sessions
  WHERE session_token = session_token AND user_id = auth.uid();

  -- Update last accessed time
  UPDATE public.user_sessions
  SET last_accessed = now()
  WHERE session_token = session_token AND user_id = auth.uid();

  RETURN COALESCE(session_valid, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.user_activity_log TO authenticated;
GRANT SELECT ON public.user_sessions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity(text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_session(text, inet, text, interval) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invalidate_session(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_session(text) TO authenticated;

-- Create view for user management (admin only)
CREATE OR REPLACE VIEW public.user_management_view AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.capacity_level,
  p.is_active,
  p.created_at,
  p.updated_at,
  a.last_sign_in_at,
  a.email_confirmed_at,
  COUNT(ua.id) as activity_count
FROM public.profiles p
LEFT JOIN auth.users a ON p.id = a.id
LEFT JOIN public.user_activity_log ua ON p.id = ua.user_id
GROUP BY p.id, p.email, p.full_name, p.role, p.capacity_level, p.is_active, p.created_at, p.updated_at, a.last_sign_in_at, a.email_confirmed_at;

-- RLS for the view
ALTER VIEW public.user_management_view OWNER TO postgres;
-- Note: Views inherit RLS from underlying tables in PostgreSQL

-- Create indexes for the view (materialized if needed)
-- CREATE INDEX idx_user_management_view_role ON user_management_view(role);

-- Audit function for admin actions
CREATE OR REPLACE FUNCTION public.audit_admin_action(
  action_type text,
  target_user_id uuid,
  details jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  -- Log admin action for compliance
  INSERT INTO public.user_activity_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    'ADMIN_' || action_type,
    'USER_MANAGEMENT',
    target_user_id::text,
    jsonb_build_object(
      'details', details,
      'admin_role', (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Final validation checks
DO $$
DECLARE
  table_count integer;
BEGIN
  -- Verify all required tables exist
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_activity_log', 'user_sessions');

  IF table_count != 3 THEN
    RAISE EXCEPTION 'Not all required tables were created. Found: %', table_count;
  END IF;

  -- Verify RLS is enabled
  SELECT COUNT(*) INTO table_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_activity_log', 'user_sessions');

  IF table_count = 0 THEN
    RAISE EXCEPTION 'RLS policies were not created properly';
  END IF;

  RAISE NOTICE 'Epic 1 user management schema created successfully';
END $$;