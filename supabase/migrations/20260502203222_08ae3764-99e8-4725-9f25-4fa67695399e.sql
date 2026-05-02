DROP TRIGGER IF EXISTS trg_handle_stamp_validation ON public.stamp_requests;
DROP TRIGGER IF EXISTS trg_stamp_validation ON public.stamp_requests;
-- On garde uniquement stamp_validation_trigger