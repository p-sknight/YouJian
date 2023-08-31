const Room = require("../models1/rooms")
const History = require("../models1/historys")
const { judgeTimeAvailable } = require("../common1/myMethods")
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');



class RoomsCtl {
  // 新增自习室
  async create (ctx) {
    console.log(ctx.request.body)

    ctx.verifyParams({
      name: { type: 'string', required: true },
      description: { type: 'string', required: true },
      time: { type: 'string', required: true },
      total_seats:{ type: 'number', required: true },
      now_seats:{ type: 'number', required: true },
      img_url: { type: 'string', required: true },
    })
    const { name } = ctx.request.body
    const requestRoom = await Room.findOne({ name })
    if (requestRoom) ctx.throw(409, '自习室名字已经存在')
    let room = await new Room(ctx.request.body).save()
    ctx.body = room
  }
  // 修改自习室
  async update (ctx) {
    console.log("dadadad",ctx.request.body)
    ctx.verifyParams({
      name: { type: 'string', required: true },
      description: { type: 'string', required: true },
      time: { type: 'string', required: true },
      total_seats:{ type: 'number', required: true },
      now_seats:{ type: 'number', required: true },
    })
    const room = await Room.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: true })
    if (!room) ctx.throw(404, '该自习室不存在')
    ctx.body = room

  }
  // 查询自习室
  async find (ctx) {
    ctx.body = await Room.find()
  }
  async findById (ctx) {
    console.log("这是findbyid的ctx",ctx.params.id)
    const room = await Room.findById(ctx.params.id)
    if (!room) ctx.throw(404, '自习室不存在')
    ctx.body = room
  }
  async findByName (ctx) {
    console.log("这是findbyname的ctx",ctx.params.name)
    const regex = new RegExp(ctx.params.name, 'i');
    const room = await Room.find({ name:  { $regex: regex } })
    if (!room) ctx.throw(404, '自习室不存在')
    console.log(room)
    ctx.body = room

  }
  // 查询当前有空余的自习室
  async getAvailableRoom (ctx) {
    console.log("searching")
    let allRooms=await Room.find({"$where":"this.now_seats < this.total_seats"})
    console.log(allRooms)
    if (!allRooms) ctx.throw(404, '自习室不存在')
    ctx.body = allRooms;
  }
  async getQRcode (ctx) {
    // 0 以图片形式获取   1 返回img标签
  console.log(ctx.params)
  console.log(ctx.request.body)
console.log(ctx.request)
    if(ctx.params.kind==0){
       console.log(ctx.query)
      const text=JSON.stringify(ctx.query)    
      console.log("text",text)
      const qrImage = await QRCode.toDataURL(text);
      const qrName=new Date().toDateString()
      const base64Data = qrImage.replace(/^data:image\/\w+;base64,/, '');
      const bufferData = Buffer.from(base64Data, 'base64');
      const filePath = path.join(__dirname, 'qrcode'+qrName+'.png');
      fs.writeFileSync(filePath, bufferData);
      ctx.attachment('qrcode.png');
      ctx.body = fs.createReadStream(filePath);
    }
    // const text = ctx.query.text || 'default';
   
  }
  async deleteRoomsByIds (ctx) {
    // 
  console.log(ctx.request.body)
    const { ids } = ctx.request.body;
    const result = await Room.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      ctx.throw(404, '自习室不存在');
    }
    ctx.body = {
      message: '删除成功',
      deletedCount: result.deletedCount,
    };
  }
  async getBanRoom (ctx) {
    console.log("searching")
    let allRooms=await Room.find({"$where":"this.now_seats >= this.total_seats"})
    console.log(allRooms)
    if (!allRooms) ctx.throw(404, '自习室不存在')
    ctx.body = allRooms
  }
  async getRoomsNews(ctx){
    const totalRooms = await Room.countDocuments()
    const availableRooms = await Room.countDocuments({ $expr: { $lt: ['$now_seats', '$total_seats'] } } )
    console.log(totalRooms,availableRooms)
    ctx.body = {
      totalRooms,
      availableRooms
    }
  }

}
module.exports = new RoomsCtl()
