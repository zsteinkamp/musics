import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-pagebg-light dark:bg-pagebg-dark text-text-light dark:text-text-dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
