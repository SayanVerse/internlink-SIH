-- Ensure admin@pminternship.in has admin role in user_roles table
-- This fixes the RLS policy issue when uploading CSV data

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID for admin@pminternship.in
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@pminternship.in';

  -- If admin user exists and doesn't have admin role, insert it
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;