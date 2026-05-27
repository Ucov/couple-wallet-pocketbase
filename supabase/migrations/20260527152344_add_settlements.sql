CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    settled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(couple_id, month, year)
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settlements visibles por pareja" ON public.settlements
FOR SELECT USING (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Insertar settlements de la propia pareja" ON public.settlements
FOR INSERT WITH CHECK (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);
