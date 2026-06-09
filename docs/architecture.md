# 지하철 고장처치 AX 시스템 — 아키텍처

현장 고장 보고를 모아 AI가 **고장처치 위키**로 정제하고, 관제사는 즉시 조치를
안내받고 승무원은 평상시 학습하는 시스템.

설계는 Karpathy의 [LLM Wiki 패턴](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)을
따른다. 핵심은 **"RAG로 매번 raw를 재검색하지 말고, 한 번 합성한 위키를 점진적으로
유지하라"** — 지식이 질의마다 재생성되지 않고 **복리로 축적되는 단일 아티팩트**가 된다.

---

## 1. 데이터 흐름 한눈에

```
                  [현장 승무원/관제사]
                         │ 보고 입력·업로드
                         ▼
   ┌──────────────────────────────────────┐
   │  raw_reports  (불변 원천, Raw Sources) │
   └──────────────────────────────────────┘
                         │ 자동 정리(ingest) / 수동 위키 생성
                         ▼  ── AI 정제·병합 ──
   ┌──────────────────────────────────────┐
   │  wiki  (LLM이 소유·유지하는 지식, Wiki) │◄── lint(청소) / crosslink(연결)
   └──────────────────────────────────────┘
              │ RAG 검색            │ 학습
              ▼                     ▼
        [관제 즉시 조치]       [학습 위키 열람]
```

| Karpathy 패턴                   | 본 시스템                               | 위치                                     |
| ------------------------------- | --------------------------------------- | ---------------------------------------- |
| Raw Sources (불변 원천)         | `raw_reports` 테이블                    | DB                                       |
| The Wiki (LLM 소유)             | `wiki` 테이블                           | DB                                       |
| The Schema (구조·규칙)          | `guidance_prompts` + 생성/병합 프롬프트 | DB + `lib/wiki.ts`                       |
| Ingest (1회 처리→다수 갱신)     | 자동 정리 / 수동 위키 생성              | `/api/wiki/ingest`, `/api/wiki/generate` |
| Query (raw 재검색 X, wiki 읽음) | 관제 RAG 검색                           | `/api/wiki/search`                       |
| Lint (모순·노후·고아 점검)      | 위키 건강 점검                          | `/api/wiki/lint`                         |
| Interlinked (상호 링크)         | cross-link                              | `/api/wiki/crosslink`                    |

---

## 2. 핵심 개념

### 임베딩 기반 RAG

- 모델: Gemini (`gemini-3.5-flash`), 임베딩 `gemini-embedding-001` 768차원
- pgvector 코사인 유사도로 의미 검색 (`match_wiki` RPC)
- wiki 저장 시 핵심 필드(title·category·symptom·cause·procedure·prevention)를
  합쳐 임베딩 (`embedTextOf`)

### 병합 우선 전략 (중복 누적 방지)

보고를 wiki로 만들 때, **항상 가장 유사한 기존 wiki를 먼저 찾는다.**

- 유사도 **≥ 0.82** → 신규 생성이 아니라 기존 문서에 **병합·보강** (출처 ID 합집합)
- 미만 → 신규 생성

→ 같은 고장유형이 반복 보고돼도 문서가 1건으로 정제되며, 근거 사례가 쌓일수록
문서가 똑똑해진다. 공유 로직: `lib/wiki.ts`의 `upsertWikiFromReports()`.

### 신뢰도 (근거 사례 수 기반)

`source_report_ids` 길이로 신뢰도를 산정해 배지로 표시 (`lib/confidence.ts`):

- **검증됨** (≥3건) / **보통** (2건) / **사례 부족** (≤1건)

병합이 쌓일수록 자동으로 신뢰도가 승격된다.

---

## 3. 기능별 상세

### 3.1 고장 보고 입력 — `/report`

- **직접 입력**: 발생일시·호선·차량번호·증상(필수)·조치·결과
- **문서 업로드**: 이미지/PDF/텍스트를 AI가 파싱해 여러 건 추출 (`EXTRACT_PROMPT`)

### 3.2 보고 목록 — `/report/list`

- 검색(호선·차량번호·증상 등)
- **다단 정렬**: 1차→2차 (발생일시·호선, 각각 오름/내림). 호선은 자연 정렬,
  값 없는 항목은 항상 뒤로
- **자동 정리(ingest)**: 미처리(`ingested=false`) 보고를 한 건씩 자동으로 유사
  wiki에 병합/신규 생성. 배치 20건. 사람의 수동 선택 없이 AI가 분류
- **수동 위키 생성**: 보고를 직접 선택해 위키로 정제 (공존)

### 3.3 관제 검색 — `/control`

- 증상 입력 → 유사 wiki top-5 검색 → 활성 프롬프트로 **즉시 조치 안내** 생성
- 검색 결과 카드에 근거 사례 수·신뢰도 표시

### 3.4 프롬프트 관리 — `/control/prompts`

- 즉시 조치 안내 생성에 쓰는 시스템 프롬프트를 사용자가 직접 CRUD
- 여러 프롬프트 중 하나를 **활성**으로 선택 (항상 1개만 활성, 부분 유니크 인덱스)

### 3.5 학습 위키 — `/wiki`

- 읽기 전용. 검색어 입력 시에만 본문 펼침
- 카테고리 필터, 신뢰도 배지, **관련 문서(cross-link)** 배지 (클릭 시 이동)

### 3.6 위키 건강 점검 — `/wiki/lint`

Karpathy 패턴의 lint. 위키가 쌓일수록 깨끗해지는 청소 루프.

- **중복 의심**: 유사도 ≥0.85 wiki 쌍 탐지 → "하나로 통합"(LLM dedupe)
- **오래된 문서**: 90일 이상 미갱신
- **근거 부족**: 사례 ≤1건
- **관련 문서 연결(crosslink)**: 전체 wiki에 의미적 top-3 관련 문서 저장

---

## 4. API 엔드포인트

| 메서드 · 경로                             | 설명                                    |
| ----------------------------------------- | --------------------------------------- |
| `GET/POST /api/reports`                   | 보고 목록 / 입력·업로드(AI 추출)        |
| `PATCH/DELETE /api/reports/[id]`          | 보고 수정·삭제                          |
| `POST /api/wiki/generate`                 | 선택 보고 → 위키 정제(병합 우선)        |
| `GET/POST /api/wiki/ingest`               | 미처리 건수 / 자동 정리(일괄 분류·병합) |
| `POST /api/wiki/search`                   | RAG 검색 + 즉시 조치 안내 생성          |
| `GET /api/wiki`                           | 학습 위키 목록                          |
| `PATCH/DELETE /api/wiki/[id]`             | 위키 수정·삭제(임베딩 재생성)           |
| `GET /api/wiki/lint`                      | 중복·노후·근거부족 점검                 |
| `POST /api/wiki/lint/merge`               | 중복 쌍 LLM 통합                        |
| `POST /api/wiki/crosslink`                | 관련 문서 연결 재계산                   |
| `GET/POST /api/guidance-prompts`          | 프롬프트 목록 / 생성                    |
| `PATCH/DELETE /api/guidance-prompts/[id]` | 프롬프트 수정·활성전환·삭제             |

---

## 5. 데이터베이스

### 테이블

- **raw_reports** — 현장 보고. `symptom`(필수), `line`/`train_no`/`action`/
  `result`/`occurred_at`, `source`('text'|'upload'), `ingested`(자동 정리 여부)
- **wiki** — 정제 문서. `title`·`category`·`symptom_summary`·`cause`·
  `procedure`·`prevention`, `source_report_ids`(근거), `related_ids`(cross-link),
  `embedding vector(768)`
- **guidance_prompts** — 안내 생성 프롬프트. `is_active`로 1개만 적용

### RPC

- `match_wiki(embedding, count)` — 코사인 유사도 top-N (source·updated_at 포함)
- `wiki_duplicate_pairs(min_sim, max)` — 중복 의심 쌍
- `related_wiki(source_id, count, min_sim)` — 관련 문서 top-N

### 마이그레이션 (순서대로 Supabase SQL 에디터에서 실행)

1. `0001_init.sql` — 테이블·match_wiki·RLS
2. `0002_guidance_prompts.sql` — 프롬프트 관리
3. `0003_match_wiki_sources.sql` — match_wiki가 source/updated_at 반환
4. `0004_wiki_lint.sql` — wiki_duplicate_pairs
5. `0005_ingest_crosslink.sql` — ingested·related_ids·related_wiki

> RLS는 프로토타입용으로 anon 키 직접 접근을 허용한다.
> **운영 전에는 인증 + 역할 기반 정책으로 교체해야 한다.**

---

## 6. 주요 파라미터 (튜닝 포인트)

| 값     | 의미                                    | 위치                                   |
| ------ | --------------------------------------- | -------------------------------------- |
| `0.82` | 병합 임계값 (이상이면 기존 wiki에 병합) | `lib/wiki.ts` `MERGE_THRESHOLD`        |
| `0.85` | 중복 의심 임계값 (lint)                 | `api/wiki/lint` `DUPLICATE_SIMILARITY` |
| `0.5`  | 관련 문서 최소 유사도 (crosslink)       | `0005` `related_wiki`                  |
| `90일` | 노후 문서 기준                          | `api/wiki/lint` `STALE_DAYS`           |
| `1건`  | 근거 부족 기준                          | `api/wiki/lint` `LOW_CONFIDENCE_CASES` |
| `20건` | ingest 1회 배치 상한                    | `api/wiki/ingest` `BATCH_LIMIT`        |

---

## 7. 기술 스택

- Next.js (App Router) · TypeScript · Tailwind · shadcn/ui
- Supabase (Postgres + pgvector) · Google Gemini
- 상태: 페이지 로컬 상태 + sonner 토스트

---

## 8. 남은 발전 방향

- **질의응답 환류**: 자주 묻는 관제 검색 안내를 wiki로 승격 (Karpathy의
  _"valuable answers become new wiki pages"_)
- **명시적 Schema**: wiki 구조(필드 구성) 자체를 설정으로 분리
- **적응형 학습**: wiki로 시나리오 퀴즈 생성, 약한 고장유형 추적·복습
- **운영용 인증·권한**: RLS 정책 강화
