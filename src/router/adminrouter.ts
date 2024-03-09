import express from 'express'
import { adminAuth } from 'src/middleware/auth'
import { UserDataManager } from 'src/userdb'

const adminRouter = express.Router()
const userManager = new UserDataManager()

// 查询所有用户数据
adminRouter.get('/', adminAuth, async (req, res) => {
  try {
    const users = await userManager.getAllUsers()
    res.send({
      status: 'Success',
      message: '查询成功',
      data: users,
    })
  }
  catch (error) {
    res.send({
      status: 'Fail',
      message: error.message ?? '查询失败',
      data: null,
    })
  }
})

// 查询单个用户数据
adminRouter.get('/:username', adminAuth, async (req, res) => {
  try {
    const { username } = req.params
    const userData = await userManager.getUserData(username)
    res.send({
      status: 'Success',
      message: '查询所有数据成功',
      data: userData,
    })
  }
  catch (error) {
    res.send({
      status: 'Fail',
      message: error.message ?? '查询失败',
      data: null,
    })
  }
})

// 增加单个用户数据
adminRouter.post('/', adminAuth, async (req, res) => {
  try {
    const { username, password, date, email } = req.body
    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (date && !dateRegex.test(date))
      throw new Error('日期格式不正确')
    await userManager.addUser(username, password, date, email)
    res.send({
      status: 'Success',
      message: '添加成功',
      data: username,
    })
  }
  catch (error) {
    res.send({
      status: 'Fail',
      message: error.message ?? '添加失败',
      data: null,
    })
  }
})

// 修改用户信息
adminRouter.put('/:username', adminAuth, async (req, res) => {
  try {
    const { username } = req.params
    const { newPassword, newDate } = req.body
    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (newDate && !dateRegex.test(newDate))
      throw new Error('日期格式不正确')

    const updateResult = { password: '', date: '' }

    if (newPassword) {
      await userManager.changePassword(username, newPassword)
      updateResult.password = '密码更新成功'
    }

    if (newDate) {
      await userManager.changeDate(username, newDate)
      updateResult.date = '日期更新成功'
    }

    if (!newPassword && !newDate)
      throw new Error('没有提供更新数据')

    res.send({
      status: 'Success',
      message: '更新成功',
      data: updateResult,
    })
  }
  catch (error) {
    res.send({
      status: 'Fail',
      message: error.message ?? '更新失败',
      data: null,
    })
  }
})

// 删除单个用户
adminRouter.delete('/:username', adminAuth, async (req, res) => {
  try {
    const { username } = req.params
    await userManager.deleteUser(username)
    res.send({
      status: 'Success',
      message: '删除用户成功',
      data: username,
    })
  }
  catch (error) {
    res.send({
      status: 'Fail',
      message: error.message ?? '删除用户失败',
      data: null,
    })
  }
})

export { adminRouter }
