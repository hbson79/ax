-- wiki 건강 점검(lint)용 RPC
-- 서로 충분히 유사한(중복 의심) wiki 쌍을 찾아 병합 후보로 제안한다.
-- Karpathy의 LLM Wiki 패턴 중 'lint'(모순·중복·노후 점검)에 해당.
-- Supabase SQL 에디터에 붙여넣어 실행하세요.

create or replace function wiki_duplicate_pairs(
  min_similarity float default 0.85,
  max_pairs int default 20
) returns table (
  a_id uuid, a_title text, a_category text,
  a_cases int, a_updated_at timestamptz,
  b_id uuid, b_title text, b_category text,
  b_cases int, b_updated_at timestamptz,
  similarity float
) language sql stable as $$
  select
    a.id, a.title, a.category,
    coalesce(array_length(a.source_report_ids, 1), 0) as a_cases,
    a.updated_at,
    b.id, b.title, b.category,
    coalesce(array_length(b.source_report_ids, 1), 0) as b_cases,
    b.updated_at,
    1 - (a.embedding <=> b.embedding) as similarity
  from wiki a
  join wiki b
    on a.id < b.id                       -- 각 쌍을 한 번만, 자기 자신 제외
  where a.embedding is not null
    and b.embedding is not null
    and 1 - (a.embedding <=> b.embedding) >= min_similarity
  order by similarity desc
  limit max_pairs;
$$;
