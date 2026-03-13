module.exports = {
  merchantId: process.env.NEWEBPAY_MERCHANT_ID,
  hashKey: process.env.NEWEBPAY_HASH_KEY,
  hashIV: process.env.NEWEBPAY_HASH_IV,
  version: process.env.NEWEBPAY_VERSION,
  payGateway: process.env.NEWEBPAY_PAY_GATEWAY,
  notifyUrl: process.env.NEWEBPAY_NOTIFY_URL,
  returnUrl: process.env.NEWEBPAY_RETURN_URL,
  frontendUrl: process.env.FRONTEND_URL
}
