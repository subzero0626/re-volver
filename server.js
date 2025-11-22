const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// HTTP 서버 생성 (정적 파일 제공용)
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './revolver.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

// 방 관리
const rooms = new Map(); // roomCode -> { host: WebSocket, guest: WebSocket }

wss.on('connection', (ws) => {
    console.log('새 클라이언트 연결됨');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('받은 메시지:', data.type);

            switch (data.type) {
                case 'createRoom':
                    handleCreateRoom(ws, data.roomCode);
                    break;

                case 'joinRoom':
                    handleJoinRoom(ws, data.roomCode);
                    break;

                case 'playerAction':
                    handlePlayerAction(ws, data.action);
                    break;

                default:
                    console.log('알 수 없는 메시지 타입:', data.type);
            }
        } catch (error) {
            console.error('메시지 파싱 오류:', error);
        }
    });

    ws.on('close', () => {
        console.log('클라이언트 연결 종료');
        // 방에서 제거
        for (const [roomCode, room] of rooms.entries()) {
            if (room.host === ws) {
                if (room.guest) {
                    room.guest.send(JSON.stringify({
                        type: 'hostDisconnected'
                    }));
                }
                rooms.delete(roomCode);
                console.log(`방 ${roomCode} 삭제됨 (호스트 종료)`);
            } else if (room.guest === ws) {
                if (room.host) {
                    room.host.send(JSON.stringify({
                        type: 'guestDisconnected'
                    }));
                }
                room.guest = null;
                console.log(`방 ${roomCode}에서 게스트 제거됨`);
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket 오류:', error);
    });
});

function handleCreateRoom(ws, roomCode) {
    if (rooms.has(roomCode)) {
        ws.send(JSON.stringify({
            type: 'roomError',
            message: '이미 존재하는 방 코드입니다.'
        }));
        return;
    }

    rooms.set(roomCode, {
        host: ws,
        guest: null
    });

    ws.send(JSON.stringify({
        type: 'roomCreated',
        roomCode: roomCode
    }));

    console.log(`방 생성됨: ${roomCode}`);
}

function handleJoinRoom(ws, roomCode) {
    const room = rooms.get(roomCode);

    if (!room) {
        ws.send(JSON.stringify({
            type: 'roomNotFound'
        }));
        return;
    }

    if (room.guest) {
        ws.send(JSON.stringify({
            type: 'roomError',
            message: '방이 이미 가득 찼습니다.'
        }));
        return;
    }

    room.guest = ws;

    // 게스트에게 입장 성공 알림
    ws.send(JSON.stringify({
        type: 'roomJoined',
        roomCode: roomCode
    }));

    // 호스트에게 게스트 입장 알림
    if (room.host && room.host.readyState === WebSocket.OPEN) {
        room.host.send(JSON.stringify({
            type: 'playerJoined'
        }));
    }

    // 양쪽 모두에게 게임 시작 알림
    setTimeout(() => {
        if (room.host && room.host.readyState === WebSocket.OPEN) {
            room.host.send(JSON.stringify({
                type: 'gameStart'
            }));
        }
        if (room.guest && room.guest.readyState === WebSocket.OPEN) {
            room.guest.send(JSON.stringify({
                type: 'gameStart'
            }));
        }
    }, 500);

    console.log(`방 ${roomCode}에 게스트 입장`);
}

function handlePlayerAction(ws, action) {
    // 액션을 상대방에게 전달
    for (const [roomCode, room] of rooms.entries()) {
        let target = null;
        
        if (room.host === ws && room.guest) {
            target = room.guest;
        } else if (room.guest === ws && room.host) {
            target = room.host;
        }

        if (target && target.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify({
                type: 'playerAction',
                data: action
            }));
            return;
        }
    }
}

server.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`게임 접속: http://localhost:${PORT}`);
});

