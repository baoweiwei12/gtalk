import fs from 'fs'
import path from 'path'

async function saveChatRecord(username: string, prompt: string) {
  const recordsPath = process.env.RECORDS_PATH || __dirname
  const filePath = path.join(recordsPath, `${username}.txt`)
  const timestamp = new Date().toISOString()
  const fileContent = `用户: ${username}\n时间: ${timestamp}\n消息: ${prompt}\n\n`

  try {
    await fs.promises.appendFile(filePath, fileContent)
  }
  catch (error) {
    console.error(`Failed to save chat record: ${error}`)
  }
}

export { saveChatRecord }
