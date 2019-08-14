/** Express 서버 생성 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
// var ejsLint = require('./views/index.ejs');
var ejsLint = require('ejs-lint')
// 서버가 읽을 수 있도록 HTML의 위치를 정의
app.set('views', __dirname + '/views');
// 서버가 HTML 렌더링을 할 때 EJS 엔진을 사용하도록 설정
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function() {
    console.log("Express server has started on port 3000")
})

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
    secret: '@#@$MYSIGN#@$#$', // 쿠키를 임의로 변조하는 것을 방지하기 위한 sign값, 원하는 값을 넣으면 됨
    resave: false, // 세션을 항상 저장할 지 정하는 값, express-session documentation에서는 이 값을 false로 하는 것을 권장(필요에 따라 true로 설정)
    saveUninitialized: true // 새로 생겼지만 변경되지 않은 세션, Documentation에서는 이 값을 true로 설정하는 것을 권장
}));

// ejsLint.lint()
// 라우터 모듈인 main.js를 불러와서 app에 전달
var router = require('./router/main')(app, fs);

