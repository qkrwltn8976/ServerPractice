const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const server = http.createServer((req, res)=>{
    if(req.url=='/favicon.ico')
        return;

    const queryParsed = querystring.parse(url.parse(req.url).query);

    crypto.randomBytes(32, (err, buf)=>{
        if(err) {
            res.end(JSON.stringify({msg:err}));
        } else {
            crypto.pbkdf2(queryParsed.str, buf.toString('base64'), 10, 32, 'sha512', (err, result)=>{
                if(err)
                    res.end(JSON.stringify({msg: 'failed'}));
                else   
                    res.end(JSON.stringify({msg: 'success', hashed: result.toString('base64')}));
            });
        }
    });
}).listen(3000, ()=>{
    console.log('server.open')
});


// URL 주소 입력 형식
// http://127.0.0.1:3000/?str=jisu
// 서버 실행 결과 {"msg":"success","hashed":"Abrq06V7RrTk9N6t6d0dT1EATL5Gvlreh6iJIT4HzSo="}