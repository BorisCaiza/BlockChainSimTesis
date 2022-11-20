const express = require('express');
const router = express.Router()
const userCtrl = require ('../controller/User.controller');







router.post('/create',  userCtrl.createUser)

router.put('/update/:id', userCtrl.updateUser)


router.get('/emails/:id', userCtrl.getEmails)

router.put('/aceptAll/:id',userCtrl.acceptAllConsent)

router.put('/rejectAll/:id',userCtrl.rejectAllConsent)




module.exports = router