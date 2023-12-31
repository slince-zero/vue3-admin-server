const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const { User } = require('../models')
const { SALT } = require('../config/index.js')
const log4js = require('../utils/log4j.js')

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = SALT

// 解析token
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      // console.log(jwt_payload);
      User.findOne({
        where: {
          id: jwt_payload.userId - 123123,
        },
      })
        .then((user) => {
          if (user) {
            return done(null, user)
          }

          return done(null, false)
        })
        .catch((err) => {
          log4js.error(err)
          console.log(err)
        })
    }),
  )
}
