-- 1. Fix bugs with "Mi pareja pagó", "Saldar mes" (when done by creditor), and "Recurring expenses".
-- The previous policy forced paid_by = auth.uid(), which broke inserting an expense on behalf of the partner.

DROP POLICY IF EXISTS "Insertar gasto propio o de pareja" ON public.expenses;
DROP POLICY IF EXISTS "Actualizar gasto propio o de pareja" ON public.expenses;

-- Insert allows paid_by to be ANYONE as long as the expense belongs to the user's couple_id.
CREATE POLICY "Insertar gasto propio o de pareja" ON public.expenses
FOR INSERT WITH CHECK (
  (couple_id IS NOT NULL AND couple_id = public.get_user_couple_id())
  OR
  (couple_id IS NULL AND paid_by = auth.uid())
);

-- Update allows modifying an expense if it belongs to the couple_id.
CREATE POLICY "Actualizar gasto propio o de pareja" ON public.expenses
FOR UPDATE USING (
  (couple_id IS NOT NULL AND couple_id = public.get_user_couple_id())
  OR
  (couple_id IS NULL AND paid_by = auth.uid())
) WITH CHECK (
  (couple_id IS NOT NULL AND couple_id = public.get_user_couple_id())
  OR
  (couple_id IS NULL AND paid_by = auth.uid())
);


-- 2. Add RLS Policies for Chores and Recurring Expenses (Assuming they might be missing)
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_applications ENABLE ROW LEVEL SECURITY;

-- Chores policies
DROP POLICY IF EXISTS "Tareas visibles por pareja" ON public.chores;
DROP POLICY IF EXISTS "Insertar tareas de la propia pareja" ON public.chores;
DROP POLICY IF EXISTS "Modificar tareas de la pareja" ON public.chores;

CREATE POLICY "Tareas visibles por pareja" ON public.chores
FOR SELECT USING (couple_id = public.get_user_couple_id());

CREATE POLICY "Insertar tareas de la propia pareja" ON public.chores
FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id());

CREATE POLICY "Modificar tareas de la pareja" ON public.chores
FOR UPDATE USING (couple_id = public.get_user_couple_id());

CREATE POLICY "Borrar tareas de la pareja" ON public.chores
FOR DELETE USING (couple_id = public.get_user_couple_id());

-- Recurring expenses policies
DROP POLICY IF EXISTS "Gastos recurrentes visibles por pareja" ON public.recurring_expenses;
DROP POLICY IF EXISTS "Modificar gastos recurrentes" ON public.recurring_expenses;

CREATE POLICY "Gastos recurrentes visibles por pareja" ON public.recurring_expenses
FOR SELECT USING (couple_id = public.get_user_couple_id());

CREATE POLICY "Modificar gastos recurrentes" ON public.recurring_expenses
FOR ALL USING (couple_id = public.get_user_couple_id()) WITH CHECK (couple_id = public.get_user_couple_id());

-- Recurring applications policies
DROP POLICY IF EXISTS "Aplicaciones recurrentes visibles por pareja" ON public.recurring_applications;
DROP POLICY IF EXISTS "Modificar aplicaciones recurrentes" ON public.recurring_applications;

CREATE POLICY "Aplicaciones recurrentes visibles por pareja" ON public.recurring_applications
FOR SELECT USING (couple_id = public.get_user_couple_id());

CREATE POLICY "Modificar aplicaciones recurrentes" ON public.recurring_applications
FOR ALL USING (couple_id = public.get_user_couple_id()) WITH CHECK (couple_id = public.get_user_couple_id());
