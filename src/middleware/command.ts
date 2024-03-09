import fs from 'fs'
import { Base64 } from 'js-base64'
import { UserDataManager } from 'src/userdb'

const userDataManager = new UserDataManager()

const isCommand = (inputString) => {
  const regexPatterns = {
    delete: /#gtalk delete (?<username>\w+)/,
    query: /#gtalk query (?<username>\w+)/,
    queryAll: /#gtalk query-all/,
    updateDate: /#gtalk update-date (?<username>\w+) (?<newDate>\w{4}-\w{2}-\w{2})/,
    updatePassword: /#gtalk update-password (?<username>\w+) (?<newPassword>\w+)/,
    help: /#gtalk help/,
  }

  for (const command in regexPatterns) {
    const match = inputString.match(regexPatterns[command])
    if (match)
      return { command, ...match.groups }
  }
  return null
}
// 生成并返回 Markdown 格式的帮助信息
const getHelpMessage = async () => {
  const helpMessage = await fs.promises.readFile('data/usernotice/可用命令指南.md', 'utf-8')
  return helpMessage
}

const queryUser = async (commandResult, userDataManager) => {
  const userData = await userDataManager.getUserData(commandResult.username)
  let markdownString = '| Username | Password | Date       | Email              | Role  |\n'
  markdownString += '|----------|----------|------------|--------------------|-------|\n'

  const { password, date, email, role } = userData
  markdownString += `| ${commandResult.username} | ${password} | ${date} | ${email} | ${role} |\n`

  return markdownString
}
const queryAllUser = async (userDataManager) => {
  const userData = await userDataManager.getAllUsers()
  console.error(userData)
  let markdownString = '| Username | Password | Date       | Email              | Role  |\n'
  markdownString += '|----------|----------|------------|--------------------|-------|\n'
  for (const user in userData) {
    const { username, password, date, email, role } = userData[user]
    markdownString += `| ${username} | ${password} | ${date} | ${email} | ${role} |\n`
  }
  return markdownString
}

const processCommand = async (commandResult, userDataManager) => {
  switch (commandResult.command) {
    case 'delete':
      await userDataManager.deleteUser(commandResult.username)
      return `${commandResult.username} 已删除`

    case 'updateDate':
      await userDataManager.changeDate(commandResult.username, commandResult.newDate)
      return `${commandResult.username} 更新日期为 ${commandResult.newDate}`

    case 'updatePassword':
      await userDataManager.changePassword(commandResult.username, commandResult.newPassword)
      return `${commandResult.username} 更新密码为 ${commandResult.newPassword}`

    case 'query': // 处理查询命令
      return queryUser(commandResult, userDataManager)

    case 'queryAll':
      return queryAllUser(userDataManager)
    case 'help':
      return getHelpMessage()
    default:
      return '还在开发呢'
  }
}

const adminCommandHandler = async (req, res, next) => {
  try {
    const { prompt } = req.body
    const username = Base64.decode(req.headers.authorization.split(' ')[1]).split('\\')[0]
    if (prompt.startsWith('#gtalk') && await userDataManager.isAdmin(username)) {
      const commandResult = isCommand(prompt)
      const cmdMessage = commandResult ? await processCommand(commandResult, userDataManager) : '命令错误，请输入 #gtalk help 获取帮助'
      res.send({ status: 'Fail', message: cmdMessage, data: null })
    }
    else {
      next()
    }
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
}

export { adminCommandHandler }
