const express = require('express');
const router = express.Router();

const GatewayController = require('../controllers/gatewayController');

router.get('/', GatewayController.index);

router.post('/configuration', GatewayController.configuration);

router.post('/nivel', GatewayController.nivel);

router.post('/userregister', GatewayController.userRegister);

router.post('/allniveis', GatewayController.allNiveis);


module.exports = router;