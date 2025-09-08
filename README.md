# 공지사항 크롤링 플랫폼 ## ✨ 주요 기능

- **� 웹사이트 크롤링**: Puppeteer를 활용한 헤드리스 브라우저로 JS 렌더링 지원
- **👆 요소 선택**: 직관적인 클릭 인터페이스로 크롤링할 요소 선택
- **🎨 다중 선택 모드**: 번호, 제목, 날짜, 조회수, 링크별로 색상 구분하여 선택
- **⚡ 실시간 모드 전환**: 선택 모드 변경 시 즉시 색상과 선택 상태 반영
- **📱 카카오톡 연동**: 추출된 데이터를 카카오톡 채널로 실시간 전송
- **🔐 사용자 인증**: Firebase Authentication을 활용한 로그인 시스템 (계획 중)
- **📊 데이터 관리**: Firebase Firestore를 활용한 크롤링 이력 저장 (계획 중)
- **⚡ 고급 선택 기능**: 더블클릭/세부요소 선택, 다중 테두리 표시
- **🏗️ 모듈화 아키텍처**: 컴포넌트 기반 설계로 유지보수성 향상력한### 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 `.env.example` 파일을 참고하여 실제 API 키와 설정값을 입력하세요:

```bash
# .env.example 파일을 복사
cp .env.example .env.local
```

**필수 설정:**
- **카카오 API 키**: Kakao Developers에서 발급
- **Firebase 설정**: Firebase Console에서 프로젝트 생성 후 설정값 복사


## ✨ 주요 기능

- **🔍 웹사이트 크롤링**: Puppeteer를 활용한 헤드리스 브라우저로 JS 렌더링 지원
- **👆 요소 선택**: 직관적인 클릭 인터페이스로 크롤링할 요소 선택
- **🎨 다중 선택 모드**: 번호, 제목, 날짜, 조회수, 링크별로 색상 구분하여 선택
- **� 실시간 모드 전환**: 선택 모드 변경 시 즉시 색상과 선택 상태 반영
- **�📱 카카오톡 연동**: 추출된 데이터를 카카오톡 채널로 실시간 전송
- **🔐 사용자 인증**: Firebase Authentication을 활용한 로그인 시스템 (계획 중)
- **📊 데이터 관리**: Firebase Firestore를 활용한 크롤링 이력 저장 (계획 중)
- **⚡ 고급 선택 기능**: 더블클릭/세부요소 선택, 다중 테두리 표시

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- Kakao Developers API 키 (카카오톡 연동용)

### 설치 및 실행

1. **의존성 설치**
```bash
npm install
```

2. **환경 변수 설정**
`.env.local` 파일을 생성하고 다음 정보를 입력하세요:
```env
# Kakao API 설정
KAKAO_API_KEY=your_kakao_api_key_here
KAKAO_CHANNEL_ID=your_channel_id_here

# Firebase 설정 (향후 구현)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **브라우저에서 접속**
[http://localhost:3000](http://localhost:3000)에서 플랫폼을 사용할 수 있습니다.

## 📖 사용 방법

1. **메인 페이지**: 크롤링할 웹사이트 URL을 입력합니다.
2. **크롤링 페이지**: 로드된 페이지에서 원하는 요소를 선택합니다:
   - **모드 선택**: 번호, 제목, 날짜, 조회수, 링크 버튼을 클릭하여 선택 모드 지정
   - **요소 선택**: 해당 모드의 파란색 테두리로 호버링되는 요소를 클릭
   - **다중 선택**: 같은 요소를 여러 모드로 선택 가능 (중첩 테두리 표시)
   - **세부요소 선택**: 선택된 요소를 더블클릭하거나 Ctrl+클릭하여 더 정밀한 셀렉터 생성
   - **선택 해제**: 선택된 요소를 다시 클릭하여 해제
3. **데이터 추출**: 선택된 요소의 텍스트가 추출됩니다.
4. **카카오톡 전송**: 추출된 데이터가 카카오톡 채널로 전송됩니다.

## 🏗️ 아키텍처 설계

프로젝트는 컴포넌트 기반 모듈화 아키텍처를 채택하여 다음과 같은 장점을 제공합니다:

- **재사용성**: 각 컴포넌트가 독립적으로 작동하여 다른 프로젝트에서도 활용 가능
- **유지보수성**: 특정 기능 수정 시 해당 컴포넌트만 수정하면 됨
- **가독성**: 코드의 역할과 책임이 명확하게 분리됨
- **확장성**: 새로운 기능 추가 시 기존 컴포넌트에 영향을 주지 않음

### 컴포넌트 구조
- **UrlInput**: URL 입력 및 크롤링 제어
- **SelectorInput**: 선택자 관리 및 모드 선택
- **IframeViewer**: 웹페이지 표시 및 요소 상호작용
- **ExtractedData**: 추출 결과 표시
- **EmailModal**: 알림 전송 인터페이스

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **크롤링**: Puppeteer (헤드리스 Chrome)
- **외부 API**: Kakao API
- **인증**: Firebase Authentication (계획 중)
- **데이터베이스**: Firebase Firestore (계획 중)
- **아키텍처**: 컴포넌트 기반 모듈화 설계
- **상태 관리**: React Hooks (useState, useEffect, useCallback)
- **스타일링**: Tailwind CSS 클래스 기반 디자인

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── crawl/          # 페이지 크롤링 API
│   │   ├── extract/        # 데이터 추출 API
│   │   └── send-kakao/     # 카카오톡 전송 API
│   ├── crawl/              # 크롤링 페이지
│   │   └── CrawlPage.tsx   # 메인 크롤링 컴포넌트
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지
│   └── globals.css         # 전역 스타일
├── components/             # 재사용 컴포넌트
│   ├── UrlInput.tsx        # URL 입력 및 분석 컴포넌트
│   ├── SelectorInput.tsx   # 선택자 입력 및 모드 선택 컴포넌트
│   ├── IframeViewer.tsx    # iframe 뷰어 및 상호작용 컴포넌트
│   ├── ExtractedData.tsx   # 추출된 데이터 표시 컴포넌트
│   └── EmailModal.tsx      # 이메일 전송 모달 컴포넌트
└── lib/                   # 유틸리티 함수
    └── firebase-template.ts # Firebase 템플릿 설정
```

## 🔧 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start

# 린트 실행
npm run lint
```


## 🔮 향후 계획

### Phase 1: 핵심 기능 완성 ✅
- [x] 기본 크롤링 기능
- [x] 요소 선택 인터페이스
- [x] 다중 모드 선택 (번호/제목/날짜/조회수/링크)
- [x] 실시간 모드 전환 및 색상 표시
- [x] 다중 선택 및 중첩 테두리 표시
- [x] 세부요소 선택 강화 (더블클릭/Ctrl+클릭)
- [x] 카카오톡 연동
- [x] 컴포넌트 기반 모듈화 리팩토링

### Phase 2: 사용자 관리 시스템
- [ ] Firebase Authentication 연동
- [ ] 사용자별 크롤링 설정 저장
- [ ] 로그인/회원가입 페이지

### Phase 3: 고급 기능
- [ ] Firebase Firestore로 크롤링 이력 저장
- [ ] 정기 크롤링 스케줄링
- [ ] 다중 웹사이트 동시 모니터링
- [ ] 알림 시스템 (이메일, SMS)

### Phase 4: 확장성
- [ ] RESTful API 제공
- [ ] 웹훅 지원
- [ ] 플러그인 시스템
- [ ] 다중 플랫폼 연동 (Slack, Discord 등)