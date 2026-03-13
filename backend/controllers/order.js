const { dataSource } = require('../db/data-source')
const config = require('../config/index')
const logger = require('../utils/logger')('OrderController')
const {
  createTradeInfo,
  encryptTradeInfo,
  createTradeSha,
  decryptTradeInfo
} = require('../utils/newebpayEncrypt')

class OrderController {
  // 建立訂單並產生藍新金流加密資料
  static async createOrder (req, res, next) {
    try {
      const { id: userId } = req.user
      const { creditPackageId } = req.params

      // 查詢方案是否存在
      const creditPackageRepo = dataSource.getRepository('CreditPackage')
      const creditPackage = await creditPackageRepo.findOne({
        where: { id: creditPackageId }
      })
      if (!creditPackage) {
        res.status(400).json({
          status: 'failed',
          message: 'ID錯誤'
        })
        return
      }

      // 產生唯一的商店訂單編號（時間戳記 + 隨機碼，避免高併發重複）
      const merchantOrderNo = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
      const amount = Math.round(Number(creditPackage.price))

      // 建立訂單
      const orderRepo = dataSource.getRepository('Order')
      const newOrder = orderRepo.create({
        user_id: userId,
        credit_package_id: creditPackageId,
        merchant_order_no: merchantOrderNo,
        amount,
        purchased_credits: creditPackage.credit_amount,
        payment_status: 'unpaid'
      })
      await orderRepo.save(newOrder)

      // 取得藍新金流設定
      const newebpayConfig = config.get('newebpay')

      // 組成交易資料並加密
      const tradeInfo = createTradeInfo(
        { merchantOrderNo, amount, itemDesc: creditPackage.name },
        newebpayConfig.merchantId,
        newebpayConfig.version,
        newebpayConfig.notifyUrl,
        newebpayConfig.returnUrl
      )
      const encryptedTradeInfo = encryptTradeInfo(tradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      const tradeSha = createTradeSha(encryptedTradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)

      res.status(200).json({
        status: 'success',
        data: {
          paymentGateway: newebpayConfig.payGateway,
          MerchantID: newebpayConfig.merchantId,
          TradeInfo: encryptedTradeInfo,
          TradeSha: tradeSha,
          Version: newebpayConfig.version
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  // 藍新金流付款完成通知（Server to Server）
  static async handleNotify (req, res, next) {
    try {
      const newebpayConfig = config.get('newebpay')
      const { TradeInfo, TradeSha } = req.body

      // 驗證 TradeSha
      const verifyTradeSha = createTradeSha(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      if (TradeSha !== verifyTradeSha) {
        logger.error('TradeSha 驗證失敗')
        res.status(400).send('驗證失敗')
        return
      }

      // 解密 TradeInfo
      const decryptedData = decryptTradeInfo(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      logger.info('藍新回傳解密資料：', decryptedData)

      const { Status, Result } = decryptedData
      const { MerchantOrderNo, TradeNo, PaymentType, Amt } = Result

      // 查詢訂單
      const orderRepo = dataSource.getRepository('Order')
      const order = await orderRepo.findOne({
        where: { merchant_order_no: MerchantOrderNo }
      })

      if (!order) {
        logger.error(`找不到訂單：${MerchantOrderNo}`)
        res.status(400).send('訂單不存在')
        return
      }

      // 避免重複處理已付款的訂單
      if (order.payment_status === 'paid') {
        res.status(200).send('OK')
        return
      }

      // 驗證金額是否一致，防止金額被竄改
      if (Number(Amt) !== order.amount) {
        logger.error(`金額不一致：訂單 ${order.amount}，藍新回傳 ${Amt}`)
        res.status(400).send('金額不一致')
        return
      }

      if (Status === 'SUCCESS') {
        // 更新訂單狀態為已付款
        await orderRepo.update(order.id, {
          payment_status: 'paid',
          newebpay_trade_no: TradeNo,
          payment_type: PaymentType,
          paid_at: new Date().toISOString()
        })

        // 建立購買記錄（CreditPurchase）
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const newPurchase = creditPurchaseRepo.create({
          user_id: order.user_id,
          credit_package_id: order.credit_package_id,
          purchased_credits: order.purchased_credits,
          price_paid: Amt,
          purchaseAt: new Date().toISOString()
        })
        await creditPurchaseRepo.save(newPurchase)

        logger.info(`訂單 ${MerchantOrderNo} 付款成功`)
      } else {
        // 更新訂單狀態為付款失敗
        await orderRepo.update(order.id, {
          payment_status: 'failed'
        })
        logger.info(`訂單 ${MerchantOrderNo} 付款失敗：${Status}`)
      }

      res.status(200).send('OK')
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  // 藍新金流付款完成導回（使用者瀏覽器導向）
  static async handleReturn (req, res, next) {
    try {
      const newebpayConfig = config.get('newebpay')
      const { TradeInfo, TradeSha } = req.body

      // 驗證 TradeSha
      const verifyTradeSha = createTradeSha(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      if (TradeSha !== verifyTradeSha) {
        logger.error('ReturnURL TradeSha 驗證失敗')
        res.redirect(`${newebpayConfig.frontendUrl}/payment-result?status=failed`)
        return
      }

      // 解密 TradeInfo 取得訂單編號與付款狀態
      const decryptedData = decryptTradeInfo(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      const { Status, Result } = decryptedData
      const { MerchantOrderNo } = Result

      // 優先從 DB 查詢實際狀態；若 NotifyURL 尚未處理完，則參考已驗證的藍新回傳 Status
      const orderRepo = dataSource.getRepository('Order')
      const order = await orderRepo.findOne({
        where: { merchant_order_no: MerchantOrderNo }
      })

      const isPaid = order?.payment_status === 'paid' || Status === 'SUCCESS'
      const status = isPaid ? 'success' : 'failed'
      res.redirect(`${newebpayConfig.frontendUrl}/payment-result?status=${status}&orderNo=${MerchantOrderNo}`)
    } catch (error) {
      logger.error(error)
      res.redirect(`${config.get('newebpay').frontendUrl}/payment-result?status=failed`)
    }
  }
}

module.exports = OrderController
