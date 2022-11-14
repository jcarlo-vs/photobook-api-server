const express = require('express')
const { changePassword, updatePhoto, updateUser } = require('../controllers/userController')
const authentication = require('../middleware/authentication')

const router = express.Router()

router.patch('/edit', authentication, updateUser)
router.patch('/updatePassword', authentication, changePassword)
router.patch('/updatePhoto', authentication, updatePhoto)

module.exports = router
