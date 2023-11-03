// 创建express基本结构
const express = require('express')
const cors = require('cors') // 引入解决跨域工具
const log4js = require('./utils/log4j.js') // 引入日志文件
const { PORT } = require('./config/index.js')
const passport = require('passport')

const app = express()
// passport 初始化，用于验证token
app.use(passport.initialize())
require('./utils/passport.js')(passport) // 将 passport 对象传递给 require(..)返回的函数

// 配置全局中间件，中间件必须配置在路由的前面，否则不生效
app.use(express.json()) // 解析 json 数据
app.use(express.urlencoded({ extended: false })) // 处理来自客户端的 URL 编码表单数据, 后续可以通过 req.body 访问表单数据
app.use(cors()) // 解决跨域

// 封装身份验证中间件
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      res.status(401).send('未登录或身份已过期')
      return
    }
    req.user = user
    next()
  })(req, res, next)
}

// 路由
app.use('/api/user', require('./routes/user.js')) // 登录鉴权，目的是能够正常登录

// 统一身份验证--有token
const createRouter = (path, handler) => {
  const router = express.Router()
  router.use(authenticate)
  router.use(handler)
  app.use(path, router)
}

createRouter('/api/user', require('./routes/user.js'))

// 异常捕获的中间件，写在最后
app.use((err, req, res, next) => {
  log4js.error(err)
  res.send({ code: 500, msg: '未知错误,请联系管理员!', err: err.toString() })
})

// 监听端口
app.listen(PORT, () => {
  log4js.info(`✅ -- 服务器启动成功，端口:${PORT}`)
  console.log(`✅ -- 服务器启动成功，端口:${PORT}`)
})
