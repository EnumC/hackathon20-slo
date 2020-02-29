const plugin = require('ilp-plugin')()
const SPSP = require('ilp-protocol-spsp')
const createLogger = require('pino')

// recipient is the payment pointer
// amount is 1 XRP = 10^9 units

const logger = createLogger()
const AMOUNT_TO_SEND = 100;
const recipient = '$xpring.dev/alice/xrp';

const sendPayment = async (recipient, amount) => {
  try {

    logger.info('connecting plugin')
    logger.info('sending payment')
    await SPSP.pay(plugin, {
      receiver: recipient,
      sourceAmount: amount
    })
  } catch (e) {
    console.error(e)
  }
  console.log('sent!')
}

sendPayment(recipient, AMOUNT_TO_SEND).catch(error => {
    console.log('error', error)
})
