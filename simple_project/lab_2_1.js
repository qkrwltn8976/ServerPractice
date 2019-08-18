const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const server = http.createServer((req, res)=>{
    if(req.url=='/favicon.ico')
        return;

    const queryParsed = querystring.parse(url.parse(req.url).query);
    // 서버에 들어오는 url을 파싱하여 query로 만들고 이를 JSON 객체로 변환
    // parse() : query 문자열을 JSON 객체로 반환해 리턴

    // 서버에 접속 시 str값을 hashing
    // crypto 모듈 : 문자열 암호화, 복호화, 해싱 / 다양한 방식의 암호화 도와줌
    crypto.randomBytes(32, (err, buf)=>{
        if(err) {
            res.end(JSON.stringify({msg:err}));
        } else {
            crypto.pbkdf2(queryParsed.str, buf.toString('base64'), 10, 32, 'sha512', (err, result)=>{
                if(err)
                    res.end(JSON.stringify({msg: 'failed'}));
                else   
                    res.end(JSON.stringify({msg: 'success', hashed: result.toString('base64')}));
                    // hashing이 성공하면 JSON 데이터로 Response
            });
        }
    });
}).listen(3000, ()=>{
    console.log('server.open')
});


