import express from 'express'
import { router } from './router/router'
import { adminRouter } from './router/adminrouter'
import { getLocalIPAddresses } from './utils'

const app = express()
const port = parseInt(process.env.SERVER_PORT, 10) || 3002

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

app.use('', router)
app.use('/manager-users', adminRouter)
app.set('trust proxy', 1)
app.listen(port)

const ipAddresses = getLocalIPAddresses()
globalThis.console.log('服务已启动')
ipAddresses.forEach((ipAddress) => {
  globalThis.console.log(`http://${ipAddress}:${port}`)
})
