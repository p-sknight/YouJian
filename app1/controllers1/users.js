
const User = require('../models1/users')
const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config1')
const axios = require('axios')
const fs=require('fs')
const path=require('path')

class UsersCtl {


  // 检查用户名是否存在
  async checkUsernameExist (ctx, next) {
    console.log("chaecking1")
    const { username } = ctx.request.body
    const repeatedUser = await User.findOne({ username })
    if (repeatedUser && username !== ctx.state.user.username) ctx.throw(409, '用户名已经存在')
    await next()

  }

  async login (ctx) {
    ctx.verifyParams({
      username: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    let user = await User.findOne(ctx.request.body).select('+password')
    if (!user) ctx.throw(401, { message: '用户名或密码不正确' })
    const { _id, username } = user
    // 过期事件为一天
    const token = jsonwebtoken.sign({ _id, username }, secret, { expiresIn: '1d' })
    ctx.body = { userInfo: user, token }
  }
  
  async wxLogin(ctx){
    const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: 'wx28840790dcb614cd',
        secret: '9617e4451e1324face337033f3362f3e',
        js_code: ctx.query.code,
        grant_type: 'authorization_code'
      }
    })
    console.log("微信请求返回数据",data)
    let user = await User.findOne({ password: data.openid })
    console.log("数据库查找",user)
    console.log(ctx.query)
    if (!user) {
      // 如果用户不存在，则使用openid作为密码，在数据库中创建该用户对象
       user = await User.create({ username:ctx.query.username, password: data.openid })
    } 
    const { _id, username } = user
    // 过期事件为一天
    const token = jsonwebtoken.sign({ _id, username }, secret, { expiresIn: '1d' })
    ctx.body = { userInfo: user, token }

  }
  // 检查要删除或修改的用户是否为当前用户
  async checkOwner (ctx, next) {
    if (ctx.params.id != ctx.state.user._id) ctx.throw(403, '没有权限')
    let user = await User.findById(ctx.state.user._id)
    ctx.state.user.username = user.username
    await next()

  }
  // 新增用户
  async create (ctx) {
    ctx.verifyParams({
      username: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  async deleteById (ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) ctx.throw(404, '用户不存在')
    ctx.status = 204 // 没有内容，但是成功了
  }
  async updateAdmin (ctx) {
    console.log("updateAdmin")
    console.log(ctx.request.body)
  console.log(ctx.params.id)
    let user = await User.findOne({username:ctx.request.body.username,password:ctx.request.body.password})
  console.log(user)
    if (!user.age) {
      // 如果用户数据中不存在age属性，则添加age属性
      Object.assign(user, { age: ctx.request.body.age })
      console.log("after age",user)
    }
  
    user = await User.findOneAndUpdate({username:ctx.request.body.username,password:ctx.request.body.password}, ctx.request.body, { new: true })
  console.log(user)
    ctx.body = user;
  }
  async update (ctx) {
    console.log("update")
   console.log(ctx.request.body)
    // { new: true }返回更改后的新数据
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: true })
    if (!user) ctx.throw(404, '用户不存在')

    // console.log("ctx.state.user", ctx.state.user)
    ctx.state.user.username = user.username
    ctx.body = user
  }
  // 查找所有用户
  async find (ctx) {
    // ctx.body = await User.find();
    const users = await User.aggregate([
      {
        $project: {
          _id: 1,
          username: 1,
          password: 1,
          avatar_url: 1,
          gender: 1,
          birthday: 1,
          historys: 1,
          duration:1,
          age:1,
          job:1,
          school_code: "$school.code", // 将 school.code 重命名为 school_code
          school_name: "$school.name" // 将 school.code 重命名为 school_code

        }
      }
    ]);
    ctx.body=users

  }
  // 查找特定用户
  async findByNP (ctx) {
 
    console.log(ctx.request)
    console.log(ctx.query)
    const user = await User.findOne({username:ctx.query.username,password:ctx.query.password})
    console.log("findByNP")
    console.log(user)
    if (!user) {
      ctx.status = 404
      ctx.body = { message: 'User not found' }
    }
    ctx.body = user
  } catch (err) {
    ctx.status = 500
    ctx.body = { message: err.message }
  }    



  async findById (ctx) {
    console.log(ctx.request)
    console.log(ctx.params)
    const user = await User.findOne({_id:ctx.params.id})

    console.log(user)
    if (!user) {
      ctx.status = 404
      ctx.body = { message: 'User not found' }
      
    }
    ctx.body = user
  } catch (err) {
    ctx.status = 500
    ctx.body = { message: err.message }
  }   

  // 查找特定用户下的所有订单,此接口在orders的控制器里
  // 查找特定用户下的所有套餐
  async findUserCombos (ctx) {
    let user = await User.findById(ctx.params.id).select('+orders').populate('orders')
    let combos = []
    user.orders.forEach((item, index) => {
      item.combosInfo.forEach(comboItem => {
        combos.push(comboItem)
      })

    })
    ctx.body = combos
  }
  async upload(ctx){
    console.log("有一张图片正在上传")
    const file = ctx.request.body.files.file; // 获取上传的文件
    const reader = fs.createReadStream(file.path); // 创建可读流
    const ext = file.name.split('.').pop(); // 获取文件后缀名
    const fileName = `${Date.now()}.${ext}`; // 生成新的文件名
    const filePath = path.join(__dirname, 'public', fileName); // 生成文件保存路径
    const upStream = fs.createWriteStream(filePath); // 创建可写流
    reader.pipe(upStream); // 可读流通过管道写入可写流
    console.log(`http://localhost:3010/${fileName}`)
    ctx.body = {
      code: 0,
      message: '上传成功',
      data: {
        url: `http://localhost:3010/${fileName}` // 返回文件访问路径
      }
    };
  }
}

module.exports = new UsersCtl()