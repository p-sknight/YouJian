const mongoose = require('mongoose')
const { Schema, model } = mongoose
const roomSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: String, required: true },
  total_seats: { type: Number, required: true },
  now_seats: { type: Number, required: true },
  img_url: { type: String },
  no: { type: String }
})
module.exports = model('Room', roomSchema)