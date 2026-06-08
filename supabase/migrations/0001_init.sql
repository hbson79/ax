-- 지하철 고장정보 AX 시스템 초기 스키마
-- Supabase SQL 에디터에 붙여넣어 실행하세요.

-- pgvector 확장
create extension if not exists vector;

-- 1) 현장 raw 고장 보고
create table if not exists raw_reports (
  id uuid primary key default gen_random_uuid(),
  line text,                  -- 호선 (예: 2호선)
  train_no text,              -- 차량번호
  symptom text not null,      -- 증상
  action text,                -- 조치 내용
  result text,                -- 조치 결과
  occurred_at timestamptz,    -- 고장 발생 시각
  source text,                -- 'text' | 'upload'
  raw_text text,              -- 업로드 문서 원문(파싱 결과)
  created_at timestamptz default now()
);

-- 2) AI 정제 wiki 문서
create table if not exists wiki (
  id uuid primary key default gen_random_uuid(),
  title text not null,        -- 고장유형 제목
  category text,              -- 분류 (제동/출입문/추진/신호 등)
  symptom_summary text,       -- 증상 요약
  cause text,                 -- 추정 원인
  procedure text,             -- 조치 절차 (마크다운)
  prevention text,            -- 예방/주의
  source_report_ids uuid[],   -- 근거가 된 raw_reports
  embedding vector(768),      -- gemini-embedding (768차원)
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 3) RAG 의미검색 RPC (코사인 유사도)
create or replace function match_wiki(
  query_embedding vector(768),
  match_count int default 5
) returns table (
  id uuid, title text, category text, symptom_summary text,
  cause text, procedure text, prevention text, similarity float
) language sql stable as $$
  select w.id, w.title, w.category, w.symptom_summary, w.cause,
         w.procedure, w.prevention,
         1 - (w.embedding <=> query_embedding) as similarity
  from wiki w
  where w.embedding is not null
  order by w.embedding <=> query_embedding
  limit match_count;
$$;

-- 벡터 검색 인덱스
create index if not exists wiki_embedding_idx
  on wiki using ivfflat (embedding vector_cosine_ops) with (lists = 100);
