import fs from 'fs'

async function hasSensitiveWords(prompt: string): Promise<boolean> {
  const bannedWordsPath = process.env.BANNED_WORDS_PATH
  const content = await fs.promises.readFile(bannedWordsPath, 'utf-8')
  const bannedWords = content.trim().split(/\r?\n/)

  for (const word of bannedWords) {
    const regex = new RegExp(word, 'gi')
    if (regex.test(prompt))
      return true
  }

  return false
}

export { hasSensitiveWords }
