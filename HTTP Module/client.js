/** HTTP 클라이언트 예제 */
var http = require('http');

// HTTPRequest의 옵션 설정
var options = {
    host: 'localhost',
    port: '8081',
    path: '/index.html'
};

// 콜백 함수로 Response를 받아옴
var callback = function(response){
    // response 이벤트가 감지되면 데이터를 body에 받아옴
    var body = '';
    response.on('data', function(data) {
        body += data;
    });

// end 이벤트가 감지되면 데이터 수신을 종료하고 내용 출력
    response.on('end', function() {
        // 데이터 수신 완료
        console.log(body);
    });
}

// 서버에 HTTP Request를 날림
var req = http.request(options, callback);
req.end();

/** server.js를 먼저 실행시키고 다른 터미널에 client.js를 실행시켜야 제대로 동작 */