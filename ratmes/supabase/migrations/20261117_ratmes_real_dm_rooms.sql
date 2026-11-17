-- Поддержка реальных личных диалогов (dm-*) и пользовательских комнат по ссылке (room-*) в Supabase
ALTER TABLE public.ratmes_rooms
  ADD COLUMN IF NOT EXISTS room_type TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS participants TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE public.ratmes_presence
  ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_ratmes_rooms_participants
  ON public.ratmes_rooms USING GIN (participants);

CREATE INDEX IF NOT EXISTS idx_ratmes_rooms_type
  ON public.ratmes_rooms (room_type, created_at DESC);

GRANT INSERT ON public.ratmes_rooms TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ratmes_rooms' AND policyname = 'ratmes_rooms_insert'
  ) THEN
    CREATE POLICY ratmes_rooms_insert ON public.ratmes_rooms
      FOR INSERT TO anon, authenticated
      WITH CHECK (
        room_type IN ('dm', 'group')
        AND char_length(room_id) BETWEEN 4 AND 120
        AND (room_id LIKE 'dm-%' OR room_id LIKE 'room-%')
        AND char_length(title) BETWEEN 1 AND 80
      );
  END IF;
END $$;

UPDATE public.ratmes_rooms
SET room_type = 'public'
WHERE room_id IN ('games-lobby', 'games-coop', 'games-dev', 'ratmes-main');
