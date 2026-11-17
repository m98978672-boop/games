-- RatMes · Вкладка «Общение» портала Games (Supabase: games-cloud-save)
-- Безопасная схема для браузерного publishable-ключа с RLS и ограничениями длины.

CREATE TABLE IF NOT EXISTS public.ratmes_rooms (
  room_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'ratmes',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ratmes_messages (
  msg_id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.ratmes_rooms(room_id) ON DELETE CASCADE,
  network TEXT NOT NULL DEFAULT 'ratmes',
  sender_id TEXT NOT NULL CHECK (char_length(sender_id) BETWEEN 1 AND 80),
  sender_name TEXT NOT NULL CHECK (char_length(sender_name) BETWEEN 1 AND 64),
  body_text TEXT NOT NULL CHECK (char_length(body_text) BETWEEN 1 AND 4000),
  kind TEXT NOT NULL DEFAULT 'text',
  encrypted_packet JSONB,
  reply_to TEXT,
  reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
  pinned BOOLEAN NOT NULL DEFAULT false,
  edited BOOLEAN NOT NULL DEFAULT false,
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratmes_messages_room_created
  ON public.ratmes_messages (room_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ratmes_presence (
  peer_id TEXT PRIMARY KEY CHECK (char_length(peer_id) BETWEEN 1 AND 80),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 64),
  room_id TEXT NOT NULL DEFAULT 'games-lobby',
  country TEXT NOT NULL DEFAULT 'RU',
  status TEXT NOT NULL DEFAULT 'online',
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ratmes_cloud_links (
  service TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected',
  resource_id TEXT,
  url TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.ratmes_rooms, public.ratmes_cloud_links TO anon, authenticated;
GRANT SELECT, INSERT ON public.ratmes_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ratmes_presence TO anon, authenticated;

-- Включаем Row Level Security на всех таблицах
ALTER TABLE public.ratmes_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratmes_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratmes_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratmes_cloud_links ENABLE ROW LEVEL SECURITY;

-- Публичные политики сообщества Games «Общение» (publishable key, без секретных ключей)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratmes_rooms' AND policyname = 'ratmes_rooms_read') THEN
    CREATE POLICY ratmes_rooms_read ON public.ratmes_rooms FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratmes_messages' AND policyname = 'ratmes_messages_read') THEN
    CREATE POLICY ratmes_messages_read ON public.ratmes_messages FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratmes_messages' AND policyname = 'ratmes_messages_insert') THEN
    CREATE POLICY ratmes_messages_insert ON public.ratmes_messages FOR INSERT TO anon, authenticated
      WITH CHECK (char_length(body_text) BETWEEN 1 AND 4000 AND char_length(sender_name) BETWEEN 1 AND 64);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratmes_presence' AND policyname = 'ratmes_presence_read') THEN
    CREATE POLICY ratmes_presence_read ON public.ratmes_presence FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratmes_presence' AND policyname = 'ratmes_presence_insert') THEN
    CREATE POLICY ratmes_presence_insert ON public.ratmes_presence FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratmes_presence' AND policyname = 'ratmes_presence_update') THEN
    CREATE POLICY ratmes_presence_update ON public.ratmes_presence FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratmes_cloud_links' AND policyname = 'ratmes_cloud_links_read') THEN
    CREATE POLICY ratmes_cloud_links_read ON public.ratmes_cloud_links FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- Стартовые комнаты Games «Общение»
INSERT INTO public.ratmes_rooms (room_id, title, network, description) VALUES
  ('games-lobby', '🎮 Общий чат Games', 'ratmes', 'Главный канал игроков портала Games с облачной синхронизацией Supabase'),
  ('games-coop', '🤝 Кооператив и напарники', 'ratmes', 'Поиск напарников по Dead District, Ратград, Frontline: Command, Last Shore и PLAYBRIDGE'),
  ('games-dev', '🛠 Разработчики Games', 'ratmes', 'Идеи игр, баг-репорты, задачи Linear GAM-5..7 и документация Notion/Docs'),
  ('ratmes-main', '⚡ Свой чат RatMes (E2EE)', 'ratmes', 'Основной защищённый канал RatMes Engine')
ON CONFLICT (room_id) DO NOTHING;

-- Приветственные сообщения в облаке
INSERT INTO public.ratmes_messages (msg_id, room_id, network, sender_id, sender_name, body_text, kind) VALUES
  ('seed-games-lobby-01', 'games-lobby', 'ratmes', 'system-games', 'Games Bot', 'Облачная синхронизация Supabase (games-cloud-save) активна! Пишите прямо во вкладке «Общение» портала Games.', 'text'),
  ('seed-games-coop-01', 'games-coop', 'ratmes', 'system-games', 'Games Bot', 'Ищете напарников в кооператив или хотите обменяться сейвом? Отправляйте файлы с докачкой RM-302 прямо здесь!', 'text'),
  ('seed-games-dev-01', 'games-dev', 'ratmes', 'system-games', 'Максим (Gamebobli)', 'Все 9 облачных сервисов подключены: Supabase, Google Drive, Dropbox, Notion, Linear (GAM-5..7), Docs, Sheets, Calendar и Gmail.', 'text')
ON CONFLICT (msg_id) DO NOTHING;

-- Реестр всех 9 подключённых сервисов
INSERT INTO public.ratmes_cloud_links (service, title, status, resource_id, url) VALUES
  ('supabase', 'Supabase · games-cloud-save', 'connected', 'cuhfnzgytndyntpbnbda', 'https://supabase.com/dashboard/project/cuhfnzgytndyntpbnbda'),
  ('google_drive', 'Google Drive · RatMes-Vault (Games Общение)', 'connected', '1tQi82o2fHBMpBDq-0Zg5hSM4DkLOANxB', 'https://drive.google.com/drive/folders/1tQi82o2fHBMpBDq-0Zg5hSM4DkLOANxB'),
  ('dropbox', 'Dropbox · /RatMes-Vault', 'connected', 'id:5evzGBn_APMAAAAAAAAABQ', 'https://www.dropbox.com/home/RatMes-Vault'),
  ('notion', 'Notion · Центр управления RatMes', 'connected', '41b5c620-35e4-8187-8f46-e7c171e6fd09', 'https://app.notion.com/p/RatMes-Games-41b5c62035e481878f46e7c171e6fd09'),
  ('linear', 'Linear · RatMes · Общение в Games (GAM-5..7)', 'connected', '0ab5a4c9-6704-403c-b94f-fc031b6488f9', 'https://linear.app/gamebobli/issue/GAM-6/podklyuchit-oblachnuyu-sinhronizaciyu-supabase-dlya-vkladki-obshenie-v'),
  ('google_docs', 'Google Docs · Архитектура RatMes', 'connected', '1VOo2S1G5Q4NU-gM87zdEdy0uhIVkJ4-emWveXL5OwTM', 'https://docs.google.com/document/d/1VOo2S1G5Q4NU-gM87zdEdy0uhIVkJ4-emWveXL5OwTM/edit'),
  ('google_sheets', 'Google Sheets · Матрица стран и 15 веток', 'connected', '1hrJnWI0YjM9RWzMX0ORYF46Xaz_Y-NeaGZ2y9xQ23QM', 'https://docs.google.com/spreadsheets/d/1hrJnWI0YjM9RWzMX0ORYF46Xaz_Y-NeaGZ2y9xQ23QM/edit'),
  ('google_calendar', 'Google Calendar · Веха синхронизации v1.0', 'connected', 'mi5dnk3ss47csbdgh4girdf0qo', 'https://www.google.com/calendar/event?eid=bWk1ZG5rM3NzNDdjc2JkZ2g0Z2lyZGYwcW8gbTk4OTc4NjcyQG0'),
  ('gmail', 'Gmail · Черновик сводки экосистемы', 'connected', 'r-7359848319671787649', 'https://mail.google.com/mail/u/0/#drafts')
ON CONFLICT (service) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  resource_id = EXCLUDED.resource_id,
  url = EXCLUDED.url,
  updated_at = now();
