// 预约单

const mongoose = require('mongoose')
const { Schema, model } = mongoose
const historySchema = new Schema({
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  roomName: { type: String, required: true },
}, {
  timestamps: true
})
historySchema.virtual('duration').get(function() {
  const start = new Date(this.start_time);
  const end = new Date(this.end_time);
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});
module.exports = model('History', historySchema)