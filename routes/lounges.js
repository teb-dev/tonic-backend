var express = require('express');
var router = express.Router();
const Lounge = require('../models/Lounge');

const au = require('../modules/util/authUtil');
const rm = require('../modules/util/responseMessage');
const sc = require('../modules/util/statusCode');

router.post('/', async (req, res) => {
    const {title, description, imageUrl, redirectUrl, requirements} = req.body;

    if(!title || !description || !imageUrl || !requirements || !redirectUrl) res.status(sc.BAD_REQUEST).send(au.successFalse(rm.NULL_VALUE));

    try {
        const {code, json} = await Lounge.insert(title, description, imageUrl, redirectUrl, requirements);
        res.status(code).send(json);
    } catch (err) {
        console.log(err);
        res.status(sc.INTERNAL_SERVER_ERROR).send(au.successFalse(rm.LOUNGE_CREATE_FAIL));
    }
});


router.get('/', async(req, res) => {
    const page = req.query.page;

    try {
        const {code, json} = await Lounge.listLounges(page);
        console.log(json.data);
        res.status(code).send(json);
    } catch(err){
        console.log(err);
        res.status(sc.INTERNAL_SERVER_ERROR).send(au.successFalse(rm.LOUNGE_READ_ALL_FAIL));
    }
});

module.exports = router;