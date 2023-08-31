const Router = require('koa-router')
const router = new Router()
const {upload,findDayHistory,chartYear,chartAge,chartToday,findHistoryByWeek,findHistoryByMonth, findHistoryByYear,getYesterdayHistoryCount,create, findByUser, findById,cancelHistory } = require('../controllers1/historys')
const { secret } = require('../config1')
const jwt = require('koa-jwt')
const auth = jwt({ secret })
router.post('/:userId/create', create)
router.get('/:userId/historys', findByUser)
router.patch('/:userId/historys/:id', cancelHistory)

router.get('/historys/:id', findById)
router.get('/yesterdayCount', getYesterdayHistoryCount)
router.get('/getByYear/:year', findHistoryByYear)
router.get('/getByMon/:year/:month', findHistoryByMonth)
router.get('/getByWeek/:year/:month/:day', findHistoryByWeek)
router.get('/getByDay/:year/:month/:day', findDayHistory)
router.get('/chartToday', chartToday)
router.get('/chartAge', chartAge)
router.get('/chartYear', chartYear)

router.post('/upload', upload)


module.exports = router