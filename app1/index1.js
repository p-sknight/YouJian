const Koa = require("koa")
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const bodyparser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const app = new Koa()
const routing = require('./routes1/index')
const mongoose = require('mongoose')
const { connectionLocal } = require('./config1')
const cors = require('koa2-cors');
const port=3010
mongoose.connect(connectionLocal, { useNewUrlParser: true }, () => console.log('-----------------------------------数据库连接成功-----------------------------------'))
mongoose.connection.on('error', console.error)
app.use(error({
  // 生产环境暴露错误的堆栈信息不安全，故生产环境将其隐藏
  postFormat: (err, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }

}))
app.use(koaBody({
  multipart: true, // 支持文件上传
  formidable: {
    maxFileSize: 200 * 1024 * 1024 // 限制上传文件大小
    
  }
}));
app.use(koaStatic(__dirname + '/public')); // 静态文件目录

app.use(bodyparser())
app.use(parameter(app))
// app.use(cors({
//   origin: function (ctx) { //设置允许来自指定域名请求
//     if (ctx.url === '/test') {
//       return '*'; // 允许来自所有域名请求
//     }
//     return 'http://localhost:8090'; //只允许http://localhost:8089这个域名的请求
//   },
//   maxAge: 5, //指定本次预检请求的有效期，单位为秒。
//   credentials: true, //是否允许发送Cookie
//   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', "PATCH"], //设置所允许的HTTP请求方法
//   allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
//   exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
// }))
app.use(cors({
  origin: '*', // 允许访问的域名
  // credentials: true, // 允许携带 cookie
  // allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的请求方法
  // allowHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
}));

routing(app)
app.listen(port, () => {
  console.log('start server...,服务器运行于'+port+'端口')
  console.log('管理员后台运行于http://localhost:8090/index')
})