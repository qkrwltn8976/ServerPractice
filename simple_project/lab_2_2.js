const http = require('http');
const request = require('request');
const fs = require('fs');
const json2csv = require('json2csv');
const csvtojson = require('csvtojson');

const server = http.createServer((req, res)=>{
    if(req.url == '/favicon.ico')
        return;
    
    const option = {
        url: 'http://15.164.75.18:3000/homework/2nd',
        method: 'GET'
    };

    request(option, (err, response, body)=>{
        let data = JSON.parse(body);
        let csv = json2csv.parse({
            data: data.data,
            field: data.message
        });

        fs.writeFile('info.csv', csv, (err)=>{
            if(err)
                res.end(JSON.stringify({msg: err}));
            else {
                csvtojson()
                .fromFile('info.csv')
                .then((jsonObj)=>{
                    res.writeHead(200, {'Content-Type': "Application/json"});
                    res.end(JSON.stringify({msg: jsonObj}));
                });
            }
        });
    });
    }).listen(3000, ()=>{
        console.log('server open')
});