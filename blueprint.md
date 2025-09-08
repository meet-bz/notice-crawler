# 공지사항 크롤링 플랫폼 - 개발 블루프린트

## 프로젝트 개요

공지사항 크롤링 플랫폼은 사용자가 입력한 웹사이트의 공지사항을 자동으로 크롤링하고, 선택한 요소의 데이터를 추출하여 카카오톡 채널로 전송하는 웹 애플리케이션입니다.

### 주요 목표
- **사용자 친화성**: 직관적인 인터페이스로 누구나 쉽게 사용할 수 있음
- **신뢰성**: 안정적인 크롤링과 데이터 전송
- **확장성**: Firebase를 활용한 사용자 관리 및 데이터 저장
- **보안성**: 안전한 인증 시스템과 데이터 보호

## 현재 구현 상태 (Phase 1)

### ✅ 완료된 기능

#### 1. 기본 크롤링 시스템
- **Puppeteer 통합**: 헤드리스 Chrome으로 웹사이트 크롤링
- **JS 렌더링 지원**: 동적 콘텐츠 처리 가능
- **HTML 콘텐츠 추출**: 서버 사이드에서 안전하게 처리

#### 2. 요소 선택 인터페이스
- **시각적 선택**: 사용자가 웹페이지를 보고 직접 요소 클릭
- **정확한 셀렉터 생성**: CSS 셀렉터 자동 생성 알고리즘
- **실시간 피드백**: 선택된 요소 표시

#### 3. 카카오톡 연동
- **API 통합**: Kakao Developers API 사용
- **실시간 전송**: 추출된 데이터 즉시 전송
- **에러 처리**: 전송 실패 시 적절한 피드백

#### 4. UI/UX
- **모던 디자인**: Tailwind CSS 활용
- **반응형 레이아웃**: 모바일 친화적
- **직관적 네비게이션**: 심플한 사용자 흐름

### 🛠️ 기술 스택
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **크롤링**: Puppeteer
- **스타일링**: Tailwind CSS
- **외부 API**: Kakao API

## 향후 개발 계획

### 🔄 Phase 2: Firebase 인증 시스템 (진행 예정)

#### 목표
- 사용자별 개인화된 크롤링 설정
- 안전한 데이터 저장 및 관리
- 확장 가능한 사용자 기반 구축

#### 구현 항목
1. **Firebase 프로젝트 설정**
   - Firebase Console에서 프로젝트 생성
   - Authentication, Firestore 활성화
   - 보안 규칙 설정

2. **인증 컴포넌트 개발**
   - 로그인 페이지 (`/auth/login`)
   - 회원가입 페이지 (`/auth/signup`)
   - 비밀번호 재설정 기능
   - 소셜 로그인 (Google, GitHub)

3. **세션 관리**
   - Next.js Middleware로 인증 상태 확인
   - Server Components에서 세션 처리
   - Client Components에서 인증 상태 동기화

4. **보호된 라우트**
   - 인증되지 않은 사용자 접근 제한
   - 역할 기반 접근 제어 (향후 확장)

### 📊 Phase 3: 데이터 관리 및 분석 (계획)

#### 목표
- 크롤링 이력 저장 및 분석
- 사용자별 설정 관리
- 성능 모니터링 및 최적화

#### 구현 항목
1. **Firestore 스키마 설계**
   ```typescript
   // 사용자 정보
   interface User {
     uid: string;
     email: string;
     displayName: string;
     createdAt: Date;
     preferences: UserPreferences;
   }

   // 크롤링 설정
   interface CrawlConfig {
     id: string;
     userId: string;
     url: string;
     selector: string;
     name: string;
     schedule?: string; // cron 표현식
     isActive: boolean;
     createdAt: Date;
     lastRun?: Date;
   }

   // 크롤링 이력
   interface CrawlHistory {
     id: string;
     configId: string;
     userId: string;
     content: string;
     status: 'success' | 'error' | 'no_change';
     errorMessage?: string;
     createdAt: Date;
   }
   ```

2. **대시보드 개발**
   - 크롤링 설정 관리 페이지
   - 이력 조회 및 검색
   - 통계 차트 및 분석
   - 알림 설정

3. **성능 최적화**
   - 캐싱 전략 구현
   - 배치 처리로 API 호출 최적화
   - 모니터링 및 로깅 시스템

### 🚀 Phase 4: 고급 기능 확장 (장기 계획)

#### 목표
- 기업용 기능 추가
- 다중 플랫폼 지원
- 자동화된 워크플로우

#### 구현 항목
1. **정기 크롤링 스케줄링**
   - Cron 작업으로 자동 실행
   - 변경 감지 및 알림
   - 배치 처리 시스템

2. **다중 플랫폼 연동**
   - Slack, Discord 웹훅
   - 이메일 알림
   - SMS 알림 (Twilio 등)

3. **API 및 웹훅**
   - RESTful API 제공
   - 웹훅 지원으로 외부 시스템 연동
   - API 키 기반 인증

4. **플러그인 시스템**
   - 확장 가능한 아키텍처
   - 커스텀 크롤러 개발 지원
   - 타사 서비스 연동

## 개발 원칙 및 가이드라인

### 코드 품질
- **TypeScript 엄격 모드**: 타입 안전성 보장
- **ESLint 규칙 준수**: 코드 품질 유지
- **테스트 커버리지**: 주요 기능에 대한 단위/통합 테스트

### 보안
- **입력 검증**: 모든 사용자 입력에 대한 검증
- **XSS 방지**: dangerouslySetInnerHTML 사용 시 주의
- **API 키 보호**: 서버 사이드에서만 민감한 정보 처리

### 성능
- **코드 스플리팅**: 번들 크기 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 활용
- **캐싱 전략**: 적절한 캐시 레이어 구현

### 사용자 경험
- **접근성**: WCAG 2.1 AA 준수
- **반응형 디자인**: 모든 디바이스 지원
- **오프라인 지원**: PWA 기능 고려

## 현재 우선순위

### 단기 (2-4주)
1. Firebase 인증 시스템 구현
2. 기본 사용자 대시보드 개발
3. 크롤링 설정 저장 기능

### 중기 (1-3개월)
1. Firestore 데이터베이스 설계 및 구현
2. 크롤링 이력 관리 시스템
3. 알림 기능 개발

### 장기 (3-6개월)
1. 정기 크롤링 스케줄러
2. 다중 플랫폼 연동
3. API 및 웹훅 시스템

## 리스크 및 해결 방안

### 기술적 리스크
- **크롤링 차단**: User-Agent 로테이션, 프록시 사용
- **API 제한**: Rate limiting 구현, 캐싱 전략
- **데이터 일관성**: 트랜잭션 처리, 에러 복구 메커니즘

### 비즈니스 리스크
- **사용자 확보**: 직관적인 UI/UX로 진입 장벽 낮춤
- **경쟁 우위**: 고유한 기능으로 차별화
- **확장성**: 모듈화된 아키텍처로 유지보수 용이

이 블루프린트는 프로젝트의 방향성을 유지하면서 유연하게 업데이트될 수 있습니다.
