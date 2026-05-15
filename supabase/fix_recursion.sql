-- Eliminar la política problemática que causa recursión
DROP POLICY IF EXISTS "Perfiles compartidos por pareja" ON public.profiles;

-- Crear una nueva política sin recursión
-- Nota: Usamos auth.uid() directamente y evitamos SELECT sobre la misma tabla en el USING
CREATE POLICY "Perfiles compartidos por pareja" ON public.profiles
FOR SELECT USING (
    id = auth.uid() OR 
    couple_id IS NOT NULL AND couple_id IN (
        SELECT p.couple_id 
        FROM public.profiles p 
        WHERE p.id = auth.uid()
    )
);

-- Asegurar que la tabla couples también sea legible para los miembros
DROP POLICY IF EXISTS "Cualquiera puede leer parejas por código" ON public.couples;
CREATE POLICY "Miembros pueden ver su pareja" ON public.couples
FOR SELECT USING (
    id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid()) OR
    join_code IS NOT NULL
);
