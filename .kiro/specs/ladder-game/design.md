# Design Document

## Overview

사다리타기 게임은 순수 HTML, CSS, JavaScript로 구현되는 정적 웹 애플리케이션입니다. 반응형 디자인을 통해 모바일과 데스크톱 모두에서 최적화된 경험을 제공하며, 브라우저의 localStorage를 활용한 데이터 저장과 Google Ads 통합을 지원합니다.

## Architecture

### Frontend Architecture
```
├── index.html (메인 페이지)
├── css/
│   ├── main.css (전역 스타일)
│   ├── responsive.css (반응형 스타일)
│   └── ladder.css (사다리 게임 전용 스타일)
├── js/
│   ├── app.js (메인 애플리케이션 로직)
│   ├── ladder-game.js (사다리 게임 로직)
│   ├── storage.js (localStorage 관리)
│   └── ui-components.js (UI 컴포넌트)
└── assets/
    └── icons/ (아이콘 파일들)
```

### Deployment Architecture
- **Static File Hosting**: Nginx 서버에서 정적 파일 서빙
- **CDN Ready**: 모든 리소스가 CDN 배포 가능한 구조
- **No Backend Dependencies**: 클라이언트 사이드만으로 완전한 기능 제공

## Components and Interfaces

### 1. Main Application (app.js)
```javascript
class App {
  constructor()
  init()
  toggleMenu()
  navigateToPage(page)
  initializeGoogleAds()
}
```

### 2. Ladder Game Component (ladder-game.js)
```javascript
class LadderGame {
  constructor()
  setSlotCount(count)
  addSlotContent(content, type, index)
  generateLadder()
  showResults(animated)
  revealPath(topIndex)
  revealAllPaths()
  saveConfiguration(name)
  loadConfiguration(name)
}
```

### 3. Storage Manager (storage.js)
```javascript
class StorageManager {
  saveGame(gameData)
  loadGame(gameId)
  getAllSavedGames()
  deleteGame(gameId)
  exportData()
  importData(data)
}
```

### 4. UI Components (ui-components.js)
```javascript
class SlotInput {
  constructor(container, onComplete)
  highlightCurrentSlot()
  moveToNextSlot()
  editSlot(index)
}

class LadderRenderer {
  constructor(canvas)
  drawLadder(connections, animated)
  highlightPath(path)
  animateReveal()
}
```

## Data Models

### Game Configuration
```javascript
{
  id: string,
  name: string,
  slotCount: number,
  topSlots: string[],
  bottomSlots: string[],
  createdAt: Date,
  lastUsed: Date
}
```

### Ladder Connection
```javascript
{
  connections: number[], // topIndex -> bottomIndex mapping
  paths: {
    [topIndex]: {
      segments: [{x1, y1, x2, y2}],
      destination: number
    }
  }
}
```

### UI State
```javascript
{
  currentSlotIndex: number,
  currentSlotType: 'top' | 'bottom',
  gameState: 'setup' | 'ready' | 'playing' | 'complete',
  menuVisible: boolean,
  selectedConfiguration: string | null
}
```

## Error Handling

### Input Validation
- 슬롯 수: 2-20 범위 검증
- 빈 슬롯 검증: 게임 시작 전 모든 슬롯 채워짐 확인
- 중복 내용 경고: 동일한 내용 입력 시 사용자에게 알림

### Storage Error Handling
```javascript
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // 저장 공간 부족 처리
    showStorageFullWarning();
  }
}
```

### Graceful Degradation
- localStorage 미지원 브라우저: 세션 기반 임시 저장
- Canvas 미지원: SVG 기반 대체 렌더링
- 터치 이벤트 미지원: 마우스 이벤트로 폴백

## Testing Strategy

### Unit Testing
- **Ladder Generation Logic**: 연결 생성 알고리즘 정확성 검증
- **Storage Operations**: localStorage 저장/로드 기능 테스트
- **Input Validation**: 다양한 입력값에 대한 검증 로직 테스트

### Integration Testing
- **UI Flow Testing**: 전체 게임 플레이 시나리오 테스트
- **Responsive Design Testing**: 다양한 화면 크기에서의 레이아웃 검증
- **Cross-browser Testing**: 주요 브라우저에서의 호환성 확인

### Manual Testing Scenarios
1. **기본 게임 플레이**: 설정 → 입력 → 결과 확인
2. **저장/로드 기능**: 게임 저장 후 재로드하여 동일성 확인
3. **반응형 테스트**: 모바일/데스크톱 환경에서 UI 동작 확인
4. **에러 시나리오**: 잘못된 입력, 저장 실패 등 예외 상황 처리

### Performance Testing
- **렌더링 성능**: 큰 사다리(20칸) 애니메이션 부드러움 확인
- **메모리 사용량**: 장시간 사용 시 메모리 누수 검사
- **로딩 속도**: 초기 페이지 로드 시간 최적화

## Responsive Design Strategy

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### Layout Patterns
- **Mobile**: 단일 컬럼, 햄버거 메뉴, 터치 최적화
- **Tablet**: 사이드바 토글, 적응형 그리드
- **Desktop**: 고정 사이드바, 멀티 컬럼 레이아웃

## Google Ads Integration

### Ad Placement Strategy
```html
<!-- Header Banner -->
<div id="header-ad" class="ad-container">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
  <ins class="adsbygoogle" data-ad-client="ca-pub-XXXXXXXX"></ins>
</div>

<!-- Sidebar Ad (Desktop) -->
<div id="sidebar-ad" class="ad-container desktop-only">
  <ins class="adsbygoogle" data-ad-slot="XXXXXXXX"></ins>
</div>

<!-- Footer Ad -->
<div id="footer-ad" class="ad-container">
  <ins class="adsbygoogle" data-ad-slot="XXXXXXXX"></ins>
</div>
```

### Ad Loading Strategy
- 비동기 로딩으로 게임 성능에 영향 최소화
- 반응형 광고 단위 사용
- 게임 플레이 중 광고 새로고침 방지

## Deployment Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name www.windroamer.com;
    root /var/www/html;
    index index.html;
    
    # Static file caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML files - short cache
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript text/javascript;
}
```

### File Structure for Deployment
```
/var/www/html/
├── index.html
├── css/
├── js/
├── assets/
└── manifest.json (PWA support)
```

## Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

### Data Privacy
- localStorage 데이터는 클라이언트에만 저장
- 개인정보 수집 없음
- Google Ads 개인정보 처리방침 준수

## Performance Optimization

### Code Splitting
- 초기 로드: 기본 UI + 메뉴 시스템
- 지연 로드: 사다리 게임 로직 (사용자가 게임 선택 시)

### Asset Optimization
- CSS/JS 압축 및 번들링
- 이미지 최적화 (WebP 지원)
- 폰트 서브셋팅

### Caching Strategy
- 정적 리소스: 1년 캐시
- HTML: 1시간 캐시
- Service Worker를 통한 오프라인 지원 (선택사항)