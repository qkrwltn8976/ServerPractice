const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');
const request = require('request');
const fs = require('fs');
const json2csv = require('json2csv');
const csvtojson = require('csvtojson');

const server = http.createServer((req, res)=>{
    if (req.url == '/favicon.ico')
        return;
    
    let query = querystring.parse(url.parse(req.url).query);
    let parsedUrl = req.url.split('?')[0];
    console.log(parsedUrl);
    if(parsedUrl=='/signup'){
        crypto.randomBytes(32, (err, buf)=>{
        // crypto 모듈의 randomBytes(): 임의의 salt 생성하여 각각 다른 salt 정보로 비밀번호 암호화
            if(err)
                res.end(JSON.stringify({msg: err}));
            else {
                let salt = buf.toString('base64');
                // 랜덤 솔트 값 생성
                crypto.pbkdf2(query.pw, salt, 10, 32, 'sha512', (err, result)=>{
                    if(err)
                        res.end(JSON.stringify({msg: err}));
                    else {
                        let hashedPw = result.toString('base64');
                        let csv = json2csv.parse({
                            id: query.id,
                            pw: hashedPw,
                            salt: salt
                        });
                        console.log(hashedPw);
                        fs.writeFile('user.csv', csv, (err)=>{
                            if(err)
                                res.end(JSON.stringify({msg:err}));
                            else {
                                res.writeHead(200, {'Content-Type': 'Application/json'});
                                res.end(JSON.stringify({msg: '회원가입이 완료되었습니다'}));
                            }
                        });
                    }
                });
            }
        });
    } else if(parsedUrl=='/signin') {
        csvtojson()
        .fromFile('user.csv')
        .then((jsonObj)=>{
            crypto.pbkdf2(query.pw, jsonObj[0].salt, 10, 32, 'sha512', (err, result)=>{
                if(err)
                    res.end(JSON.stringify({msg: err}));
                else {
                    let hashedPw = result.toString('base54');
                    if(hashedPw==jsonObj[0].pw){
                        res.writeHead(200, {'Content-Type': 'Application/json'});
                        res.end(JSON.stringify({msg: '로그인 성공'}));
                    } else {
                        res.writeHead(200, {'Content-Type': 'Application/json'});
                        res.end(JSON.stringify({msg: '비밀번호가 틀렸습니다'}));
                    }
                }
            });
        })
    }
}).listen(3000, ()=>{
    console.log('server open');
});