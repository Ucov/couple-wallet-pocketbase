CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos visibles por pareja" ON public.calendar_events
FOR SELECT USING (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Insertar eventos de la propia pareja" ON public.calendar_events
FOR INSERT WITH CHECK (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Borrar eventos de la propia pareja" ON public.calendar_events
FOR DELETE USING (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);
