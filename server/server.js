const Koa = require('koa')
const KoaRouter = require('koa-router')
const path = require('path')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')

const { db, getReqData } = require('./utils')

const PORT = 8000
const app = new Koa()
const router = new KoaRouter()
router.all('/api/login', ctx => {
    const { body: { id } } = getReqData(ctx)
    if (db[id]) {
      ctx.body = {
        errno: 0,
        data: id
      }
    } else {
      ctx.body = { errno: 666 }
    }
  })
  
  /**
   * 获取初始化用户信息
   * 致敬我们项目中的接口路径
   */
  router.all('/api/appinfo', ctx => {
    const { token } = getReqData(ctx)
    if (db[token]) {
      ctx.body = {
        errno: 0,
        data: {
          money: db[token],
          userName: token
        }
      }
    } else {
      ctx.body = { errno: 666 }
    }
  })
  
  // 转账, 余额不足之类的异常情况统统不考虑
  router.post('/api/transfer', ctx => {
    const { body: { toUser, money }, token } = getReqData(ctx)
    if (!token) {
      ctx.body = {
        errno: 666, errmsg: '用户未登陆'
      }
      return
    }
    db[toUser] += (+money)
    db[token] -= (+money)
    ctx.body = { errno: 0 }
  })  

app.use(koaBody())
app.use(router.routes(), router.allowedMethods())
app.use(koaStatic(path.resolve(__dirname, '../front-page')))

app.listen(PORT, () => {
    console.log(`the server is running in ${PORT}`)
})