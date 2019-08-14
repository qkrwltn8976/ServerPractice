/** HTTP 서버 예제 */

var http = require('http');
var fs = require('fs');
var url = require('url');

// 서버 생성
http.createServer( function(request, response) {
    // URL 뒤에 있는 디렉토리, 파일이름 파싱
    var pathname = url.parse(request.url).pathname;

    console.log("Request for " +pathname+"received.");

    // 파일 이름이 비어있다면 index.html로 설정
    if(pathname == "/") {
        pathname = "/index.html";
    }

    // 파일 읽기
    fs.readFile(pathname.substr(1), function(err, data){
        if(err){
            console.log(err);
            // 페이지를 찾을 수 없음
            // HTTP Status: 404 : NOT FOUND
            // Content Type: text/plain
            response.writeHead(404, {'Content-Type': 'text/html'});
        } else{
            // 페이지를 찾음
            // HTTP Status: 200 : OK
            // Content Type: text/plain
            response.writeHead(200, {'Content-Type': 'text/html'});
            
            // 파일을 읽어와 responseBody에 작성
            response.write(data.toString());
            // responseBody 전송
        }
        response.end();
    });
}).listen(8081);

console.log('Server running at http://127.0.0.1:8081/');

/** 클라이언트에서 서버에 접속하면 URL에서 열고자 하는 파일을 파싱해 열어줌
 * 파일이 존재하지 않는다면 콘솔에 에러 메세지 출력
 */