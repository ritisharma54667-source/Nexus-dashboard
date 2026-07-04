/**
 * utils/mailer.js
 *
 * Sends the "reset your password" email. If no SMTP credentials are
 * configured (the common case for local dev / demoing this project),
 * it falls back to printing the reset link straight to the server
 * console so you can still test the full flow without a mail account.
 */

import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env

const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null

export async function sendPasswordResetEmail({ to, resetUrl }) {
  if (!smtpConfigured) {
    console.log('\n──────────────────────────────────────────────')
    console.log('✉  SMTP not configured — printing email instead of sending it.')
    console.log(`   To:    ${to}`)
    console.log(`   Link:  ${resetUrl}`)
    console.log('   (This link expires in 1 hour.)')
    console.log('──────────────────────────────────────────────\n')
    return
  }

  await transporter.sendMail({
    from: MAIL_FROM || 'Nexus Dashboard <no-reply@nexus.io>',
    to,
    subject: 'Reset your Nexus Dashboard password',
    text: `We received a request to reset your Nexus Dashboard password.\n\nReset it here: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#3A75C4;">Reset your password</h2>
        <p>We received a request to reset your Nexus Dashboard password.</p>
        <p><a href="${resetUrl}" style="background:#3A75C4;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;">Reset password</a></p>
        <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  })
}
