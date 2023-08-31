const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config1')
const {upload,updateAdmin,findByNP,login, checkOwner, checkUsernameExist, find, findById, create, deleteById, update, findUserCombos,wxLogin } = require('../controllers1/users')
const jwt = require('koa-jwt')

// 自定义认证中间件
// const auth = async (ctx, next) => {
//   const { authorization = '' } = ctx.request.header
//   const token = authorization.replace("Bearer ", '')
//   try {
//     const user = jsonwebtoken.verify(token, secret)
//     // 记录登录的用户信息
//     ctx.state.user = user

//   } catch (err) {
//     ctx.throw(401, err.message)
//   }
//   // 执行后面的中间件
//   await next()
// }

const auth = jwt({ secret })
router.post('/login', login)
router.get('/wxlogin', wxLogin)
router.post('/img/upload', upload)

router.post('/', checkUsernameExist, create)
router.delete('/:id',   checkOwner, deleteById)
router.post('/update/admin/:id',  updateAdmin)

router.patch('/:id', checkUsernameExist, update)
// 获取用户列表
router.get('/', find)
router.get('/:id', findById)
router.get('/search/byDetail', findByNP)
// 9
// 用户新增订单
// router.post('/:id/orders', auth, createOrder)
// router.get('/:id/combos', findUserCombos)
module.exports = router