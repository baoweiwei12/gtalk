import fs from 'fs'
import Base64 from 'js-base64'

const auth = async (req, res, next) => {
  const authKeysPath = process.env.AUTH_KEYS_PATH

  try {
    await fs.promises.access(authKeysPath, fs.constants.R_OK)

    const authorization = req.headers.authorization
    // base64解码token
    const token = Base64.decode(authorization.split(' ')[1])

    const now = new Date()
    const currentDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}` // 格式化当前日期字符串

    const [username, password] = token.split('\\')

    const userData = JSON.parse(await fs.promises.readFile(authKeysPath, 'utf8'))

    if (userData[username]?.password.trim() === password) {
      if (userData[username]?.date.trim() >= currentDate) {
        next()
      }
      else {
        const expiryMessagePath = 'data/usernotice/过期通知.md'
        const expiryMessage = (await fs.promises.readFile(expiryMessagePath, 'utf8'))
        res.send({
          status: 'Fail',
          message: expiryMessage,
          data: null,
        })
      }
    }
    else {
      throw new Error('未经授权 | Unauthorized')
    }
  }
  catch (error) {
    res.send({
      status: 'Unauthorized',
      message: error.message ?? '请进行身份验证 | Please authenticate.',
      data: null,
    })
  }
}

const adminAuth = (req, res, next) => {
  const { authorization } = req.headers.authorization
  const adminKey = process.env.ADMIN_KEY.split(' ')[1]

  if (authorization === adminKey) {
    next()
  }
  else {
    res.status(403).send({
      status: 'Fail',
      message: '权限不足，需要管理员权限',
      data: null,
    })
  }
}

export { auth, adminAuth }
