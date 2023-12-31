const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]
const db = {}
const log4js = require('../utils/log4j.js')

let sequelize // 用于存储 Sequelize 实例
// 判断使用环境变量还是配置文件中的数据库连接信息来创建 Sequelize 实例
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  )
}

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ - 数据库连接成功')
    log4js.info('✅ - 数据库连接成功');
    (async () => {
      await sequelize.sync({
        force: false, // 同步创建表，表存在的话，忽略
      })
    })()
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败', err)
    log4js.error('❌ 数据库连接失败', err)
  })

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    )
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    )
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => { 
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
