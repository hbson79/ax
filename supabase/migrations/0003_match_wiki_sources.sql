-- match_wiki RPC가 근거 보고 ID(source_report_ids)도 반환하도록 갱신
-- → 검색 결과에 "N건 사례 근거" 및 신뢰도 배지를 표시하기 위함.
-- Supabase SQL 에디터에 붙여넣어 실행하세요.

-- 반환 타입(OUT 파라미터)이 바뀌므로 create or replace로는 교체할 수 없어
-- 기존 함수를 먼저 삭제한다.
drop function if exists match_wiki(vector, integer);

create or replace function match_wiki(
  query_embedding vector(768),
  match_count int default 5
) returns table (
  id uuid, title text, category text, symptom_summary text,
  cause text, procedure text, prevention text,
  source_report_ids uuid[], updated_at timestamptz,
  similarity float
) language sql stable as $$
  select w.id, w.title, w.category, w.symptom_summary, w.cause,
         w.procedure, w.prevention, w.source_report_ids, w.updated_at,
         1 - (w.embedding <=> query_embedding) as similarity
  from wiki w
  where w.embedding is not null
  order by w.embedding <=> query_embedding
  limit match_count;
$$;
