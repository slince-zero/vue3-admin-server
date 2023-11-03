// 存储日志

const log4js = require('log4js')

// 定义levels级别
const levels = {
  debug: log4js.levels.DEBUG,
  info: log4js.levels.INFO,
  error: log4js.levels.ERROR,
}

// 配置日志
log4js.configure({
  appenders: {
    console: { type: 'console' },
    info: { type: 'file', filename: 'logs/infos.log' }, // 输出日志到 infos.log
    error: {
      type: 'dateFile', // 按天输出日志
      filename: 'logs/errors.log',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true, // 说明 filename 和 pattern 组合输出日志内容
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'debug',
    },
    info: {
      appenders: ['info', 'console'],
      level: 'info',
    },
    error: {
      appenders: ['error', 'console'],
      level: 'error',
    },
  },
})

// 输出 debug
exports.debug = (message) => {
  let logger = log4js.getLogger()
  logger.level = levels.debug
  logger.debug(message)
}

// 输出 info
exports.info = (message) => {
  let logger = log4js.getLogger()
  logger.level = levels.info
  logger.info(message)
}

// 输出 error
exports.error = (message) => {
  let logger = log4js.getLogger()
  logger.level = levels.error
  logger.error(message)
}
