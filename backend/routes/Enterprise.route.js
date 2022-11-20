const express = require('express');
const router = express.Router()
const enterpriseCtrl = require ('../controller/Enterprise.controller');







router.post('/create',  enterpriseCtrl.createEnterprise)

router.put('/update/:id', enterpriseCtrl.updateEnterprise)

router.post('/createEmail/:id', enterpriseCtrl.sendEmail)


module.exports = router