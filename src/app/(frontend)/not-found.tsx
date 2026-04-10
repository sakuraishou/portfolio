import Link from 'next/link'

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: 'calc(100vh - 20rem)',
        display: 'grid',
        placeItems: 'center',
        padding: '6rem 0',
        background: 'linear-gradient(180deg, #fff6ee 0%, rgba(255, 238, 223, 0.6) 100%)',
      }}
    >
      <div className="wrap">
        <div
          style={{
            width: '100%',
            maxWidth: '72rem',
            margin: '0 auto',
            padding: '4rem 2.4rem',
            textAlign: 'center',
            backgroundColor: '#fff',
            border: '0.1rem solid rgba(94, 49, 0, 0.12)',
            borderRadius: '1.2rem',
            boxShadow: '0 0.8rem 2.4rem rgba(94, 49, 0, 0.12)',
          }}
        >
          <p style={{ margin: 0, fontSize: '4.8rem', fontWeight: 700, lineHeight: 1, color: '#f78c00' }}>
            404
          </p>
          <h1 style={{ margin: '1.2rem 0 0', fontSize: '2.6rem', color: '#5e3100' }}>
            ページが見つかりません
          </h1>
          <p style={{ margin: '1.6rem 0 0', fontSize: '1.6rem', lineHeight: 1.8, color: 'rgba(94, 49, 0, 0.9)' }}>
            お探しのページは移動または削除された可能性があります。
            <br />
            トップページからもう一度お試しください。
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '4.8rem',
              width: 'min(30rem, 100%)',
              margin: '2.4rem auto 0',
              padding: '0 2rem',
              fontSize: '1.6rem',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#f78c00',
              borderRadius: '0.8rem',
              textDecoration: 'none',
            }}
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </section>
  )
}
