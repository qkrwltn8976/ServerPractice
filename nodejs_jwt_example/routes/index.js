let express = require('express');
let models = require("../models");
let router = express.Router();

let jwt = require('jsonwebtoken');
let secretObj = require("../config/jwt");

router.get("/login", function(req, res, next) {
    let token = jwt.sign({
            email: "foo@example.com"
        },
        secretObj.secret,
        {
            expiresIn: '5m'
        })
    models.user.find({
        where: {
            email: "foo@example.com"
        }
    })
    .then(user => {
        if(user.pwd === "1234"){
            res.cookie("user", token);
            res.json({
                token: token
            })
        }
    })
})

module.exports = router;