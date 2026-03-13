const crypto = require('crypto')

// 將交易資料組成 URL Query String
function createTradeInfo (order, merchantId, version, notifyUrl, returnUrl) {
  const data = {
    MerchantID: merchantId,
    RespondType: 'JSON',
    TimeStamp: Math.round(Date.now() / 1000).toString(),
    Version: version,
    MerchantOrderNo: order.merchantOrderNo,
    Amt: order.amount,
    ItemDesc: order.itemDesc || '健身方案',
    ReturnURL: returnUrl,
    NotifyURL: notifyUrl
  }

  // 如果有 Email，加入交易資料
  if (order.email) {
    data.Email = order.email
  }

  // 組成 URL Query String
  const queryString = Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return queryString
}

// AES-256-CBC 加密
function encryptTradeInfo (tradeInfo, hashKey, hashIV) {
  const cipher = crypto.createCipheriv('aes-256-cbc', hashKey, hashIV)
  let encrypted = cipher.update(tradeInfo, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

// SHA256 雜湊產生 TradeSha
function createTradeSha (encryptedTradeInfo, hashKey, hashIV) {
  const raw = `HashKey=${hashKey}&${encryptedTradeInfo}&HashIV=${hashIV}`
  const sha = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase()
  return sha
}

// AES-256-CBC 解密（用於處理藍新回傳資料）
function decryptTradeInfo (encryptedData, hashKey, hashIV) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', hashKey, hashIV)
  decipher.setAutoPadding(false)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  // 移除 PKCS7 padding 及所有不可見控制字元
  decrypted = decrypted.replace(/[\x00-\x1f]+/g, '')

  return JSON.parse(decrypted)
}

module.exports = {
  createTradeInfo,
  encryptTradeInfo,
  createTradeSha,
  decryptTradeInfo
}
