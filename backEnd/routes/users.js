const express = require('express');
const router = express.Router();

const UserController = require('../controllers/usersController');

router.get('/',UserController.index);

router.post('/signin', UserController.signin);

router.post('/signup',UserController.signup);

router.post('/verifytoken',UserController.verifytoken);

router.post('/userinformation', UserController.userinformation);

router.post('/request', UserController.request);

router.post('/email/:user_id', UserController.emailaccept);

router.post('/verifyacesso', UserController.verifyacesso);

module.exports = router;