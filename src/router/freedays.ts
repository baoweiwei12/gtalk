function getFreeDays(n: number): string {
  // 获取当前日期
  const currentDate: Date = new Date()

  // 在当前日期上加上n天
  currentDate.setDate(currentDate.getDate() + n)

  // 将日期格式化为YYYY-MM-DD格式
  const year: string = currentDate.getFullYear().toString()
  let month: string = (currentDate.getMonth() + 1).toString()
  let day: string = currentDate.getDate().toString()

  // 确保月份和日期是两位数
  month = month.length < 2 ? `0${month}` : month
  day = day.length < 2 ? `0${day}` : day

  // 返回格式化后的日期字符串
  return `${year}-${month}-${day}`
}

export { getFreeDays }
