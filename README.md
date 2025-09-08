# 공지사항 크롤링 플랫폼 📰

사용자가 입력한### 환경 변수 설정
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
- **📱 카카오톡 연동**: 추출된 데이터를 카카오톡 채널로 실시간 전송
- **🔐 사용자 인증**: Firebase Authentication을 활용한 로그인 시스템 (계획 중)
- **📊 데이터 관리**: Firebase Firestore를 활용한 크롤링 이력 저장 (계획 중)

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
2. **크롤링 페이지**: 로드된 페이지에서 공지사항 요소를 클릭하여 선택합니다.
3. **데이터 추출**: 선택된 요소의 텍스트가 추출됩니다.
4. **카카오톡 전송**: 추출된 데이터가 카카오톡 채널로 전송됩니다.

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **크롤링**: Puppeteer (헤드리스 Chrome)
- **외부 API**: Kakao API
- **인증**: Firebase Authentication (계획 중)
- **데이터베이스**: Firebase Firestore (계획 중)

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── crawl/          # 페이지 크롤링 API
│   │   ├── extract/        # 데이터 추출 API
│   │   └── send-kakao/     # 카카오톡 전송 API
│   ├── crawl/              # 크롤링 페이지
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 메인 페이지
├── components/             # 재사용 컴포넌트 (향후 추가)
└── lib/                   # 유틸리티 함수 (향후 추가)
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
- [x] 카카오톡 연동

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

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.
