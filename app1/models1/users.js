const mongoose = require('mongoose')
const { Schema, model } = mongoose
const userSchema = new Schema({


  username: { type: String, required: true},
  password: { type: String, required: true },
  avatar_url: { type: String }, // 用户头像
  gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
  age: { type: Number },
  birthday: { type: String },
  school: { type: String },
  job: { type: String },
  // historys 订单信息
  historys: { type: [{ type: Schema.Types.ObjectId, ref: "history" }], select: false },
  duration:{type:String,default:"00:00:00"}
  // 选购的套餐信息,可不加，用户的订单信息里包括套餐
  // combos: { type: [{ type: Schema.Types.ObjectId, ref: "Combo" }], select: false }
  // 预约信息单

})
module.exports = model('User', userSchema)