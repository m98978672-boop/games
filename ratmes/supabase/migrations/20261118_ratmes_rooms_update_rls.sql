-- RatMes: добавляем безопасную RLS-политику UPDATE для пользовательских комнат (dm-* и room-*),
-- чтобы upsert/on_conflict при открытии личного чата 1-на-1 или «Избранного» не падал с 42501.
-- Публичные комнаты (room_type = 'public') по-прежнему защищены от перезаписи.

DROP POLICY IF EXISTS ratmes_rooms_update ON public.ratmes_rooms;
CREATE POLICY ratmes_rooms_update ON public.ratmes_rooms
  FOR UPDATE
  USING (
    room_type IN ('dm', 'group')
    AND (room_id LIKE 'dm-%' OR room_id LIKE 'room-%')
  )
  WITH CHECK (
    room_type IN ('dm', 'group')
    AND char_length(room_id) BETWEEN 4 AND 120
    AND (room_id LIKE 'dm-%' OR room_id LIKE 'room-%')
    AND char_length(title) BETWEEN 1 AND 80
  );
