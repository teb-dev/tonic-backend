var express = require('express');
var router = express.Router();
const Badge = require('../models/Badge');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
require('dotenv').config();
const au = require('../modules/util/authUtil');
const rm = require('../modules/util/responseMessage');
const sc = require('../modules/util/statusCode');

const S3_BASE_URL = 'https://tonic-lounge-nft.s3.ap-northeast-2.amazonaws.com/';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2'
});

const storage = multerS3({
    s3: s3,
    bucket: 'tonic-lounge-nft',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function (req,file,cb) {
        cb(null, `contents/${Date.now()}_${file.originalname}`);
    }
})

const upload = multer({
    storage: storage
})
  

router.post('/', upload.single('image'), async (req, res) => {
    const {title, description, email, walletLists} = req.body;
    const imageUrl = S3_BASE_URL + req.file.key;
    if(!title || !description || !imageUrl || !email || !walletLists) res.status(sc.BAD_REQUEST).send(au.successFalse(rm.NULL_VALUE));

    const collectionObj = {
        name: title,
        description,
        image: imageUrl
    }

    const buf = Buffer.from(JSON.stringify(collectionObj));
    const key = `${Date.now()}_${email}/`;
    const data = {
        Bucket: 'tonic-lounge-nft',
        Key: key + 'badge.json',
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'application/json',
        ACL: 'public-read'
    }

    s3.upload(data, async (err, data) => {
        if(err) {
            console.log(err);
            console.log('Error uploading data: ', data);
        }else {
            const collectionContentUri = data.Location; // badge.json file location
            const nftItemContentBaseUri = S3_BASE_URL + key;
            try {
                const {code, json} = await Badge.insert(title, description, imageUrl, email, JSON.parse(walletLists), collectionContentUri, nftItemContentBaseUri);
                res.status(code).send(json);
            } catch (err) {
                console.log(err);
                res.status(sc.INTERNAL_SERVER_ERROR).send(au.successFalse(rm.LOUNGE_CREATE_FAIL));
            }
        }
    })
    
    
    /*
    */
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

router.get('/id/:id', async(req, res) => {
    const id = req.params.id;
    try {
        const {code, json} = await Badge.getBadgeInfoById(id);
        res.status(code).send(json);
    } catch(err){
        console.log(err);
        res.status(sc.INTERNAL_SERVER_ERROR).send(au.successFalse(rm.BADGE_READ_ALL_FAIL));
    }
})

router.put('/:id', async(req, res) => {
    const id = req.params.id;
    console.log("id",id);
    try {
        const {code, json} = await Badge.mintBadge(id);
        res.status(code).send(json);
    }catch(err){
        console.log(err);
        res.status(sc.INTERNAL_SERVER_ERROR).send(au.successFalse(rm.BADGE_UPDATE_FAIL));
    }
})



module.exports = router;