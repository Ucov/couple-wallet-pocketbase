begin;
  -- Add shopping_items to the realtime publication
  alter publication supabase_realtime add table public.shopping_items;
commit;
