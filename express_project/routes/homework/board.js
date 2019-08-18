var express = require('express');
var router = express.Router();
var fs = require('fs');
var json2csv = require('async-json2csv');
var csvtojson = require('csvtojson');
var crypto = require('crypto-promise');

const util = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

router.get('/', async(req, res) => {
    csvtojson().fromFile('board.csv').then((jsonObj)=>{
        return new Promise((resolve, reject)=>{
            if(jsonObj != null)
                resolve(jsonObj);
            else 
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.READ_FAIL));
        }).them((boardData) => {
            for(var i=0; i<boardData.length; i++) {
                if(boardData[i].id == req.params.id) 
                    break;
            }

            if(i<boardData.length) {
                delete boardData[i].pw;
                delete boardData[i].salt;
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.READ_FAIL, boardData[i]));
            } else {
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
            }
        });
    });
});


router.post('/', async(req, res)=>{
    if(!req.body.title || !req.body.pw) {
        res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        try {
            let d = new Date();
            let time = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1).slice(-2) + "-" + ('0'+ d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0') + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);

            const data = {title: req.body.title, content: req.body.content, time: time, pw: req.body.pw};
            const rand = await crypto.randomBytes(32);
            const str = await crypto.pbkdf2(data.pw.toString(), rand.toString('base64'), 1000, 32, 'SHA512');

            data.salt = rand.toString('base64');
            data.pw = str.toString('base64');

            const options = {
                fields: ['id', 'title', 'content', 'time', 'pw', 'salt'],
                header: true
            }

            let chkFileExist = () => new Promises((resolve)=>{
                fs.stat('board.csv', function(err, stat) {
                    if(err == null)
                        resolve(true);
                    else
                        resolve(false);
                });
            });

            if(await chkFileExist()) {
                let chkCSV = await csvtojson().fromFile('board.csv').then((jsonObj)=>{
                    return new Promise((resolve, reject)=>{
                        if(jsonObj != null)
                            resolve(jsonObj);
                    }).then((boardData)=>{
                        if(boardData.length==0)
                            return 0;

                        for(var i=0; i<boardData.length; i++) {
                            if(boardData[i].title == req.body.title)
                                break;
                        }

                        if(i<boardData.length) {
                            return 'exist title';
                        }

                        return boardData.slice(-1)[0].id;
                    });
                });

                if(chkCSV == 'exist title')
                    return res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.EXIST_TITLE));
                
                data.id = paresInt(chkCSV)+1;
                options.data = [data];
                options.header = false;
                const csv = await json2csv(options);
                fs.appendFile('board.csv', csv, function(err) {
                    if(err) throw err;
                });
            } else {
                data.id = 1;
                options.data = [data];
                const csv = await json2csv(options);
                fs.writeFileSync('board.csv', csv);
            }
            res.status(200).send(util.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS));
        } catch(err) {
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.SAVE_FAIL));
        }
    }
});


module.exports = router;

