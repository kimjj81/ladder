# 사다리타기 게임 배포 가이드
# Ladder Game Deployment Guide

이 문서는 사다리타기 게임을 프로덕션 환경에 배포하는 방법을 설명합니다.

## 📋 목차 (Table of Contents)

1. [시스템 요구사항](#시스템-요구사항)
2. [자동 배포](#자동-배포)
3. [수동 배포](#수동-배포)
4. [Nginx 설정](#nginx-설정)
5. [SSL 인증서 설정](#ssl-인증서-설정)
6. [모니터링 및 유지보수](#모니터링-및-유지보수)
7. [문제 해결](#문제-해결)

## 🖥️ 시스템 요구사항

### 최소 요구사항
- **OS**: Ubuntu 20.04 LTS 이상 또는 CentOS 8 이상
- **RAM**: 1GB 이상
- **Storage**: 10GB 이상 여유 공간
- **Network**: 인터넷 연결

### 필수 소프트웨어
- **Nginx**: 1.18 이상
- **Node.js**: 18.x 이상
- **npm**: 8.x 이상

## 🚀 자동 배포

가장 간단한 배포 방법입니다.

### 1단계: 프로젝트 다운로드
```bash
# 프로젝트 클론 (또는 파일 업로드)
git clone <repository-url> ladder-game
cd ladder-game
```

### 2단계: 자동 배포 실행
```bash
# 전체 배포 (빌드 + 배포)
sudo ./build/deploy.sh

# 또는 단계별 실행
sudo ./build/deploy.sh build-only    # 빌드만
sudo ./build/deploy.sh deploy-only   # 배포만
```

### 3단계: 확인
```bash
# Nginx 상태 확인
sudo systemctl status nginx

# 웹사이트 접속 테스트
curl -I http://localhost
```

## 🔧 수동 배포

세부적인 제어가 필요한 경우 수동으로 배포할 수 있습니다.

### 1단계: 의존성 설치

#### Ubuntu/Debian
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Nginx 설치
sudo apt install nginx -y

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 방화벽 설정
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### CentOS/RHEL
```bash
# 시스템 업데이트
sudo yum update -y

# Nginx 설치
sudo yum install nginx -y

# Node.js 설치
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# 방화벽 설정
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2단계: 애플리케이션 빌드
```bash
# 프로젝트 디렉토리에서
npm install
npm run build
```

### 3단계: 파일 배포
```bash
# 웹 디렉토리 생성
sudo mkdir -p /var/www/html/ladder-game

# 빌드된 파일 복사
sudo cp -r dist/* /var/www/html/ladder-game/

# 추가 파일 복사
sudo cp build/robots.txt /var/www/html/ladder-game/
sudo cp build/sitemap.xml /var/www/html/ladder-game/

# 권한 설정
sudo chown -R www-data:www-data /var/www/html/ladder-game
sudo chmod -R 755 /var/www/html/ladder-game
```

### 4단계: Nginx 설정
```bash
# Nginx 설정 파일 복사
sudo cp build/nginx.conf /etc/nginx/sites-available/ladder-game

# 사이트 활성화
sudo ln -s /etc/nginx/sites-available/ladder-game /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## ⚙️ Nginx 설정

### 기본 설정 파일 위치
- **설정 파일**: `/etc/nginx/sites-available/ladder-game`
- **활성화**: `/etc/nginx/sites-enabled/ladder-game`
- **로그**: `/var/log/nginx/`

### 주요 설정 항목

#### 캐싱 설정
```nginx
# CSS/JS 파일 - 1년 캐시
location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML 파일 - 1시간 캐시
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

#### 압축 설정
```nginx
gzip on;
gzip_comp_level 6;
gzip_types text/css application/javascript text/javascript;
```

#### 보안 헤더
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 도메인 설정 변경
```bash
# Nginx 설정 파일 편집
sudo nano /etc/nginx/sites-available/ladder-game

# server_name 변경
server_name your-domain.com www.your-domain.com;

# 설정 테스트 및 재로드
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL 인증서 설정

### Let's Encrypt 사용 (무료)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

### 수동 SSL 설정
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 나머지 설정...
}

# HTTP to HTTPS 리다이렉트
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 모니터링 및 유지보수

### 로그 모니터링
```bash
# Nginx 액세스 로그
sudo tail -f /var/log/nginx/access.log

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# 시스템 리소스 모니터링
htop
df -h
free -h
```

### 정기 업데이트
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 애플리케이션 업데이트
cd /path/to/ladder-game
git pull
npm run build
sudo cp -r dist/* /var/www/html/ladder-game/
sudo systemctl reload nginx
```

### 백업
```bash
# 웹 파일 백업
sudo tar -czf /var/backups/ladder-game-$(date +%Y%m%d).tar.gz /var/www/html/ladder-game

# Nginx 설정 백업
sudo cp /etc/nginx/sites-available/ladder-game /var/backups/nginx-ladder-game-$(date +%Y%m%d).conf
```

## 🔧 성능 최적화

### Nginx 성능 튜닝
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;

# Gzip 압축 레벨 조정
gzip_comp_level 6;

# 캐시 설정 최적화
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
```

### 시스템 리소스 모니터링
```bash
# CPU 및 메모리 사용량 확인
top
htop

# 디스크 사용량 확인
df -h
du -sh /var/www/html/ladder-game

# 네트워크 연결 확인
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. Nginx 시작 실패
```bash
# 설정 파일 문법 검사
sudo nginx -t

# 포트 충돌 확인
sudo netstat -tulpn | grep :80

# 로그 확인
sudo journalctl -u nginx
```

#### 2. 파일 권한 문제
```bash
# 올바른 권한 설정
sudo chown -R www-data:www-data /var/www/html/ladder-game
sudo chmod -R 755 /var/www/html/ladder-game
```

#### 3. 캐시 문제
```bash
# 브라우저 캐시 강제 새로고침
# Ctrl+F5 (Windows) 또는 Cmd+Shift+R (Mac)

# Nginx 캐시 클리어 (캐시 사용 시)
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

#### 4. Google Ads 표시 안됨
- `index.html`에서 `ca-pub-XXXXXXXXXXXXXXXX`를 실제 AdSense 클라이언트 ID로 변경
- 도메인이 AdSense에 승인되었는지 확인
- 브라우저의 광고 차단기 비활성화

### 로그 분석
```bash
# 404 에러 확인
sudo grep "404" /var/log/nginx/access.log

# 에러 로그 실시간 모니터링
sudo tail -f /var/log/nginx/error.log

# 액세스 로그 통계
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

### 성능 테스트
```bash
# 웹사이트 응답 시간 테스트
curl -w "@curl-format.txt" -o /dev/null -s http://your-domain.com

# 동시 연결 테스트 (Apache Bench)
sudo apt install apache2-utils
ab -n 1000 -c 10 http://your-domain.com/
```

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:

1. 로그 파일 확인 (`/var/log/nginx/error.log`)
2. 설정 파일 문법 검사 (`sudo nginx -t`)
3. 시스템 리소스 확인 (`htop`, `df -h`)
4. 방화벽 설정 확인

---

## 📝 체크리스트

배포 완료 후 다음 항목들을 확인하세요:

- [ ] 웹사이트가 정상적으로 로드됨
- [ ] 모든 CSS/JS 파일이 로드됨
- [ ] 사다리타기 게임이 정상 작동함
- [ ] 저장/로드 기능이 작동함
- [ ] 모바일에서 정상 표시됨
- [ ] Google Ads가 표시됨 (승인된 경우)
- [ ] SSL 인증서가 설정됨 (선택사항)
- [ ] 백업 시스템이 구축됨
- [ ] 모니터링이 설정됨

배포가 완료되면 정기적으로 시스템을 업데이트하고 백업을 수행하세요.