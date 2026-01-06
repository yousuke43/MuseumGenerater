import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '美術館風ラベルジェネレーター',
  description: 'あなたの作品を美術館の展示品のように演出します',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
