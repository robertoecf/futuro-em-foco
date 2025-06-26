-- Final trigger function with hardcoded key as per user's request.
-- WARNING: User has acknowledged and accepted the security risk of hardcoding the service key.
CREATE OR REPLACE FUNCTION public.handle_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Make the HTTP POST request to the Edge Function
  PERFORM net.http_post(
    url := 'https://hcmjavggiphoulwgcoej.supabase.co/functions/v1/send-lead-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- The service role key is hardcoded below.
      'Authorization', 'Bearer ' || 'USER_HAS_TO_REPLACE_THIS_WITH_THEIR_KEY'
    ),
    body := jsonb_build_object(
      'record', new
    )
  );
  RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_new_lead ON public.leads;
CREATE TRIGGER on_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_lead(); 