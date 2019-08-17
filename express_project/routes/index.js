var express = require('express');
var router = express.Router();

/* /homework로 라우팅 */
router.use('/homework', require('./homework/index'))

module.exports = router;
