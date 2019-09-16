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
    });

    socket.on('randomChatFindClick', function(data) {
        for(var i=0; i<clients.length; i++) {
            if(clients[i].name == data.name) {
                // 해당 사용자의 상태를 finding으로 변경
                clients[i].status = finding;
                socket.emit('randomChatFindClickComplete');
                return;
            }
        }
    });

    socket.on('randomChatFinding', function(data) {
        // 클라이언트에서 일정한 주기로 반복적으로 발생시킬 이벤트
        // 사용자와 대화방을 찾고 있는 상대를 매칭
        for(var i=0; i<clients.length; i++) {
            if(clients[i].status == finding) {
                if(clients[i].name == data.name) {
                    continue;
                } else {
                    var roomName = new Date().getTime() + '';
                    clients[i].status = chatting; // 상대의 상태 chating으로 전환
                    clients[i].roomName = roomName; // 상대가 들어가있는 방 이름이 roomName
                    clients[i].client.join(roomName); // 방으로 이동
                    // client[i].client : 해당 사용자의 socket 객체
                    // socket의 join 메서드를 사용하여 사용자를 방으로 강제 이동

                    for(var j=0; j<clients.length; j++) {
                        if(clients[j].name == data.name) {
                            clients[j].status = chatting;
                            clients[j].roomName = roomName;
                            clients[j].client.join(roomName); // 대화방을 찾고 있는 상대와 같은 방으로 이동
                            
                            io.sockets.to(roomName).emit('randomChatFindingComplete', roomName);
                            return;
                        }
                    }
                }
            }
        }
    });

    socket.on('message', function(result) {
        // message 이벤트를 발생시킨 사용자와 같은 방에 있는 대화 상대들에게 문자열 전달
        io.sockets.to(result.roomName).emit('message', result.data);
    });

    socket.on('chatClosingBtn', function(data) {
        // 나가기 버튼을 누른 사용자와 같은 방에 있는 사용자에게 chatEnd 이벤트 발생
        io.sockets.to(data.roomName).emit('chatEnd');
    });

    socket.on('chatClosing', function(data) {
        for(var i=0; i<clients.length; i++) {
            clients[i].client.join(clients[i].client.id);
            // clients[i].client.id는 사용자 소켓의 고유한 아이디값
            // 이 값을 통해 사용자는 다른 사용자와 매칭이 되기 전까지 자신만의 독방에 존재
            clients[i].roomName = '';
            clients[i].status = notFinding;
        }
    });

    socket.on('disconnect', function() {
        // 사이트를 새로고침하거나 사이트에서 나갈 때 disconnect 이벤트 발생
        for(var i=0; i<clients.length; i++) {
            if(clients[i].name == socket.name) {
                var aroom = clients[i].roomName;
                // 사용자의 정보를 클라이언트 배열에서 삭제
                clients.slice(a, 1);
                io.sockets.to(aroom).emit('discWhileChat');
            }
        }
    });

    socket.on('clientsCount', function() {
        io.sockets.emit('clientsCount', clients.length);
    });
    // console.log('클라이언트가 소켓 서버에 접속했습니다');

});
// connection 이벤트는 클라이언트가 소켓 서버에 접속할 때 발생하는 이벤트
// 콜백함수에 있는 socket이라는 변수는 접속한 클라이언트와 소켓서버가 실시간 양방향 통신을 할 수 있도록 하는 소켓객체