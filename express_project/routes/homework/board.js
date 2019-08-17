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

module.exports = router;

