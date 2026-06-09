-- ─────────────────────────────────────────────────────────────────────────
-- 로컬 LLM(사내망) 전환 시 임베딩 차원 변경
--
-- 배경: AI_PROVIDER=local 로 바꾸며 임베딩 모델이 달라지면(예: bge-m3=1024)
--       벡터 차원이 기존 gemini-embedding(768)과 달라진다. 차원이 다르면
--       기존 컬럼/함수에 새 임베딩을 넣을 수 없으므로 먼저 차원을 변경한다.
--
-- 사용법:
--   1) 사용할 임베딩 모델의 차원을 확인한다. (bge-m3=1024, multilingual-e5-large=1024,
--      gemini-embedding-001=768 등)
--   2) 아래 768 → 1024(또는 해당 차원)로 전부 치환한 뒤 Supabase SQL 에디터에서 실행.
--   3) 앱에서 POST /api/wiki/reembed 를 호출해 전체 임베딩을 재생성한다.
--
-- 주의: 차원을 바꾸면 기존 임베딩 값은 무효가 된다. 컬럼을 비우고(NULL) 재생성한다.
--       gemini로 되돌릴 때도 동일하게 768로 다시 바꾸고 재생성해야 한다.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) 기존 임베딩 무효화 (차원이 안 맞으면 ALTER가 실패하므로 먼저 비운다)
update wiki set embedding = null;

-- 2) 컬럼 차원 변경 (← 사용할 모델 차원으로 치환)
alter table wiki
  alter column embedding type vector(1024);

-- 3) 검색 RPC 재생성 (0003과 동일한 반환 형태, 차원만 변경)
drop function if exists match_wiki(vector, integer);

create or replace function match_wiki(
  query_embedding vector(1024),
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

-- 4) (선택) 벡터 인덱스를 쓰고 있었다면 차원 변경 후 재생성 필요.
--    drop index if exists wiki_embedding_idx;
--    create index wiki_embedding_idx on wiki using hnsw (embedding vector_cosine_ops);
