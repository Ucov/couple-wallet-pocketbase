-- Auto balance split_percentage between couples
-- When user A sets split to 60, user B is automatically set to 40.

CREATE OR REPLACE FUNCTION public.sync_partner_split()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if the split_percentage actually changed
    IF NEW.split_percentage IS DISTINCT FROM OLD.split_percentage AND NEW.couple_id IS NOT NULL THEN
        -- Update the partner's split_percentage to (100 - NEW)
        -- This trigger runs as SECURITY DEFINER or bypasses RLS naturally within the DB.
        UPDATE public.profiles
        SET split_percentage = 100 - NEW.split_percentage
        WHERE couple_id = NEW.couple_id
          AND id != NEW.id
          -- Prevent infinite recursion
          AND split_percentage != 100 - NEW.split_percentage;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_split_percentage_change ON public.profiles;

CREATE TRIGGER on_split_percentage_change
    AFTER UPDATE OF split_percentage ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_partner_split();
