var http = require('http');
// http 웹 서버를 생성하기 위한 모듈
var fs = require('fs');
// 파일 관련 처리를 하기 위한 모듈
var socketIo = require('socket.io');
// 소켓 서버를 생성 및 실행하기 위한 모듈

const finding = 1; // 랜덤한 사용자를 찾고 있는 상태
const notFinding = 2; // 랜덤한 사용자를 찾고 있지 않는 상태
const chatting = 3; // 랜덤한 사용자와 채팅을 하고 있는 상태

var clients = [];
// 사용자를 저장, 관리하는 배열, 이 배열의 길이가 사용자(채팅 접속자)의 수

var server = http.createServer(function(request, response) {
    // 해당 파일의 데이터를 읽고, 읽은 데이터를 클라이언트로 응답
    fs.readFile('htmlPage.html', 'utf-8', function(error, data) {
        response.writeHead(200, {
            'Content-Type' : 'text/html'
        });
        response.end(data);
    })
}).listen(52273, function() {
    console.log('server running on port 52273');
});
// http 웹 서버 생성

var io = socketIo.listen(server); 
// 소켓 서버 생성 및 실행

io.sockets.on('connection', function(socket) {
    socket.on('nickNameCheck', function(data) {
        // data 매개변수는 클라이언트에서 이벤트가 발생하면서 전달된 데이터 ({name: nicknameValue})

        if(!data.name) {
            socket.emit('nullError', '닉네임을 입력해주세요');
            return;
        }

        for(var i=0; i<clients.length; i++) {
            if(clients[i].name == data.name) {
                socket.emit('sameNameError', '동일한 닉네임이 존재합니다');
                return;
            }
        }

        clients.push({
            name: data.name, // 사용자의 닉네임
            client: socket, // 사용자의 소켓
            roomName: "", // 사용자가 들어가 있는 방의 이름
            status: notFinding // 사용자의 상태, notFinding 상태로 초기화
        });

        socket.name = data.name;
        socket.emit('nickNameCheckComplete');
    })
    console.log('클라이언트가 소켓 서버에 접속했습니다');
    
});
// connection 이벤트는 클라이언트가 소켓 서버에 접속할 때 발생하는 이벤트
// 콜백함수에 있는 socket이라는 변수는 접속한 클라이언트와 소켓서버가 실시간 양방향 통신을 할 수 있도록 하는 소켓객체