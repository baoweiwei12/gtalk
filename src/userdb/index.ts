import fs from 'fs'

interface User {
  password: any
  date: string
  email: string
  role: string
}

// 管理用户
class UserDataManager {
  userDataFilePath: string

  constructor() {
    this.userDataFilePath = process.env.AUTH_KEYS_PATH
  }

  async isAdmin(username: string) {
    const userData = await this.readUserDataFromFile()
    return userData[username]?.role.trim() === 'Admin'
  }

  async isMatchedUser(username: string, password: string) {
    const userData = await this.readUserDataFromFile()
    return userData[username]?.password.trim() === password
  }

  async getAllUsers() {
    const userData = await this.readUserDataFromFile()
    return Object.keys(userData).map(username => ({ username, ...userData[username] }))
  }

  async getUserData(username: string) {
    const userData = await this.readUserDataFromFile()
    if (Object.prototype.hasOwnProperty.call(userData, username))
      return { username, ...userData[username] }

    else
      throw new Error('用户不存在 | User does not exist')
  }

  async addUser(username: string, password: any, date: string, email: string) {
    const userData: Record<string, User> = await this.readUserDataFromFile()

    // 检查用户名是否存在
    if (Object.prototype.hasOwnProperty.call(userData, username))
      throw new Error('用户已存在 | User already exists')

    // 检查邮箱是否已被使用
    const emailAlreadyExists = Object.values(userData).some(user => user.email === email)
    if (emailAlreadyExists)
      throw new Error('该邮箱已被绑定 | Email already in use')

    // 添加新用户
    const role = 'User'
    userData[username] = { password, date, email, role }
    await this.writeUserDataToFile(userData)
  }

  async changePassword(username: string, newPassword: any) {
    const userData = await this.readUserDataFromFile()
    if (Object.prototype.hasOwnProperty.call(userData, username)) {
      userData[username].password = newPassword
      await this.writeUserDataToFile(userData)
    }
    else {
      throw new Error('用户不存在 | User does not exist')
    }
  }

  async changeDate(username: string, newDate: string) {
    const userData = await this.readUserDataFromFile()
    if (Object.prototype.hasOwnProperty.call(userData, username)) {
      userData[username].date = newDate
      await this.writeUserDataToFile(userData)
    }
    else {
      throw new Error('用户不存在 | User does not exist')
    }
  }

  async deleteUser(username: string) {
    const userData = await this.readUserDataFromFile()
    if (Object.prototype.hasOwnProperty.call(userData, username)) {
      delete userData[username]
      await this.writeUserDataToFile(userData)
    }
    else {
      throw new Error('用户不存在 | User does not exist')
    }
  }

  async readUserDataFromFile() {
    try {
      const userData = await fs.promises.readFile(this.userDataFilePath, 'utf8')
      return JSON.parse(userData)
    }
    catch (error) {
      // 如果文件不存在，则返回一个空的用户数据对象
      if (error.code === 'ENOENT')
        return {}

      throw error
    }
  }

  async writeUserDataToFile(userData: any) {
    await fs.promises.writeFile(this.userDataFilePath, JSON.stringify(userData))
  }
}

export { UserDataManager }
