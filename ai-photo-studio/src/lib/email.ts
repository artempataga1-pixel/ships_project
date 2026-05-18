import nodemailer from "nodemailer"

let transport: nodemailer.Transporter | null = null

async function getTransport() {
  if (transport) return transport

  const testAccount = await nodemailer.createTestAccount()
  transport = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  return transport
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const t = await getTransport()
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  const info = await t.sendMail({
    from: '"AI Photo Studio" <noreply@aiphotostudio.com>',
    to: email,
    subject: "Восстановление пароля — AI Photo Studio",
    text: `Для сброса пароля перейдите по ссылке: ${resetUrl}\n\nСсылка действительна 1 час.`,
    html: `
      <p>Для сброса пароля перейдите по ссылке:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Ссылка действительна 1 час.</p>
      <p>Если вы не запрашивали сброс — проигнорируйте это письмо.</p>
    `,
  })

  console.log("[email] Preview URL:", nodemailer.getTestMessageUrl(info))
  return info
}
