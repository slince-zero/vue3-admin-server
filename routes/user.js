const express = require('express')
const router = express.Router()
const { User } = require('../models')
const log4js = require('../utils/log4j.js')
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const { SALT } = require('../config/index.js')
const passport = require('passport')
const { TOKEN_EXPIRES_IN } = require('../config/index.js') // token 过期时间
const svgCaptcha = require('svg-captcha') // 用于生成验证码

/**
 * 用户注册
 * @param username
 * @param password
 * @api {post} /api/user/register 用户注册
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body

  // 校验
  if (!username || !password) {
    log4js.error('用户名和密码不能为空')
    res.send({
      code: 400,
      message: '用户名和密码不能为空',
    })
    return
  }
  if (password.length < 6) {
    log4js.error('密码不能小于6位')
    res.send({
      code: 400,
      message: '密码不能小于6位',
    })
    return
  }

  // 判断用户名是否存在
  const user = await User.findOne({
    where: {
      username,
    },
  })
  if (user) {
    log4js.error('用户已存在')
    res.send({
      code: 400,
      message: '用户已存在',
    })
  }

  // 创建新用户
  try {
    const newUser = await User.create({
      username,
      password: md5(md5(password) + SALT),
    })
    log4js.info('用户注册成功')
    res.send({
      code: 200,
      message: '用户注册成功',
      // data: newUser, // 不要返回用户信息，这里有加密过的密码
    })
  } catch (error) {
    log4js.error('用户注册失败', error)
    res.send({
      code: 400,
      message: '用户注册失败',
    })
  }
})

// 生成验证码
let captcha_text = '' // 目的是为了登录验证时候用
router.get('/captcha', (req, res) => {
  try {
    const options = {
      width: 100,
      color: true,
    }
    const captcha = svgCaptcha.create(options)
    res.type('svg')
    captcha_text = captcha.text.toLocaleLowerCase()
    res.send({
      code: 200,
      msg: '获取验证码成功',
      data: captcha.data,
    })
  } catch (err) {
    log4js.error('生成验证码失败', err)
    res.send({
      code: 400,
      message: '生成验证码失败',
      data: err,
    })
  }
})

/**
 * 用户登录
 * @param username
 * @param password
 * @param captcha
 * @api {post} /api/user/login 用户登录
 */
router.post('/login', async (req, res) => {
  const { username, password, captcha } = req.body
  if (captcha.toLowerCase() !== captcha_text) {
    res.send({
      code: 400,
      message: '验证码不正确',
    })
    return
  }
  // 查询用户是否存在
  const user = await User.findOne({
    where: {
      username,
    },
  })
  if (!user) {
    log4js.error(`用户${username}不存在`)
    res.send({
      code: 400,
      message: '用户不存在',
    })
    return
  }
  // 校验密码是否正确
  if (md5(md5(password) + SALT) !== user.password) {
    log4js.error('密码不正确')
    res.send({
      code: 400,
      message: '密码不正确',
    })
    return
  }

  // 生成 token 并返回客户端
  const payload = { userId: user.id + 123123 }
  const options = { expiresIn: TOKEN_EXPIRES_IN } // token 失效时间
  jwt.sign(payload, SALT, options, (err, token) => {
    if (err) {
      log4js.error('生成 token 失败', err)
      res.send({
        code: 400,
        message: '生成 token 失败',
      })
      return
    }
    log4js.info('登录成功')
    res.send({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      },
    })
  })
})

/**
 * 获取当前用户信息
 * @api {get} /api/user/current 获取当前用户信息
 * @apiHeader {String} Authorization Bearer token
 */
router.get(
  '/current',
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send({
      code: 200,
      message: '获取当前用户信息成功',
      data: req.user,
    })
  },
)

module.exports = router
