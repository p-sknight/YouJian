const History = require("../models1/historys")
const User = require("../models1/users")
const Room = require("../models1/rooms")
const { judgeTimeAvailable } = require("../common1/myMethods")
const { date } = require("faker/lib/locales/az")
const moment = require('moment');
const fs=require('fs')

class HistorysCtl {
  async  getYesterdayHistoryCount(ctx) {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toDateString()
    const yesterdayCount = await History.countDocuments({
      createdAt: {
        $gte: start,
        $lt: end
      }
    })
    console.log(yesterdayCount)
    ctx.body = {
      yesterdayCount: yesterdayCount
    }
  }
  
  
  async create(ctx){
    console.log("ctx req",ctx.request.body)
    console.log("ctx params",ctx.params)

      ctx.verifyParams({
      start_time: { type: 'string', required: true },
      end_time: { type: 'string', required: true },
      userId: { type: 'string', required: true },
      roomId: { type: 'string', required: true },
      roomName: { type: 'string', required: true }
    })
    // const room = await Room.findById(ctx.params.roomId)
    // console.log(room)
    const history = await new History(ctx.request.body).save()
    ctx.body = history
  

  }
  async  findHistoryByRoomName(ctx) {
    
    const his = await History.find({ roomName: ctx.params.name })
    if (!his) {
      throw new Error('Room not found');
    }
      ctx.body=  his 
  }
  async findHistoryByMonth(ctx) {
    const year = ctx.params.year;
    const month = ctx.params.month;
    const start = moment.utc(`${year}-${month}-01T00:00:00.000Z`);
    const end = moment.utc(start).add(1, 'month').subtract(1, 'millisecond');
    console.log(year, month);
    console.log(start.toISOString());
    console.log(end.toISOString());
  
    const histories = await History.find({
      start_time: { $gte: start.toISOString(), $lt: end.toISOString() }
    });
    console.log(histories);
    ctx.body = histories;
  }
  async findHistoryByYear(ctx) {
    console.log("getByYear")
    const year = ctx.params.year;
    const start = moment.utc(`${year}-01-01T00:00:00.000Z`);
    const end = moment.utc(start).add(1, 'year').subtract(1, 'millisecond');
    console.log(year);
    console.log(start.toISOString());
    console.log(end.toISOString());
  
    const histories = await History.find({
      createdAt: { $gte: start.toISOString(), $lt: end.toISOString() }
    });
    ctx.body = histories;
  }
  async findHistoryByWeek(ctx) {
    const year = ctx.params.year;
    const month = ctx.params.month;
    const day = ctx.params.day;
  console.log("ppppppppppp")
    const date = moment.utc(`${year}-${month}-${day}T00:00:00.000Z`);
    const start = moment.utc(date).startOf('week');
    const end = moment.utc(date).endOf('week');
    console.log(start)
    const histories = await History.find({
      start_time: { $gte: start.toISOString(), $lt: end.toISOString() }
    });
    ctx.body = histories;
  }
  
  async findDayHistory(ctx) {
    console.log("ooooooooooooooo")
    const year = ctx.params.year;
    const month = ctx.params.month;
    const day = ctx.params.day;
    const start = moment.utc(`${year}-${month}-${day}T00:00:00.000Z`);
    const end = moment.utc(start).add(1, 'day');
    console.log(start)

    const histories = await History.find({
      start_time: { $gte: start.toISOString(), $lt: end.toISOString() }
    });
    console.log(histories)
    ctx.body= histories;
  }
  // 查询某用户所有的历史记录
  async findByUser (ctx) {
    console.log("dadadggevrtghr")
    console.log(ctx.params.name)
    const user = await User.findOne({username:ctx.params.name}).populate('historys')
    console.log(user)
    let HistoryList = []
    if (user) {
      HistoryList = user.Historys
      HistoryList = HistoryList.reverse()
      ctx.body = HistoryList
    }
  }
  // 根据记录id查询记录
  async findById (ctx) {
    // console.log("test")
    const history = await History.findById(ctx.params.id)
    // console.log("History",History)
    if (!history) ctx.throw(404, '该记录不存在')
    ctx.body = History
  }

  // 删除记录
  async cancelHistory (ctx) {
    let History = await History.findById(ctx.params.id)
    if (!History) ctx.throw(404, '该记录不存在')
    // 取消预约前检查预约时间范围是否已经成为过去式
    if (new Date(History.start_time).getTime() <= new Date().getTime()) {
      History.status = 'invalid'
      History.save()
      ctx.body = {
        msg: "无法取消",
        status: 409
      }
      return false
    }
    console.log("History.seatId", History.seatId.toString())
    let seat = await Seat.findById(History.seatId.toString()).select('+Historys').populate('Historys')
    console.log("seat", seat)

    if (seat) {
      let index = seat.Historys.findIndex((el, index) => el._id.toString() === History._id.toString());
      console.log("index", index)
      if (index > -1) {//大于0 代表存在，
        seat.Historys.splice(index, 1);//存在就删除
      }
      seat.save()
    }
    History.status = 'cancel'
    History.save()
    ctx.status = 204
  }
  async chartToday(ctx){
    const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const histories = await History.find({ createdAt: { $gte: startOfDay, $lt: endOfDay } }).populate('userId');
  const hour = [];
  const count = [];
  const uniqueUserCount = [];
  for (let i = 0; i < 24; i++) {
    const hourStr = i < 10 ? `0${i}` : `${i}`;
    const hourHistories = histories.filter(history => history.createdAt.getHours() === i);
    const countNum = hourHistories.length;
    const users = hourHistories.map(history => history.userId);
    const uniqueUsers = [...new Set(users)];
    const uniqueUserCountNum = uniqueUsers.length;
    hour.push(hourStr);
    count.push(countNum);
    uniqueUserCount.push(uniqueUserCountNum);
  }
  ctx.body = { hour, count, uniqueUserCount };
  }
  async chartAge(ctx){
    const ageRanges = [
      { name: '15岁以下', minAge: 0, maxAge: 15 },
      { name: '18岁以下', minAge: 15, maxAge: 18 },
      { name: '23岁以下', minAge: 18, maxAge: 23 },
      { name: '23岁到35岁', minAge: 23, maxAge: 35 },
      { name: '35岁以上', minAge: 35, maxAge: Infinity },
    ];
  
    const pipeline = [
      {
        $group: {
          _id: {
            $switch: {
              branches: ageRanges.map(({ name, minAge, maxAge }) => ({
                case: {
                  $and: [
                    { $gte: ['$age', minAge] },
                    { $lt: ['$age', maxAge] },
                  ],
                },
                then: name,
              })),
              default: '15岁以下',
            },
          },
          count: { $sum: 1 },
        },
      },
    ];
  
    const results = await User.aggregate(pipeline);
  
    const data = [];
    for (let i = 0; i < ageRanges.length; i++) {
      const range = ageRanges[i];
      const result = results.find(({ _id }) => _id === range.name);
      const count = result ? result.count : 0;
      data.push({
        name: range.name,
        value: count||0,
      });
    }
  
    ctx.body = data;
  }
  async chartYear(ctx) {
    const nowYear = moment().year(); // 获取当前年份
    const startOfYear = moment(`${nowYear}-01-01`).startOf('day'); // 当年第一天零点
    const endOfYear = moment(`${nowYear}-12-31`).endOf('day'); // 当年最后一天23:59:59
  
    try {
      const historyList = await History.find({
        createdAt: { $gte: startOfYear, $lte: endOfYear }, // 查找当年内创建的history记录
      }).select('createdAt'); // 只查询createdAt字段
  
      const monthCountMap = new Map(); // 使用Map来存储每个月份新增记录数
  
      historyList.forEach((history) => {
        const monthStr = moment(history.createdAt).format('YYYY-MM'); // 根据createdAt获取对应的月份字符串，如'2022-03'
        if (monthCountMap.has(monthStr)) {
          monthCountMap.set(monthStr, monthCountMap.get(monthStr) + 1); // 已有该月份记录，则数量+1
        } else {
          monthCountMap.set(monthStr, 1); // 没有该月份记录，则初始化为1
        }
      });
  
      const resultData = []; // 用于存储返回的结果数据
      for (let i = 1; i <= 12; i++) {
        const monthStr = `${nowYear}-${i.toString().padStart(2, '0')}`; // 根据年份和月份数字拼接成'2022-03'这样的字符串
        const count = monthCountMap.get(monthStr) || 0; // 获取该月份新增记录数，如果不存在则默认为0
        resultData.push([i, count]); // 将月份和新增记录数放入数组中
      }
  
      ctx.body = { code: 200, data: resultData };
    } catch (error) {
      console.log(error);
      ctx.body = { code: 500, message: '服务器出错了' };
    }
  }

  async upload(ctx){
    console.log("有一张图片正在上传")
    console.log(ctx.request.files)
    const file = ctx.request.files.file; // 获取上传的文件
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
module.exports = new HistorysCtl()