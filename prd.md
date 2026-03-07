# PRD: Modern Web Starter Kit

## 1. 프로젝트 개요

### 1.1 목적

어떠한 웹사이트를 개발하더라도 빠르게 시작할 수 있는 **범용 스타터 킷**을 구축한다.
초기 랜딩페이지를 기본 제공하며, 사용자가 필요에 따라 기능을 확장해 나갈 수 있는 구조를 갖춘다.

### 1.2 핵심 원칙

- **바퀴를 재발명하지 않는다** — 검증된 라이브러리와 Shadcn UI 컴포넌트를 최대한 활용한다.
- **과도한 엔지니어링을 지양한다** — 현재 필요한 최소한의 복잡도만 유지한다.
- **확장 가능한 구조** — 인증, DB, 결제 등 실서비스 기능을 자연스럽게 붙일 수 있어야 한다.

---

## 2. 기술 스택

### 2.1 코어

| 기술                 | 역할                   |
| -------------------- | ---------------------- |
| Next.js (App Router) | 프레임워크             |
| TypeScript           | 타입 안정성            |
| Tailwind CSS         | 유틸리티 기반 스타일링 |
| Shadcn UI            | 컴포넌트 라이브러리    |
| Lucide React         | 아이콘                 |

### 2.2 추가 라이브러리 (설치 예정)

#### Phase 1 — 즉시 설치 (스타터 킷 기본)

| 라이브러리          | 역할               | 설치 명령어                       |
| ------------------- | ------------------ | --------------------------------- |
| next-themes         | 다크모드/테마 전환 | `npm install next-themes`         |
| Framer Motion       | 애니메이션         | `npm install framer-motion`       |
| React Hook Form     | 폼 상태 관리       | `npm install react-hook-form`     |
| Zod                 | 스키마 검증        | `npm install zod`                 |
| @hookform/resolvers | RHF + Zod 연동     | `npm install @hookform/resolvers` |
| Zustand             | 전역 상태 관리     | `npm install zustand`             |

#### Phase 2 — DX 도구 (코드 품질)

| 도구        | 역할         | 설치 명령어                                           |
| ----------- | ------------ | ----------------------------------------------------- |
| Prettier    | 코드 포맷팅  | `npm install -D prettier prettier-plugin-tailwindcss` |
| Husky       | Git hooks    | `npm install -D husky`                                |
| lint-staged | 커밋 전 린트 | `npm install -D lint-staged`                          |

#### Phase 3 — 확장 시 설치 (필요할 때)

| 라이브러리            | 역할                 | 설치 명령어                         |
| --------------------- | -------------------- | ----------------------------------- |
| @supabase/supabase-js | 인증 + DB + 스토리지 | `npm install @supabase/supabase-js` |
| @supabase/ssr         | Supabase SSR 지원    | `npm install @supabase/ssr`         |

---

## 3. 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (ThemeProvider, 폰트)
│   ├── page.tsx                  # 랜딩페이지 (메인)
│   ├── globals.css               # 전역 스타일 + Tailwind
│   └── (routes)/                 # 향후 페이지 확장
│
├── components/
│   ├── ui/                       # Shadcn UI 컴포넌트 (자동 생성)
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── header.tsx            #   네비게이션 헤더
│   │   ├── footer.tsx            #   푸터
│   │   ├── mobile-nav.tsx        #   모바일 네비게이션
│   │   └── theme-toggle.tsx      #   다크모드 토글
│   ├── sections/                 # 랜딩페이지 섹션
│   │   ├── hero.tsx              #   히어로 섹션
│   │   ├── features.tsx          #   기능 소개
│   │   ├── pricing.tsx           #   가격 플랜 (선택)
│   │   ├── testimonials.tsx      #   사용자 후기 (선택)
│   │   ├── faq.tsx               #   FAQ 아코디언
│   │   └── cta.tsx               #   CTA (Call to Action)
│   └── shared/                   # 공통 재사용 컴포넌트
│       ├── logo.tsx              #   로고
│       ├── section-header.tsx    #   섹션 제목 + 설명
│       └── animated-wrapper.tsx  #   Framer Motion 래퍼
│
├── lib/                          # 유틸리티 & 설정
│   ├── utils.ts                  # cn() 등 유틸리티 (Shadcn 기본)
│   └── constants.ts              # 사이트 메타데이터, 네비게이션 링크
│
├── stores/                       # Zustand 스토어
│   └── use-example-store.ts      # 예시 스토어
│
├── hooks/                        # 커스텀 React 훅
│   └── use-scroll-top.ts         # 스크롤 위치 감지
│
├── types/                        # TypeScript 타입 정의
│   └── index.ts                  # 공통 타입
│
└── providers/                    # Context Providers
    └── theme-provider.tsx        # next-themes 래퍼
```

---

## 4. 설치할 Shadcn UI 컴포넌트 (우선순위별)

### Tier 1 — 필수 (랜딩페이지 구성)

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add accordion        # FAQ 섹션
npx shadcn@latest add sheet            # 모바일 네비게이션
npx shadcn@latest add navigation-menu  # 헤더 네비
npx shadcn@latest add dropdown-menu    # 테마 토글 메뉴
```

### Tier 2 — 폼 & 인터랙션

```bash
npx shadcn@latest add form             # React Hook Form 통합
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add switch
npx shadcn@latest add toast            # 알림 토스트
npx shadcn@latest add dialog           # 모달
```

### Tier 3 — 확장 시 추가

```bash
npx shadcn@latest add avatar
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add popover
npx shadcn@latest add command          # 커맨드 팔레트 (Ctrl+K)
npx shadcn@latest add skeleton         # 로딩 상태
npx shadcn@latest add scroll-area
```

---

## 5. 컴포넌트 & 레이아웃 상세 설계

### 5.1 루트 레이아웃 (`layout.tsx`)

```
┌─────────────────────────────────────────┐
│  ThemeProvider (next-themes)            │
│  ┌───────────────────────────────────┐  │
│  │  Header (sticky, blur backdrop)   │  │
│  ├───────────────────────────────────┤  │
│  │                                   │  │
│  │  {children} — 페이지 콘텐츠       │  │
│  │                                   │  │
│  ├───────────────────────────────────┤  │
│  │  Footer                           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Header 기능:**

- 로고 (좌측)
- 네비게이션 링크 (중앙 또는 우측)
- 다크모드 토글 버튼
- 모바일: 햄버거 메뉴 → Sheet(Drawer) 네비게이션
- 스크롤 시 배경 블러 + 그림자 효과

**Footer 기능:**

- 로고 + 간단한 설명
- 링크 그룹 (제품, 회사, 법적 고지 등)
- 소셜 미디어 아이콘 (Lucide)
- 저작권 표시

### 5.2 랜딩페이지 섹션 구성 (`page.tsx`)

```
┌─────────────────────────────────────────┐
│  Hero Section                           │
│  - 메인 헤드라인 (h1)                   │
│  - 서브 텍스트                          │
│  - CTA 버튼 2개 (Primary + Secondary)  │
│  - 히어로 이미지 또는 일러스트          │
├─────────────────────────────────────────┤
│  Features Section                       │
│  - 섹션 제목 + 설명                     │
│  - 기능 카드 그리드 (3~4열)             │
│  - 아이콘 + 제목 + 설명                 │
├─────────────────────────────────────────┤
│  CTA Section                            │
│  - 강조 배경색                          │
│  - 행동 유도 문구                       │
│  - 버튼                                │
├─────────────────────────────────────────┤
│  FAQ Section                            │
│  - Accordion 기반 Q&A                   │
├─────────────────────────────────────────┤
│  Footer                                 │
└─────────────────────────────────────────┘
```

### 5.3 공통 컴포넌트 상세

| 컴포넌트          | 설명                                        | 의존성                     |
| ----------------- | ------------------------------------------- | -------------------------- |
| `SectionHeader`   | 모든 섹션의 제목 + 부제 패턴 통일           | —                          |
| `AnimatedWrapper` | Framer Motion viewport 진입 애니메이션 래퍼 | framer-motion              |
| `ThemeToggle`     | 라이트/다크/시스템 모드 전환 버튼           | next-themes, dropdown-menu |
| `MobileNav`       | 반응형 모바일 네비게이션 드로어             | sheet                      |
| `Logo`            | SVG 로고 또는 텍스트 로고                   | —                          |

---

## 6. 구현 단계 (순서)

### Step 1: 프로젝트 초기화

- [x] `npx create-next-app@latest .`
- [x] `npx shadcn@latest init`
- [x] `npm install lucide-react`

### Step 2: 추가 라이브러리 설치

- [ ] Phase 1 라이브러리 일괄 설치 (next-themes, framer-motion, react-hook-form, zod, zustand 등)
- [ ] Phase 2 DX 도구 설치 (prettier, husky, lint-staged)

### Step 3: Shadcn UI 컴포넌트 설치

- [ ] Tier 1 컴포넌트 일괄 설치
- [ ] Tier 2 컴포넌트 일괄 설치

### Step 4: 프로젝트 구조 생성

- [ ] 디렉토리 구조 생성 (components/layout, sections, shared, lib, stores, hooks, types, providers)
- [ ] 기본 설정 파일 작성 (constants.ts, types/index.ts)

### Step 5: 기반 구축

- [ ] ThemeProvider 설정 (providers/theme-provider.tsx)
- [ ] 루트 레이아웃 구성 (layout.tsx에 ThemeProvider, 폰트 적용)
- [ ] 유틸리티 함수 정리 (lib/utils.ts)

### Step 6: 레이아웃 컴포넌트 개발

- [ ] Logo 컴포넌트
- [ ] ThemeToggle 컴포넌트
- [ ] Header 컴포넌트 (데스크탑 네비게이션)
- [ ] MobileNav 컴포넌트 (Sheet 기반)
- [ ] Footer 컴포넌트

### Step 7: 랜딩페이지 섹션 개발

- [ ] SectionHeader 공통 컴포넌트
- [ ] AnimatedWrapper 컴포넌트 (Framer Motion)
- [ ] Hero 섹션
- [ ] Features 섹션
- [ ] CTA 섹션
- [ ] FAQ 섹션

### Step 8: 통합 & 마무리

- [ ] page.tsx에서 전체 섹션 조합
- [ ] 반응형 레이아웃 검증 (모바일/태블릿/데스크탑)
- [ ] 다크모드 전체 테스트
- [ ] Prettier + Husky + lint-staged 설정
- [ ] 메타데이터 및 SEO 기본 설정

---

## 7. 다크모드 전략

- `next-themes`의 `ThemeProvider`를 루트 레이아웃에 적용
- `attribute="class"` 모드 사용 (Tailwind CSS의 `dark:` 접두사와 연동)
- 기본값: 시스템 설정 따름 (`defaultTheme="system"`)
- 테마 전환 시 깜빡임(FOUC) 방지: `suppressHydrationWarning` 적용
- `ThemeToggle` 컴포넌트: Light / Dark / System 3가지 옵션 제공

---

## 8. 애니메이션 전략

- `AnimatedWrapper` 컴포넌트로 일관된 진입 애니메이션 제공
- Viewport 진입 시 fade-in + slide-up 기본 효과
- `framer-motion`의 `useInView` 활용, `once: true`로 최초 1회만 실행
- 과도한 애니메이션 지양 — 자연스러운 등장 효과에 집중
- 성능 고려: `will-change`, `transform` 기반 애니메이션 우선 사용

---

## 9. 상태 관리 전략

### 서버 상태 (Server State)

- Next.js App Router의 Server Components + `fetch` 캐싱 활용
- 필요 시 React의 `use` 또는 SWR/TanStack Query 도입 검토

### 클라이언트 상태 (Client State)

- **Zustand**로 관리: UI 상태, 모달/드로어 열림/닫힘, 사용자 설정 등
- 스토어 파일은 `stores/` 디렉토리에 기능 단위로 분리
- 예시 스토어를 제공하여 패턴 가이드 역할

---

## 10. 코드 품질 & DX 설정

### ESLint

- Next.js 기본 ESLint 설정 유지 (`next/core-web-vitals`)

### Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Husky + lint-staged

- `pre-commit` 훅에서 스테이징된 파일에 대해:
  - `prettier --write` (포맷팅)
  - `eslint --fix` (린트)

---

## 11. 향후 확장 가이드

| 기능         | 추천 스택                  | 비고                         |
| ------------ | -------------------------- | ---------------------------- |
| 인증         | Supabase Auth              | 소셜 로그인, 이메일/패스워드 |
| 데이터베이스 | Supabase (PostgreSQL)      | RLS 기반 보안                |
| 파일 업로드  | Supabase Storage           | S3 호환                      |
| 결제         | Stripe                     | 구독/일회성 결제             |
| 이메일 발송  | Resend                     | React Email 템플릿           |
| 배포         | Vercel                     | Next.js 최적 호스팅          |
| 모니터링     | Sentry                     | 에러 트래킹                  |
| 분석         | Vercel Analytics / PostHog | 사용자 행동 분석             |

---

## 12. 파일 네이밍 컨벤션

- **컴포넌트 파일**: `kebab-case.tsx` (예: `theme-toggle.tsx`)
- **유틸리티 파일**: `kebab-case.ts` (예: `constants.ts`)
- **타입 파일**: `kebab-case.ts` (예: `index.ts`)
- **스토어 파일**: `use-[name]-store.ts` (예: `use-example-store.ts`)
- **훅 파일**: `use-[name].ts` (예: `use-scroll-top.ts`)
- **컴포넌트 내부**: `PascalCase` export (예: `export function ThemeToggle()`)
