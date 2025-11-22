# 리볼버 듀얼 - 멀티플레이어 게임

## 설치 및 실행 방법

### 1. Node.js 설치
Node.js가 설치되어 있어야 합니다. [Node.js 다운로드](https://nodejs.org/)

### 2. 의존성 설치
```bash
npm install
```

### 3. 서버 실행
```bash
npm start
```

서버가 포트 3000에서 실행됩니다.

### 4. 게임 접속
브라우저에서 다음 주소로 접속:
```
http://localhost:3000
```

## 멀티플레이어 사용 방법

### 로컬 멀티플레이어 (같은 컴퓨터)
- 같은 컴퓨터에서 두 명이 플레이
- 플레이어 1: WASD 이동, 마우스 조준, 좌클릭 발사, 우클릭 구르기
- 플레이어 2: 화살표 키 이동, 마우스 조준, 우클릭 발사, Enter 구르기

### 온라인 멀티플레이어 (다른 컴퓨터)

#### 같은 네트워크에서 플레이
1. 서버를 실행한 컴퓨터의 로컬 IP 주소 확인:
   - Windows: `ipconfig` 명령어 실행
   - Mac/Linux: `ifconfig` 또는 `ip addr` 명령어 실행
2. 서버를 실행한 컴퓨터에서 `http://localhost:3000` 접속
3. 다른 컴퓨터에서 `http://[서버IP주소]:3000` 접속 (예: `http://192.168.1.100:3000`)
4. 한 명이 "방 생성"을 클릭하고 방 코드를 상대방에게 알려줌
5. 상대방이 "방 입장"을 클릭하고 방 코드 입력
6. 두 명이 모두 연결되면 자동으로 게임 시작

#### 인터넷을 통해 플레이
1. 서버를 클라우드에 배포 (Railway, Heroku, Render 등)
2. 배포된 URL로 접속
3. 방 생성/입장 과정은 동일

## 배포 방법

### Railway 배포
1. Railway에 프로젝트 연결
2. 환경 변수 설정 (선택사항):
   - `PORT`: 서버 포트 (기본값: 3000)
3. 배포 후 `https://your-app.railway.app` 접속

### 다른 플랫폼 배포
- Heroku, Render, Vercel 등에서도 배포 가능
- WebSocket 지원이 필요합니다

## 기술 스택
- Frontend: HTML5 Canvas, JavaScript
- Backend: Node.js, WebSocket (ws)

