-- Audit logging functions for Story 1.3
-- Implements audit_admin_action() and log_user_activity() functions

-- Function to log admin actions for security audit trail
CREATE OR REPLACE FUNCTION public.audit_admin_action(
  action_type text,
  target_user_id uuid DEFAULT NULL,
  details jsonb DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get current admin user
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE id = auth.uid() AND role = 'admin';

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found or insufficient privileges';
  END IF;

  -- Log the admin action
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    target_entity_id,
    metadata,
    created_at
  ) VALUES (
    admin_user_id,
    action_type,
    target_user_id,
    details,
    now()
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    -- Log the error to console for debugging
    RAISE WARNING 'Failed to log admin action: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activities
CREATE OR REPLACE FUNCTION public.log_user_activity(
  action text,
  resource_type text DEFAULT NULL,
  resource_id text DEFAULT NULL,
  metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  INSERT INTO public.user_activity_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), action, resource_type, resource_id, metadata);

EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    -- Log the error to console for debugging
    RAISE WARNING 'Failed to log user activity: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  target_entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit_logs (admin only access)
CREATE POLICY "Admin users can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access to audit logs" ON public.audit_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS policies for user_activity_logs (users can view their own, admin can view all)
CREATE POLICY "Users can view own activity logs" ON public.user_activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin users can view all activity logs" ON public.user_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access to activity logs" ON public.user_activity_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_entity_id ON public.audit_logs(target_entity_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action_type ON public.user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_entity_type ON public.user_activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- Grant necessary permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.user_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_admin_action(text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity(text, text, text, jsonb) TO authenticated;

-- Validation
DO $$
DECLARE
  audit_table_count integer;
  activity_table_count integer;
BEGIN
  SELECT COUNT(*) INTO audit_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'audit_logs';

  SELECT COUNT(*) INTO activity_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'user_activity_logs';

  IF audit_table_count = 0 THEN
    RAISE EXCEPTION 'Audit logs table was not created';
  END IF;

  IF activity_table_count = 0 THEN
    RAISE EXCEPTION 'User activity logs table was not created';
  END IF;

  RAISE NOTICE 'Audit functions and tables created successfully';
END $$;