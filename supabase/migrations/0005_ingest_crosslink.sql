-- 자동 ingest + wiki cross-link 지원
-- Supabase SQL 에디터에 붙여넣어 실행하세요.

-- 1) raw_reports: 자동 ingest 처리 여부 (이미 wiki에 반영된 보고 추적)
alter table raw_reports
  add column if not exists ingested boolean not null default false;

-- 2) wiki: 관련 문서(cross-link) id 목록
alter table wiki
  add column if not exists related_ids uuid[];

-- 3) 특정 wiki의 유사 문서 top-N을 반환 (cross-link 계산용)
--    자기 자신은 제외한다.
create or replace function related_wiki(
  source_id uuid,
  match_count int default 3,
  min_similarity float default 0.5
) returns table (id uuid, similarity float)
language sql stable as $$
  select w.id, 1 - (w.embedding <=> s.embedding) as similarity
  from wiki w, wiki s
  where s.id = source_id
    and w.id <> source_id
    and w.embedding is not null
    and s.embedding is not null
    and 1 - (w.embedding <=> s.embedding) >= min_similarity
  order by w.embedding <=> s.embedding
  limit match_count;
$$;
