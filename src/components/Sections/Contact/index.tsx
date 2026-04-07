'use client'

import { useState, type FormEvent } from 'react'
import Title from '@/components/UI/Title'
import styles from './Contact.module.scss'

type SubmitStatus = 'idle' | 'success' | 'error'

export default function Contact() {
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('idle')
    setFeedback(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const telRaw = String(formData.get('tel') ?? '').trim()
    const tel = telRaw === '' ? undefined : telRaw
    const email = String(formData.get('email') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()

    setPending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tel, email, message }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string }

      if (!res.ok) {
        setStatus('error')
        setFeedback(data.error ?? '送信に失敗しました。時間をおいて再度お試しください。')
        return
      }

      setStatus('success')
      setFeedback(data.message ?? 'お問い合わせを受け付けました。')
      form.reset()
    } catch {
      setStatus('error')
      setFeedback('通信エラーが発生しました。ネットワークをご確認ください。')
    } finally {
      setPending(false)
    }
  }

  return (
    <section id="contact" className={styles.contact}>
      <div className="wrap">
        <Title en="CONTACT" className={styles.contactTitle}>
          お問い合わせ
        </Title>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="contact-name" className={styles.label}>
              名前
              <span className={styles.badgeRequired}>必須</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className={styles.input}
              autoComplete="name"
              required
              disabled={pending}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-tel" className={styles.label}>
              電話番号
              <span className={styles.badgeOptional}>任意</span>
            </label>
            <input
              id="contact-tel"
              name="tel"
              type="tel"
              className={styles.input}
              autoComplete="tel"
              disabled={pending}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-email" className={styles.label}>
              メールアドレス
              <span className={styles.badgeRequired}>必須</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className={styles.input}
              autoComplete="email"
              required
              disabled={pending}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-message" className={styles.label}>
              お問い合わせ内容
              <span className={styles.badgeRequired}>必須</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              className={styles.textarea}
              required
              rows={6}
              disabled={pending}
            />
          </div>

          <div className={styles.submitRow}>
            {feedback && (
              <p
                className={`${styles.message} ${
                  status === 'success' ? styles.messageSuccess : styles.messageError
                }`}
                role="status"
                aria-live="polite"
              >
                {feedback}
              </p>
            )}
            <button type="submit" className={styles.submit} disabled={pending}>
              {pending ? '送信中…' : '送信する'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
