/**
 * 加盐
 * 在开发中，"加盐"（salting）是指在进行密码哈希算法时，
 * 为了增加密码的安全性而附加一个随机生成的字符串（盐）到原始密码之前。
 */
const SALT = 'vue3-admin' 

// 端口
const PORT = 3080

// token过期时间
const TOKEN_EXPIRES_IN = 3600 * 24 * 7 // 一周

module.exports = {
  SALT,
  PORT,
  TOKEN_EXPIRES_IN,
}
