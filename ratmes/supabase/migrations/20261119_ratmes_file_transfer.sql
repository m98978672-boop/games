-- RatMes: настоящая передача файлов между устройствами и людьми.
-- 1. Колонка attachment (JSONB) в ratmes_messages: имя, MIME, размер, sha256, путь в Storage.
-- 2. Разрешаем пустой body_text, если у сообщения есть вложение (файл без подписи).
-- 3. Публичный bucket ratmes-media + политики на чтение/запись для anon/authenticated.

-- ---------- 1. Вложения ----------
ALTER TABLE public.ratmes_messages
  ADD COLUMN IF NOT EXISTS attachment JSONB;

COMMENT ON COLUMN public.ratmes_messages.attachment IS
  'Метаданные вложения: {filename,mimeType,sizeBytes,mediaKind,sha256,storagePath,bucket}';

-- ---------- 2. Текст сообщения ----------
ALTER TABLE public.ratmes_messages
  ALTER COLUMN body_text SET DEFAULT '';

ALTER TABLE public.ratmes_messages
  DROP CONSTRAINT IF EXISTS ratmes_messages_body_text_check;

ALTER TABLE public.ratmes_messages
  ADD CONSTRAINT ratmes_messages_body_text_check
  CHECK (
    char_length(body_text) <= 4000
    AND (char_length(body_text) >= 1 OR attachment IS NOT NULL)
  );

-- Политика INSERT должна разрешать файл без подписи.
DROP POLICY IF EXISTS ratmes_messages_insert ON public.ratmes_messages;
CREATE POLICY ratmes_messages_insert ON public.ratmes_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(sender_name) BETWEEN 1 AND 64
    AND char_length(body_text) <= 4000
    AND (char_length(body_text) >= 1 OR attachment IS NOT NULL)
  );

-- ---------- 3. Хранилище файлов ----------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('ratmes-media', 'ratmes-media', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

DROP POLICY IF EXISTS ratmes_media_insert ON storage.objects;
CREATE POLICY ratmes_media_insert ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'ratmes-media');

DROP POLICY IF EXISTS ratmes_media_read ON storage.objects;
CREATE POLICY ratmes_media_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'ratmes-media');
