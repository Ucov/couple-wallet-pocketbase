-- Políticas para permitir borrar y editar gastos
CREATE POLICY "Borrar gastos de la propia pareja" ON public.expenses
FOR DELETE USING (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Actualizar gastos de la propia pareja" ON public.expenses
FOR UPDATE USING (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
) WITH CHECK (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);
