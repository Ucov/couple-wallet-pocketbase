-- 1. Eliminar políticas que causan problemas
DROP POLICY IF EXISTS "Perfiles compartidos por pareja" ON public.profiles;
DROP POLICY IF EXISTS "Gastos visibles por pareja" ON public.expenses;
DROP POLICY IF EXISTS "Insertar gastos de la propia pareja" ON public.expenses;
DROP POLICY IF EXISTS "Usuarios pueden crear parejas" ON public.couples;
DROP POLICY IF EXISTS "Miembros pueden ver su pareja" ON public.couples;

-- 2. Función auxiliar con SECURITY DEFINER para romper la recursión
-- Esta función se ejecuta con permisos de administrador, saltándose el RLS
CREATE OR REPLACE FUNCTION public.get_auth_couple_id()
RETURNS UUID AS $$
  SELECT couple_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Nuevas políticas limpias y sin recursión

-- PROFILES: Puedes ver el tuyo o el de alguien con tu mismo couple_id
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
    id = auth.uid() OR 
    couple_id = public.get_auth_couple_id()
);

-- EXPENSES: Puedes ver/insertar si el couple_id coincide
CREATE POLICY "expenses_select_policy" ON public.expenses
FOR SELECT USING (
    couple_id = public.get_auth_couple_id()
);

CREATE POLICY "expenses_insert_policy" ON public.expenses
FOR INSERT WITH CHECK (
    couple_id = public.get_auth_couple_id() AND
    paid_by = auth.uid()
);

-- COUPLES: 
-- Para INSERT: Permitir a cualquier usuario autenticado crear una pareja
CREATE POLICY "couples_insert_policy" ON public.couples
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);

-- Para SELECT: Ver la tuya o buscar por código
CREATE POLICY "couples_select_policy" ON public.couples
FOR SELECT USING (
    id = public.get_auth_couple_id() OR
    join_code IS NOT NULL
);
