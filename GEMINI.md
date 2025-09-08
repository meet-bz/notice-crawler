# **공지사항 크롤링 플랫폼 - AI 개발 가이드라인**

이 가이드라인은 공지사항 크롤링 플랫폼의 AI 에이전트(Gemini)가 Next.js 프로젝트에서 효율적이고 자동화된 개발 워크플로우를 수행하기 위한 운영 원칙과 기능을 정의합니다.

## **프로젝트 개요**

공지사항 크롤링 플랫폼은 사용자가 입력한 웹사이트의 공지사항을 자동으로 크롤링하고, 선택한 요소의 데이터를 추출하여 카카오톡 채널로 전송하는 웹 애플리케이션입니다.

### **주요 기능**
- **웹사이트 크롤링**: Puppeteer를 활용한 헤드리스 브라우저로 JS 렌더링 지원
- **요소 선택 인터페이스**: 직관적인 클릭으로 크롤링할 요소 선택
- **카카오톡 연동**: 추출된 데이터를 실시간 전송
- **Firebase 인증**: 사용자 로그인/회원가입 시스템
- **데이터 관리**: Firestore를 활용한 크롤링 이력 저장

## **프로젝트 구조**

```
src/
├── app/
│   ├── api/
│   │   ├── crawl/          # 페이지 크롤링 API
│   │   ├── extract/        # 데이터 추출 API
│   │   ├── send-kakao/     # 카카오톡 전송 API
│   │   └── auth/           # Firebase 인증 API (계획)
│   ├── crawl/              # 크롤링 페이지
│   ├── auth/               # 인증 페이지 (계획)
│   ├── dashboard/          # 사용자 대시보드 (계획)
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 메인 페이지
├── components/
│   ├── auth/               # 인증 컴포넌트 (계획)
│   ├── crawl/              # 크롤링 관련 컴포넌트
│   └── ui/                 # 공통 UI 컴포넌트
├── lib/
│   ├── firebase.ts         # Firebase 설정 (계획)
│   ├── auth.ts             # 인증 유틸리티 (계획)
│   └── utils.ts            # 공통 유틸리티
└── types/
    └── index.ts            # TypeScript 타입 정의
```

## **Firebase 통합 가이드라인**

### **Firebase 설정**
1. Firebase 프로젝트 생성 및 설정
2. Authentication, Firestore 활성화
3. 환경 변수 설정 (`.env.local`)

### **인증 구현**
- **Firebase Authentication** 사용
- 이메일/비밀번호, Google 소셜 로그인 지원
- Server Components에서 세션 관리
- Client Components에서 인증 상태 관리

### **데이터베이스 설계**
```typescript
// 사용자 정보
interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// 크롤링 설정
interface CrawlConfig {
  id: string;
  userId: string;
  url: string;
  selector: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

// 크롤링 이력
interface CrawlHistory {
  id: string;
  configId: string;
  userId: string;
  content: string;
  status: 'success' | 'error';
  createdAt: Date;
}
```

## **개발 워크플로우**

### **Phase별 개발 계획**

#### **Phase 1: 핵심 기능 (현재)**
- [x] 기본 크롤링 기능 구현
- [x] 요소 선택 인터페이스
- [x] 카카오톡 API 연동

#### **Phase 2: Firebase 인증 시스템**
- [ ] Firebase 프로젝트 설정
- [ ] 인증 컴포넌트 구현
- [ ] 로그인/회원가입 페이지
- [ ] 세션 관리

#### **Phase 3: 데이터 관리**
- [ ] Firestore 스키마 설계
- [ ] 크롤링 설정 저장
- [ ] 이력 관리
- [ ] 사용자 대시보드

#### **Phase 4: 고급 기능**
- [ ] 정기 크롤링 스케줄링
- [ ] 알림 시스템
- [ ] 다중 플랫폼 연동

## **코드 품질 및 보안**

### **보안 고려사항**
- **API 키 보호**: 서버 사이드에서만 Firebase Admin SDK 사용
- **사용자 데이터**: Firestore 보안 규칙으로 데이터 접근 제어
- **인증 토큰**: 안전한 토큰 관리 및 검증

### **성능 최적화**
- **Server Components**: 데이터 페칭을 서버에서 처리
- **코드 스플리팅**: 동적 import로 번들 크기 최적화
- **캐싱**: Next.js 캐시 전략 활용

## **AI 개발 원칙**

### **자동화된 에러 감지 및 수정**
- 코드 수정 후 자동으로 `npm run lint` 실행
- TypeScript 오류 자동 감지 및 수정
- 런타임 오류 모니터링 및 보고

### **사용자 중심 디자인**
- 모던하고 직관적인 UI/UX
- 모바일 반응형 디자인
- 접근성(A11Y) 표준 준수

### **반복적 개발 프로세스**
1. 사용자 요구사항 분석
2. blueprint.md 파일 업데이트
3. 단계별 구현 계획 수립
4. 코드 구현 및 테스트
5. 피드백 기반 개선

## **Firebase MCP 설정**

Firebase 기능을 사용할 때는 다음 MCP 서버 설정을 추가하세요:

```json
{
    "mcpServers": {
        "firebase": {
            "command": "npx",
            "args": [
                "-y",
                "firebase-tools@latest",
                "experimental:mcp"
            ]
        }
    }
}
```

이 가이드라인을 따라 공지사항 크롤링 플랫폼을 체계적이고 효율적으로 개발할 수 있습니다.

## Firebase MCP

When requested for Firebase add the following the server configurations to .idx/mcp.json. Just add the following and don't add anything else.

{
    "mcpServers": {
        "firebase": {
            "command": "npx",
            "args": [
                "-y",
                "firebase-tools@latest",
                "experimental:mcp"
            ]
        }
    }
}

## **Code Modification & Dependency Management**

The AI is empowered to modify the codebase autonomously based on user requests. The AI is creative and anticipates features that the user might need even if not explicitly requested.

* **Core Code Assumption:** The AI will primarily work with React components (`.tsx` or `.jsx`) within the `/app` directory. It will create new routes, layouts, and components as needed.
* **Package Management:** The AI will use `npm` or `yarn` for package management.
* **Next.js CLI:** The AI will use the Next.js CLI for common development tasks:
  * `npm run build`: To build the project for production.
  * `npm run lint`: To run ESLint and check for code quality issues.

## **Next.js Core Concepts (App Router)**

### **Server Components by Default**

The AI understands that components in the `/app` directory are React Server Components (RSCs) by default.

* **Data Fetching:** The AI will perform data fetching directly in Server Components using `async/await`, colocating data access with the component that uses it.
* **"use client" Directive:** For components that require interactivity, state, or browser-only APIs, the AI will use the `"use client"` directive to mark them as Client Components.
* **Best Practice:** Keep Client Components as small as possible and push them to the leaves of the component tree to minimize the client-side JavaScript bundle.

### **File-based Routing**

The AI will manage routing by creating folders and `page.tsx` files within the `/app` directory.

* **Layouts (`layout.tsx`):** Define shared UI for a segment and its children.
* **Pages (`page.tsx`):** Define the unique UI of a route.
* **Loading UI (`loading.tsx`):** Create instant loading states that show while a route segment loads.
* **Error Handling (`error.tsx`):** Isolate errors to specific route segments.

### **Server Actions**

For data mutations (e.g., form submissions), the AI will use Server Actions to call server-side functions directly from components.

* **Definition:** The AI will define an `async` function with the `"use server"` directive.
* **Invocation:** Actions will be invoked using the `action` prop on a `<form>` element or from custom event handlers.
* **Security:** Server Actions are the preferred way to handle mutations as they provide built-in protection against POST-only requests.

*Example of a simple Server Action:*

```ts
// app/actions.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function-save-email(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  // Save email to database...
  return { message: 'Success!' }
}
```

## **Automated Error Detection & Remediation**

A critical function of the AI is to continuously monitor for and automatically resolve errors.

* **Post-Modification Checks:** After every code modification, the AI will:
  * Run `npm run lint -- --fix` to catch and fix linting issues.
  * Monitor the IDE's diagnostics (problem pane).
  * Check the output of the running dev server for compilation and runtime errors.
* **Automatic Error Correction:** The AI will attempt to fix common Next.js and React errors.
* **Problem Reporting:** If an error cannot be resolved, the AI will report the specific error message, its location, and a concise explanation with a suggested fix.

## **Visual Design**

**Aesthetics:** The AI always makes a great first impression by creating a unique user experience that incorporates modern components, a visually balanced layout with clean spacing, and polished styles that are easy to understand.

1. Build beautiful and intuitive user interfaces that follow modern design guidelines.
2. Ensure your app is mobile responsive and adapts to different screen sizes, working perfectly on mobile and web.
3. Propose colors, fonts, typography, iconography, animation, effects, layouts, texture, drop shadows, gradients, etc.
4. If images are needed, make them relevant and meaningful, with appropriate size, layout, and licensing (e.g., freely available). If real images are not available, provide placeholder images.
5. If there are multiple pages for the user to interact with, provide an intuitive and easy navigation bar or controls.

**Bold Definition:** The AI uses modern, interactive iconography, images, and UI components like buttons, text fields, animation, effects, gestures, sliders, carousels, navigation, etc.

1. Fonts \- Choose expressive and relevant typography. Stress and emphasize font sizes to ease understanding, e.g., hero text, section headlines, list headlines, keywords in paragraphs, etc.
2. Color \- Include a wide range of color concentrations and hues in the palette to create a vibrant and energetic look and feel.
3. Texture \- Apply subtle noise texture to the main background to add a premium, tactile feel.
4. Visual effects \- Multi-layered drop shadows create a strong sense of depth. Cards have a soft, deep shadow to look "lifted."
5. Iconography \- Incorporate icons to enhance the user’s understanding and the logical navigation of the app.
6. Interactivity \- Buttons, checkboxes, sliders, lists, charts, graphs, and other interactive elements have a shadow with elegant use of color to create a "glow" effect.

**Accessibility or A11Y Standards:** The AI implements accessibility features to empower all users, assuming a wide variety of users with different physical abilities, mental abilities, age groups, education levels, and learning styles.

## **Iterative Development & User Interaction**

The AI's workflow is iterative, transparent, and responsive to user input.

* **Plan Generation & Blueprint Management:** Each time the user requests a change, the AI will first generate a clear plan overview and a list of actionable steps. This plan will then be used to **create or update a `blueprint.md` file** in the project's root directory.
  * The blueprint.md file will serve as a single source of truth, containing:
    * A section with a concise overview of the purpose and capabilities.
    * A section with a detailed outline documenting the project, including *all style, design, and features* implemented in the application from the initial version to the current version.
    * A section with a detailed outline of the plan and steps for the current requested change.
  * Before initiating any new change or at the start of a new chat session, the AI will reference the blueprint.md to ensure full context and understanding of the application's current state and existing features. This ensures consistency and avoids redundant or conflicting modifications.
* **Prompt Understanding:** The AI will interpret user prompts to understand the desired changes. It will ask clarifying questions if the prompt is ambiguous.
* **Contextual Responses:** The AI will provide conversational responses, explaining its actions, progress, and any issues encountered.
* **Error Checking Flow:**
  1. **Important:** The AI will **not** start the dev server (`next dev`), as it is already managed by Firebase Studio.
  2. **Code Change:** AI applies a code modification.
  3. **Dependency Check:** If a new package is needed, AI runs `npm install`.
  4. **Compile & Analyze:** AI runs `npm run lint` and monitors the dev server.
  5. **Preview Check:** AI observes the browser preview for visual and runtime errors.
  6. **Remediation/Report:** If errors are found, AI attempts automatic fixes. If unsuccessful, it reports details to the user.