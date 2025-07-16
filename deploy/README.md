# 사다리타기 게임 빌드 시스템
# Ladder Game Build System

이 디렉토리는 사다리타기 게임의 프로덕션 배포를 위한 빌드 시스템과 배포 도구들을 포함합니다.

## 📁 파일 구조

```
build/
├── build.js           # 메인 빌드 스크립트
├── deploy.sh          # 자동 배포 스크립트
├── test-deployment.js # 배포 테스트 스크립트
├── nginx.conf         # Nginx 설정 파일
├── robots.txt         # 검색엔진 크롤러 설정
├── sitemap.xml        # 사이트맵
└── README.md          # 이 파일
```

## 🚀 빌드 명령어

### 기본 빌드
```bash
npm run build
```

### 빌드 + 테스트
```bash
npm run build:test
```

### 배포 테스트만 실행
```bash
npm run deploy:test
```

### 개발 서버 실행
```bash
npm run serve:dev  # 소스 파일로 실행
npm run serve      # 빌드된 파일로 실행
```

## 📦 빌드 과정

1. **CSS 최적화**: 모든 CSS 파일을 하나로 합치고 압축
2. **JavaScript 최적화**: 모든 JS 파일을 하나로 합치고 압축
3. **HTML 최적화**: 프로덕션용 HTML 생성 (테스트 스크립트 제거, 성능 최적화)
4. **매니페스트 생성**: PWA 지원을 위한 웹 앱 매니페스트 생성

## 🎯 최적화 결과

- **CSS**: ~34% 크기 감소
- **JavaScript**: ~50% 크기 감소
- **전체**: ~43% 크기 감소

## 🔧 배포 방법

### 자동 배포 (권장)
```bash
sudo ./build/deploy.sh
```

### 단계별 배포
```bash
sudo ./build/deploy.sh build-only    # 빌드만
sudo ./build/deploy.sh deploy-only   # 배포만
```

## 🧪 테스트

배포 전 다음 테스트들이 자동으로 실행됩니다:

- ✅ 빌드 출력 파일 존재 확인
- ✅ 파일 압축률 검증
- ✅ HTML 최적화 확인
- ✅ 정적 파일 서빙 테스트
- ✅ Nginx 설정 검증
- ✅ 배포 파일 완성도 확인

## 📋 배포 체크리스트

배포 전 확인사항:

- [ ] `npm run build:test` 성공
- [ ] Google Ads 클라이언트 ID 설정
- [ ] 도메인 설정 확인
- [ ] SSL 인증서 준비 (선택사항)
- [ ] 서버 리소스 확인

## 🔗 관련 문서

- [DEPLOYMENT.md](../DEPLOYMENT.md) - 상세한 배포 가이드
- [package.json](../package.json) - 프로젝트 설정 및 스크립트