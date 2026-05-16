-- Permite gastos en solitario (couple_id IS NULL) manteniendo el aislamiento por pareja.
-- Antes: las políticas comparaban couple_id = (subquery), que con NULL = NULL evalúa a NULL
-- (no a true), bloqueando INSERT/SELECT/UPDATE/DELETE para usuarios sin pareja.
-- Ahora: rama explícita para couple_id IS NULL filtrando por paid_by = auth.uid().

-- Drops idempotentes: nombres antiguos (migración inicial) Y nuevos
-- (por si una ejecución previa de esta migración quedó a medias).
DROP POLICY IF EXISTS "Gastos visibles por pareja" ON public.expenses;
DROP POLICY IF EXISTS "Insertar gastos de la propia pareja" ON public.expenses;
DROP POLICY IF EXISTS "Borrar gastos de la propia pareja" ON public.expenses;
DROP POLICY IF EXISTS "Actualizar gastos de la propia pareja" ON public.expenses;
DROP POLICY IF EXISTS "Gastos visibles" ON public.expenses;
DROP POLICY IF EXISTS "Insertar gasto propio o de pareja" ON public.expenses;
DROP POLICY IF EXISTS "Actualizar gasto propio o de pareja" ON public.expenses;
DROP POLICY IF EXISTS "Borrar gasto propio o de pareja" ON public.expenses;

CREATE POLICY "Gastos visibles" ON public.expenses
FOR SELECT USING (
  (couple_id IS NOT NULL AND couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid()))
  OR
  (couple_id IS NULL AND paid_by = auth.uid())
);

CREATE POLICY "Insertar gasto propio o de pareja" ON public.expenses
FOR INSERT WITH CHECK (
  paid_by = auth.uid()
  AND (
    couple_id IS NULL
    OR couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Actualizar gasto propio o de pareja" ON public.expenses
FOR UPDATE USING (
  (couple_id IS NOT NULL AND couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid()))
  OR
  (couple_id IS NULL AND paid_by = auth.uid())
) WITH CHECK (
  (couple_id IS NOT NULL AND couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid()))
  OR
  (couple_id IS NULL AND paid_by = auth.uid())
);

CREATE POLICY "Borrar gasto propio o de pareja" ON public.expenses
FOR DELETE USING (
  (couple_id IS NOT NULL AND couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid()))
  OR
  (couple_id IS NULL AND paid_by = auth.uid())
);
