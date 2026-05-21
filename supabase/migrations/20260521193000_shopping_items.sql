CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'bought')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopping items visibles por pareja" ON public.shopping_items
FOR SELECT USING (
    (couple_id IS NOT NULL AND couple_id = public.get_user_couple_id())
);

CREATE POLICY "Insertar shopping item" ON public.shopping_items
FOR INSERT WITH CHECK (
    couple_id = public.get_user_couple_id() AND
    created_by = auth.uid()
);

CREATE POLICY "Actualizar shopping item" ON public.shopping_items
FOR UPDATE USING (
    couple_id = public.get_user_couple_id()
) WITH CHECK (
    couple_id = public.get_user_couple_id()
);

CREATE POLICY "Borrar shopping item" ON public.shopping_items
FOR DELETE USING (
    couple_id = public.get_user_couple_id()
);
