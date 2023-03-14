var express = require('express');
var router = express.Router();
const Badge = require('../models/Badge');

const au = require('../modules/util/authUtil');
const rm = require('../modules/util/responseMessage');
const sc = require('../modules/util/statusCode');

router.post('/', async (req, res) => {
    const {title, description, imageUrl, email, walletLists} = req.body;
    if(!title || !description || !imageUrl || !walletLists) res.status(sc.BAD_REQUEST).send(au.successFalse(rm.NULL_VALUE));
    
    try {
        const {code, json} = await Badge.insert(title, description, imageUrl, email, walletLists);
        res.status(code).send(json);
    } catch (err) {
        console.log(err);
        res.status(sc.INTERNAL_SERVER_ERROR).send(au.successFalse(rm.LOUNGE_CREATE_FAIL));
    }
});

router.get('/:walletAddress', async(req, res) => {
    const walletAddress = req.params.walletAddress;
    console.log("walletAddress", walletAddress);
    try {
        const {code, json} = await Badge.listBadges(walletAddress);
        res.status(code).send(json);
    } catch(err){
        console.log(err);
        res.status(sc.INTERNAL_SERVER_ERROR).send(au.successFalse(rm.BADGE_READ_ALL_FAIL));
    }
})



module.exports = router;