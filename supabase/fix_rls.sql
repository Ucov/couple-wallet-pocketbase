-- Políticas para la tabla COUPLES
CREATE POLICY "Usuarios pueden crear parejas" ON public.couples FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquiera puede leer parejas por código" ON public.couples FOR SELECT USING (true);
