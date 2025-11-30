-- Story 1.3 User Registration & Invitation (Admin) Schema Extensions
-- Extends Epic 1 user management to support invitation system

-- Create invitation status type
CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
);

-- Add invitation tracking columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN invitation_status public.invitation_status DEFAULT 'pending',
ADD COLUMN invited_by UUID REFERENCES public.profiles(id),
ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN invitation_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for invitation tracking
CREATE INDEX idx_profiles_invitation_status ON public.profiles(invitation_status);
CREATE INDEX idx_profiles_invited_by ON public.profiles(invited_by);
CREATE INDEX idx_profiles_invitation_token ON public.profiles(invitation_token);
CREATE INDEX idx_profiles_invitation_expires_at ON public.profiles(invitation_expires_at);

-- Create invitations table for better tracking and audit
CREATE TABLE public.user_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  role public.user_role NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invitation_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  status public.invitation_status DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  metadata jsonb DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add constraints
ALTER TABLE public.user_invitations
ADD CONSTRAINT invitations_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT invitations_expires_after_sent CHECK (expires_at >= sent_at);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
-- 1. Admin users can manage all invitations
CREATE POLICY "Admin users can manage invitations" ON public.user_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Users can view invitations sent to their email
CREATE POLICY "Users can view own invitations" ON public.user_invitations
  FOR SELECT USING (
    email IN (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 3. Service role can do anything
CREATE POLICY "Service role full access to invitations" ON public.user_invitations
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create indexes for invitations table
CREATE INDEX idx_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_invitations_status ON public.user_invitations(status);
CREATE INDEX idx_invitations_invited_by ON public.user_invitations(invited_by);
CREATE INDEX idx_invitations_token ON public.user_invitations(invitation_token);
CREATE INDEX idx_invitations_expires_at ON public.user_invitations(expires_at);

-- Function to create invitation
CREATE OR REPLACE FUNCTION public.create_user_invitation(
  target_email text,
  target_role public.user_role,
  expires_after interval DEFAULT '7 days'
)
RETURNS uuid AS $$
DECLARE
  invitation_uuid uuid;
  current_user_role public.user_role;
BEGIN
  -- Check if user is admin
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admin users can create invitations';
  END IF;

  -- Check if invitation already exists for this email
  IF EXISTS (
    SELECT 1 FROM public.user_invitations
    WHERE email = target_email
    AND status IN ('pending', 'accepted')
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Invitation already exists for this email';
  END IF;

  -- Create invitation
  INSERT INTO public.user_invitations (email, role, invited_by, expires_at)
  VALUES (target_email, target_role, auth.uid(), now() + expires_after)
  RETURNING id INTO invitation_uuid;

  -- Log admin action
  PERFORM public.audit_admin_action('CREATE_INVITATION', NULL, jsonb_build_object(
    'target_email', target_email,
    'target_role', target_role,
    'invitation_id', invitation_uuid
  ));

  RETURN invitation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(
  invitation_token text
)
RETURNS boolean AS $$
DECLARE
  invitation_record public.user_invitations%ROWTYPE;
  profile_created boolean;
BEGIN
  -- Get invitation record
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE invitation_token = invitation_token::uuid
  AND status = 'pending'
  AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;

  -- Update invitation status
  UPDATE public.user_invitations
  SET status = 'accepted',
      accepted_at = now(),
      updated_at = now()
  WHERE id = invitation_record.id;

  -- Update profile invitation status if exists
  UPDATE public.profiles
  SET invitation_status = 'accepted'
  WHERE email = invitation_record.email;

  -- Log activity
  PERFORM public.log_user_activity('ACCEPT_INVITATION', 'INVITATION', invitation_record.id::text);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resend invitation
CREATE OR REPLACE FUNCTION public.resend_invitation(
  invitation_id uuid,
  expires_after interval DEFAULT '7 days'
)
RETURNS boolean AS $$
DECLARE
  current_user_role public.user_role;
  invitation_email text;
BEGIN
  -- Check if user is admin
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admin users can resend invitations';
  END IF;

  -- Update invitation
  UPDATE public.user_invitations
  SET status = 'pending',
      sent_at = now(),
      expires_at = now() + expires_after,
      invitation_token = gen_random_uuid(),
      updated_at = now()
  WHERE id = invitation_id
  AND status IN ('pending', 'expired')
  RETURNING email INTO invitation_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or cannot be resent';
  END IF;

  -- Log admin action
  PERFORM public.audit_admin_action('RESEND_INVITATION', NULL, jsonb_build_object(
    'invitation_id', invitation_id,
    'email', invitation_email
  ));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke invitation
CREATE OR REPLACE FUNCTION public.revoke_invitation(
  invitation_id uuid
)
RETURNS boolean AS $$
DECLARE
  current_user_role public.user_role;
  invitation_email text;
BEGIN
  -- Check if user is admin
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admin users can revoke invitations';
  END IF;

  -- Update invitation
  UPDATE public.user_invitations
  SET status = 'revoked',
      updated_at = now()
  WHERE id = invitation_id
  AND status IN ('pending', 'expired')
  RETURNING email INTO invitation_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or cannot be revoked';
  END IF;

  -- Log admin action
  PERFORM public.audit_admin_action('REVOKE_INVITATION', NULL, jsonb_build_object(
    'invitation_id', invitation_id,
    'email', invitation_email
  ));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get invitation by token
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(
  token text
)
RETURNS TABLE (
  id uuid,
  email text,
  role public.user_role,
  status public.invitation_status,
  invited_by uuid,
  sent_at timestamp with time zone,
  expires_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id, i.email, i.role, i.status, i.invited_by, i.sent_at, i.expires_at
  FROM public.user_invitations i
  WHERE i.invitation_token = token::uuid
  AND i.status = 'pending'
  AND i.expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for invitation management (admin only)
CREATE OR REPLACE VIEW public.invitation_management_view AS
SELECT
  i.id,
  i.email,
  i.role,
  i.status,
  i.sent_at,
  i.accepted_at,
  i.expires_at,
  p_inviter.email as invited_by_email,
  p_inviter.full_name as invited_by_name,
  i.metadata,
  CASE
    WHEN i.expires_at <= now() THEN 'expired'
    WHEN i.status = 'pending' AND i.expires_at > now() THEN 'pending'
    ELSE i.status
  END as current_status
FROM public.user_invitations i
LEFT JOIN public.profiles p_inviter ON i.invited_by = p_inviter.id
ORDER BY i.created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON public.user_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_invitation(text, public.user_role, interval) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resend_invitation(uuid, interval) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO authenticated;

-- Validation checks
DO $$
DECLARE
  table_count integer;
BEGIN
  -- Verify invitations table was created
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_invitations';

  IF table_count = 0 THEN
    RAISE EXCEPTION 'Invitations table was not created';
  END IF;

  -- Verify RLS policies exist
  SELECT COUNT(*) INTO table_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'user_invitations';

  IF table_count = 0 THEN
    RAISE EXCEPTION 'RLS policies for invitations were not created';
  END IF;

  RAISE NOTICE 'Story 1.3 invitation system schema created successfully';
END $$;