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
        ctx.cookies.set('userid', id)
        ctx.redirect('/')
    } else {
        ctx.redirect('/login.html')
    }
})

router.all('/api/appinfo', ctx => {
    const { id } = getReqData(ctx)
    if (db[id]) {
        ctx.body = {
            errno: 0,
            data: {
                money: db[id],
                userName: id
            }
        }
    } else {
        ctx.body = { errno: 666 }
    }
})

router.all('/api/transfer', ctx => {
    const { query: { toUser, money }, id } = getReqData(ctx)
    if (!id) {
        ctx.body = { errno: 666, errmsg: '您尚未登录请登录' }
        return
    }
    db[toUser] += (+money)
    db[id] -= (+money)
    ctx.body = { errno: 0 }
})

app.use(koaBody())
app.use(router.routes(), router.allowedMethods())
app.use(koaStatic(path.resolve(__dirname, '../front-page')))

app.listen(PORT, () => {
    console.log(`the server is running in ${PORT}`)
})