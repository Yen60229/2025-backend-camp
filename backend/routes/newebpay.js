const express = require('express')

const router = express.Router()
const orderController = require('../controllers/order')

// 藍新金流付款通知（不需登入，由藍新伺服器呼叫）
router.post('/notify', orderController.handleNotify)

// 藍新金流付款導回（不需登入，使用者瀏覽器導向）
router.post('/return', orderController.handleReturn)

module.exports = router
