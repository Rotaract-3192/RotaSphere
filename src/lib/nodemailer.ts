import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || "RotaSphere <tech.rotaract3192@gmail.com>"

const isSMTPConfigured = !!(
  SMTP_HOST && 
  SMTP_USER && 
  SMTP_PASS && 
  SMTP_PASS !== "your_gmail_app_password_here"
)

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!isSMTPConfigured) {
    console.log("=================== [SIMULATED EMAIL NOTIFIER] ===================")
    console.log(`TO:      ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log("CONTENT:")
    // Strip HTML tags for clean console view
    const textBody = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    console.log(textBody)
    console.log("==================================================================")
    return { success: true, simulated: true }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: SMTP_PORT === "465",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    })

    console.log(`[Email] Message sent successfully to ${to}. MessageID: ${info.messageId}`)
    return { success: true, messageId: info.messageId, simulated: false }
  } catch (error) {
    console.error("[Email] Error sending email via Nodemailer:", error)
    return { success: false, error: error instanceof Error ? error.message : "SMTP transport failure" }
  }
}
