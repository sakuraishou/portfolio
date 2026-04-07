import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type ContactBody = {
  name?: unknown
  tel?: unknown
  email?: unknown
  message?: unknown
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isOptionalTel(value: unknown): value is string | undefined {
  if (value === undefined || value === null || value === '') return true
  return typeof value === 'string'
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const mailUser = process.env.MAIL_USER
const mailPass = process.env.MAIL_PASS
const mailTo = process.env.CONTACT_TO_EMAIL ?? mailUser

const transporter =
  mailUser && mailPass
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: mailUser,
          pass: mailPass,
        },
      })
    : null

export async function POST(request: Request) {
  let body: ContactBody
  try {
    body = (await request.json()) as ContactBody
  } catch {
    return NextResponse.json({ error: 'JSONの形式が正しくありません' }, { status: 400 })
  }

  const { name, tel, email, message } = body

  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: '名前は必須です' }, { status: 400 })
  }
  if (!isOptionalTel(tel)) {
    return NextResponse.json({ error: '電話番号の形式が正しくありません' }, { status: 400 })
  }
  if (!isNonEmptyString(email) || !emailPattern.test(email.trim())) {
    return NextResponse.json({ error: 'メールアドレスは有効な形式で必須です' }, { status: 400 })
  }
  if (!isNonEmptyString(message)) {
    return NextResponse.json({ error: 'お問い合わせ内容は必須です' }, { status: 400 })
  }

  if (!transporter || !mailTo) {
    return NextResponse.json(
      { error: 'メール送信設定が未完了です。環境変数を確認してください。' },
      { status: 500 },
    )
  }

  const safeTel = typeof tel === 'string' && tel.trim().length > 0 ? tel.trim() : '未入力'
  const safeName = name.trim()
  const safeEmail = email.trim()
  const safeMessage = message.trim()

  try {
    await transporter.sendMail({
      from: mailUser,
      to: mailTo,
      replyTo: safeEmail,
      subject: `【ポートフォリオお問い合わせ】${safeName} 様`,
      text: [
        'ポートフォリオサイトからお問い合わせが届きました。',
        '',
        `名前: ${safeName}`,
        `電話番号: ${safeTel}`,
        `メールアドレス: ${safeEmail}`,
        '',
        'お問い合わせ内容:',
        safeMessage,
      ].join('\n'),
    })
  } catch (error) {
    console.error('contact mail send error:', error)
    return NextResponse.json(
      { error: 'メール送信に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, message: 'お問い合わせを受け付けました' }, { status: 200 })
}
