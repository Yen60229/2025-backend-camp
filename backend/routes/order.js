const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const orderController = require('../controllers/order')
const logger = require('../utils/logger')('Order')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

// 建立訂單（需要登入）
router.post('/:creditPackageId', auth, orderController.createOrder)

module.exports = router
