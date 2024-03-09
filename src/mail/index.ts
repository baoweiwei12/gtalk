import nodemailer from 'nodemailer'

// 生成随机的验证码
function generateVerificationCode() {
  const code = Math.floor(1000 + Math.random() * 9000) // 生成随机的四位数字验证码
  return code.toString()
}

// 发送验证码到用户提供的邮箱地址
async function sendVerificationCodeByEmail(email, verificationCode) {
  // 创建邮件传输对象
  const transporter = nodemailer.createTransport({
    // 配置SMTP设置

    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // 邮件的内容
  const mailOptions = {
    from: `Gtalk<${process.env.SMTP_USER}>`,
    to: email,
    subject: `[Gtalk] 验证码 | ${verificationCode}`,
    html: `
          <!DOCTYPE html>
          <html lang="zh">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>[Gtalk] 验证码 | Verification Code</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      text-align: center;
                      padding: 20px;
                  }
                  .container {
                      background-color: #fff;
                      max-width: 400px;
                      margin: 20px auto;
                      padding: 30px;
                      border-radius: 8px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                      color: #333;
                  }
                  .code {
                      font-size: 36px;
                      font-weight: bold;
                      color: #007bff;
                      margin-top: 20px;
                  }
                  .footer {
                      margin-top: 30px;
                      font-size: 14px;
                      color: #666;
                  }
                  img.logo {
                      width: 100px; 
                      margin-top: 20px;
                  }
              </style>
          </head>
          <body>
              <img src="http://47.102.135.18/chatapi/images/gtalklogo.png" alt="Gtalk Logo" class="logo">
              <div class="container">
                  <h1>您的验证码是</h1>
                  <p class="code">${verificationCode}</p>
              </div>
              <div class="footer">
                  <a href="https://work.weixin.qq.com/kfid/kfcdf624e09740106c5">遇到问题？联系微信客服</a>
                  <p>@Copyright www.gtalk.site</p>
              </div>
          </body>
          </html>`,
  }

  // 发送邮件
  await transporter.sendMail(mailOptions)
}

export { generateVerificationCode, sendVerificationCodeByEmail }
