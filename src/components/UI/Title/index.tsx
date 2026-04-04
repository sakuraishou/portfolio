import styles from './Title.module.css'

type Props = {
  children: React.ReactNode
  en?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
}

export default function Title({ children, en, as: Tag = 'h2', className = '' }: Props) {
  return (
    <Tag
      className={`${styles.title} ${className}`.trim()}
      data-en={en || undefined}
    >
      {children}
    </Tag>
  )
}
