import fs from 'fs'
import express from 'express'
import { limiter } from 'src/middleware/limiter'
import { auth } from 'src/middleware/auth'
import type { RequestProps } from 'src/types'
import { saveChatRecord } from 'src/middleware/records'
import type { ChatMessage } from 'src/chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from 'src/chatgpt'
import { isNotEmptyString } from 'src/utils/is'
import { UserDataManager } from 'src/userdb'
import { generateVerificationCode, sendVerificationCodeByEmail } from 'src/mail'
import { Base64 } from 'js-base64'
import { adminCommandHandler } from 'src/middleware/command'
import { getFreeDays } from './freedays'

const router = express.Router()
const userDataManager = new UserDataManager()
const verificationCodesFilePath = 'data/verfication/verification-codes.json'

// 静态资源
router.use('/images', express.static('data/images'))

// icon数据
router.get('/iconapi/*', (req, res) => {
  fs.readFile('./data/icondata/icon.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    const jsonData = JSON.parse(data)
    res.json(jsonData)
  })
})

router.get('/getprompts/:filename', (req, res) => {
  const filename = req.params.filename
  const filepath = `data/promptsdata/prompts/${filename}`

  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    const jsonData = JSON.parse(data)
    res.json(jsonData)
  })
})

router.get('/prompt-recommend', (req, res) => {
  fs.readFile('data/promptsdata/promptslist.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    const jsonData = JSON.parse(data)
    res.json(jsonData)
  })
})

router.post('/chat-process', [auth, limiter, adminCommandHandler], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage } = req.body as RequestProps
    let firstChunk = true
    const username = Base64.decode(req.headers.authorization.split(' ')[1]).split('\\')[0]

    await saveChatRecord(username, prompt)
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_KEYS_PATH = process.env.AUTH_KEYS_PATH
    const hasAuth = isNotEmptyString(AUTH_KEYS_PATH)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      throw new Error('用户名和密码不能为空 | Username and password cannot be empty')

    if (await userDataManager.isMatchedUser(username, password))
      res.send({ status: 'Success', message: '验证成功 | Verify successfully', data: null })
    else
      throw new Error('账号或密码错误 | Secret key is invalid')
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, verificationCode } = req.body
    if (!username || !password || !email || !verificationCode)
      throw new Error('用户名、密码、邮箱地址和验证码均不能为空 | Username, password, email address and verification code cannot be empty')

    // 从文件中读取验证码
    const data = (await fs.promises.readFile(verificationCodesFilePath, 'utf8'))
    const storedVerificationCodes = JSON.parse(data)

    if (storedVerificationCodes[email] !== verificationCode)
      throw new Error('验证码错误 | Incorrect verification code')

    // 注册就送七天
    const freedays = 7
    const date = getFreeDays(freedays)

    // 添加用户到数据管理器
    await userDataManager.addUser(username, password, date, email)
    res.send({ status: 'Success', message: `用户注册成功 | 已获得${freedays}天试用`, data: null })

    // 注册成功后，删除文件中的验证码记录
    delete storedVerificationCodes[email]
    fs.promises.writeFile(verificationCodesFilePath, JSON.stringify(storedVerificationCodes))
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/send-verification-code', async (req, res) => {
  try {
    const { email } = req.body // 接收用户输入的邮箱地址

    if (!email)
      throw new Error('邮箱地址不能为空 | Email address cannot be empty')

    const verificationCode = generateVerificationCode()

    // 写入邮箱地址和验证码到文件中
    let data = {}
    if (fs.existsSync(verificationCodesFilePath)) {
      const existingData = await fs.promises.readFile(verificationCodesFilePath, 'utf8')
      data = JSON.parse(existingData)
    }
    data[email] = verificationCode
    await fs.promises.writeFile(verificationCodesFilePath, JSON.stringify(data))

    // 发送验证码到用户提供的邮箱地址
    await sendVerificationCodeByEmail(email, verificationCode)

    res.send({ status: 'Success', message: '验证码已发送 | Verification code has been sent', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

export { router }
