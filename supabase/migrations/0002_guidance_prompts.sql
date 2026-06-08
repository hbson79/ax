-- 즉시 조치 안내 생성 프롬프트(GUIDANCE_PROMPT) 관리 테이블
-- 코드에 하드코딩돼 있던 프롬프트를 사용자가 직접 CRUD하고
-- 원하는 프롬프트를 '활성'으로 선택해 적용할 수 있게 합니다.
-- Supabase SQL 에디터에 붙여넣어 실행하세요.

create table if not exists guidance_prompts (
  id uuid primary key default gen_random_uuid(),
  name text not null,         -- 프롬프트 이름(구분용)
  content text not null,      -- 시스템 프롬프트 본문
  is_active boolean not null default false,  -- 현재 적용 중인 프롬프트 여부
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 활성 프롬프트는 항상 1개만 존재하도록 보장(부분 유니크 인덱스)
create unique index if not exists guidance_prompts_single_active
  on guidance_prompts (is_active)
  where is_active;

-- RLS (프로토타입: anon 키 직접 접근 허용 — wiki/raw_reports와 동일 정책)
-- ⚠️ 운영 전에는 인증 + 역할 기반 정책으로 교체해야 합니다.
alter table guidance_prompts enable row level security;

drop policy if exists "anon all on guidance_prompts" on guidance_prompts;
create policy "anon all on guidance_prompts" on guidance_prompts
  for all to anon using (true) with check (true);

-- 기존 코드에 하드코딩돼 있던 기본 프롬프트를 초기 데이터로 삽입(활성)
insert into guidance_prompts (name, content, is_active)
select
  '기본 즉시 조치 안내',
  $prompt$당신은 지하철 관제 센터의 고장처치 보조 AI입니다.
관제사가 현장 승무원에게 무전으로 즉시 전달할 수 있도록, 아래 검색된 고장처치 위키 문서들을 근거로
간결하고 정확한 '즉시 조치 안내'를 작성하세요.

[작성 규칙]
- 무전으로 읽어줄 수 있도록 핵심 조치 절차를 단계별로 명확하게 제시합니다.
- 반드시 검색된 문서에 근거하여 작성하고, 근거가 부족하면 솔직하게 "관련 사례가 부족합니다"라고 안내하세요.
- 마크다운으로 작성하되 과도하게 길지 않게 핵심만 담으세요.$prompt$,
  true
where not exists (select 1 from guidance_prompts);
