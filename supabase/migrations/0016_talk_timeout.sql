-- Talks could get stuck "processing" forever if the notes job hung (e.g. the
-- transcription provider stalled). Track when the notes run started so the app
-- can show a retry path after a sensible wait instead of spinning indefinitely.
alter table talks add column if not exists notes_started_at timestamptz default now();
update talks set notes_started_at = coalesce(notes_started_at, created_at) where notes_started_at is null;
