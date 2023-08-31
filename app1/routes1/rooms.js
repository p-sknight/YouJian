const Router = require('koa-router')
const router = new Router({ prefix: '/rooms' })
const { deleteRoomsByIds,getRoomsNews,getQRcode,create,lcreate, find, findById, update, getAvailableRoom,getBanRoom,findByName } = require('../controllers1/rooms')

router.post('/', create)
router.get('/', find)
router.get('/detail/:id', findById)
router.get('/search/:name', findByName)

router.post("/detail/:id", update)
router.get("/available", getAvailableRoom)
router.get("/ban", getBanRoom)
router.get("/qr/:kind", getQRcode)
router.get("/news", getRoomsNews)
router.post("/delete", deleteRoomsByIds)

// 10



// 查重指定自习室所有座位的状态
// router.post('/:id/status', findSeatsStatus)
module.exports = router